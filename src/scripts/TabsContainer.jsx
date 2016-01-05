"use strict"
import React from 'react'

const TabsContainer = React.createClass({

    getInitialState: function() {
        return {
            active: ""
        }
    },

    propTypes: {
        titleList: React.PropTypes.arrayOf(React.PropTypes.string),
        active: React.PropTypes.string,

        checkTitleAndChildrenCount: function(props) {
            if(props.titleList.length !== React.Children.count(props.children)) {
                throw new Error("Length of titleList property and children count should be equal")
            }
        }
    },

    onClick: function(title) {
        return (e) => {
            e.preventDefault()
            this.props.onSwitch(title)
        }
    },

    render: function() {

        var activeTabIndex = this.props.titleList.indexOf(this.props.active)

        console.log("active",activeTabIndex)

        return  (
            <div className="tabs-container">
                <div className="tabs-container__labels">
                {
                    this.props.titleList.map((title) => (
                        title === this.props.active
                        ? <span key={title}>{title}{' '}</span>
                        : <span key={title}><a href="http://ya.ru" onClick={this.onClick(title)}>{title}</a>{' '}</span>
                    ))
                }
                </div>
                <div className="tabs-container__content">
                    {
                        React.Children.map(this.props.children, (child, i) => {
                            if(i === activeTabIndex) {
                                return child
                            }
                            else {
                                return null
                            }
                        })
                    }
                </div>
            </div>      
        )
    },
})

export default TabsContainer