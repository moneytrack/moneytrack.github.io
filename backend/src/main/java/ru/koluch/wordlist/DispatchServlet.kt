package ru.koluch.wordlist

import com.github.salomonbrys.kotson.*
import com.google.appengine.api.datastore.*
import com.google.appengine.api.datastore.Query.FilterOperator.EQUAL
import com.google.appengine.api.datastore.Query.FilterPredicate
import com.google.gson.*
import java.lang.reflect.Type
import java.security.Principal
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.util.Date
import kotlin.collections.*

/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 29.12.2015 02:30
 */

abstract class Action(val type: String)
class NewExpenseAction(val amount: Int, val categoryId: Long, val date: Date, val comment: String?) : Action(ACTION_NEW_EXPENSE)
class EditExpenseAction(val id: Long, val amount: Int, val categoryId: Long, val date: Date, val comment: String?) : Action(ACTION_NEW_EXPENSE)
class DeleteExpenseAction(val id: Long) : Action(ACTION_DELETE_EXPENSE)
class NewCategoryAction(val title: String, val parentId: Long) : Action(ACTION_NEW_CATEGORY)
class EditCategoryAction(val id: Long, val title: String?, val parentId: Long?) : Action(ACTION_NEW_CATEGORY)
class DeleteCategoryAction(val id: Long) : Action(ACTION_NEW_CATEGORY)

enum class Currency {USD, EUR, RUR}
class SetCurrencyAction(val currency: Currency) : Action(ACTION_NEW_CATEGORY)

class DispatchServlet : Servlet() {

    val gson = GsonBuilder().serializeNulls().create()


    override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
        super.doGet(req, resp)

        val datastore = DatastoreServiceFactory.getDatastoreService()

        val userPrincipal = req.userPrincipal
        if (userPrincipal == null) {
            resp.writer.println("User is not authorized")
            resp.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

//        val tx = datastore.beginTransaction();

        datastore.inTransaction(fun(tx) {
            val userEntity: Entity
            try {
                userEntity = datastore.get(tx, KeyFactory.createKey(USER_KIND, userPrincipal.name))
            } catch(e: EntityNotFoundException) {
                resp.writer.println("User account info not found. Try to log out and then sign in again.")
                resp.sendError(HttpServletResponse.SC_FORBIDDEN)
                return;
            }

            val body = req.reader.readText()
            if (body.equals("")) {

                fun collectExpenses(): JsonArray {
                    val query = Query(EXPENSE_KIND, userEntity.key)
                    query.addSort(EXPENSE_PROP_DATE, Query.SortDirection.DESCENDING)
                    val preparedQuery = datastore.prepare(tx, query)
                    val expenseList = preparedQuery.asList(FetchOptions.Builder.withDefaults())
                    val result = jsonArray()
                    expenseList.forEach { expenseEntity ->
                        result.add(jsonObject (
                            PROP_ID to expenseEntity.key.id,
                            EXPENSE_PROP_AMOUNT to expenseEntity.getProperty(EXPENSE_PROP_AMOUNT),
                            EXPENSE_PROP_CATEGORY_ID to expenseEntity.getProperty(EXPENSE_PROP_CATEGORY_ID),
                            EXPENSE_PROP_DATE to (expenseEntity.getProperty(EXPENSE_PROP_DATE) as Date).getTime(),
                            EXPENSE_PROP_COMMENT to expenseEntity.getProperty(EXPENSE_PROP_COMMENT)
                        ))
                    }
                    return result
                }

                fun collectCategoryIdList(parent: Long?): JsonArray {
                    val query = Query(CATEGORY_KIND, userEntity.key).setFilter(
                        FilterPredicate(CATEGORY_PROP_PARENT_ID, EQUAL, parent)
                    )
                    val preparedQuery = datastore.prepare(tx, query)
                    val categoryList = preparedQuery.asList(FetchOptions.Builder.withDefaults())
                    val idList = categoryList.map { categoryEntity -> categoryEntity.key.id }
                    val result = jsonArray()
                    result.addAll(idList)
                    return result
                }

                fun collectCategories(): JsonArray {
                    val query = Query(CATEGORY_KIND, userEntity.key)
                    val preparedQuery = datastore.prepare(tx, query)
                    val categoryList = preparedQuery.asList(FetchOptions.Builder.withDefaults())
                    val result = jsonArray()
                    categoryList.forEach { categoryEntity ->
                        result.add( jsonObject(
                            PROP_ID to categoryEntity.key.id,
                            CATEGORY_PROP_TITLE to categoryEntity.getProperty(CATEGORY_PROP_TITLE),
                            CATEGORY_PROP_PARENT_ID to categoryEntity.getProperty(CATEGORY_PROP_PARENT_ID),
                            CATEGORY_PROP_ORDER to categoryEntity.getProperty(CATEGORY_PROP_ORDER),
                            CATEGORY_PROP_CHILD_ID_LIST to collectCategoryIdList(categoryEntity.key.id)
                        ))
                    }
                    return result
                }


                val stateJson = jsonObject(
                    STATE_HISTORY to collectExpenses(),
                    STATE_ROOT_CATEGORY_ID to userEntity.getProperty(USER_PROP_ROOT_CATEGORY_ID) as Long,
                    STATE_CATEGORY_LIST to collectCategories(),
                    STATE_USER_SETTINGS to jsonObject(
                        USER_PROP_CURRENCY to userEntity.getProperty(USER_PROP_CURRENCY)
                    )
                )

                resp.characterEncoding = "UTF-8";
                resp.writer.println(gson.toJson(stateJson))
                resp.setStatus(HttpServletResponse.SC_OK)
                return
            }
        })

    }



