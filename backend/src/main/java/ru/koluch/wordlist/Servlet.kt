package ru.koluch.wordlist

import com.google.appengine.api.utils.SystemProperty
import java.util.*
import javax.servlet.ServletConfig
import javax.servlet.http.HttpServlet
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.collections.get
import kotlin.text.startsWith

/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 18.01.2016 06:22
 */
open class Servlet : HttpServlet() {

    val env = Properties()

    override fun init(config: ServletConfig) {
        super.init(config)
        if(SystemProperty.environment.value() == SystemProperty.Environment.Value.Production) {
            env.load(config.servletContext.getResourceAsStream("/WEB-INF/env_prod.properties"))
        }
        else {
            env.load(config.servletContext.getResourceAsStream("/WEB-INF/env_dev.properties"))
        }
    }

    override fun doOptions(req: HttpServletRequest, resp: HttpServletResponse) {
        super.doOptions(req, resp)
        resp.addHeader("Access-Control-Allow-Origin", env.getProperty("allowOrigin"))
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
        resp.addHeader("Access-Control-Allow-Origin", env.getProperty("allowOrigin"))
        resp.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        resp.addHeader("Access-Control-Allow-Credentials", "true")


        if(SystemProperty.environment.value() == SystemProperty.Environment.Value.Production) {
            val referer = req.getHeader("Referer")
            if (referer == null || !referer.startsWith(env.getProperty("allowOrigin"))) {
                throw RuntimeException("Bad referer")
            }
        }
    }
}