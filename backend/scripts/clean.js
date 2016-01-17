"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 30.12.2015 22:03
 */
var moment = require("moment")

var common = require("./_common.js");


/******************************************************************************/

var sender = new common.Sender();


sender.post('http://localhost:8081/_ah/login?continue=%2Fauth', {form: {
    'email':'test@example.com',
    'continue':'/login',
    'action':'Log In'
}});

sender.get('http://localhost:8081/login')

sender.get('http://localhost:8081/clean')