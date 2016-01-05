"use strict"
import React from 'react'

const CategoryPicker = React.createClass({

    onChange: function(category) {
        this.props.onChange(category)
    },

    renderRecurse: function(list, level) {
        return list.map((category) => {
            const childList = category.childIdList.map(id => this.props.categoryList.filter(x => x.id === id)[0])
            var classes = ["category-picker__category"]
            if(this.props.value === category.id) {
                classes.push("category-picker__category--selected")
            }
            classes = classes.join(" ")
            const styles = {
            }
            if(childList.length > 0) {
                const childListRendered = childList.length > 0 ? this.renderRecurse(childList, level+1) : ""
                return [
                    <div key={category.id} className={classes} style={styles} onClick={() => this.onChange(category)}>
                        <div>
                            {category.title}
                        </div>
                    </div>,
                    <div key={category.id + '-children'} className="category-picker__children">{childListRendered}</div>
                ]
            }
            else {
                return [
                    <div key={category.id} className={classes} style={styles} onClick={() => this.onChange(category)}>
                        <div>
                            {category.title}
                        </div>
                    </div>
                ]
            }
            
        })
    },

    render: function() {
        const rootCategoryList = this.props.rootCategoryIdList.map(id => this.props.categoryList.filter(x => x.id === id)[0])
        const children = this.renderRecurse(rootCategoryList, 0)
        return  (
            <div className="category-picker">
                {children}
            </div>      
        )
    },
})

export default CategoryPicker