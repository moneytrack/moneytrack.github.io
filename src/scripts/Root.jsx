"use strict"

import React from 'react'
import moment from 'moment'
import update from 'react-addons-update'

import {newExpense, deleteExpense} from './action-creators.js'

import NumberInput from './NumberInput.jsx'
import NewExpense from './NewExpense.jsx'
import TabsContainer from './TabsContainer.jsx'
import WaitIndicator from './WaitIndicator.jsx'

const Root = React.createClass({

    getInitialState: function() {
        return {
            activeTab: "Main"
        }
    },

    componentDidMount: function() {
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate()
        })
    },

    componentUnmount: function() {
        this.unsubscribe();
    },

    onAdd: function(attrs) {
        this.context.store.dispatch(newExpense(attrs))
    },

    onDelete: function(id) {
        this.context.store.dispatch(deleteExpense(id))
    },

    onSwitchTab: function(newActiveTab) {
        this.setState(update(this.state, {
            activeTab: {$set: newActiveTab}
        }))
    },

    render: function () {
        const {store} = this.context
        const {history, categoryList, waiting} = store.getState()

        var input;
        var prevValue = 0;

        return (
            <div>
                <TabsContainer titleList={["Main", "History"]} 
                               active={this.state.activeTab}
                               onSwitch={this.onSwitchTab}>
                    <div>
                        <NewExpense onAdd={this.onAdd} />
                    </div>

                    <div>
                        {history.map((expense) => {
                            const category = categoryList.filter(x => x.id === expense.categoryId)[0]
                            return (
                                <div key={expense.id}>
                                    {expense.amount} ({category.title}): {expense.comment} (at {moment(expense.date).format("MM.DD HH:mm:ss")})
                                    <button onClick={() => this.onDelete(expense.id)}>Delete</button>
                                </div>
                            )
                        })}
                    </div>
                </TabsContainer>
                <WaitIndicator waiting={waiting}/>
                
                
            </div>
        )
    }
})

Root.contextTypes = {
    store: React.PropTypes.object
}

export default Root
