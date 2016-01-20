package ru.koluch.wordlist

import com.google.appengine.api.datastore.*
import com.google.appengine.api.datastore.Query.FilterOperator.EQUAL
import java.util.*

/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 29.12.2015 02:30
 */
fun DatastoreService.exists(key: Key): Boolean {
    return this.getNull( key) != null
}

fun DatastoreService.exists(transaction: Transaction, key: Key): Boolean {
    return this.getNull(transaction, key) != null
}

fun DatastoreService.getNull(key: Key): Entity? {
    try {
        return this.get(key)
    } catch(e: EntityNotFoundException) {
        return null;
    }
}

fun DatastoreService.getNull(transaction: Transaction, key: Key): Entity? {
    try {
        return this.get(transaction, key)
    } catch(e: EntityNotFoundException) {
        return null;
    }
}

val MAX_TRANSACTION_REPEAT_COUNT = 10
fun <T> DatastoreService.inTransaction(f: (Transaction) -> T): T {
    val tx = this.beginTransaction();
    try {
        var success = false;
        var result: T? = null;
        var tryCount = MAX_TRANSACTION_REPEAT_COUNT
        while(!success) {
            try {
                result = f(tx)
                success = true;
                tx.commit()
            } catch(e: ConcurrentModificationException) {
                tx.rollback();
                if(--tryCount == 0) {
                    throw RuntimeException("Transaction try count exceeded")
                }
            }
        }
        return result!!;
    } finally {
        if(tx.isActive) {
            tx.rollback()
        }
    }
}