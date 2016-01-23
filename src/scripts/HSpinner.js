"use strict";
/**
 * Copyright (c) 2016 Nikolai Mavrenkov <koluch@koluch.ru>
 *
 * Distributed under the MIT License (See accompanying file LICENSE or copy at http://opensource.org/licenses/MIT).
 *
 * Created: 23.01.2016 18:33
 */
import React from 'react'

const HorSpinner = React.createClass({
    render: function(){
        return (
            <div className="h-counter">
                <button type="button" className="h-counter__button h-counter__button--down" onClick={this.props.onDown}><div className="arrow-left"></div></button>
                <div className="h-counter__middle">
                    {this.props.children}
                </div>
                <button type="button" className="h-counter__button h-counter__button--up" onClick={this.props.onUp}><div className="arrow-right"></div></button>
            </div>

        )
    }
})

export default HorSpinner
