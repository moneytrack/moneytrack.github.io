package ru.koluch.wordlist

import com.google.appengine.api.datastore.*
import com.google.appengine.api.datastore.FetchOptions.Builder
import com.google.appengine.api.datastore.FetchOptions.Builder.*
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


class AuthServlet : HttpServlet() {

    override fun service(req: HttpServletRequest, res: HttpServletResponse) {
        val userService = UserServiceFactory.getUserService();
        when (req.requestURI) {
            "/login" -> {

                val thisURL = req.requestURL.toString() + if (req.queryString != null) ("?" + req.queryString) else ("");

                val userPrincipal = req.userPrincipal
                if (userPrincipal != null) {
                    val datastore = DatastoreServiceFactory.getDatastoreService()

                    //todo: make transactional
                    if (!datastore.exists(KeyFactory.createKey(USER_KIND, userPrincipal.name))) {

                        val newUserEntity = Entity(USER_KIND, userPrincipal.name)
                        val userEntityKey = datastore.put(newUserEntity)

                        val rootCategoryEntity = Entity(CATEGORY_KIND, userEntityKey)
                        rootCategoryEntity.setProperty(CATEGORY_PROP_TITLE, "Root")
                        rootCategoryEntity.setProperty(CATEGORY_PROP_PARENT_ID, null)
                        rootCategoryEntity.setProperty(CATEGORY_PROP_ORDER, 0)
                        val rootCategoryKey = datastore.put(rootCategoryEntity)

                        newUserEntity.setProperty(USER_PROP_ROOT_CATEGORY_ID, rootCategoryKey.id)
                        datastore.put(newUserEntity)
                    }

                    //todo: need to think about security in this place. Is it save to take redirect url from params?
                    val redirect: String = req.getParameter("redirect") ?: "/";
                    res.sendRedirect(redirect);
                } else {
                    res.sendRedirect(userService.createLoginURL(thisURL))
                }
            }
            "/logout" -> {
                val userPrincipal = req.userPrincipal
                if (userPrincipal != null) {
                    res.sendRedirect(userService.createLogoutURL("/"))
                } else {
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED)
                    res.writer.println("User is not authorized");
                }
            }
            else -> {
                res.writer.println("Unknown uri: " + req.requestURI);
            }
        }


    }
}
