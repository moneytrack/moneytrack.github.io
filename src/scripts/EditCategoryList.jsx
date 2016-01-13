"use strict"
import React from 'react'
import update from 'react-addons-update'
import {find} from './arrays'

const EditCategoryList = React.createClass({
    getInitialState: function() {
        return {
            editing: false,
            editingId: null,
            editingText: null
        }
    },

    onEditTitleBegin: function(category) {

        this.setState(update(this.state, {
            editing: {$set: true},
            editingId: {$set: category.id},
            editingText: {$set: category.title},
        }))
    },

    onEditFinished: function(e) {
        if(e.keyCode == 13) {
            this.props.onRenameCategory(this.state.editingId, this.state.editingText)
            this.setState(update(this.state, {
                editing: {$set: false},
            }))
        }
        else if(e.keyCode == 27) {
            this.setState(update(this.state, {
                editing: {$set: false},
            }))
        }
    },

    onEdit: function(e) {
        this.setState(update(this.state, {
            editingText: {$set: e.target.value},
        }))
    },

    onMove: function(id, e) {
        const toId = parseInt(e.target.value);
        if(id >= 0) {
            this.props.onMoveCategory(id, toId)
        }
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
        let {categoryList, rootCategoryId} = this.context.store.getState();

        function renderMoveToOptions(category, current, level = 0) {

            if(category.id == current) {
                return [];
            }

            let space = "";
            for(let i = 0; i<level; ++i) {
                space += String.fromCharCode(parseInt("00A0", 16))
                space += String.fromCharCode(parseInt("00A0", 16))
            }
            let childOptionList = [
                <option value={category.id} key={category.id}>{space + category.title}</option>
            ];
            category.childIdList.map((id) => {
                let child = find(categoryList, x => x.id === id)
                return renderMoveToOptions(child, current, level + 1)
            }).forEach(subList => subList.forEach(option => {
                childOptionList.push(option)
            }))
            return childOptionList
        }

        let rootCategory = categoryList.filter(x => x.id === rootCategoryId)[0]

        let sorted = list.slice().sort((c1, c2) => c1.order - c2.order)
        return sorted.map((category) => {
            const childList = category.childIdList.map(id => categoryList.filter(x => x.id === id)[0])
            let classes = ["edit-category-list__category"]
            classes = classes.join(" ")
            if(childList.length > 0) {
                const childListRendered = childList.length > 0 ? this.renderRecurse(childList, level+1) : ""
                return [
                    <div key={category.id} className={classes} >
                        <div className="edit-category-list__category__title"
                             onClick={() => this.onEditTitleBegin(category)}>
                            {(this.state.editing && this.state.editingId === category.id )
                            ? <input value={this.state.editingText} onChange={this.onEdit} onKeyUp={this.onEditFinished}/>
                            : category.title}
                        </div>
                        <button onClick={(e) => this.onDeleteCategory(e, category.id)}>Delete</button>
                        <select onChange={(e) => this.onMove(category.id, e)}>
                            <option value={-1}>Move to...</option>
                            {renderMoveToOptions(rootCategory, category.id)}
                        </select>
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
                        <div className="edit-category-list__category__title" onClick={() => this.onEditTitleBegin(category)}>
                            {(this.state.editing && this.state.editingId === category.id )
                                ? <input value={this.state.editingText} onChange={this.onEdit}  onKeyUp={this.onEditFinished}/>
                                : category.title}
                        </div>
                        {' '}<button  onClick={(e) => this.onDeleteCategory(e, category.id)} >Delete</button>
                        <select  onChange={(e) => this.onMove(category.id, e)}>
                            <option value={-1}>Move to...</option>
                            {renderMoveToOptions(rootCategory, category.id)}
                        </select>
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
        let {rootCategoryId,categoryList} = this.context.store.getState();
        const rootCategoryList = categoryList.filter(category => category.parentId === rootCategoryId)
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
