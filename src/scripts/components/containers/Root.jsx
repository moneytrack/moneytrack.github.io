"use strict"

import React from 'react'
import moment from 'moment'
import update from 'react-addons-update'

import {newExpense, deleteExpense, newCategory} from '../../action-creators.js'

import NumberInput from '../presentational/NumberInput.jsx'
import EditExpense from './EditExpense.jsx'
import TabsContainer from '../presentational/TabsContainer.jsx'
import WaitIndicator from '../presentational/WaitIndicator.jsx'
import ErrorPanel from '../presentational/ErrorPanel.jsx'
import History from './History.jsx'
import Statistics from './Statistics.jsx'
import Settings from './Settings'
import UserPanel from '../presentational/UserPanel'

const Root = React.createClass({

    getInitialState: function() {
        return {
            activeTab: "Add expense"
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

    onAddCategory: function(attrs) {
        this.context.store.dispatch(newCategory(attrs))
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
        const {error = null, history, waiting} = store.getState()

        var content;
        if(error === "UNAUTHORIZED") {
            content = (
                <div className="unauthorized">
                    <div className="unauthorized__caption">To use this application you should be authorized with Google Account</div>

                    <div className="unauthorized__button">
                        <a href={window.context.backend_url + "/login?redirect=" + encodeURIComponent(window.location.href)}><img className="unhovered" src="images/google_signin_buttons/web/1x/btn_google_signin_light_normal_web.png"/></a>
                    </div>
                </div>
            )
        }
        else {
            const disabled = {}

            if(history.length === 0) {
                disabled["History"] = "You have no expenses yet"
                disabled["Statistics"] = "You have no expenses yet"
            }

            content = (
                <div>
                    <TabsContainer titleList={["Add expense", "History", "Statistics", "Settings"]}
                                   active={this.state.activeTab}
                                   onSwitch={this.onSwitchTab}
                                   disabled={disabled}>
                        <div>
                            <EditExpense onAdd={this.onAdd}/>
                        </div>

                        <div>
                            <History onDelete={this.onDelete}/>
                        </div>

                        <div>
                            <Statistics />
                        </div>

                        <div>
                            <Settings />
                        </div>

                    </TabsContainer>
                    <WaitIndicator waiting={waiting}/>
                    <ErrorPanel isError={error !== null} />
                    <UserPanel />
                </div>
            )
        }

        return (<div>
                    <div className="logo">
                        <span className="logo__title__span">MONEYTRACK</span>
                    </div>
                    {content}
                </div>)


    }
})

Root.contextTypes = {
    store: React.PropTypes.object
}

export default Root
