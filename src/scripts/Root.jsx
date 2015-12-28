"use strict"

import React from 'react'

import NumberInput from './NumberInput.jsx'

import NewExpense from './NewExpense.jsx'

const Root = React.createClass({

    componentDidMount: function() {
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate()
        })
    },

    componentUnmount: function() {
        this.unsubscribe();
    },

    onAdd: function({amount, categoryId, comment}) {
        this.context.store.dispatch({
            type: 'NEW_EXPENSE',
            amount,
            categoryId,
            comment
        })
    },

    render: function () {
        const {store} = this.context
        const {history, categoryList} = store.getState()

        var input;
        var prevValue = 0;

        return (
            <div>
                <NewExpense onAdd={this.onAdd} />
                <div>
                    {history.map((payment) => {
                        const category = categoryList.filter(x => x.id === payment.categoryId)[0]
                        return (<div key={payment.id}>{payment.amount} ({category.title}): {payment.comment}</div>)
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
