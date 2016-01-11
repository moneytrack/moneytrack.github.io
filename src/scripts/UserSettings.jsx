"use strict"
import React from 'react'
import update from 'react-addons-update'

const UserSettings = React.createClass({
    render: function () {


        return (
            <div>
                <label>Currency: <input /></label>
            </div>
        )
    }
})

UserSettings.contextTypes = {
    store: React.PropTypes.object
}

export default UserSettings
