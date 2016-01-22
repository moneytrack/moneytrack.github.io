"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import _moment from 'moment'

import ModalContainer from './ModalContainer'
import DropDownContainer from './DropDownContainer'

const DateTimePickerModal = React.createClass({

    render: function() {

        const timestamp = 1453474169224

        const days = [0,1,2,3,4,5,6]
        const weeks = [0,1,2,3,4,5]

        var m = _moment(timestamp);

        m.date(1)
        m.subtract('days', m.day())
        var start = m.valueOf();

        return (
            <div>
                <h1>{m.format("dddd, MMMM Do YYYY (dddd), h:mm:ss a") + " - " + m.day()}</h1>
                <table>
                    <thead>
                        <tr>
                            {
                                days.map(dayI => (
                                    <td key={dayI}>{dayI}</td>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>

                        {
                            weeks.map(week => (
                                <tr key={"week_" + week}>
                                    {
                                        days.map(day => (
                                            <td key={"week_"+week+"day_" + day}>
                                                {_moment(start).add('weeks', week).add('days', day).format("DD")}
                                            </td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        )
    }

})


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
        let resetMoment = _moment(this.props.value.timestamp)
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
            <div className="date-time-picker">
                <input onClick={this.onClick} value={_moment(timestamp).format("MM.DD HH:mm:ss")} readOnly={true} />
                {  this.state.visible
                   ? <ModalContainer onCancel={this.onCancel}>
                        <DateTimePickerModal/>
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
