package ru.koluch.wordlist

import com.google.appengine.api.datastore.*
import com.google.appengine.api.datastore.Query.FilterOperator.EQUAL

/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 29.12.2015 02:30
 */
fun DatastoreService.exists(key: Key): Boolean {
    val keyPredicate = Query.FilterPredicate(Entity.KEY_RESERVED_PROPERTY, EQUAL, key)
    val checkForUserQuery = Query(key.kind).setFilter(keyPredicate)
    return this.prepare(checkForUserQuery).countEntities(FetchOptions.Builder.withLimit(1)) > 0
}

fun DatastoreService.exists(transaction: Transaction, key: Key, ancestorKey: Key): Boolean {
    val keyPredicate = Query.FilterPredicate(Entity.KEY_RESERVED_PROPERTY, EQUAL, key)
    val checkForUserQuery = Query(key.kind, ancestorKey).setFilter(keyPredicate)
    return this.prepare(transaction, checkForUserQuery).countEntities(FetchOptions.Builder.withLimit(1)) > 0
}

fun DatastoreService.getNull(key: Key): Entity? {
    try {
        return this.get(key)
    } catch(e: EntityNotFoundException) {
        return null;
    }
}