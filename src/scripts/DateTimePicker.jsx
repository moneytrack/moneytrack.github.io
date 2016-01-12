"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import _moment from 'moment'

import ModalContainer from './ModalContainer'
import DropDownContainer from './DropDownContainer'

const DateTimePicker = React.createClass({

    getInitialState: function() {
        return {
            visible: false
        }
    },

    onCancel: function() {
        this.setState(update(this.state, {
            visible: {$set: false}
        }))
    },

    onClick: function() {
        this.setState(update(this.state, {
            visible: {$set: !this.state.visible}
        }))
        var resetMoment = _moment(this.props.value.timestamp)
        this.props.onChange(update(this.props.value, {
            moment: {$set: resetMoment}
        }))
    },

    onChangeDate: function(moment) {
        this.props.onChange(update(this.props.value, {
            moment: {$set: moment}
        }))
    },

    onSaveDate: function() {
        const newTimestamp = this.props.value.moment.valueOf();
        this.props.onChange(update(this.props.value, {
            timestamp: {$set: newTimestamp}
        }))
        this.setState(update(this.state, {
            visible: {$set: false}
        }))
    },

    render: function () {
        const {timestamp, moment} = this.props.value
        return (
            <div>
                <input onClick={this.onClick} value={_moment(timestamp).format("MM.DD HH:mm:ss")} readOnly={true} />
                {  this.state.visible
                   ? <ModalContainer onCancel={this.onCancel}>
                        <InputMoment
                            moment={moment}
                            onChange={this.onChangeDate}
                            onSave={this.onSaveDate} />
                     </ModalContainer>
                   : <span/>  
                }
            </div>
        )
    }
})

DateTimePicker.contextTypes = {
    store: React.PropTypes.object
}

DateTimePicker.wrapState = function(timestamp) {
    return {
        timestamp,
        moment: _moment(timestamp)
    }
}

DateTimePicker.unwrapState = function(value) {
    return value.timestamp
}

export default DateTimePicker
