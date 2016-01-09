"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import moment from 'moment'

import ModalContainer from './ModalContainer'
import EditExpense from './EditExpense'
import {editExpense} from './action-creators'
import ConfirmDialog from './ConfirmDialog'
import ExpenseList from './ExpenseList'
import CategoryPicker from './CategoryPicker'

const History = React.createClass({

    getInitialState: function() {
        var now = moment();
        now.startOf('month')
        var from = now.valueOf()
        now.endOf('month')
        var to = now.valueOf()

        return {
            editingExpense: false,
            deletingExpense: false,
            filterDateFrom: from,
            filterDateTo: to,
            filterDateItem: now.year() + "-" + now.month(),
            filterCategory: null
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


    render: function () {
        const {history, rootCategoryIdList, categoryList} = this.context.store.getState()
        const {filterDateFrom, filterDateTo, filterDateItem, filterCategory} = this.state

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


        const yearMonthMap = {};
        history.forEach((expense) => {
            var month = moment(expense.date).month()
            var year = moment(expense.date).year()
            if(!(year in yearMonthMap)) {
                yearMonthMap[year] = [];
            }
            if(yearMonthMap[year].indexOf(month)==-1) {
                yearMonthMap[year].push(month)
            }
        })

        var filteredHistory = history.filter(x => x.date >= filterDateFrom && x.date <= filterDateTo)
        if(filterCategory!==null) {
            filteredHistory = filteredHistory.filter(x => x.categoryId === filterCategory)
        }
        const sortedHistory = filteredHistory.sort((e1, e2) => e2.date - e1.date)
        const expensesByDays = groupBy(filteredHistory, (expense) => moment(expense.date).format('YYYY MM DD'))

        /*
        
            2015         2016
            ----         ----
            September    January
            October      Febuary
            November
            December

            2015   September October November December
            2016   January Febuary

            http://localhost:8080/#history/by-month/2016/Febuary
            http://localhost:8080/#history/by-year/2016
        */

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
                        </div>)
                      : null
                    }   

                    <ExpenseList
                         data={filteredHistory}
                         onEdit={this.onExpenseEdit}
                         onDelete={this.onExpenseDelete}/>
                </div>

<div className="history__filters">
                    <div  className="history__title">Filter by date</div>
                    <div className="history__year-month-filter">
                    {
                        Object.keys(yearMonthMap).sort((x,y) => x - y).map((year) => (
                            <div key={year}>
                                {(filterDateItem === (year))
                                  ? (
                                        <div  className="history__year-month-filter__item history__year-month-filter__item--active history__year-month-filter__year"><span>
                                            {year}:
                                        </span></div>
                                    )
                                  : (
                                        <div className="history__year-month-filter__year history__year-month-filter__item"><a href="#"
                                            className="pseudo"
                                            onClick={(e) => {e.preventDefault(); this.onFilterByYear(year)}}>
                                            {year}:
                                        </a></div>
                                    )
                                }


                                {
                                    yearMonthMap[year].sort((x,y) => x - y).map((month) => {
                                        var m = moment().month(month).year(year)
                                        if(filterDateItem === (year + "-" + month)) {
                                            return (<div  className="history__year-month-filter__item history__year-month-filter__month history__year-month-filter__item--active"><span key={month}>
                                                        {m.format("MMMM")}
                                                    </span></div>)

                                        }
                                        else {
                                            return (<div className="history__year-month-filter__month history__year-month-filter__item"><a href="#"
                                                   key={month}
                                                   className="pseudo"
                                                   onClick={(e) => {e.preventDefault(); this.onFilterByYearMonth(year, month)}}>
                                                    {m.format("MMMM")}
                                                </a></div>)
                                        }

                                    })
                                }
                            </div>
                        ))
                    }
                    </div>

                    <div  className="history__title">Filter by category</div>
                    <div className="history__category-filter">
                        <CategoryPicker
                            rootCategoryIdList={rootCategoryIdList}
                            categoryList={categoryList}
                            allowEmpty={true}
                            value={this.state.filterCategory}
                            onChange={this.onFilterByCategory}
                         />
                    </div>
                        
                </div>                

            </div>
        )
    }
})

History.contextTypes = {
    store: React.PropTypes.object
}

export default History
