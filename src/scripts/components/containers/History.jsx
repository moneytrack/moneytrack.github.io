"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import moment from 'moment'

import ModalContainer from './../presentational/ModalContainer'
import EditExpense from './EditExpense'
import {editExpense} from './../../action-creators'
import ExpenseList from './ExpenseList'
import CategoryPicker from './../presentational/CategoryPicker'
import {asc,desc} from './../../arrays'
const {keys} = Object

const History = React.createClass({

    getInitialState: function() {
        let now = moment();
        now.startOf('month')
        let from = now.valueOf()
        now.endOf('month')
        let to = now.valueOf()

        return {
            editingExpense: false,
            deletingExpense: false,
            filterDateFrom: from,
            filterDateTo: to,
            filterDateItem: now.year() + "-" + now.month(),
            filterCategory: null,
            filterComment: ""
        }
    },

    onExpenseDelete: function(id) {
        this.props.onDelete(id)
    },

    onExpenseEdit: function(id) {
        this.setState(update(this.state, {
            editingExpense: {$set: true},
            editingExpenseId: {$set: id}
        }))
    },

    onCancelEditingExpense: function() {
        this.setState(update(this.state, {
            editingExpense: {$set: false}
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

    onFilterByYearMonth: function(year, month) {

        const m = moment().year(year).month(month)
        m.startOf('month')
        const from = m.valueOf();
        m.endOf('month')
        const to = m.valueOf();

        this.setState(update(this.state, {
            filterDateFrom: {$set: from},
            filterDateTo: {$set: to},
            filterDateItem: {$set: year + "-" + month}
        }))
    },

    onFilterByYear: function(year) {

        const m = moment().year(year)
        m.startOf('year')
        const from = m.valueOf();
        m.endOf('year')
        const to = m.valueOf();

        this.setState(update(this.state, {
            filterDateFrom: {$set: from},
            filterDateTo: {$set: to},
            filterDateItem: {$set: year}
        }))
    },

    onFilterByCategory: function(category) {
        this.setState(update(this.state, {
            filterCategory: {$set: category}
        }))
    },


    onFilterByComment: function(e) {
        this.setState(update(this.state, {
            filterComment: {$set: e.target.value}
        }))
    },


    render: function () {
        const {history, rootCategoryId, categoryList} = this.context.store.getState()
        const {filterDateFrom, filterDateTo, filterDateItem, filterCategory, filterComment} = this.state

        const yearMonthMap = {};
        history.forEach((expense) => {
            let month = moment(expense.date).month()
            let year = moment(expense.date).year()
            if(!(year in yearMonthMap)) {
                yearMonthMap[year] = [];
            }
            if(yearMonthMap[year].indexOf(month)==-1) {
                yearMonthMap[year].push(month)
            }
        })

        let filteredHistory = history.filter(x => x.date >= filterDateFrom && x.date <= filterDateTo)
        if(filterCategory!==null) {
            filteredHistory = filteredHistory.filter(x => x.categoryId === filterCategory)
        }
        if(filterComment !== "") {
            filteredHistory = filteredHistory.filter(x => x.comment.indexOf(filterComment)!=-1)
        }

        /*

            2015         2016
            ----         ----
            September    January
            October      February
            November
            December

            2015   September October November December
            2016   January Febuary

            http://localhost:8080/#history/by-month/2016/Febuary
            http://localhost:8080/#history/by-year/2016
        */

        if(history.length === 0) {
            return (
                <div className="history">
                    <div className="empty-history-msg">You have no expenses yet</div>
                </div>
            )
        }
        else {
            return (
                <div className="history">
                    <ModalContainer visible={this.state.editingExpense} onCancel={this.onCancelEditingExpense}>
                        <EditExpense expenseId={this.state.editingExpenseId}
                                     onSave={this.onExpenseSave}
                                     onCancel={this.onExpenseEditCancel}/>
                    </ModalContainer>

                    <div className="history__results">


                        {(filterDateFrom != 0 && filterDateTo != Number.MAX_VALUE)
                            ? (<div className="history__current-filter">
                            <span className="history__current-filter__title">Showing records:</span>  <span>{
                            moment(filterDateFrom).format("MMMM Do YYYY")
                        }</span> — <span>{
                            moment(filterDateTo).format("MMMM Do YYYY")
                        }</span>
                            {
                                filterCategory !== null
                                    ?
                                    <span>, in category &bdquo;{categoryList.filter(x => x.id === filterCategory)[0].title}&ldquo;</span>
                                    : null
                            }
                            {
                                filterComment !== ""
                                    ? <span>, with comment, containing &bdquo;{filterComment}&ldquo;</span>
                                    : null
                            }
                        </div>)
                            : null
                        }

                        <ExpenseList
                            data={filteredHistory}
                            onEdit={this.onExpenseEdit}
                            onDelete={this.onExpenseDelete}/>
                    </div>


                    <div className="history__filters">
                        <div className="history__title">Filter by date</div>
                        <div className="history__year-month-filter">
                            {
                                keys(yearMonthMap).sort(desc).map((year) => (
                                    <div key={year} className="history__year-month-filter__year-block">
                                        {(filterDateItem === (year))
                                            ? (
                                            <div
                                                className="history__year-month-filter__item history__year-month-filter__item--active history__year-month-filter__year"><span>
                                                {year}:
                                            </span></div>
                                        )
                                            : (
                                            <div
                                                className="history__year-month-filter__year history__year-month-filter__item">
                                                <a href="#"
                                                   className="pseudo"
                                                   onClick={(e) => {e.preventDefault(); this.onFilterByYear(year)}}>
                                                    {year}:
                                                </a></div>
                                        )
                                        }


                                        {
                                            yearMonthMap[year].sort(desc).map((month) => {
                                                let m = moment().month(month).year(year)
                                                if (filterDateItem === (year + "-" + month)) {
                                                    return (
                                                        <div key={month}
                                                             className="history__year-month-filter__item history__year-month-filter__month history__year-month-filter__item--active">
                                                        <span>
                                                            {m.format("MMMM")}
                                                        </span>
                                                        </div>
                                                    )

                                                }
                                                else {
                                                    return (
                                                        <div key={month}
                                                             className="history__year-month-filter__month history__year-month-filter__item">
                                                            <a href="#"
                                                               className="pseudo"
                                                               onClick={(e) => {e.preventDefault(); this.onFilterByYearMonth(year, month)}}>
                                                                {m.format("MMMM")}
                                                            </a>
                                                        </div>
                                                    )
                                                }

                                            })
                                        }
                                    </div>
                                ))
                            }
                        </div>


                    </div>


                    <div className="history__filters">
                        <div className="history__title">Filter by category</div>
                        <div className="history__category-filter">
                            <CategoryPicker
                                rootCategoryId={rootCategoryId}
                                categoryList={categoryList}
                                allowEmpty={true}
                                emptyText="Do not filter by category"
                                value={this.state.filterCategory}
                                onChange={this.onFilterByCategory}
                            />
                        </div>

                        <div className="history__title">Filter by comment</div>
                        <div className="history__comment-filter">
                            <input type="text" value={this.state.filterComment} onChange={this.onFilterByComment}/>
                        </div>

                    </div>


                </div>
            )
        }
    }
})

History.contextTypes = {
    store: React.PropTypes.object
}

export default History
