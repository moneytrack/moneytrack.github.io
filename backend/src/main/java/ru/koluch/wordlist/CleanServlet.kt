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

class CleanServlet : Servlet() {

    override fun doGet(req: HttpServletRequest, resp: HttpServletResponse) {
        super.doGet(req, resp)

        //todo: add captcha

        val datastore = DatastoreServiceFactory.getDatastoreService()

        val userPrincipal = req.userPrincipal
        if (userPrincipal == null) {
            resp.writer.println("User is not authorized")
            resp.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        datastore.inTransaction {tx ->
            val userEntity = datastore.getNull(tx, KeyFactory.createKey(USER_KIND, userPrincipal.name))
            if(userEntity == null) {
                resp.writer.println("User account info not found, nothing to delete")
            }
            else {
                val query = Query(userEntity.key)
                query.setKeysOnly()
                val preparedQuery = datastore.prepare(tx, query)

                val entities = preparedQuery.asList(FetchOptions.Builder.withDefaults())
                if (entities.size > 50000) {
                    //todo: estimate this value
                    throw RuntimeException("Too many entities. Please, contact support")
                }

                for (entity in entities) {
                    datastore.delete(tx, entity.key)
                }
            }
            resp.setStatus(HttpServletResponse.SC_OK)
        }
    }
}