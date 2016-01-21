"use strict"
import React from 'react'
import update from 'react-addons-update'
import moment from 'moment'

import TabsContainer from './TabsContainer'
import money from './money'
import {asc,desc} from './arrays'

const format = money.format()
const {keys} = Object

const SumTableStatistics = React.createClass({
    getInitialState: function() {
        let years = Object.keys(this.getYearMonthCategoryExpenseMap()).map(x => parseInt(x)).sort(desc)
        return {
            activeYear: years[0],
            showChild: false,
            showAtRoot: false,
            showDif: false
        }
    },

    getYearMonthCategoryExpenseMap: function() {

        const {history, categoryList} = this.context.store.getState()

        const yearMonthCategoryExpenseMap = {}

        history.forEach(expense => {
            let month = moment(expense.date).month()
            let year = moment(expense.date).year()
            let categoryId = expense.categoryId
            if(!(year in yearMonthCategoryExpenseMap)) {
                yearMonthCategoryExpenseMap[year] = [];
            }
            if(!(month in yearMonthCategoryExpenseMap[year])) {
                yearMonthCategoryExpenseMap[year][month] = []
            }
            if(!(categoryId in yearMonthCategoryExpenseMap[year][month])) {
                yearMonthCategoryExpenseMap[year][month][categoryId] = []
            }
            yearMonthCategoryExpenseMap[year][month][categoryId].push(expense)
        })

        return yearMonthCategoryExpenseMap
    },

    onChangeChild: function(e){
        this.setState(update(this.state, {
            showChild: {$set: !this.state.showChild}
        }))
    },


    onChangeShotAtRoot: function(e){
        this.setState(update(this.state, {
            showAtRoot: {$set: !this.state.showAtRoot}
        }))
    },

    onChangeShotDif: function(e){
        this.setState(update(this.state, {
            showDif: {$set: !this.state.showDif}
        }))
    },


    render: function () {

        const {history, categoryList, rootCategoryId} = this.context.store.getState()

        const asc = (x,y) => x - y

        const yearMonthCategoryExpenseMap = this.getYearMonthCategoryExpenseMap()

        function recurseSum(data, category, month) {
            const childList = categoryList.filter(x => x.parentId === category.id)
            const childChildSum = childList.map(child => recurseSum(data, child, month)).reduce((acc,x) => acc + x, 0)
            const selfChildSum = childList.map(child => data[child.id][month]).reduce((acc,x) => acc + x, 0)
            return selfChildSum + childChildSum;
        }

        const renderDif = dif => {
            if(this.state.showDif) {
                if(dif) {
                    if(dif > 0) {
                        return (
                            <div className="sum-table-statistics__year__value__dif sum-table-statistics__year__value__dif--plus">
                                {"+" + format(dif) }
                            </div>
                        )
                    }
                    else {
                        return (
                            <div className="sum-table-statistics__year__value__dif sum-table-statistics__year__value__dif--minus">
                                {"-" + format(-dif) }
                            </div>
                        )

                    }
                }
                else {
                    return (
                        <div  className="sum-table-statistics__year__value__dif sum-table-statistics__year__value__dif--zero">0</div>
                    )
                }
            }
            else {
                return <div/>
            }
        }

        const renderCategory = (data, category, level) => {
            const result = [];
            const categoryData = data[category.id];

            result.push(<tr key={category.id}>
                            <td style={{paddingLeft: (level * 20) + "px"}} className={"sum-table-statistics__year__category"}>{category.title}</td>
                            {
                                keys(categoryData).sort(asc).map(month => {
                                    const sum = categoryData[month] + recurseSum(data, category, month);
                                    let dif = null;
                                    if(categoryData[month - 1] ) {
                                            const lastSum = categoryData[month - 1]  + recurseSum(data, category, month - 1)
                                        dif = lastSum ?  sum - lastSum : null
                                    }
                                    return (
                                        <td key={category.id + "-" + month} className="sum-table-statistics__year__value">
                                            {format(sum)}
                                            {renderDif(dif)}
                                        </td>
                                    )
                                })
                            }
                      </tr>)


            if(this.state.showChild) {
                let childrenRowList = []
                categoryList.filter(cat => cat.parentId === category.id).forEach(child => {
                    childrenRowList.push(...renderCategory(data, child, level + 1))
                })
                if(this.state.showAtRoot) {
                    childrenRowList.unshift(
                        <tr key={category.id + "-self"}>
                            <td style={{paddingLeft: ((level + 1) * 20) + "px"}} className={"sum-table-statistics__year__category"}>(at root)</td>
                            {
                                keys(categoryData).sort(asc).map(month => {
                                    const sum = categoryData[month];
                                    const lastSum = categoryData[month - 1];
                                    const dif = lastSum ? sum - lastSum : null
                                    return (
                                        <td key={category.id + "-" + month}  className="sum-table-statistics__year__value">
                                            {format(sum)}
                                            {renderDif(dif)}
                                        </td>
                                    )
                                })
                            }
                        </tr>
                    )
                }
                result.push(...childrenRowList)
            }
            return result;
        }

        function renderTotal(data) {
            var monthToTotal = {}
            Object.keys(data).forEach(category => {
                Object.keys(data[category]).forEach(month => {
                    if(!monthToTotal[month]) {
                        monthToTotal[month] = 0;
                    }
                    monthToTotal[month] += data[category][month]
                })
            })
            return (
                <tr key="total">
                    <td className="sum-table-statistics__year__total__title">Total:</td>
                    {
                        Object.keys(monthToTotal).sort(asc).map( month => {
                            const total = monthToTotal[month];
                            const lastTotal = monthToTotal[month - 1];
                            const dif = lastTotal ? total - lastTotal : null

                            return (
                                <td key={month} className="sum-table-statistics__year__total__value">
                                    {format(total)}
                                    {renderDif(dif)}
                                </td>
                            )
                        })
                    }
                </tr>
            )
        }

        function renderTable(data) {
            let rows = [];

            const rootCategoryList = categoryList.filter(category => category.parentId === rootCategoryId);
            rootCategoryList.forEach((category) => {
                rows.push(...renderCategory(data, category, 0))
            })

            rows.push(renderTotal(data))

            return rows;
        }

        /*
            Returns map: category -> month -> sum
        */
        function calculateTable(monthCategoryExpenseMap) {
            let result = {}

            categoryList.forEach(category => {
                result[category.id] = {};

                Object.keys(monthCategoryExpenseMap).sort(asc).map(month => {
                    const categoryToExpenses = monthCategoryExpenseMap[month];
                    const expenseList = categoryToExpenses[category.id] || [];
                    const sum = expenseList.reduce((acc, x) => acc + x.amount, 0)
                    result[category.id][month] = sum;
                })

            })

            return result;
        }

        if(history.length === 0) {
            return (
                <div className="sum-table-statistics">
                    <div className="empty-history-msg">You have no expenses yet</div>
                </div>
            )
        }
        return (
            <TabsContainer className="sum-table-statistics"
                           titleList={Object.keys(yearMonthCategoryExpenseMap).sort(asc)}
                           active={(this.state.activeYear || "").toString()}
                           onSwitch={(year) => {
                                this.setState(update(this.state, {activeYear: {$set: year}}))
                           }}>
                {
                    Object.keys(yearMonthCategoryExpenseMap).sort(asc).map(year => {
                        let data = calculateTable(yearMonthCategoryExpenseMap[year])
                        return (
                            <div key={year}>
                                <div>
                                    <label><input type="checkbox" checked={this.state.showChild}
                                                  onChange={this.onChangeChild}/> show child categories</label>
                                    <label><input type="checkbox"  disabled={!this.state.showChild} checked={this.state.showAtRoot}
                                          onChange={this.onChangeShotAtRoot}/> show 'at root'</label>

                                    <label><input type="checkbox" checked={this.state.showDif}
                                                  onChange={this.onChangeShotDif}/> show difference</label>
                                </div>
                                <table className="sum-table-statistics__year">
                                    <tbody>

                                    <tr>
                                        <td></td>
                                        {
                                            keys(yearMonthCategoryExpenseMap[year]).sort(asc).map(month => {
                                                const m = moment().year(parseInt(year)).month(parseInt(month))
                                                return (
                                                    <td key={year + "-" + month} className="sum-table-statistics__year__month">
                                                        {m.format("MMMM")}
                                                    </td>
                                                )
                                            })
                                        }
                                    </tr>

                                    {
                                        renderTable(data)
                                    }

                                    </tbody>
                                </table>
                            </div>
                        )

                    })
                }
            </TabsContainer>
        )
    }
})

SumTableStatistics.contextTypes = {
    store: React.PropTypes.object
}

export default SumTableStatistics
