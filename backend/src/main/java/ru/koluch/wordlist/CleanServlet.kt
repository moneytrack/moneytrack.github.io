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

        val datastore = DatastoreServiceFactory.getDatastoreService()
        val query = Query()
        query.setKeysOnly()
        val preparedQuery = datastore.prepare(query)

        var counter = 100
        while(counter-->0) {
            val entities: List<Entity> = preparedQuery.asList(FetchOptions.Builder.withDefaults())
            if(entities.isEmpty()) {
                return;
            }
            for (entity in entities) {
                datastore.delete(entity.key)
            }

        }
        throw RuntimeException("Too much entities")


    }
}