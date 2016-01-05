"use strict"
import React from 'react'

const ModalContainer = React.createClass({
    render: function() {
        return  (
            <div className="modal-container">
                <div className="modal-container__column">
                    {this.props.children}
                </div>
            </div>      
        )
    },
})

export default ModalContainer