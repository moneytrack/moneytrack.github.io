"use strict"
import React from 'react'
import update from 'react-addons-update'
import InputMoment from 'input-moment'
import _moment from 'moment'

import ModalContainer from './ModalContainer'
import TabsContainer from './TabsContainer'
import DropDownContainer from './DropDownContainer'


const TimePicker = React.createClass({

    onHoursUp: function(){
        const {timestamp} = this.props
        const m = _moment(timestamp)
        m.add(1, 'hours')
        this.props.onChange(m.valueOf())
    },

    onHoursDown: function(){
        const {timestamp} = this.props
        const m = _moment(timestamp)
        m.subtract(1, 'hours')
        this.props.onChange(m.valueOf())
    },

    onMinutesUp: function(){
        const {timestamp} = this.props
        const m = _moment(timestamp)
        m.add(1, 'minutes')
        this.props.onChange(m.valueOf())
    },

    onMinutesDown: function(){
        const {timestamp} = this.props
        const m = _moment(timestamp)
        m.subtract(1, 'minutes')
        this.props.onChange(m.valueOf())
    },


    render: function(){
        const {timestamp} = this.props

        const m = _moment(timestamp)

        return (
            <div className="time-picker">
                <div className="ver-counter">
                    <button type="button" className="ver-counter__button ver-counter__button--up" onClick={this.onHoursUp}><div className="arrow-up"></div></button>
                    <div className="ver-counter__middle" >
                        <input  className="time-picker__input" value={m.format("HH")} readOnly={true}/>
                    </div>
                    <button type="button" className="ver-counter__button ver-counter__button--down" onClick={this.onHoursDown}><div className="arrow-down"></div></button>
                </div>
                <div className="ver-counter">
                    <button type="button" className="ver-counter__button ver-counter__button--up" onClick={this.onMinutesUp}><div className="arrow-up"></div></button>
                    <div className="ver-counter__middle" >
                        <input className="time-picker__input" value={m.format("mm")} readOnly={true}/>
                    </div>
                    <button type="button" className="ver-counter__button ver-counter__button--down" onClick={this.onMinutesDown}><div className="arrow-down"></div></button>
                </div>
            </div>
        )
    }
})

const DatePicker = React.createClass({

    getInitialState: function() {
        const {timestamp} = this.props
        var m = _moment(timestamp);

        return {
            year: m.year(),
            month: m.month(),
        }
    },

    onChange: function(year, month, week, day) {

        const {timestamp} = this.props;

        const m = _moment(timestamp)
        m.year(year)
        m.month(month)
        m.week(week)
        m.day(day)

        this.props.onChange(m.valueOf())
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
        const {timestamp} = this.props
        const {year, month} = this.state;

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
            <div className="date-picker">

                <div className="hor-counter">
                    <button type="button" className="hor-counter__button hor-counter__button--down" onClick={this.onPrevYear}><div className="arrow-left"></div></button>
                    <div className="hor-counter__middle">
                        <div className="date-picker__years__title">{showing.format("YYYY")}</div>
                    </div>
                    <button type="button" className="hor-counter__button hor-counter__button--up" onClick={this.onNextYear}><div className="arrow-right"></div></button>
                </div>

                <div className="hor-counter">
                    <button type="button" className="hor-counter__button hor-counter__button--down" onClick={this.onPrevMonth}><div className="arrow-left"></div></button>
                    <div className="hor-counter__middle">
                        <div className="date-picker__months__title">{showing.format("MMMM")}</div>
                    </div>
                    <button type="button" className="hor-counter__button hor-counter__button--up" onClick={this.onNextMonth}><div className="arrow-right"></div></button>
                </div>

                <table className="date-picker__calendar">
                    <thead>
                        <tr>
                            {
                                days.map(day => (
                                    <td key={"header_day_" + day} className="date-picker__calendar__header date-picker__calendar__cell">{_moment(start).day(day).format("ddd")}</td>
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
                                            var className = "date-picker__calendar__cell"
                                            if((date.week() === now.week() && date.day() == now.day() && date.year() === now.year() && date.month() === now.month())) {
                                                className += " date-picker__calendar__cell--active"
                                            }
                                            if((date.month() !== month)) {
                                                className += " date-picker__calendar__cell--another-month"
                                            }
                                            return (
                                                <td key={"week_"+week+"_day_" + day}
                                                    onClick={(e) => this.onChange(date.year(), date.month(), date.week(), date.day())}
                                                    className={className}>
                                                    {
                                                        date.format("D")
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
            timestamp: this.props.timestamp,
            visible: false
        }
    },

    onChange: function(timestamp) {
        this.setState(update(this.state, {
            timestamp: {$set: timestamp}
        }))
    },

    onCancel: function() {
        this.setState(update(this.state, {
            visible: {$set: false}
        }))
    },

    onClick: function(e) {
        e.preventDefault();
        this.setState(update(this.state, {
            visible: {$set: !this.state.visible}
        }))
    },

    onSave: function() {
        this.props.onChange(this.state.timestamp)
        this.setState(update(this.state, {
            visible: {$set: false}
        }))
    },

    render: function () {
        const {timestamp} = this.props
        return (
            <div className="date-time-picker">
                <input onClick={this.onClick} value={_moment(timestamp).format("HH:mm MM.DD.YYYY")} readOnly={true} />
                {  this.state.visible
                   ? <ModalContainer onCancel={this.onCancel}>
                        <div className="date-time-picker__modal-content">
                            <div className="date-time-picker__modal-content__section">
                                <TimePicker timestamp={this.state.timestamp} onChange={this.onChange}/>
                            </div>
                            <div className="date-time-picker__modal-content__section">
                                <DatePicker timestamp={this.state.timestamp} onChange={this.onChange}/>
                            </div>
                            <div className="date-time-picker__modal-content__section date-time-picker__modal-content__controls">
                                <button type="button" onClick={this.onSave}>Save</button>
                                <button type="button" onClick={this.onCancel}>Cancel</button>
                            </div>
                        </div>
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

DateTimePicker.unwrapState = function(value) {
    return value.timestamp
}

export default DateTimePicker
