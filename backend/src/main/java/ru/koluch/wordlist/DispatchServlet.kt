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
        throw JsonParseException("Only JsonObject could be parsed")
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

        val actionJson: JsonObject = gson.fromJson(body)
        if(!actionJson.has("type")) {
            res.writer.write("Missing action type")
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
            return
        }

        val type: String = actionJson.getAsJsonPrimitive("type").asString;
        if("NEW_EXPENSE".equals(type)) {

            val newExpenseEntity = Entity(EXPENSE_KIND, userEntity.key)
            newExpenseEntity.setProperty(EXPENSE_PROP_AMOUNT, actionJson.get(EXPENSE_PROP_AMOUNT).asString);
            newExpenseEntity.setProperty(EXPENSE_PROP_CATEGORY_ID, actionJson.get(EXPENSE_PROP_CATEGORY_ID).asInt);
            if (actionJson.has(EXPENSE_PROP_COMMENT)) {
                newExpenseEntity.setProperty(EXPENSE_PROP_COMMENT, actionJson.get(EXPENSE_PROP_COMMENT).asString)
            };

            datastoreService.put(newExpenseEntity);
            res.setStatus(HttpServletResponse.SC_OK)
        }
        else {
            res.writer.write("Unknown action type: " + type)
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
        }
    }
}

data class NewExpenseAction(val amount: Int, val categoryId: Int, val comment: String?)


