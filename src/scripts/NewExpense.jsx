"use strict"
import React from 'react'
import update from 'react-addons-update'

import NumberInput from './NumberInput.jsx'
import CategoryPicker from './CategoryPicker.jsx'
import DateTimePicker from './DateTimePicker.jsx'
import moment from 'moment'

const NewExpense = React.createClass({

    getInitialState: function(){
        const {rootCategoryIdList} = this.context.store.getState()
        var firstCategoryId = rootCategoryIdList.length > 0 ? rootCategoryIdList[0] : -1;
        return {
            amount: NumberInput.wrapState(0),
            categoryId: firstCategoryId,
            date: DateTimePicker.wrapState(moment().valueOf()),
            comment: ''
        }
    },

    onAdd: function(e) {
        e.preventDefault();
        
        this.props.onAdd({
            amount: Math.floor(NumberInput.unwrapState(this.state.amount) * 100),
            categoryId: this.state.categoryId,
            comment: this.state.comment,
            date: DateTimePicker.unwrapState(this.state.date)
        })

        this.setState(this.getInitialState())
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
        this.setState(update(this.state, {
            date: {$set:date}
        }))
    },

    onChangeCategory: function(category) {
        this.setState(update(this.state, {
            categoryId: {$set:category.id}
        }))
    },

    render: function () {
        return (
            <form onSubmit={this.onAdd}>
                <div><label>Amount: <NumberInput  value={this.state.amount} onChange={this.onAmountChange}/></label></div>
                <div>
                    <label>Category: 
                        <CategoryPicker categoryList={this.context.store.getState().categoryList} 
                                        rootCategoryIdList={this.context.store.getState().rootCategoryIdList} 
                                        value={this.state.categoryId}
                                        onChange={this.onChangeCategory}/>
                    </label>
                </div>
                <div>Comment: <input value={this.state.comment} onChange={this.onChangeComment}/></div>
                <div>Date: <DateTimePicker 
                    value={this.state.date} 
                    onChange={this.onChangeDate} />
                </div>
                <div><button type="submit" >Add</button></div>
            </form>
        )
    }
})

NewExpense.contextTypes = {
    store: React.PropTypes.object
}

export default NewExpense
