"use strict"

import React from 'react'
import moment from 'moment'
import update from 'react-addons-update'

import {newExpense, deleteExpense} from './action-creators.js'

import NumberInput from './NumberInput.jsx'
import EditExpense from './EditExpense.jsx'
import TabsContainer from './TabsContainer.jsx'
import WaitIndicator from './WaitIndicator.jsx'
import History from './History.jsx'
import Statistics from './Statistics.jsx'

const Root = React.createClass({

    getInitialState: function() {
        return {
            activeTab: "History"
        }
    },

    componentDidMount: function() {
        this.unsubscribe = this.context.store.subscribe(() => {
            this.forceUpdate()
        })
    },

    componentUnmount: function() {
        this.unsubscribe();
    },

    onAdd: function(attrs) {
        this.context.store.dispatch(newExpense(attrs))
    },

    onDelete: function(id) {
        this.context.store.dispatch(deleteExpense(id))
    },

    onSwitchTab: function(newActiveTab) {
        this.setState(update(this.state, {
            activeTab: {$set: newActiveTab}
        }))
    },

    render: function () {
        const {store} = this.context
        const {history, categoryList, waiting} = store.getState()

        var input;
        var prevValue = 0;

        return (
            <div>
                <TabsContainer titleList={["Main", "History", "Statistics"]} 
                               active={this.state.activeTab}
                               onSwitch={this.onSwitchTab}>
                    <div>
                        <EditExpense onAdd={this.onAdd} />
                    </div>

                    <div>
                        <History onDelete={this.onDelete}/>
                    </div>

                    <div>
                        <Statistics />
                    </div>
                </TabsContainer>
                <WaitIndicator waiting={waiting}/>
                
                
            </div>
        )
    }
})

Root.contextTypes = {
    store: React.PropTypes.object
}

export default Root
