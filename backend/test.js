"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 30.12.2015 22:03
 */
var request = require("request");

request.debug = true;

function post(params) {
    return new Promise(function(success, fail){
        request.post(params, (err, response, body) => {
            if(err!=null) {
                fail(err);
            }
            else {
                success({response,body})
            }
        });
    })
}

function get(params) {
    return new Promise(function(success, fail){
        request.get(params, (err, response, body) => {
            if(err!=null) {
                fail(err);
            }
            else {
                success({response,body})
            }
        });
    })
}

post({
    url:"http://localhost:8080/_ah/login",
    form:{
        'email':'test@example.com',
        'continue':'/auth',
        'action':'Log In'
    }
})
.catch((err) => console.error(err))
.then((result) => {
    var cookie = result.response.headers['set-cookie'];
    if(!cookie) throw new Error("No auth cookie");
    console.log(cookie);
    var loginCookieValue = cookie[0].split(";")[0].split("=")[1]; // ["dev_appserver_login=test@example.com:false:185804764220139124118;Path=/"] => test@example.com:false:185804764220139124118

    return post({
        url: "http://localhost:8080/auth",
        json: true,
        "headers": {
            "Cookie": "dev_appserver_login=" + loginCookieValue
        }
    })
})
.then((response) => console.log(response))
.catch((err) => console.error(err));



//body: JSON.stringify({
//    "type":"NEW_CATEGORY",
//    "title":'Other',
//
//})

