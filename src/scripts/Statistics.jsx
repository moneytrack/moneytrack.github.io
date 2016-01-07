"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import moment from 'moment'


const Statistics = React.createClass({
    render: function () {
        
        const {history, categoryList, rootCategoryIdList} = this.context.store.getState()

        const asc = (x,y) => x - y

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


        function calculateSum(category, categoryToExpenses) {
            const expenseList = categoryToExpenses[category.id] || [];
            const sum = expenseList.reduce((acc, x) => acc + x.amount, 0)

            var childSum = categoryList
                .filter(x => x.parentId === category.id)
                .map(category => calculateSum(category, categoryToExpenses))
                .reduce((acc, x) => acc + x, 0)

            return sum + childSum
        }

        function render(category, level) {
            const result = [];
            result.push(<tr key={category.id}>
                        <td style={{paddingLeft: (level * 20) + "px"}}>{category.title}</td>
                        {
                            Object.keys(yearMonthCategoryExpenseMap).sort(asc).map(year => (
                                Object.keys(yearMonthCategoryExpenseMap[year]).sort(asc).map(month => {
                                    const categoryToExpenses = yearMonthCategoryExpenseMap[year][month];
                                    const sum = calculateSum(category, categoryToExpenses)
                                    return (<td>
                                        {sum / 100}
                                    </td>)
                                })
                            ))
                        }
                      </tr>)
            categoryList.filter(cat => cat.parentId === category.id).forEach(cat => {
                render(cat, level + 1).forEach(row => {
                    result.push(row)
                })
            })
            return result;
        }
        
        function renderCats() {
            var rows = [];

            const rootCategoryList = categoryList.filter((category) => rootCategoryIdList.indexOf(category.id)!=-1);
            rootCategoryList.forEach((category) => {
                render(category, 0).forEach(subRow => {
                    rows.push(subRow)
                })
            })

            console.log("rows",rows)

            return rows;
        }

        return (
            <div className="statistics">
                <table>
                    <tbody>

                    <tr>
                        <td></td>
                        {
                            Object.keys(yearMonthCategoryExpenseMap).sort(asc).map(year => (
                                <td key={year} colSpan={Object.keys(yearMonthCategoryExpenseMap[year]).length}>
                                    {year}
                                </td>
                            ))
                        }
                    </tr>
                    <tr>
                        <td></td>
                        {
                            Object.keys(yearMonthCategoryExpenseMap).sort(asc).map(year => (
                                Object.keys(yearMonthCategoryExpenseMap[year]).sort(asc).map(month => {
                                    const m = moment().year(parseInt(year)).month(parseInt(month))
                                    return (<td key={year + "-" + month}>
                                        {m.format("MMMM")}
                                    </td>)
                                })
                            ))
                        }
                    </tr> 
                                       
                    {
                        renderCats()
                    }

                    </tbody>
                </table>
            </div>
        )
                    // categoryList.map((category) => {
                        //     var categoryLevel = 0;
                        //     var parentId = category.parentId
                        //     while(parentId) {
                        //         var parent = categoryList.filter(x => x.id === parentId)[0]
                        //         categoryLevel++;
                        //         parentId = parent.parentId
                        //     }
                        //     return (<tr key={category.id}>
                        //         <td>{category.title} : {categoryLevel}</td>
                        //         {
                        //             Object.keys(yearMonthCategoryExpenseMap).sort(asc).map(year => (
                        //                 Object.keys(yearMonthCategoryExpenseMap[year]).sort(asc).map(month => {
                        //                     const categoryToExpenses = yearMonthCategoryExpenseMap[year][month];
                        //                     const expenseList = categoryToExpenses[category.id] || [];
                        //                     const sum = expenseList.reduce((acc, x) => acc + x.amount, 0)
                        //                     return (<td>
                        //                         {sum / 100}
                        //                     </td>)
                        //                 })
                        //             ))
                        //         }
                        //     </tr>)
                        // })
    }
})

Statistics.contextTypes = {
    store: React.PropTypes.object
}

export default Statistics
