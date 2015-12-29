package ru.koluch.wordlist

import com.github.salomonbrys.kotson.*
import com.google.appengine.api.datastore.DatastoreServiceFactory
import com.google.appengine.api.datastore.Entity
import com.google.appengine.api.datastore.EntityNotFoundException
import com.google.appengine.api.datastore.KeyFactory
import com.google.gson.*
import java.lang.reflect.Type
import java.security.Principal
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

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

class DispatchServlet : HttpServlet() {


    val gsonBuilder: GsonBuilder = GsonBuilder().deserialize<NewExpenseAction> { jsonElement, type, context ->
        if (jsonElement.isJsonObject) {
            val jsonObject = jsonElement as JsonObject
            val amount = jsonObject.get(EXPENSE_PROP_AMOUNT).int
            val categoryId = jsonObject.get(EXPENSE_PROP_CATEGORY_ID).int
            val comment = jsonObject.get(EXPENSE_PROP_CATEGORY_ID).nullString
            NewExpenseAction(amount, categoryId, comment)
        }
        else {
            throw JsonParseException("Only JsonObject could be parsed")
        }
    }
    val gson = gsonBuilder.create()

    override fun service(req: HttpServletRequest, res: HttpServletResponse) {

        val datastoreService = DatastoreServiceFactory.getDatastoreService();

        val userPrincipal = req.userPrincipal
        if(userPrincipal == null) {
            res.writer.write("User is not authorized")
            res.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        val userEntity: Entity
        try {
            userEntity = datastoreService.get(KeyFactory.createKey(USER_KIND, userPrincipal.name))
        } catch(e: EntityNotFoundException) {
            res.writer.write("User account info not found. Try to log out and then sign in again.")
            res.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        val body = req.reader.readText()
        if(body.equals("")) {
            res.writer.write("Missing parameter 'action'")
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
            return
        }

        val action: Action
        try {
            action = parseAction(body)
        } catch(e: ActionParseException) {
            res.writer.write("Unable to parse action JSON: ${e.message}")
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
            return
        }
        when (action) {
            is NewExpenseAction -> {
                val newExpenseEntity = Entity(EXPENSE_KIND, userEntity.key)
                newExpenseEntity.setProperty(EXPENSE_PROP_AMOUNT, action.amount);
                newExpenseEntity.setProperty(EXPENSE_PROP_CATEGORY_ID, action.categoryId);
                if (action.comment != null) {
                    newExpenseEntity.setProperty(EXPENSE_PROP_COMMENT, action.comment)
                };
                datastoreService.put(newExpenseEntity);
                res.setStatus(HttpServletResponse.SC_OK)
            }
            else -> {
                res.writer.write("Unknown action type: ${action.type}")
                res.sendError(HttpServletResponse.SC_BAD_REQUEST)
                return
            }
        }

    }

    fun parseAction(body: String): Action  {
        val actionJson: JsonObject
        try {
            actionJson = gson.fromJson(body)
        } catch(e: Exception) {
            throw ActionParseException(e)
        }
        if(!actionJson.has("type")) {
            throw ActionParseException("Action type is not specified")
        }
        val type = actionJson.get("type").string
        if(type == "NEW_EXPENSE") {
            try {
                return gson.fromJson<NewExpenseAction>(body);
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


abstract class Action(val type: String)
class NewExpenseAction(val amount: Int, val categoryId: Int, val comment: String?) : Action("NEW_EXPENSE")

