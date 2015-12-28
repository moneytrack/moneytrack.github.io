package ru.koluch.wordlist

import com.google.appengine.api.users.UserService
import com.google.appengine.api.users.UserServiceFactory
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
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
class AuthServlet: HttpServlet() {
    override fun service(req: HttpServletRequest, res: HttpServletResponse) {
        val userService = UserServiceFactory.getUserService();

        val thisURL = req.requestURI;

        res.contentType = "text/html";
        req.userPrincipal
        if (req.userPrincipal != null) {
            res.writer.println("<p>Hello, " +
                    req.userPrincipal.name +
                    "!  You can <a href=\"" +
                    userService.createLogoutURL(thisURL) +
                    "\">sign out</a>.</p>");
        } else {
            res.writer.println("<p>Please <a href=\"" +
                    userService.createLoginURL(thisURL) +
                    "\">sign in</a>.</p>");
        }
    }
}