    override fun doPost(req: HttpServletRequest, resp: HttpServletResponse) {
        super.doPost(req, resp)

        val datastore = DatastoreServiceFactory.getDatastoreService();

        val userPrincipal = req.userPrincipal
        if (userPrincipal == null) {
            resp.writer.println("User is not authorized")
            resp.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        open class Result {}
        class ErrorResult(val code: Int = HttpServletResponse.SC_OK, val msg: String? = null) : Result()
        class DataResult(val code: Int = HttpServletResponse.SC_OK, val msg: String? = null) : Result()

        val trResult = datastore.inTransaction(fun(tx: Transaction): Result {

            val userEntity: Entity
            try {
                userEntity = datastore.get(tx, KeyFactory.createKey(USER_KIND, userPrincipal.name))
            } catch(e: EntityNotFoundException) {
                return ErrorResult(
                    HttpServletResponse.SC_FORBIDDEN,
                    "User account info not found. Try to log out and then sign in again."
                )
            }

            val body = req.reader.readText()
            if (body.equals("")) {
                return ErrorResult(
                    HttpServletResponse.SC_FORBIDDEN,
                    "Missing request body"
                )
            }

            val action: Action
            try {
                action = parseAction(body)
            } catch(e: ActionParseException) {
                return ErrorResult(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Unable to parse action JSON: ${e.message}"
                )
            }
            when (action) {
                is NewExpenseAction -> {
                    if (!datastore.exists(KeyFactory.createKey(userEntity.key, CATEGORY_KIND, action.categoryId))) {
                        return ErrorResult(
                            HttpServletResponse.SC_BAD_REQUEST,
                            "Category with id '${action.categoryId}' doesn't exists"
                        )
                    }

                    val entity = Entity(EXPENSE_KIND, userEntity.key)
                    entity.setProperty(EXPENSE_PROP_AMOUNT, action.amount);
                    entity.setProperty(EXPENSE_PROP_CATEGORY_ID, action.categoryId);
                    entity.setProperty(EXPENSE_PROP_DATE, action.date)
                    entity.setProperty(EXPENSE_PROP_COMMENT, action.comment)
                    val key = datastore.put(entity);

                    return DataResult (
                        HttpServletResponse.SC_OK,
                        key.id.toString()
                    )
                }
                is EditExpenseAction -> {
                    if (!datastore.exists(KeyFactory.createKey(userEntity.key, CATEGORY_KIND, action.categoryId))) {
                        return ErrorResult(
                            HttpServletResponse.SC_BAD_REQUEST,
                            "Category with id '${action.categoryId}' doesn't exists"
                        )
                    }

                    val entity = datastore.get(KeyFactory.createKey(userEntity.key, EXPENSE_KIND, action.id))
                    entity.setProperty(EXPENSE_PROP_AMOUNT, action.amount);
                    entity.setProperty(EXPENSE_PROP_CATEGORY_ID, action.categoryId);
                    entity.setProperty(EXPENSE_PROP_DATE, action.date)
                    entity.setProperty(EXPENSE_PROP_COMMENT, action.comment)
                    val key = datastore.put(entity);

                    return DataResult(
                        HttpServletResponse.SC_OK,
                        key.id.toString()
                    )
                }
                is DeleteExpenseAction -> {
                    datastore.delete(KeyFactory.createKey(userEntity.key, EXPENSE_KIND, action.id))
                    return DataResult()
                }

                is NewCategoryAction -> {
                    val entity = Entity(CATEGORY_KIND, userEntity.key)

                    entity.setProperty(CATEGORY_PROP_TITLE, action.title);
                    if (!datastore.exists(tx, KeyFactory.createKey(userEntity.key, CATEGORY_KIND, action.parentId))) {
                        return ErrorResult(
                            HttpServletResponse.SC_BAD_REQUEST,
                            "Parent category with id '${action.parentId}' doesn't exists"
                        );
                    }

                    val childQuery = Query(CATEGORY_KIND, userEntity.key)
                    childQuery.setFilter(FilterPredicate(CATEGORY_PROP_PARENT_ID, EQUAL, action.parentId))
                    val childList = datastore.prepare(tx, childQuery).asList(FetchOptions.Builder.withDefaults())

                    val maxOrder: Long = childList.fold(0L, { acc, child ->
                        val order = (child.getProperty(CATEGORY_PROP_ORDER) as Long?) ?: 0
                        Math.max(acc, order)
                    })

                    entity.setProperty(CATEGORY_PROP_PARENT_ID, action.parentId)
                    entity.setProperty(CATEGORY_PROP_ORDER, maxOrder + 1)
                    val key = datastore.put(tx, entity);

                    return DataResult(
                        HttpServletResponse.SC_OK,
                        key.id.toString()
                    );

                }
                is DeleteCategoryAction -> {

                    fun remove(categoryId: Long) {


                        val childQuery = Query(CATEGORY_KIND, userEntity.key)
                        childQuery.setFilter(FilterPredicate(CATEGORY_PROP_PARENT_ID, EQUAL, categoryId))
                        val childList = datastore.prepare(childQuery).asList(FetchOptions.Builder.withDefaults())

                        val expensesQuery = Query(EXPENSE_KIND, userEntity.key)
                        expensesQuery.setFilter(FilterPredicate(EXPENSE_PROP_CATEGORY_ID, EQUAL, categoryId))
                        val expenseList = datastore.prepare(expensesQuery).asList(FetchOptions.Builder.withDefaults())

                        // Remove childs
                        for (child in childList) {
                            remove(child.key.id)
                        }

                        // Remove expenses
                        for (expense in expenseList) {
                            datastore.delete(tx, expense.key)
                        }

                        datastore.delete(tx, KeyFactory.createKey(userEntity.key, CATEGORY_KIND, categoryId))

                    }
                    remove(action.id)
                    return DataResult();
                }
                is EditCategoryAction -> {
                    //todo: do not allow editing of root category
                    if (action.parentId != null) {
                        if (!datastore.exists(tx, KeyFactory.createKey(userEntity.key, CATEGORY_KIND, action.parentId))) {
                            return ErrorResult(
                                HttpServletResponse.SC_BAD_REQUEST,
                                "Category with id '${action.parentId}' doesn't exists"
                            );
                        }
                    }

                    val entity = datastore.get(tx, KeyFactory.createKey(userEntity.key, CATEGORY_KIND, action.id))
                    if (action.title != null) {
                        entity.setProperty(CATEGORY_PROP_TITLE, action.title);
                    }
                    if (action.parentId != null) {
                        entity.setProperty(CATEGORY_PROP_PARENT_ID, action.parentId);
                    }
                    val key = datastore.put(tx, entity);

                    return DataResult(
                        HttpServletResponse.SC_OK,
                        key.id.toString()
                    );
                }

                is SetCurrencyAction -> {
                    userEntity.setProperty(USER_PROP_CURRENCY, action.currency.name)
                    datastore.put(userEntity)
                }
            }
            return ErrorResult(
                HttpServletResponse.SC_BAD_REQUEST,
                "Unknown action type: ${action.type}"
            );
        })

        when(trResult) {
            is DataResult -> {
                resp.writer.println(trResult.msg)
                resp.setStatus(trResult.code)
            }
            is ErrorResult -> {
                resp.writer.println(trResult.msg)
                resp.sendError(trResult.code)
            }
            else -> throw RuntimeException("Unknown result type")
        }
    }

    fun parseAction(body: String): Action {
        val actionJson: JsonObject
        try {
            actionJson = gson.fromJson(body)
        } catch(e: Exception) {
            throw ActionParseException(e)
        }
        if (!actionJson.has(ACTION_TYPE)) {
            throw ActionParseException("Action type is not specified")
        }
        val type = actionJson.get(ACTION_TYPE).string
        try {
            if (type == ACTION_NEW_EXPENSE) {
                val amount = actionJson.get(EXPENSE_PROP_AMOUNT).int
                val categoryId = actionJson.get(EXPENSE_PROP_CATEGORY_ID).long
                val date = Date(actionJson.get(EXPENSE_PROP_DATE).long)
                val comment = actionJson.get(EXPENSE_PROP_COMMENT).nullString
                return NewExpenseAction(amount, categoryId, date, comment)
            }
            else if (type == ACTION_EDIT_EXPENSE) {
                val id = actionJson.get(PROP_ID).long
                val amount = actionJson.get(EXPENSE_PROP_AMOUNT).int
                val categoryId = actionJson.get(EXPENSE_PROP_CATEGORY_ID).long
                val date = Date(actionJson.get(EXPENSE_PROP_DATE).long)
                val comment = actionJson.get(EXPENSE_PROP_COMMENT).nullString
                return EditExpenseAction(id, amount, categoryId, date, comment)
            }
            else if (type == ACTION_NEW_CATEGORY) {
                val title = actionJson.get(CATEGORY_PROP_TITLE).string
                val parentId = actionJson.get(CATEGORY_PROP_PARENT_ID).long
                return NewCategoryAction(title, parentId)
            }
            else if (type == ACTION_DELETE_EXPENSE) {
                val id = actionJson.get(PROP_ID).long
                return DeleteExpenseAction(id)
            }
            else if (type == ACTION_EDIT_CATEGORY) {
                val id = actionJson.get(PROP_ID).long
                val title = actionJson.get(CATEGORY_PROP_TITLE).nullString
                val parentId = actionJson.get(CATEGORY_PROP_PARENT_ID).nullLong
                return EditCategoryAction(id, title, parentId)
            }
            else if (type == ACTION_DELETE_CATEGORY) {
                val id = actionJson.get(PROP_ID).long
                return DeleteCategoryAction(id)
            }

            else if (type == ACTION_SET_CURRENCY) {
                val currencyString = actionJson.get(USER_PROP_CURRENCY).string
                val currency = Currency.valueOf(currencyString)
                return SetCurrencyAction(currency)
            }
            throw ActionParseException("Unknown action type: " + type)
        } catch(e: Exception) {
            throw ActionParseException(e)
        }
    }
}

class ActionParseException : Exception {
    constructor() : super()

    constructor(message: String?) : super(message)

    constructor(message: String?, cause: Throwable?) : super(message, cause)

    constructor(cause: Throwable?) : super(cause)
}

