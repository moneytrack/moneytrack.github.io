package ru.koluch.wordlist

import com.google.appengine.api.datastore.*
import com.google.appengine.api.datastore.Query.FilterOperator.EQUAL

/**
 * Created by Nikolai_Mavrenkov on 29/12/15.
 */
fun DatastoreService.exists(key: Key): Boolean {
    val keyPredicate = Query.FilterPredicate(Entity.KEY_RESERVED_PROPERTY, EQUAL, key)
    val checkForUserQuery = Query(key.kind).setFilter(keyPredicate)
    return this.prepare(checkForUserQuery).countEntities(FetchOptions.Builder.withLimit(1)) > 0
}

fun DatastoreService.getNull(key: Key): Entity? {
    try {
        return this.get(key)
    } catch(e: EntityNotFoundException) {
        return null;
    }
}