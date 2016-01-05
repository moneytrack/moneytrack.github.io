"use strict"
import React from 'react'

const WaitIndicator = React.createClass({

    render: function() {
        return  this.props.waiting 
        ? (
            <div className="wait-indicator">Please, wait...</div>      
        )
        : (
            null
        )
    },
})

export default WaitIndicator