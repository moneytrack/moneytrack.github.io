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

const paymentsHistoryInit = [
    {amount:290.0, comment:"Lunch", date: 1451126739340},
    {amount:860.0, comment:"Some food", date: 1450983139340},
    {amount:390.0, comment:"Lunch (teremok)", date: 1451041813860}
]

const paymentsHistory = (state = paymentsHistoryInit, action) => {
    return state
}

const store = createStore(paymentsHistory)

ReactDOM.render(
    <Provider store={store}>
        <Root />
    </Provider>,
    document.getElementById("react")
)
