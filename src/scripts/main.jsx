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

const DISPATCH_URL = "http://localhost:8080/dispatch"


ajax.get(DISPATCH_URL)
.then((response) => {
    return response
}, (err) => {
    console.error(err)
    console.error("Failed to load state, use default state");
    return Promise.resolve({
        history: [],
        categoryList: []
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
                const date = moment(action.date)

                const valid = !isNaN(amount) && (categoryId in state.categoryMap)
                if(valid) {
                    return update(state, {
                        [id]: {$set: {
                            id,
                            amount,
                            categoryId,
                            comment,
                            date
                        }}
                    })
                }
                else {
                    console.error("Invalid action", action)
                }
                //todo: handle "failed" case
            }
            break;

            case 'DELETE_EXPENSE': {

                const keys = Object.keys(state.history).filter(key => key !== action.id).map(key => state)



                const newHistory = Object.assign({}, state.history)
                newHistory.remove(aciton.id)

                return update(state, {
                    history: {$set: state.history.filter(expense => expense.id !== action.id)}
                })
                //todo: handle "failed" case
            }
            break;

            default: ;
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