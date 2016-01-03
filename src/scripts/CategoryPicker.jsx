"use strict"
import React from 'react'

const CategoryPicker = React.createClass({

    onChange: function(category) {
        console.log(category)
        this.props.onChange(category)
    },

    renderRecurse: function(list, level) {
        return list.map((category) => {
            const children = category.children ? this.renderRecurse(category.children, level+1) : ""
            const classes = this.props.value === category.id ? ["selected"] : []
            if(category.children) {
                return [
                    <div key={category.id} className={classes} onClick={() => this.onChange(category)}>{category.title}</div>,
                    <div key={category.id + '-children'} className={["children"]}>{children}</div>
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
        const children = this.renderRecurse(this.props.categoryList, 0)
        return  (
            <div>
                {children}
            </div>      
        )
    },
})

export default CategoryPicker