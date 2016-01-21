"use strict"
import React from 'react'

const ModalContainer = React.createClass({
    onCancel: function(e) {
        if(e.target === this.refs.root && this.props.onCancel) {
            this.props.onCancel(e)
        }
    },

    onSave: function(e) {
        if(e.keyCode === 13 && this.props.onSave) {
            this.props.onSave(e)
        }
        else if(e.keyCode === 27 && this.props.onCancel) {
            this.props.onCancel(e)
        }

    },

    render: function() {
        return  (
            this.props.visible !== false
            ?
            (<div className="modal-container" onClick={this.onCancel} ref="root" onKeyUp={this.onSave}>
                <div className="modal-container__column">
                    <div className="modal-container__column__cell">
                        {this.props.children}
                    </div>
                </div>
            </div>)
            : null
        )
    },
})

export default ModalContainer