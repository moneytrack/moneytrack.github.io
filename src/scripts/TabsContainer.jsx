"use strict"
import React from 'react'

const TabsContainer = React.createClass({

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

        var disabled = this.props.disabled || {}

        let activeTabIndex = this.props.titleList.indexOf(this.props.active)
        let className = "tabs-container" + (this.props.className ? " " + this.props.className : "")
        return  (
            <div className={className}>
                <div className="tabs-container__labels">
                {
                    this.props.titleList.map((title) => (
                        title === this.props.active
                        ? <span key={title} className="tabs-container__labels__label tabs-container__labels__label--active">{title}</span>
                        : (!disabled[title]
                             ? <span key={title} className="tabs-container__labels__label"><a href="#" className="pseudo" title={disabled[title]} onClick={this.onClick(title)}>{title}</a></span>
                             : <span key={title} className="tabs-container__labels__label tabs-container__labels__label--disabled" title={disabled[title]}>{title}</span>)
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
    }
})

TabsContainer.contextTypes = {
    store: React.PropTypes.object
}

export default TabsContainer