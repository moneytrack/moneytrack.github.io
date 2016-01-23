"use strict"
import React from 'react'
import update from 'react-addons-update'
import moment from 'moment'

import SumTableStatistics from './SumTableStatistics'

const Statistics = React.createClass({


    render: function () {
        const {history} = this.context.store.getState()
        if(history.length === 0) {
            return (
                <div className="sum-table-statistics">
                    <div className="empty-history-msg">You have no expenses yet</div>
                </div>
            )
        }
        return (
            <div className="statistics">
                <SumTableStatistics />
            </div>
        )
    }
})

Statistics.contextTypes = {
    store: React.PropTypes.object
}

export default Statistics
