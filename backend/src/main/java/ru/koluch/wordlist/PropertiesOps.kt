package ru.koluch.wordlist

import com.google.appengine.api.utils.SystemProperty
import java.io.FileInputStream
import java.util.*
import kotlin.collections.get
import kotlin.collections.mapOf

/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 20.01.2016 22:25
 */

object env : Properties() {
    init {
        if(SystemProperty.environment.value() == SystemProperty.Environment.Value.Production) {
            this.load(this.javaClass.classLoader.getResourceAsStream("/env_prod.properties"))
        }
        else {
            this.load(this.javaClass.classLoader.getResourceAsStream("/env_dev.properties"))
        }
    }
}