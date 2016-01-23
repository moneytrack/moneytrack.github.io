"use strict";
/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 23.01.2016 18:33
 */
import React from 'react'

const VSpinner = React.createClass({
    render: function(){
        return (
            <div className="v-counter">
                <button type="button" className="v-counter__button v-counter__button--up" onClick={this.props.onUp}><div className="arrow-up"></div></button>
                <div className="v-counter__middle" >
                    {this.props.children}
                </div>
                <button type="button" className="v-counter__button v-counter__button--down" onClick={this.props.onDown}><div className="arrow-down"></div></button>
            </div>
        )
    }
})

export default VSpinner
