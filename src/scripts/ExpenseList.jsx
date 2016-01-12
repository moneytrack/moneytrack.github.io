"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import moment from 'moment'

import ModalContainer from './ModalContainer'
import EditExpense from './EditExpense'
import {editExpense} from './action-creators'
import ConfirmDialog from './ConfirmDialog'

const ExpenseList = React.createClass({

    
    render: function () {
        const {data} = this.props

        const {categoryList} = this.context.store.getState()

        function groupBy(arr, f) {
            const result = [];
            let group = null;
            let lastGroupValue = null;
            for(let i = 0; i<arr.length; ++i) {
                let next = arr[i]
                let newGroupValue = f(next)
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
            let parentId = category.parentId;
            const result = [category];
            while(parentId) {
                let parent = categoryList.filter(x => x.id === parentId)[0];
                result.unshift(parent)
                parentId = parent.parentId;
            }
            return result;
        }


        const sortedHistory = data.sort((e1, e2) => e2.date - e1.date)
        const expensesByDays = groupBy(sortedHistory, (expense) => moment(expense.date).format('YYYY MM DD'))

        return (
            <div className="expense-list">

                {
                    expensesByDays.map((group) => {
                        let day = moment(group[0].date).format('MMMM Do YYYY (dddd)')
                        return (<div key={day} className="expense-list__group">
                            <div className="expense-list__group__title">{day}</div>
                            {
                                group.map((expense) => {
                                    const category = categoryList.filter(x => x.id === expense.categoryId)[0]

                                    const cats = collectCategoryAncestors(category).map(cat => cat.title).join(" / ")

                                    return (
                                        <div key={expense.id} className="expense-list__expense">
                                            <div className="expense-list__expense__time">
                                                {moment(expense.date).format("HH:mm")}
                                            </div>
                                            <div>
                                                <div  className="expense-list__expense__first-line">
                                                    <div className="expense-list__expense__amount">
                                                        {expense.amount / 100} &#8381;
                                                    </div>
                                                    <div  className="expense-list__expense__category">
                                                       {' '} — {cats}
                                                    </div>
                                                </div>
                                                <div  className="expense-list__expense__comment">
                                                    {expense.comment}
                                                </div>
                                            </div>
                                            <div  className="expense-list__expense__controls" >
                                                <a href="#" className="pseudo warning" onClick={(e) => {e.preventDefault(); this.props.onDelete(expense.id)}}>Delete</a>
                                                <a href="#" className="pseudo" onClick={(e) => {e.preventDefault(); this.props.onEdit(expense.id); }}>Edit</a>
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

ExpenseList.contextTypes = {
    store: React.PropTypes.object
}

export default ExpenseList
