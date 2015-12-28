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
import {createStore} from 'redux'
import {Provider} from 'react-redux'

import Root from './Root.jsx'

const initState = {
    seq: 9,
    categoryList: [
        {id:0,title:"Other"},
        {id:1,title:"Lunch"},
        {id:2,title:"Grocery"},
        {id:6,title:"Home",children:[
            {id:7,title:"Electricity"},
            {id:8,title:"Internet"}
        ]},
    ],
    history: [
        {id:3, amount:290.0, comment:"KFC", date: 1451126739340, categoryId:1},
        {id:4, amount:860.0, comment:"Some food", date: 1450983139340, categoryId:2},
        {id:5, amount:390.0, comment:"Teremok", date: 1451041813860, categoryId:1}
    ]
}

const reducer = (state = initState, action) => {
    switch(action.type) {
        case 'NEW_EXPENSE': {
            const amount = parseFloat(action.amount)
            const categoryId = parseInt(action.categoryId)
            const comment = action.comment;

            const valid = !isNaN(amount) && state.categoryList.filter((x) => x.id === categoryId).length > 0;
            if(valid) {
                state = update(state, {
                    history: {$push: [{
                        id: state.seq,
                        amount:parseFloat(amount),
                        categoryId,
                        comment
                    }]},
                    seq: {$set: state.seq + 1}
                })
            }
        };
        default: ;
    }
    return state
}

const store = createStore(reducer)

ReactDOM.render(
    <Provider store={store}>
        <Root />
    </Provider>,
    document.getElementById("react")
)
