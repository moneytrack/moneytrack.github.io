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
        url: "http://localhost:8080/dispatch",
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

function action(json)  {
    var result = sender.post('http://localhost:8080/dispatch', { json: json})
    if(result.body) {
        return JSON.parse(result.body)
    }
}

function time(str) {
    return moment(str).valueOf()
}

function money(rubels) {
    return Math.floor(rubels / 100)
}

sender.get('http://localhost:8080/clean')

var loginResponse = sender.post('http://localhost:8080/_ah/login?continue=%2Fauth', {form: {
    'email':'test@example.com',
    'continue':'/auth',
    'action':'Log In'
}});

sender.get('http://localhost:8080/auth')

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
var homeCategoryId = action({
    type:"NEW_CATEGORY",
    title:"Home"
})

var paymentsCategoryId = action({
    type:"NEW_CATEGORY",
    title:"Payments",
    parentId:homeCategoryId
})

var rentCategoryId = action({
    type:"NEW_CATEGORY",
    title:"Rent",
    parentId:paymentsCategoryId
})

var internetCategoryId = action({
    type:"NEW_CATEGORY",
    title:"Internet",
    parentId:paymentsCategoryId
})

var foodCategoryId = action({
    type:"NEW_CATEGORY",
    title:"Food"
})

var atWorkCategoryId = action({
    type:"NEW_CATEGORY",
    title:"Work",
    parentId:foodCategoryId
})

var atHomeCategoryId = action({
    type:"NEW_CATEGORY",
    title:"Home",
    parentId:foodCategoryId
})

// Expenses
/*
    November 26, 2015:
        12:46 - 315 - Food/Work - Lunch (Teremok)
        15:17 - 20000 - Home/Payments/Rent
        20:52 - 1053.56 - Food/Home - Some goods (Okay)
*/
action({
    type:"NEW_EXPENSE",
    amount: money(315),
    categoryId: atWorkCategoryId,
    comment:"Lunch (Teremok)",
    date: time("2016-11-26 12:46")
})

action({
    type:"NEW_EXPENSE",
    amount: money(20000),
    categoryId: rentCategoryId,
    date: time("2016-11-26 15:17")
})


action({
    type:"NEW_EXPENSE",
    amount: money(20000),
    categoryId: atHomeCategoryId,
    comment:"Some goods (Okay))",
    date: time("2016-11-26 20:52")
})

/*
    November 27, 2015:
        13:10 - 400 - Food/Work - Lunch, sushi
        21:12 - 293.10 - Food/Home - Diksi

*/
action({
    type:"NEW_EXPENSE",
    amount: money(400),
    categoryId: atWorkCategoryId,
    comment:"Lunch, sushi",
    date: time("2016-11-27 13:10")
})

action({
    type:"NEW_EXPENSE",
    amount: money(293.10),
    categoryId: atHomeCategoryId,
    comment:"Diksi",
    date: time("2016-11-27 21:12")
})

/*
    November 28, 2015:
        18:31 - 1574.56 - Some goods from Okay
*/
action({
    type:"NEW_EXPENSE",
    amount: money(293.10),
    categoryId: atHomeCategoryId,
    comment:"Some goods from Okay",
    date: time("2016-11-28 18:31")
})





// get({url:"http://localhost:8080/clean"})
// .then(() => post({
//     url:"http://localhost:8080/_ah/login",
//     form:{
//         'email':'test@example.com',
//         'continue':'/auth',
//         'action':'Log In'
//     }
// }))
// .then((result) => {
//     var cookie = result.response.headers['set-cookie'];
//     if(!cookie) throw new Error("No auth cookie");
//     var loginCookieValue = cookie[0].split(";")[0].split("=")[1]; // ["dev_appserver_login=test@example.com:false:185804764220139124118;Path=/"] => test@example.com:false:185804764220139124118

//     var cookies = {
//         "Cookie": "dev_appserver_login=" + loginCookieValue
//     };

//     var sender = new Sender(cookies);

//     return get({
//         url: "http://localhost:8080/auth",
//         "headers": cookies
//     })
//     .catch((err) => console.error(err))
//     .then(() => sender.sendAction({
//         type:"NEW_CATEGORY",
//         title:"Home"
//     }))
//     .then((result) => sender.sendAction({
//         type:"NEW_CATEGORY",
//         title:"Internet",
//         parentId:parseFloat(result.body)
//     }))
//     .then((result) => {
//         const categoryId = parseFloat(result.body);
//         return sender.sendAction({
//             type:"NEW_EXPENSE",
//             amount:45000,
//             categoryId: categoryId,
//             comment:"InterZet",
//             date: 1451872749936
//         })
//         .then((result) => sender.sendAction({
//             type:"NEW_EXPENSE",
//             amount:14999,
//             categoryId: categoryId,
//             comment:"Mobile",
//             date: 1451872749936
//         }))
//         .then((result) => sender.sendAction({
//             type:"NEW_EXPENSE",
//             amount:35000,
//             categoryId: categoryId,
//             comment:"For parents (in Olenegorsk)",
//             date: 1451872749936
//         }))
//     })
//     .catch((err) => console.error(err));
// })
// .catch((err) => console.error(err));