package ru.koluch.wordlist

import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.text.startsWith

/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 18.01.2016 06:22
 */
open class Servlet : HttpServlet() {

    val allowedOrigin = "http://moneytrack.github.io"

    override fun doOptions(req: HttpServletRequest, resp: HttpServletResponse) {
        super.doOptions(req, resp)
        resp.addHeader("Access-Control-Allow-Origin", allowedOrigin)
        resp.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        resp.addHeader("Access-Control-Allow-Credentials", "true")
    }

    override fun doTrace(req: HttpServletRequest, resp: HttpServletResponse) {
        setAndCheckOrigin(req, resp)
    }

    override fun doPut(req: HttpServletRequest, resp: HttpServletResponse) {
        setAndCheckOrigin(req, resp)
    }

    override fun doPost(req: HttpServletRequest, resp: HttpServletResponse) {
        setAndCheckOrigin(req, resp)
    }

    override fun doHead(req: HttpServletRequest, resp: HttpServletResponse) {
        setAndCheckOrigin(req, resp)
    }

    override fun doDelete(req: HttpServletRequest, resp: HttpServletResponse) {
        setAndCheckOrigin(req, resp)
    }

    override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
        setAndCheckOrigin(req, resp)
    }

    private fun setAndCheckOrigin(req: HttpServletRequest, resp: HttpServletResponse) {
        resp.addHeader("Access-Control-Allow-Origin", allowedOrigin)
        resp.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        resp.addHeader("Access-Control-Allow-Credentials", "true")

        val referer = req.getHeader("Referer")
        if (referer == null || !referer.startsWith(allowedOrigin)) {
            throw RuntimeException("Bad referer")
        }
    }
}