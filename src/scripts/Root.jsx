"use strict"

import React from 'react'

import NumberInput from './NumberInput.jsx'
import NewExpense from './NewExpense.jsx'
import {newExpense, deleteExpense} from './action-creators.js'
import moment from 'moment'

const Root = React.createClass({

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


    render: function () {
        const {store} = this.context
        const {history, categoryList, waiting} = store.getState()

        var input;
        var prevValue = 0;

        return (
            <div>
                <h1>Waiting: {waiting ? "waiting" : "no."}</h1>
                <NewExpense onAdd={this.onAdd} />
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
            </div>
        )
    }
})

Root.contextTypes = {
    store: React.PropTypes.object
}

export default Root
