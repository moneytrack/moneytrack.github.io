package ru.koluch.wordlist

import com.github.salomonbrys.kotson.*
import com.google.appengine.api.datastore.*
import com.google.gson.*
import java.lang.reflect.Type
import java.security.Principal
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.collections.map
import java.util.Date
import kotlin.collections.fold
import kotlin.collections.forEach

/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 29.12.2015 02:30
 */

abstract class Action(val type: String)
class NewExpenseAction(val amount: Int, val categoryId: Long, val date: Date, val comment: String?) : Action(ACTION_NEW_EXPENSE)
class DeleteExpenseAction(val id: Long) : Action(ACTION_DELETE_EXPENSE)
class NewCategoryAction(val title: String, val parentId: Long?) : Action(ACTION_NEW_CATEGORY)


class DispatchServlet : HttpServlet() {

    val gson = Gson()

    override fun doGet(req: HttpServletRequest, res: HttpServletResponse) {
        val datastore = DatastoreServiceFactory.getDatastoreService();
        
        val userPrincipal = req.userPrincipal
        if (userPrincipal == null) {
            res.writer.println("User is not authorized")
            res.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        val userEntity: Entity
        try {
            userEntity = datastore.get(KeyFactory.createKey(USER_KIND, userPrincipal.name))
        } catch(e: EntityNotFoundException) {
            res.writer.println("User account info not found. Try to log out and then sign in again.")
            res.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        val body = req.reader.readText()
        if (body.equals("")) {

            fun collectExpenses(): JsonArray {
                val query = Query(EXPENSE_KIND, userEntity.key)
                val preparedQuery = datastore.prepare(query)
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
                    Query.FilterPredicate(CATEGORY_PROP_PARENT_ID, Query.FilterOperator.EQUAL, parent)
                )
                val preparedQuery = datastore.prepare(query)
                val categoryList = preparedQuery.asList(FetchOptions.Builder.withDefaults())
                val idList = categoryList.map { categoryEntity -> categoryEntity.key.id }
                val result = jsonArray()
                result.addAll(idList)
                return result
            }

            fun collectCategories(): JsonArray {
                val query = Query(CATEGORY_KIND, userEntity.key)
                val preparedQuery = datastore.prepare(query)
                val categoryList = preparedQuery.asList(FetchOptions.Builder.withDefaults())
                val result = jsonArray()
                categoryList.forEach { categoryEntity ->
                    result.add( jsonObject(
                        PROP_ID to categoryEntity.key.id,
                        CATEGORY_PROP_TITLE to categoryEntity.getProperty(CATEGORY_PROP_TITLE),
                        CATEGORY_PROP_PARENT_ID to categoryEntity.getProperty(CATEGORY_PROP_PARENT_ID),
                        CATEGORY_PROP_CHILD_ID_LIST to collectCategoryIdList(categoryEntity.key.id)
                    ))
                }
                return result
            }

            val stateJson = jsonObject(
                STATE_HISTORY to collectExpenses(),
                STATE_ROOT_CATEGORY_ID_LIST to collectCategoryIdList(null),
                STATE_CATEGORY_LIST to collectCategories()
            )

            res.characterEncoding = "UTF-8";
            res.writer.println(gson.toJson(stateJson))
            res.setStatus(HttpServletResponse.SC_OK)
            return
        }

    }

    override fun doPost(req: HttpServletRequest, res: HttpServletResponse) {

        val datastore = DatastoreServiceFactory.getDatastoreService();

        val userPrincipal = req.userPrincipal
        if (userPrincipal == null) {
            res.writer.println("User is not authorized")
            res.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        val userEntity: Entity
        try {
            userEntity = datastore.get(KeyFactory.createKey(USER_KIND, userPrincipal.name))
        } catch(e: EntityNotFoundException) {
            res.writer.println("User account info not found. Try to log out and then sign in again.")
            res.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        val body = req.reader.readText()
        if (body.equals("")) {
            res.writer.println("Missing request body")
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
            return
        }

        val action: Action
        try {
            action = parseAction(body)
        } catch(e: ActionParseException) {
            res.writer.println("Unable to parse action JSON: ${e.message}")
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
            return
        }
        when (action) {
            is NewExpenseAction -> {
                if (!datastore.exists(KeyFactory.createKey(userEntity.key, CATEGORY_KIND, action.categoryId))) {
                    res.writer.println("Category with id '${action.categoryId}' doesn't exists")
                    res.sendError(HttpServletResponse.SC_BAD_REQUEST)
                    return
                }

                val entity = Entity(EXPENSE_KIND, userEntity.key)
                entity.setProperty(EXPENSE_PROP_AMOUNT, action.amount);
                entity.setProperty(EXPENSE_PROP_CATEGORY_ID, action.categoryId);
                entity.setProperty(EXPENSE_PROP_DATE, action.date)
                entity.setProperty(EXPENSE_PROP_COMMENT, action.comment)
                val key = datastore.put(entity);
                res.writer.println(key.id)
                res.setStatus(HttpServletResponse.SC_OK)
            }
            is NewCategoryAction -> {
                val entity = Entity(CATEGORY_KIND, userEntity.key)
                entity.setProperty(CATEGORY_PROP_TITLE, action.title);
                if (action.parentId != null) {
                    if (!datastore.exists(KeyFactory.createKey(userEntity.key, CATEGORY_KIND, action.parentId))) {
                        res.writer.println("Parent category with id '${action.parentId}' doesn't exists")
                        res.sendError(HttpServletResponse.SC_BAD_REQUEST)
                        return
                    }
                };
                entity.setProperty(CATEGORY_PROP_PARENT_ID, action.parentId)
                val key = datastore.put(entity);
                res.writer.println(key.id)
                res.setStatus(HttpServletResponse.SC_OK)
            }
            is DeleteExpenseAction -> {
                datastore.delete(KeyFactory.createKey(userEntity.key, EXPENSE_KIND, action.id))
                res.setStatus(HttpServletResponse.SC_OK)
            }
            else -> {
                res.writer.println("Unknown action type: ${action.type}")
                res.sendError(HttpServletResponse.SC_BAD_REQUEST)
                return
            }
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
            } else if (type == ACTION_NEW_CATEGORY) {
                val title = actionJson.get(CATEGORY_PROP_TITLE).string
                val parentId = actionJson.get(CATEGORY_PROP_PARENT_ID).nullLong
                return NewCategoryAction(title, parentId)
            } else if (type == ACTION_DELETE_EXPENSE) {
                val id = actionJson.get(PROP_ID).long
                return DeleteExpenseAction(id)
            }
        } catch(e: Exception) {
            throw ActionParseException(e)
        }
        throw ActionParseException("Unknown action type: " + type)
    }
}

class ActionParseException : Exception {
    constructor() : super()

    constructor(message: String?) : super(message)

    constructor(message: String?, cause: Throwable?) : super(message, cause)

    constructor(cause: Throwable?) : super(cause)

    constructor(message: String?, cause: Throwable?, enableSuppression: Boolean, writableStackTrace: Boolean) : super(message, cause, enableSuppression, writableStackTrace)
}


