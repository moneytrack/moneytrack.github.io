"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import moment from 'moment'

import ModalContainer from './ModalContainer'

const History = React.createClass({

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


        const expensesByDays = groupBy(history, (expense) => moment(expense.date).format('YYYY MM DD'))



        return (
            <div className="history">
                {
                    expensesByDays.map((group) => {
                        var day = moment(group[0].date).format('dddd, MMMM Do YYYY')
                        return (<div key={day}>
                            <p><b>{day}</b></p>
                            {
                                group.map((expense) => {
                                    const category = categoryList.filter(x => x.id === expense.categoryId)[0]
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
                                                       {' '} — {category.title}
                                                    </div>
                                                </div>
                                                <div  className="history__expense__comment">
                                                    {expense.comment}
                                                </div>
                                            </div>
                                            <div  className="history__expense__controls" >
                                                <button onClick={() => this.props.onDelete(expense.id)}>Delete</button>
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
