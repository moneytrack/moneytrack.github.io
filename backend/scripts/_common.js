"use strict";
/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 17.01.2016 15:09
 */

var request = require("sync-request");
var colors = require("colors/safe")

function Sender() {}

Sender.prototype.sendAction = function (data) {
    return post({
        url: "http://localhost:8081/dispatch",
        json: true,
        headers: this.cookies,
        body: data
    })
};

Sender.prototype.req = function(method, url, params) {
    params = params || {}
    params.followRedirects = false;
    if(this.cookies) {
        params.headers = params.headers || {}
        params.headers["Cookie"] = this.cookies
    }
    console.log(colors.cyan("> " + method + " " + url))
    console.log(colors.cyan("> " + JSON.stringify(params, undefined, 4)))
    var result = request(method, url, params);

    if(result.statusCode >= 400) {
        console.log(colors.red("> " + result.body.toString("utf8")));
        throw new Error(result)
    }
    console.log(colors.green("< " + result.statusCode + ": " + result.body.toString("utf8")))
    if(result.headers['set-cookie']) {
        var newCookies = result.headers['set-cookie']
        this.cookies = newCookies.map((cookie) => {
            return cookie.split(/\s*;\s*/)[0]
        })
    }
    return {
        body: result.body.toString("utf8"),
        headers: result.headers
    };
}

Sender.prototype.get = function(url, params) {
    return this.req('GET', url, params);
}

Sender.prototype.post = function(url, params) {
    if (params.form) {
        params.body = []
        for(var i in params.form) {
            params.body.push(i + "=" + encodeURIComponent(params.form[i]))
        }
        params.body = params.body.join("&")
        params.headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    return this.req('POST', url, params);
}

module.exports.Sender = Sender