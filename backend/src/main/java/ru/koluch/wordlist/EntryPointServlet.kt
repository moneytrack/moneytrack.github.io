package ru.koluch.wordlist

import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServlet

/**
 * Created by Nikolai_Mavrenkov on 28/12/15.
 */
class EntryPointServlet : HttpServlet() {

    override fun service(req: ServletRequest?, res: ServletResponse?) {
        res!!.writer.print("<h1>hi again</h1>")
    }
}