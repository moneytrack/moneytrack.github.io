"use strict"
import React from 'react'

const UserPanel = React.createClass({

    render: function() {
        return  <div className="user-panel"><a href="/logout">Logout</a></div>
    },
})

export default UserPanel