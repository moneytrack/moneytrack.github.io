"use strict"
import React from 'react'
import update from 'react-addons-update'
import moment from 'moment'

import SumTableStatistics from './SumTableStatistics'


const Statistics = React.createClass({


    render: function () {
        
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
