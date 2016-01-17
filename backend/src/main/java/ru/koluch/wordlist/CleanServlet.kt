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

class CleanServlet : HttpServlet() {
    override fun service(req: HttpServletRequest, res: HttpServletResponse) {

        //todo: add captcha

        val datastore = DatastoreServiceFactory.getDatastoreService()

        val userPrincipal = req.userPrincipal
        if (userPrincipal == null) {
            res.writer.println("User is not authorized")
            res.sendError(HttpServletResponse.SC_FORBIDDEN)
            return;
        }

        val userEntity: Entity
        try {
            userEntity = datastore.get(KeyFactory.createKey(USER_KIND, userPrincipal.name))
        } catch(e: EntityNotFoundException) {
            res.writer.println("User account info not found, nothing to delete")
            res.sendError(HttpServletResponse.SC_OK)
            return;
        }

        val tx = datastore.beginTransaction();
        try {
            val query = Query(userEntity.key)
            query.setKeysOnly()
            val preparedQuery = datastore.prepare(tx, query)

            val entities = preparedQuery.asList(FetchOptions.Builder.withDefaults())
            if(entities.size > 50000) { //todo: estimate this value
                throw RuntimeException("Too many entities. Please, contact support")
            }

            for (entity in entities) {
                datastore.delete(tx, entity.key)
            }

            tx.commit();
        } catch(e: Exception) {
            tx.rollback();
            throw e;
        }

    }
}