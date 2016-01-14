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
    var result = sender.post('http://localhost:8081/dispatch', { json: json})
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

var loginResponse = sender.post('http://localhost:8081/_ah/login?continue=%2Fauth', {form: {
    'email':'test@example.com',
    'continue':'/login',
    'action':'Log In'
}});


sender.get('http://localhost:8081/login')

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
var DAYS = 356
var EXPENSE_PER_DAY = 3;
var cats = [homeCategoryId, paymentsCategoryId, rentCategoryId, internetCategoryId,
 foodCategoryId, atWorkCategoryId, atHomeCategoryId, transportCategoryId, familyCategoryId, presentsCategoryId]

var words = ("using props passed down from parent to generate state in "
+ "often leads to duplication of source of truth where the real data "
+ "is whenever possible compute values on-the-fly to ensure that they dont "
+ "get out of sync later on and cause maintenance trouble").split(/\s+/g)


var dev = 0.4;

function choose(arr) {
    return arr[parseInt(Math.random() * arr.length)]
}

const makeText = function(len) {
    var result = [];
    var count = len - (len * dev) + (len * dev * 2 * Math.random())
    for(var i = 0; i < count; ++i) {
        result.push(choose(words))
    }

    return result.join(" ");
}

function makeNumber(num) {
    return num - (num * dev) + (num * dev * 2 * Math.random())
}

var time = moment("2015-01-01 09:46");
for(var day = 0; day < DAYS; ++day) {
    for(var expense = 0; expense < makeNumber(EXPENSE_PER_DAY); ++expense) {

        time.add(makeNumber(3), 'hours')
        time.add(makeNumber(30), 'minutes')

        dispatch({
            type:"NEW_EXPENSE",
            amount: money(makeNumber(300)),
            categoryId: choose(cats),
            comment: makeText(5),
            date: time.valueOf()
        })

    }
    time.add(1, 'days')
    time.set('hours', 9)
}
