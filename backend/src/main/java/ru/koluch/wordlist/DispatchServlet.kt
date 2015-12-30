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

/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 29.12.2015 02:30
 */

val EXPENSE_KIND = "Expense";
val EXPENSE_PROP_AMOUNT = "amount"
val EXPENSE_PROP_CATEGORY_ID = "categoryId"
val EXPENSE_PROP_COMMENT = "comment"

val CATEGORY_KIND = "Category";
val CATEGORY_PROP_TITLE = "title";
val CATEGORY_PROP_PARENT_ID = "parentId";

abstract class Action(val type: String)
class NewExpenseAction(val amount: Int, val categoryId: Long, val comment: String?) : Action("NEW_EXPENSE")
class NewCategoryAction(val title: String, val parentId: Long?) : Action("NEW_CATEGORY")


class DispatchServlet : HttpServlet() {


    val gsonBuilder: GsonBuilder = GsonBuilder()
        .deserialize { jsonElement, type, context ->
            if (jsonElement.isJsonObject) {
                val jsonObject = jsonElement as JsonObject
                val amount = jsonObject.get(EXPENSE_PROP_AMOUNT).int
                val categoryId = jsonObject.get(EXPENSE_PROP_CATEGORY_ID).long
                val comment = jsonObject.get(EXPENSE_PROP_COMMENT).nullString
                NewExpenseAction(amount, categoryId, comment)
            } else {
                throw JsonParseException("Only JsonObject could be parsed")
            }
        }
        .deserialize { jsonElement, type, context ->
            if (jsonElement.isJsonObject) {
                val jsonObject = jsonElement as JsonObject
                val title = jsonObject.get(CATEGORY_PROP_TITLE).string
                val parentId = jsonObject.get(CATEGORY_PROP_PARENT_ID).nullLong
                NewCategoryAction(title, parentId)
            } else {
                throw JsonParseException("Only JsonObject could be parsed")
            }
        }
    val gson = gsonBuilder.create()

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
                val expenseJsonList = expenseList.map { categoryEntity ->
                    jsonObject(
                        EXPENSE_PROP_AMOUNT to categoryEntity.getProperty(EXPENSE_PROP_AMOUNT),
                        EXPENSE_PROP_CATEGORY_ID to categoryEntity.getProperty(EXPENSE_PROP_CATEGORY_ID),
                        EXPENSE_PROP_COMMENT to categoryEntity.getProperty(EXPENSE_PROP_COMMENT)
                    )
                }
                val result = jsonArray()
                result.addAll(expenseJsonList)
                return result
            }

            fun collectCategories(parentId: Long?): JsonArray {
                val query = Query(CATEGORY_KIND, userEntity.key).setFilter(
                    Query.FilterPredicate(CATEGORY_PROP_PARENT_ID, Query.FilterOperator.EQUAL, parentId)
                )
                val preparedQuery = datastore.prepare(query)
                val categoryList = preparedQuery.asList(FetchOptions.Builder.withDefaults())
                val categoryJsonList = categoryList.map { categoryEntity ->
                    jsonObject(
                        CATEGORY_PROP_TITLE to categoryEntity.getProperty(CATEGORY_PROP_TITLE),
                        "children" to collectCategories(categoryEntity.key.id)
                    )
                }
                val result = jsonArray()
                result.addAll(categoryJsonList)
                return result
            }

            val stateJson = jsonObject(
                "history" to collectExpenses(),
                "categoryList" to collectCategories(null)
            )

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
        if (!actionJson.has("type")) {
            throw ActionParseException("Action type is not specified")
        }
        val type = actionJson.get("type").string
        if (type == "NEW_EXPENSE") {
            try {
                return gson.fromJson<NewExpenseAction>(body);
            } catch(e: Exception) {
                throw ActionParseException(e)
            }
        } else if (type == "NEW_CATEGORY") {
            try {
                return gson.fromJson<NewCategoryAction>(body);
            } catch(e: Exception) {
                throw ActionParseException(e)
            }
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


