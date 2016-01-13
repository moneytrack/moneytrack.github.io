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
import Promise from 'es6-promise'
import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react-addons-update'
import {createStore, applyMiddleware} from 'redux'
import createLogger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import {Provider} from 'react-redux'
import moment from 'moment'

import ajax from './ajax'
import Root from './Root.jsx'
import {find} from './arrays'

const DISPATCH_URL = "http://localhost:8081/dispatch"

ajax.get(DISPATCH_URL)
.then((response) => {
    return response
}, (err) => {
    console.error(err)
    console.error("Failed to load state, use default state");
    //todo: make default state reasonable
    return Promise.resolve({
        history: [],
        categoryList: [],
        rootCategoryId: null
    });
})
.then((initState) => {

    const reducer = (state = initState, action) => {
        const {type, status} = action
        switch(type) {
            case 'WAIT': {
                return update(state, {waiting: {$set:true} })
            }

            case 'STOP_WAIT': {
                return update(state, {waiting: {$set:false} })
            }

            case 'NEW_EXPENSE': {
                const amount = parseFloat(action.amount)
                const categoryId = parseInt(action.categoryId)
                const comment = action.comment;
                const id = action.id
                const date = moment(action.date).valueOf()

                const valid = !isNaN(amount) && state.categoryList.filter((x) => x.id === categoryId).length > 0;
                if(valid) {
                    return update(state, {
                        history: {$push: [{
                            id,
                            amount,
                            categoryId,
                            comment,
                            date
                        }]}
                    })
                }
                else {
                    console.error("Invalid action", action)
                }
                //todo: handle "failed" case
            }
            break;

            case 'EDIT_EXPENSE': {
                const id = action.id
                const amount = parseFloat(action.amount)
                const categoryId = parseInt(action.categoryId)
                const comment = action.comment;
                const date = moment(action.date).valueOf()

                let newHistory = state.history.map((expense) => {
                    if(expense.id === id) {
                        return {id, amount, categoryId, comment, date}
                    }
                    else {
                        return expense
                    }
                })

                return update(state, {
                    history: {$set: newHistory}
                })
                //todo: handle "failed" case
            }
            break;


            case 'DELETE_EXPENSE': {
                return update(state, {
                    history: {$set: state.history.filter(expense => expense.id !== action.id)}
                })
                //todo: handle "failed" case
            }
            break;

            case 'NEW_CATEGORY': {
                const id = parseFloat(action.id)
                const title = action.title
                const parentId = action.parentId

                const newCategory = {
                    id,
                    title,
                    parentId,
                    childIdList: []
                }

                let newCategoryList = state.categoryList.map(category => {
                    if(category.id === parentId) {
                        return update(category, {
                            childIdList: {$push: [id]}
                        })
                    }
                    else {
                        return category;
                    }
                })
                newCategoryList = newCategoryList.concat([newCategory])

                return update(state, {
                    categoryList: {$set: newCategoryList},
                })
                //todo: handle "failed" case
            }
            break;

            case 'EDIT_CATEGORY': {
                const id = parseFloat(action.id)
                const title = action.title
                const parentId = action.parentId

                const newCategoryList = state.categoryList.map(category => {
                    if(category.id === id) {
                        let newCategory = category;
                        if(title) {
                            newCategory = update(category, {
                                title: {$set: title}
                            })
                        }
                        if(parentId) {
                            newCategory = update(category, {
                                parentId: {$set: parentId}
                            })
                        }
                        return newCategory
                    }
                    else {
                        return category
                    }
                })


                return update(state, {
                    categoryList: {$set: newCategoryList}
                })
                //todo: handle "failed" case
            }
            break;

            case 'DELETE_CATEGORY': {

                let newCategoryList = state.categoryList.map(category => {
                    if(category.id === parentId) {
                        return update(category, {
                            childIdList: {$set: category.childIdList.filter(x => x !== action.id)}
                        })
                    }
                    else {
                        return category;
                    }
                })

                return update(state, {
                    categoryList: {$set: newCategoryList},
                })
                //todo: handle "failed" case
            }
            break;


            default:
                console.warn("Unhandled action", action);
                //todo: log
            ;
        }
        return state
    }

    const store = applyMiddleware(thunkMiddleware, createLogger())(createStore)(reducer)
    // const store = createStore(reducer)

    ReactDOM.render(
        <Provider store={store}>
            <Root />
        </Provider>,
        document.getElementById("react")
    )
}, (err) => {
    console.error(err)
})
.catch((err) => {
    console.error(err)
})
