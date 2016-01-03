"use strict"
/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 *
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 01.11.2015 23:04
 */
import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react-addons-update'
import {createStore, applyMiddleware} from 'redux'
import createLogger from 'redux-logger'
import {Provider} from 'react-redux'
import Q from 'kew'

import ajax from './ajax'
import Root from './Root.jsx'

const DISPATCH_URL = "http://localhost:8080/dispatch"

//todo: get rid of this function
function flatCategoryTree(categoryList) {
    const result = []
    for(var i = 0; i<categoryList.length; ++i) {
        const category = categoryList[i];
        result.push(category)
        var flattenChildren = flatCategoryTree(category.children)
        for(var j = 0; j<flattenChildren.length; ++j) {
            result.push(flattenChildren[j])
        }
    }
    return result
}


ajax.get(DISPATCH_URL)
.then((response) => {
    return response
}, (err) => {
    console.error(err)
    console.error("Failed to load state, use default state");
    return Q.resolve({
        history: [],
        categoryList: []
    });
})
.then((initState) => {

    function confirm(state, action, cb, cbe) {
        if(action.status === "success") {
            return cb(action.result)
        }
        else if(action.status === "failed") {
            const cbe = cbe ? cbe : (err) => {
                console.error(err)
                return state
            }
            return cbe(action.result)
        }
        else {
            ajax.post(DISPATCH_URL, action).then((result) => {
                store.dispatch(Object.assign({}, action, {
                    status: "success",
                    result: result
                }))
            }, (err) => {
                store.dispatch(Object.assign({}, action, {
                    status: "failed",
                    result: err
                }))                
            })
            return state
        }
    }


    const reducer = (state = initState, action) => {
        const {type} = action
        switch(type) {
            case 'NEW_EXPENSE': {
                return confirm(state, action, (id) => {
                    const amount = parseFloat(action.amount)
                    const categoryId = parseInt(action.categoryId)
                    const comment = action.comment;

                    const valid = !isNaN(amount) && flatCategoryTree(state.categoryList).filter((x) => x.id === categoryId).length > 0;
                    if(valid) {
                        return update(state, {
                            history: {$push: [{
                                id,
                                amount,
                                categoryId,
                                comment
                            }]}
                        })
                    }
                    else {
                        console.error("Invalid action", action)
                    }
                })
                break;
            };

            case 'DELETE_EXPENSE': {
                return confirm(state, action, () => {
                    return update(state, {
                        history: {$set: state.history.filter(expense => expense.id !== action.id)}
                    })
                })
                break;
            };

            default: ;
        }
        return state
    }

    const store = applyMiddleware(createLogger())(createStore)(reducer)
    // const store = createStore(reducer)

    ReactDOM.render(
        <Provider store={store}>
            <Root />
        </Provider>,
        document.getElementById("react")
    )
}, (err) => {
    console.log(err)
})