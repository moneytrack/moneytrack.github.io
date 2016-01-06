"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import moment from 'moment'

import ModalContainer from './ModalContainer'
import EditExpense from './EditExpense'
import {editExpense} from './action-creators'

const History = React.createClass({

    getInitialState: function() {
        return {
            editingExpense: false
        }
    },

    onEdit: function(id) {
        this.setState(update(this.state, {
            editingExpense: {$set: true},
            editingExpenseId: {$set: id}
        }))
    },

    onExpenseSave: function(data) {
        this.context.store.dispatch(editExpense(data));
        this.setState(update(this.state, {
            editingExpense: {$set: false},
        }))  
    },

    onExpenseEditCancel: function() {
        this.setState(update(this.state, {
            editingExpense: {$set: false},
        }))  
    },

    render: function () {
        const {store} = this.context
        const {history, categoryList, waiting} = store.getState()

        function groupBy(arr, f) {
            const result = [];
            var group = null;
            var lastGroupValue = null;
            for(var i = 0; i<arr.length; ++i) {
                var next = arr[i]
                var newGroupValue = f(next)
                if(group === null || f(next) !== lastGroupValue) {
                    group = []
                    result.push(group)
                }
                group.push(next)
                lastGroupValue = newGroupValue
            }
            return result;
        }

        function collectCategoryAncestors(category) {
            var parentId = category.parentId;
            const result = [category];
            while(parentId) {
                var parent = categoryList.filter(x => x.id === parentId)[0];
                result.unshift(parent)
                parentId = parent.parentId;
            }
            return result;
        }

        const sortedHistory = history.sort((e1, e2) => e2.date - e1.date)
        const expensesByDays = groupBy(history, (expense) => moment(expense.date).format('YYYY MM DD'))



        return (
            <div className="history">
                <ModalContainer visible={this.state.editingExpense}>
                    <EditExpense expenseId={this.state.editingExpenseId}
                                 onSave={this.onExpenseSave}
                                 onCancel={this.onExpenseEditCancel}/>
                </ModalContainer>
                {
                    expensesByDays.map((group) => {
                        var day = moment(group[0].date).format('MMMM Do YYYY (dddd)')
                        return (<div key={day} className="history__group">
                            <div className="history__group__title">{day}</div>
                            {
                                group.map((expense) => {
                                    const category = categoryList.filter(x => x.id === expense.categoryId)[0]

                                    const cats = collectCategoryAncestors(category).map(cat => cat.title).join(" / ")

                                    return (
                                        <div key={expense.id} className="history__expense">
                                            <div className="history__expense__time">
                                                {moment(expense.date).format("HH:mm")}
                                            </div>
                                            <div>
                                                <div  className="history__expense__first-line">
                                                    <div className="history__expense__amount">
                                                        {expense.amount / 100} &#8381;
                                                    </div>
                                                    <div  className="history__expense__category">
                                                       {' '} — {cats}
                                                    </div>
                                                </div>
                                                <div  className="history__expense__comment">
                                                    {expense.comment}
                                                </div>
                                            </div>
                                            <div  className="history__expense__controls" >
                                                <a href="#" className="pseudo warning" onClick={(e) => {e.preventDefault(); this.props.onDelete(expense.id)}}>Delete</a>
                                                <a href="#" className="pseudo" onClick={(e) => {e.preventDefault(); this.onEdit(expense.id); }}>Edit</a>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>)
                    })
                }
            </div>
        )
    }
})

History.contextTypes = {
    store: React.PropTypes.object
}

export default History
