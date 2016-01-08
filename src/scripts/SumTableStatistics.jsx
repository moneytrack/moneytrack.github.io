"use strict"
import React from 'react'
import update from 'react-addons-update'
import moment from 'moment'

import TabsContainer from './TabsContainer'


const asc = (x,y) => x - y
const desc = (x,y) => y - x


const SumTableStatistics = React.createClass({
    getInitialState: function() {
        var years = Object.keys(this.getYearMonthCategoryExpenseMap()).map(x => parseInt(x)).sort(desc)
        return {
            activeYear: years[0]
        }
    },

    getYearMonthCategoryExpenseMap: function() {

        const {history, categoryList, rootCategoryIdList} = this.context.store.getState()

        const yearMonthCategoryExpenseMap = {}

        history.forEach(expense => {
            var month = moment(expense.date).month()
            var year = moment(expense.date).year()
            var categoryId = expense.categoryId
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

    render: function () {
        
        const {history, categoryList, rootCategoryIdList} = this.context.store.getState()

        const asc = (x,y) => x - y

        const yearMonthCategoryExpenseMap = this.getYearMonthCategoryExpenseMap()

        function calculateSum(category, categoryToExpenses) {
            const expenseList = categoryToExpenses[category.id] || [];
            const sum = expenseList.reduce((acc, x) => acc + x.amount, 0)
            var childSum = categoryList
                .filter(x => x.parentId === category.id)
                .map(category => calculateSum(category, categoryToExpenses))
                .reduce((acc, x) => acc + x, 0)
            return sum + childSum
        }

        function calculateSelfSum(category, categoryToExpenses) {
            const expenseList = categoryToExpenses[category.id] || [];
            const sum = expenseList.reduce((acc, x) => acc + x.amount, 0)

            return sum;
        }

        function renderCategory(category, monthCategoryExpenseMap, level) {
            const result = [];
            result.push(<tr key={category.id}>
                        <td style={{paddingLeft: (level * 20) + "px"}} className={"sum-table-statistics__year__category"}>{category.title}</td>
                        {
                            Object.keys(monthCategoryExpenseMap).sort(asc).map(month => {
                                const categoryToExpenses = monthCategoryExpenseMap[month];
                                const sum = calculateSum(category, categoryToExpenses)
                                return (<td key={category.id + "-" + month}  className="sum-table-statistics__year__value">
                                    {sum / 100}
                                </td>)
                            })
                        }
                      </tr>)
            var childrenRowList = []
            categoryList.filter(cat => cat.parentId === category.id).forEach(child => {
                childrenRowList.push(...renderCategory(child, monthCategoryExpenseMap, level + 1))
            })
            if(childrenRowList.length > 0) {
                childrenRowList.unshift(
                    <tr key={category.id + "-self"}>
                        <td style={{paddingLeft: ((level +1) * 20) + "px"}}  className="sum-table-statistics__year__category">
                            (self)
                        </td>
                        {
                            Object.keys(monthCategoryExpenseMap).sort(asc).map(month => {
                                const categoryToExpenses = monthCategoryExpenseMap[month];
                                const sum = calculateSelfSum(category, categoryToExpenses)
                                return (<td key={category.id + "-" + month + "-self"} className="sum-table-statistics__year__value">
                                    {sum / 100}
                                </td>)
                            })
                        }
                    </tr>
                )
            }
            result.push(...childrenRowList)
            return result;
        }
        
        function renderCats(monthCategoryExpenseMap) {
            var rows = [];

            const rootCategoryList = categoryList.filter((category) => rootCategoryIdList.indexOf(category.id)!=-1);
            rootCategoryList.forEach((category) => {
                renderCategory(category, monthCategoryExpenseMap, 0).forEach(subRow => {
                    rows.push(subRow)
                })
            })

            return rows;
        }

        return (
            <TabsContainer className="sum-table-statistics"
                           titleList={Object.keys(yearMonthCategoryExpenseMap).sort(asc)} 
                           active={(this.state.activeYear || "").toString()}
                           onSwitch={(year) => {
                                console.log(year)
                                this.setState(update(this.state, {activeYear: {$set: year}}))
                           }}>
                {
                    Object.keys(yearMonthCategoryExpenseMap).sort(asc).map(year => {
                        var monthCategoryExpenseMap = yearMonthCategoryExpenseMap[year]
                        return (
                            <table key={year} className="sum-table-statistics__year">
                                <tbody>

                                <tr>
                                    <td></td>
                                    {
                                        Object.keys(monthCategoryExpenseMap).sort(asc).map(month => {
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
                                    renderCats(monthCategoryExpenseMap)
                                }

                                </tbody>
                            </table>
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
