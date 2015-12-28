import React from 'react'

import NumberInput from './NumberInput.jsx'
import CategoryPicker from './CategoryPicker.jsx'

import update from 'react-addons-update'


const NewExpense = React.createClass({

    getInitialState: function(){
        const {categoryList} = this.context.store.getState()
        var firstCategoryId = categoryList.length > 0 ? categoryList[0].id : -1;
        return {
            amount: NumberInput.wrapState(0),
            categoryId: firstCategoryId,
            comment: ''
        }
    },

    onAdd: function(e) {
        e.preventDefault();
        
        this.props.onAdd({
            type: 'NEW_EXPENSE',
            amount: NumberInput.unwrapState(this.state.amount),
            categoryId: this.state.categoryId,
            comment: this.state.comment
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

    onChangeCategory: function(category) {
        this.setState(update(this.state, {
            categoryId: {$set:category.id}
        }))
    },

    render: function () {
        return (
            <form onSubmit={this.onAdd}>
                <div><label>Amount: <NumberInput ref="amount" value={this.state.amount} onChange={this.onAmountChange}/></label></div>
                <div>
                    <label>Category: 
                        <CategoryPicker categoryList={this.context.store.getState().categoryList} 
                                        value={this.state.categoryId}
                                        onChange={this.onChangeCategory}/>
                    </label>
                </div>
                <div>Comment: <input ref="comment" value={this.state.comment} onChange={this.onChangeComment}/></div>
                <div><button type="submit" >Add</button></div>
            </form>
        )
    }
})

NewExpense.contextTypes = {
    store: React.PropTypes.object
}

export default NewExpense
