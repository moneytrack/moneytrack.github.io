"use strict"
import React from 'react'

const CategoryPicker = React.createClass({

    onChange: function(category) {
        this.props.onChange(category)
    },

    renderRecurse: function(list, level) {
        return list.map((category) => {
            const childList = category.childIdList.map(id => this.props.categoryList.filter(x => x.id === id)[0])
            const childListRendered = childList.length > 0 ? this.renderRecurse(childList, level+1) : ""
            const classes = this.props.value === category.id ? ["selected"] : []
            if(childList.length > 0) {
                return [
                    <div key={category.id} className={classes} onClick={() => this.onChange(category)}>{category.title}</div>,
                    <div key={category.id + '-children'} className={["children"]}>{childListRendered}</div>
                ]
            }
            else {
                return [
                    <div key={category.id} className={classes} onClick={() => this.onChange(category)}>{category.title}</div>
                ]
            }
            
        })
    },

    render: function() {
        const rootCategoryList = this.props.rootCategoryIdList.map(id => this.props.categoryList.filter(x => x.id === id)[0])
        const children = this.renderRecurse(rootCategoryList, 0)
        return  (
            <div>
                {children}
            </div>      
        )
    },
})

export default CategoryPicker