"use strict"
import React from 'react'
import update from 'react-addons-update'

const EditCategoryList = React.createClass({
    propTypes: {
        rootCategoryIdList: React.PropTypes.arrayOf(React.PropTypes.number),
        categoryList: React.PropTypes.arrayOf(React.PropTypes.object),
        allowEmpty: React.PropTypes.bool
    },

    onNewCategory: function(e, parentId, refId) {
        e.preventDefault()
        this.props.onNewCategory(this.refs[refId].value, parentId)
    },

    onDeleteCategory: function(e, id) {
        e.preventDefault()
        this.props.onDeleteCategory(id)
    },

    renderRecurse: function(list, level) {
        let {categoryList} = this.context.store.getState();

        return list.map((category) => {
            const childList = category.childIdList.map(id => categoryList.filter(x => x.id === id)[0])
            let classes = ["edit-category-list__category"]
            classes = classes.join(" ")
            if(childList.length > 0) {
                const childListRendered = childList.length > 0 ? this.renderRecurse(childList, level+1) : ""
                return [
                    <div key={category.id} className={classes} >
                        <div className="edit-category-list__category__title">
                            {category.title}
                        </div>
                        <button onClick={(e) => this.onDeleteCategory(e, category.id)}>Delete</button>
                    </div>,
                    <div key={category.id + '-children'} className="edit-category-list__children">
                        {childListRendered}
                        <div>
                            <label>New category: <input  ref={"new_category_" + category.id} /> </label>
                            {' '}<button onClick={(e) => this.onNewCategory(e, category.id, "new_category_" + category.id)}>Add</button>
                        </div>
                    </div>
                ]
            }
            else {
                return [
                    <div key={category.id} className={classes}>
                        <div className="edit-category-list__category__title">
                            {category.title}
                        </div>
                        {' '}<button  onClick={(e) => this.onDeleteCategory(e, category.id)}>Delete</button>
                        <div>
                            <label>New category: <input  ref={"new_category_" + category.id} /> </label>
                            {' '}<button onClick={(e) => this.onNewCategory(e, category.id, "new_category_" + category.id)}>Add</button>
                        </div>
                    </div>
                ]
            }

        })
    },

    render: function() {
        let {rootCategoryIdList,categoryList} = this.context.store.getState();

        const rootCategoryList = rootCategoryIdList.map(id => categoryList.filter(x => x.id === id)[0])
        const children = this.renderRecurse(rootCategoryList, 0)
        if(this.props.allowEmpty) {
            let classes = ["edit-category-list__category"]
            if(this.props.value === null) {
                classes.push("edit-category-list__category--selected")
            }
            classes = classes.join(" ")
            children.unshift(<div key="empty" className={classes} >
                <div className="edit-category-list__empty" >
                    Do not filter by category
                </div>
            </div>)
        }
        return  (
            <div className="edit-category-list">
                {children}
                <div>
                    <label >New category: <input ref={"new_category_root"} /> </label>
                    <button onClick={(e) => this.onNewCategory(e, null, "new_category_root")}>Add</button>
                </div>
            </div>
        )
    },
})

EditCategoryList.contextTypes = {
    store: React.PropTypes.object
}

export default EditCategoryList
