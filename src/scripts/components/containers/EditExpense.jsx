"use strict"
import React from 'react'
import update from 'react-addons-update'

import NumberInput from './../presentational/NumberInput.jsx'
import CategoryPicker from './../presentational/CategoryPicker.jsx'
import DateTimePicker from './../presentational/DateTimePicker.jsx'
import moment from 'moment'

const EditExpense = React.createClass({

    getInitialState: function(){
        const {rootCategoryId, categoryList, history} = this.context.store.getState()

        if(typeof this.props.expenseId !== "undefined") {
            const expense = history.filter(x => x.id === this.props.expenseId)[0]
            return {
                id: expense.id,
                amount: NumberInput.wrapState(expense.amount / 100),
                categoryId: expense.categoryId,
                date: expense.date,
                comment: expense.comment,
                mode: 'EDIT'
            }
        }
        else {
            let rootCategoryList = categoryList.sort((c1,c2) => c1.order - c2.order).filter(x => x.parentId === rootCategoryId)
            let firstCategoryId = rootCategoryList.length > 0 ? rootCategoryList[0].id : -1;
            return {
                amount: NumberInput.wrapState(0),
                categoryId: firstCategoryId,
                date: moment().valueOf(),
                comment: '',
                mode: 'NEW'
            }
        }

    },

    onSubmit: function(e) {
        e.preventDefault();

        if(this.state.mode === "NEW") {
            this.props.onAdd({
                amount: Math.floor(NumberInput.unwrapState(this.state.amount) * 100),
                categoryId: this.state.categoryId,
                comment: this.state.comment,
                date: this.state.date
            })
            this.setState(this.getInitialState())
        }
        else if(this.state.mode === "EDIT"){

            this.props.onSave({
                id: this.state.id,
                amount: Math.floor(NumberInput.unwrapState(this.state.amount) * 100),
                categoryId: this.state.categoryId,
                comment: this.state.comment,
                date: this.state.date
            })
        }
        else {
            throw new Error("Illegal mode: " + this.state.mode)
        }
    },



    onAmountChange: function(value) {
        this.setState(update(this.state, {
            amount: {$set:value}
        }))
    },

    onChangeComment: function(e) {
        this.setState(update(this.state, {
            comment: {$set:e.target.value}
        }))
    },

    onChangeDate: function(date) {
        console.log("new date", moment(date).format("dddd, MMMM Do YYYY, h:mm:ss a"));

        this.setState(update(this.state, {
            date: {$set:date}
        }))
    },

    onChangeCategory: function(categoryId) {
        this.setState(update(this.state, {
            categoryId: {$set:categoryId}
        }))
    },

    onNewCategory: function(title, parentId) {
        this.props.onAddCategory({
            title,
            parentId
        })
    },

    onCancel: function() {
        this.props.onCancel()
    },

    render: function () {
        return (
            <form onSubmit={this.onSubmit} className="edit-expense">
                <div className="edit-expense__row">
                    <table>
                        <tbody>
                        <tr>
                            <td className="edit-expense__field__label">Amount: </td>
                        </tr>
                        <tr>
                            <td className="edit-expense__field__input"><NumberInput  value={this.state.amount} onChange={this.onAmountChange}/></td>
                        </tr>
                        <tr>
                            <td className="edit-expense__field__label">Date:</td>
                        </tr>
                        <tr>
                            <td className="edit-expense__field__input">
                                <DateTimePicker
                                    timestamp={this.state.date}
                                    onChange={this.onChangeDate} />
                            </td>
                        </tr>
                        <tr>
                            <td className="edit-expense__field__label">Comment:</td>
                        </tr>
                        <tr>
                            <td className="edit-expense__field__input">
                                <textarea  value={this.state.comment} onChange={this.onChangeComment} rows="3"/>
                            </td>
                        </tr>

                        </tbody>
                    </table>
                    <table>
                        <tbody>
                        <tr>
                            <td className="edit-expense__field__label">Category: </td>
                        </tr>
                        <tr>
                            <td className="edit-expense__field__input">
                                <div  className="edit-expense__category-picker-wrapper">
                                    <CategoryPicker categoryList={this.context.store.getState().categoryList}
                                                    rootCategoryId={this.context.store.getState().rootCategoryId}
                                                    value={this.state.categoryId}
                                                    onChange={this.onChangeCategory}
                                                    editingEnabled={true}
                                                    onNewCategory={this.onNewCategory}/>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div className="edit-expense__controls">

                                {
                                    this.state.mode === "NEW"
                                        ? (<button disabled={NumberInput.unwrapState(this.state.amount) === 0} type="submit" >Add</button>)
                                        : (<button disabled={NumberInput.unwrapState(this.state.amount) === 0} type="submit" >Save</button>)
                                }
                                {
                                    this.state.mode === "EDIT"
                                        ? (<button type="button" onClick={this.onCancel}>Cancel</button>)
                                        : null
                                }
                </div>




            </form>
        )
    }
})

EditExpense.contextTypes = {
    store: React.PropTypes.object
}

export default EditExpense
