"use strict"
import React from 'react'
import update from 'react-addons-update'
import TabsContainer from './TabsContainer'
import UserSettings from './UserSettings'
import EditCategoryList from './EditCategoryList'

import {newExpense, deleteExpense, newCategory, editCategory, deleteCategory} from './action-creators.js'

const Settings = React.createClass({

    getInitialState: function() {
        return {
            "active": "Categories"
        }
    },

    onNewCategory: function(title, parentId) {
        this.context.store.dispatch(newCategory({
            title,
            parentId
        }))
    },

    onRenameCategory: function(id, title) {
        this.context.store.dispatch(editCategory({
            id,
            title
        }))
    },

    onMoveCategory: function(id, parentId) {
        this.context.store.dispatch(editCategory({
            id,
            parentId
        }))
    },

    onDeleteCategory: function(id) {
        this.context.store.dispatch(deleteCategory({
            id
        }))
    },

    onSwitch: function(newActive) {
        this.setState(update(this.state, {
            "active": {$set: newActive}
        }))
    },

    render: function () {

        return (
            <div className="statistics">
                <TabsContainer titleList={["Categories","User settings"]} active={this.state.active} onSwitch={this.onSwitch}>
                    <EditCategoryList onNewCategory={this.onNewCategory}
                                      onRenameCategory={this.onRenameCategory}
                                      onMoveCategory={this.onMoveCategory}
                                      onDeleteCategory={this.onDeleteCategory} />
                    <UserSettings />
                </TabsContainer>
            </div>
        )
    }
})

Settings.contextTypes = {
    store: React.PropTypes.object
}

export default Settings
