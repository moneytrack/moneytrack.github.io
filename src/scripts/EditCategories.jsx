"use strict"
import React from 'react'
import update from 'react-addons-update'

const EditCategories = React.createClass({
    render: function () {

        return (
            <div>
                Edit categories
            </div>
        )
    }
})

EditCategories.contextTypes = {
    store: React.PropTypes.object
}

export default EditCategories
