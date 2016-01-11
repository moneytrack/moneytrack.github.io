"use strict"
import React from 'react'
import update from 'react-addons-update'
import TabsContainer from './TabsContainer'
import UserSettings from './UserSettings'
import EditCategories from './EditCategories'

const Settings = React.createClass({

    getInitialState: function() {
        return {
            "active": "Categories"
        }
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
                    <EditCategories />
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
