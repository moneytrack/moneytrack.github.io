"use strict"
import React from 'react'

const UserPanel = React.createClass({

    render: function() {
        return  <div className="user-panel"><a href={window.context.backend_url + "/logout?redirect=" + encodeURIComponent(window.location.href)}>Log out</a></div>
    },
})

export default UserPanel