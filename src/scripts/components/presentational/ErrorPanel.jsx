"use strict"
import React from 'react'

const ErrorPanel = React.createClass({

    render: function() {
        return  this.props.isError
        ? (
            <div className="error-panel">Something has gone wrong, sorry :( Please, reload the page</div>
        )
        : (
            null
        )
    },
})

export default ErrorPanel