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


class AuthServlet : Servlet() {

    override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
        super.doGet(req, resp)

        val userService = UserServiceFactory.getUserService();
        when (req.requestURI) {
            "/login" -> {

                val thisURL = req.requestURL.toString() + if (req.queryString != null) ("?" + req.queryString) else ("");

                val userPrincipal = req.userPrincipal
                if (userPrincipal != null) {
                    val datastore = DatastoreServiceFactory.getDatastoreService()

                    datastore.inTransaction { tx ->
                        val userEntity = datastore.getNull(tx, KeyFactory.createKey(USER_KIND, userPrincipal.name))
                        if(userEntity == null) {
                            val newUserEntity = Entity(USER_KIND, userPrincipal.name)
                            val userEntityKey = datastore.put(tx, newUserEntity)

                            val rootId = createDefaultCategories(tx, userEntityKey, datastore).key.id

                            newUserEntity.setProperty(USER_PROP_ROOT_CATEGORY_ID, rootId)
                            newUserEntity.setProperty(USER_PROP_CURRENCY, "USD")
                            datastore.put(tx, newUserEntity)
                        }
                    }

                    //todo: need to think about security in this place. Is it save to take redirect url from params?
                    val redirect: String = req.getParameter("redirect") ?: "/";
                    resp.sendRedirect(redirect);
                } else {
                    resp.sendRedirect(userService.createLoginURL(thisURL))
                }
            }
            "/logout" -> {
                val userPrincipal = req.userPrincipal
                if (userPrincipal != null) {
                    resp.sendRedirect(userService.createLogoutURL("/"))
                } else {
                    resp.sendError(HttpServletResponse.SC_UNAUTHORIZED)
                    resp.writer.println("User is not authorized");
                }
            }
            else -> {
                resp.writer.println("Unknown uri: " + req.requestURI);
            }
        }
    }

    private fun createDefaultCategories(tx: Transaction, ancestor: Key, datastore: DatastoreService): Entity {

        val root = createCategory(ancestor, "Root", null, 0)
        val rootId = datastore.put(tx, root).id

        datastore.put(tx, createCategory(ancestor, "Transport", rootId, 0))
        datastore.put(tx, createCategory(ancestor, "Food", rootId, 0))
        datastore.put(tx, createCategory(ancestor, "Self care", rootId, 0))
        datastore.put(tx, createCategory(ancestor, "Сlothes", rootId, 0))

        return root;
    }


    private fun createCategory(ancestor: Key, title: String, parent: Long?, order: Long = 0): Entity {
        val entity = Entity(CATEGORY_KIND, ancestor)
        entity.setProperty(CATEGORY_PROP_TITLE, title)
        entity.setProperty(CATEGORY_PROP_PARENT_ID, parent)
        entity.setProperty(CATEGORY_PROP_ORDER, order)
        return entity;
    }
}
