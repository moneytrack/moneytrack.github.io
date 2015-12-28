"use strict"
import React from 'react'

import { isNumber, getNumber } from './numbers'


const NumberInput = React.createClass({


    propTypes: {
        "value": React.PropTypes.shape({
            number: React.PropTypes.number.isRequired,
            text: React.PropTypes.string.isRequired
        })
    },

    getDefaultProps: function() {
        return {
            number: 0,
            text: ''
        }
    },


    onChange: function(e) {
        var value = e.target.value
        value = value.replace(/\s/g,'')
        value = value.replace(/,/g,'.')
        value = /^0[0-9]+/.test(value) ? value.substring(1) : value
        if(isNumber(value)) {
            this.props.onChange({
                text: value,
                number: getNumber(value)
            })
        } 
    },

    getValue: function() {
        return getNumber(this.state.value)
    },

    setValue: function(value) {
       if(isNumber(value)) {
            this.setState({
                value
            })
        }  
    },

    render: function() {
        return (
            <input value={this.props.value.text} onChange={this.onChange}/>
        )
    }
})

NumberInput.wrapState = function(number) {
    //todo: add validation
    number = parseFloat(number)
    const text = number === 0 ? '' : (''+number)
    return {number,text}
}


NumberInput.unwrapState = function(value) {
    return value.number
}

export default NumberInput