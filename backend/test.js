"use strict";
/**
 * Copyright (c) 2015 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 30.12.2015 22:03
 */
var request = require("sync-request");
var moment = require("moment")
var colors = require("colors/safe")
/*

    Categories:
        Home
            Payments
                Rent
                Internet
        Food
            Work
            Home        

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
function Sender() {
    
}

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


/******************************************************************************/

var sender = new Sender();

function dispatch(json)  {
    var result = sender.post('http://localhost:8080/dispatch', { json: json})
    if(result.body) {
        return JSON.parse(result.body)
    }
}

function time(str) {
    return moment(str).valueOf()
}

function money(rubels) {
    return Math.floor(rubels * 100)
}

sender.get('http://localhost:8080/clean')

var loginResponse = sender.post('http://localhost:8080/_ah/login?continue=%2Fauth', {form: {
    'email':'test@example.com',
    'continue':'/auth',
    'action':'Log In'
}});

sender.get('http://localhost:8080/auth')

var initialState = JSON.parse(sender.get('http://localhost:8081/dispatch').body)
var rootCategoryId = initialState.rootCategoryId


/*
    Categories:
        Home
            Payments
                Rent
                Internet
        Food
            Work
            Home        
*/

// Categories
var homeCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Home",
    parentId: rootCategoryId
})

var paymentsCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Payments",
    parentId:homeCategoryId
})

var rentCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Rent",
    parentId:paymentsCategoryId
})

var internetCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Internet",
    parentId:paymentsCategoryId
})

var foodCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Food",
    parentId: rootCategoryId
})

var atWorkCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Work",
    parentId:foodCategoryId
})

var atHomeCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Home",
    parentId:foodCategoryId
})

var transportCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Transport",
    parentId: rootCategoryId
})

var familyCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Family",
    parentId: rootCategoryId
})

var presentsCategoryId = dispatch({
    type:"NEW_CATEGORY",
    title:"Presents",
    parentId:familyCategoryId
})


// Expenses
/*
    November 26, 2015:
        12:46 - 315 - Food/Work - Lunch (Teremok)
        15:17 - 20000 - Home/Payments/Rent
        20:52 - 1053.56 - Food/Home - Some goods (Okay)
*/
dispatch({
    type:"NEW_EXPENSE",
    amount: money(315),
    categoryId: atWorkCategoryId,
    comment:"Lunch (Teremok)",
    date: time("2015-11-26 12:46")
})

dispatch({
    type:"NEW_EXPENSE",
    amount: money(20000),
    categoryId: rentCategoryId,
    date: time("2015-11-26 15:17")
})


dispatch({
    type:"NEW_EXPENSE",
    amount: money(1053.56),
    categoryId: atHomeCategoryId,
    comment:"Some goods (Okay))",
    date: time("2015-11-26 20:52")
})

/*
    November 27, 2015:
        13:10 - 400 - Food/Work - Lunch, sushi
        21:12 - 293.10 - Food/Home - Diksi

*/
dispatch({
    type:"NEW_EXPENSE",
    amount: money(400),
    categoryId: atWorkCategoryId,
    comment:"Lunch, sushi",
    date: time("2015-11-27 13:10")
})

dispatch({
    type:"NEW_EXPENSE",
    amount: money(293.10),
    categoryId: atHomeCategoryId,
    comment:"Diksi",
    date: time("2015-11-27 21:12")
})

/*
    November 28, 2015:
        18:31 - 1574.56 - Some goods from Okay
*/
dispatch({
    type:"NEW_EXPENSE",
    amount: money(1574.56),
    categoryId: atHomeCategoryId,
    comment:"Some goods from Okay",
    date: time("2015-11-28 18:31")
})

/*
    November 30, 2015:
        10:34 - 500 - Transport - Podoroznik
        12:15 - 326 - Food/Work - Lunch (KFC)
        16:12 - 4210 - Family/Presents - Present for papa
*/
dispatch({
    type:"NEW_EXPENSE",
    amount: money(500),
    categoryId: transportCategoryId,
    comment:"Podoroznik",
    date: time("2015-11-30 10:34")
})

dispatch({
    type:"NEW_EXPENSE",
    amount: money(326),
    categoryId: atWorkCategoryId,
    comment:"Lunch (KFC)",
    date: time("2015-11-30 12:15")
})

dispatch({
    type:"NEW_EXPENSE",
    amount: money(4210),
    categoryId: presentsCategoryId,
    comment:"Present for papa",
    date: time("2015-11-30 16:12")
})


/*
    December 01, 2015:
        12:37 - 336 - Food/Work - Lunch (Teremok)
        21:32 - 502.90 - Home/Payments/Internet - Interzet
*/
dispatch({
    type:"NEW_EXPENSE",
    amount: money(336),
    categoryId: atWorkCategoryId,
    comment:"Lunch (Teremok)",
    date: time("2015-12-01 12:37")
})

dispatch({
    type:"NEW_EXPENSE",
    amount: money(502.90),
    categoryId: internetCategoryId,
    comment:"Interzet",
    date: time("2015-12-01 21:32")
})



/*
    December 02, 2015:
        13:06 - 297 - Food/Work - Lunch (Teremok)
*/
dispatch({
    type:"NEW_EXPENSE",
    amount: money(297),
    categoryId: atWorkCategoryId,
    comment:"Lunch (Teremok)",
    date: time("2015-12-01 13:06")
})

