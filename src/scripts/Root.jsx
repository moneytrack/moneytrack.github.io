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

    onDelete: function(id) {
        this.context.store.dispatch({
            type: 'DELETE_EXPENSE',
            id 
        })
    },


    render: function () {
        const {store} = this.context
        const {history, categoryList} = store.getState()

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

        var input;
        var prevValue = 0;

        return (
            <div>
                <NewExpense onAdd={this.onAdd} />
                <div>
                    {history.map((expense) => {
                        const category = flatCategoryTree(categoryList).filter(x => x.id === expense.categoryId)[0]
                        return (
                            <div key={expense.id}>
                                {expense.amount} ({category.title}): {expense.comment} 
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
