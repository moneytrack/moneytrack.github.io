"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 30.12.2015 22:03
 */
var request = require("request");
var moment = require("moment")

/*

    November 26, 2015:
        12:46 - 315 - Food/Work - Lunch (Teremok)
        15:17 - 20000 - Home/Payments/Rent
        20:52 - 1053.56 - Food/Home - Some goods (Okay)

    November 27, 2015:
        13:10 - 400 - Lunch, sushi
        21:12 - 293.10 - Diksi

    November 28, 2015:
        18:31 - 1574.56 - Some goods from Okay

    November 29, 2015:

    November 30, 2015:
        10:34 - 500 - Transport - Podoroznik
        12:15 - 326 - Food/Work - Lunch (KFC)
        16:12 - 4210 - Family/Presents - Present for papa

    December 01, 2015:
        12:37 - 336 - Food/Work - Lunch (Teremok)
        21:32 - 502.90 - Home/Payments/Internet - Interzet

    December 02, 2015:
        13:06 - 297 - Food/Work - Lunch (Teremok)


*/

function post(params) {
    console.log()
    console.log("==========================")
    console.log('post: ' +  params.url);
    console.log("params: ", params)
    return new Promise(function(success, fail){
        request.post(params, (err, response, body) => {
            if(err!=null) {
                fail(err);
            }
            else if(response.statusCode >= 400) {
                fail("Error: ("+params.url+"): " + response.statusCode + (body ? ": " + body : ""));    
            }
            else {
                success({response,body})
            }
        });
    })
}

function get(params) {
    console.log()
    console.log("==========================")
    console.log('get: ' +  params.url);
    console.log("params: ", params)
    return new Promise(function(success, fail){
        request.get(params, (err, response, body) => {
            if(err!=null) {
                fail(err);
            }
            else if(response.statusCode >= 400) {
                fail("Error: ("+params.url+"): " + response.statusCode + (body ? ": " + body : ""));    
            }
            else {
                success({response,body})
            }
        });
    })
}

function Sender(cookies) {
    this.cookies = cookies
}

Sender.prototype.sendAction = function (data) {
    return post({
            url: "http://localhost:8080/dispatch",
            json: true,
            headers: this.cookies,
            body: data
    })
};

get({url:"http://localhost:8080/clean"})
.then(() => post({
    url:"http://localhost:8080/_ah/login",
    form:{
        'email':'test@example.com',
        'continue':'/auth',
        'action':'Log In'
    }
}))
.then((result) => {
    var cookie = result.response.headers['set-cookie'];
    if(!cookie) throw new Error("No auth cookie");
    var loginCookieValue = cookie[0].split(";")[0].split("=")[1]; // ["dev_appserver_login=test@example.com:false:185804764220139124118;Path=/"] => test@example.com:false:185804764220139124118

    var cookies = {
        "Cookie": "dev_appserver_login=" + loginCookieValue
    };

    var sender = new Sender(cookies);

    return get({
        url: "http://localhost:8080/auth",
        "headers": cookies
    })
    .catch((err) => console.error(err))
    .then(() => sender.sendAction({
        type:"NEW_CATEGORY",
        title:"Home"
    }))
    .then((result) => sender.sendAction({
        type:"NEW_CATEGORY",
        title:"Internet",
        parentId:parseFloat(result.body)
    }))
    .then((result) => {
        const categoryId = parseFloat(result.body);
        return sender.sendAction({
            type:"NEW_EXPENSE",
            amount:45000,
            categoryId: categoryId,
            comment:"InterZet",
            date: 1451872749936
        })
        .then((result) => sender.sendAction({
            type:"NEW_EXPENSE",
            amount:14999,
            categoryId: categoryId,
            comment:"Mobile",
            date: 1451872749936
        }))
        .then((result) => sender.sendAction({
            type:"NEW_EXPENSE",
            amount:35000,
            categoryId: categoryId,
            comment:"For parents (in Olenegorsk)",
            date: 1451872749936
        }))
    })
    .catch((err) => console.error(err));
})
.catch((err) => console.error(err));