package ru.koluch.wordlist

import com.google.appengine.api.datastore.DatastoreServiceFactory
import com.google.appengine.api.datastore.Entity
import com.google.gson.Gson
import com.google.gson.JsonObject
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


    override fun service(req: HttpServletRequest, res: HttpServletResponse) {
        val actionJsonString = req.reader.readText()
        if(!actionJsonString.equals("")) {
            val gson = Gson()
            val actionJson = gson.fromJson(actionJsonString, JsonObject::class.java)
            if(actionJson.has("type")) {
                val type: String = actionJson.getAsJsonPrimitive("type").asString;
                if("NEW_EXPENSE".equals(type)) {

                    // Create expense object and save
                    val newExpense = Entity(EXPENSE_KIND)
                    newExpense.setProperty(EXPENSE_PROP_AMOUNT, actionJson.get(EXPENSE_PROP_AMOUNT).asString);
                    newExpense.setProperty(EXPENSE_PROP_CATEGORY_ID, actionJson.get(EXPENSE_PROP_CATEGORY_ID).asInt);
                    if (actionJson.has(EXPENSE_PROP_COMMENT)) {
                        newExpense.setProperty(EXPENSE_PROP_COMMENT, actionJson.get(EXPENSE_PROP_COMMENT).asString)
                    };

                    val datastoreService = DatastoreServiceFactory.getDatastoreService();
                    datastoreService.put(newExpense);
                    res.setStatus(HttpServletResponse.SC_OK)
                }
                else {
                    res.writer.write("Unknown action type: " + type)
                    res.sendError(HttpServletResponse.SC_BAD_REQUEST)
                }
            }
            else {
                res.writer.write("Missing action type")
                res.sendError(HttpServletResponse.SC_BAD_REQUEST)
            }
        }
        else {
            res.writer.write("Missing parameter 'action'")
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
        }
    }
}