"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import _moment from 'moment'

import ModalContainer from './ModalContainer'
import DropDownContainer from './DropDownContainer'

const DateTimePickerModal = React.createClass({

    getInitialState: function() {
        const {timestamp} = this.props
        var m = _moment(timestamp);

        return {
            timestamp: timestamp,
            year: m.year(),
            month: m.month(),
        }
    },

    onChange: function(year, month, week, day) {

        console.log(year, month, week, day);

        const {timestamp} = this.state;

        const m = _moment(timestamp)
        m.year(year)
        m.month(month)
        m.week(week)
        m.day(day)

        this.setState(update(this.state, {
            timestamp: {$set: m.valueOf()},
        }))
    },

    onPrevMonth: function() {
        const {year, month} = this.state;
        const m = _moment(1);
        m.year(year)
        m.month(month)
        m.subtract(1, "month");

        this.setState(update(this.state, {
            month: {$set: m.month()},
        }))
    },

    onNextMonth: function() {
        const {year, month} = this.state;
        const m = _moment(1);
        m.year(year)
        m.month(month)
        m.add(1, "month");

        this.setState(update(this.state, {
            month: {$set: m.month()},
        }))
    },

    onPrevYear: function() {
        const {year, month} = this.state;
        const m = _moment(1);
        m.year(year)
        m.month(month)
        m.subtract(1, "year");

        this.setState(update(this.state, {
            year: {$set: m.year()},
        }))
    },

    onNextYear: function() {
        const {year, month} = this.state;
        const m = _moment(1);
        m.year(year)
        m.month(month)
        m.add(1, "year");

        this.setState(update(this.state, {
            year: {$set: m.year()},
        }))
    },


    render: function() {
        const {timestamp, year, month} = this.state;

        const days = [0,1,2,3,4,5,6]
        const weeks = [0,1,2,3,4,5]

        var now = _moment(timestamp);

        var showing = _moment(1);

        showing.year(year)
        showing.month(month)
        showing.date(1)

        var mStart = _moment(showing.valueOf());
        mStart.subtract(mStart.day(), 'days')
        var start = mStart.valueOf();

        return (
            <div>
                <h3>
                    <button type="button" onClick={(e) => this.onPrevYear()}> left </button>
                    {showing.format("YYYY")}
                    <button type="button" onClick={(e) => this.onNextYear()}> right </button>
                </h3>
                <h3>
                    <button type="button" onClick={(e) => this.onPrevMonth()}> left </button>
                    {showing.format("MMMM")}
                    <button type="button" onClick={(e) => this.onNextMonth()}> right </button>
                </h3>
                <table>
                    <thead>
                        <tr>
                            {
                                days.map(day => (
                                    <td key={"header_day_" + day}>{_moment(start).day(day).format("ddd")}</td>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>

                        {
                            weeks.map(week => (
                                <tr key={"week_" + week}>
                                    {
                                        days.map(day => {
                                            var date = _moment(start).add(week, 'weeks').add(day, 'days');
                                            return (
                                                <td key={"week_"+week+"_day_" + day}
                                                    onClick={(e) => this.onChange(date.year(), date.month(), date.week(), date.day())}>
                                                    {
                                                        (date.week() === now.week() && date.day() == now.day() && date.year() === now.year() && date.month() === now.month())
                                                        ? "[" + date.format("D") + "]"
                                                        : date.format("D")
                                                    }
                                                </td>
                                            )
                                        })
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
                        <DateTimePickerModal timestamp={Date.now()}/>
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
