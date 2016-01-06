"use strict"
import React from 'react'

import ModalContainer from './ModalContainer'

const ConfirmDialog = React.createClass({
    render: function() {
        return  (
            <ModalContainer visible={this.props.visible}>
                <div className='confirm-dialog'>
                    <div className='confirm-dialog__msg'>Are you sure?</div>
                    <div className='confirm-dialog__controls'>
                        <button type="button" onClick={this.props.onYes}>Yes</button>
                        <button type="button" onClick={this.props.onNo}>No</button>
                    </div>
                </div>
            </ModalContainer>
        )
    },
})

export default ConfirmDialog