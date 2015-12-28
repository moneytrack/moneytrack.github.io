package ru.koluch.wordlist

import com.google.appengine.repackaged.com.google.gson.Gson
import com.google.appengine.repackaged.com.google.gson.JsonObject
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.text.map

/**
 * Created by Nikolai_Mavrenkov on 28/12/15.
 */
class EntryPointServlet : HttpServlet() {

    override fun service(req: HttpServletRequest, res: HttpServletResponse) {
        val actionJsonString = req.getParameter("action")
        if(actionJsonString != null) {
            val actionJson = Gson().fromJson(actionJsonString, JsonObject::class.java)
            val type = actionJson.get("type").asString;
            res.writer.print("<h1>type: $type</h1>")
        }
        else {
            res.writer.write("Missing parameter 'action'")
            res.sendError(HttpServletResponse.SC_BAD_REQUEST)
        }
    }
}