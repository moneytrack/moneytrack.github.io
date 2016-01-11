"use strict"
import React from 'react'

const DropDownContainer = React.createClass({
    render: function() {
        return  (
            this.props.visible !== false
            ?
            (<div className="drop-down-container">
                <div className="drop-down-container__bg" />
                <div className="drop-down-container__body">
                    {
                        this.props.children
                    }
                </div>
            </div>)
            : null
        )
    },
})

export default DropDownContainer