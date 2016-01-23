"use strict"
import React from 'react'
import update from 'react-addons-update'

import {setCurrency} from './../../action-creators'

const UserSettings = React.createClass({

    onChangeCurrency: function(e) {
        this.context.store.dispatch(setCurrency({currency:e.target.value}))
    },

    render: function () {
        const {currency} = this.context.store.getState().userSettings
        return (
            <table>
                <tbody>
                    <tr>
                        <td>
                            <label>Currency:</label>
                        </td>
                        <td>
                            <select value={currency} onChange={this.onChangeCurrency}>
                                <option value="USD">U.S. dollars</option>
                                <option value="EUR">Euro</option>
                                <option value="RUR">Russian rubles</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
})

UserSettings.contextTypes = {
    store: React.PropTypes.object
}

export default UserSettings
