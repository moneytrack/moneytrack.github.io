"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import _moment from 'moment'

const DateTimePicker = React.createClass({

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
    },

    render: function () {
        const {timestamp, moment} = this.props.value
        return (
            <div>
                <input value={_moment(timestamp).format("MM.DD HH:mm:ss")} readOnly={true} />
                <InputMoment
                      moment={moment}
                      onChange={this.onChangeDate}
                      onSave={this.onSaveDate}  />
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
