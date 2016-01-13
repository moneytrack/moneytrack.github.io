"use strict"
import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react-addons-update'
import {find} from './arrays'
import ModalContainer from './ModalContainer'

const RenameModal = React.createClass({
    render: function(){
        return (
            <ModalContainer visible={this.props.editing}
                            onCancel={this.props.onEditCanceled}
                            onSave={this.props.onEditFinished}>
                <label>New name: <input value={this.props.editingText} onChange={this.onEdit} ref="title_edit_input"/></label>
                <button onClick={this.onEditFinished}>Save</button>
            </ModalContainer>
        )
    }
})

const EditCategoryList = React.createClass({
    getInitialState: function() {
        return {
            mode: null,
            renamingId: null,
            renamingText: null,

            newCategoryTitle: null,
            newCategoryParentId: null
        }
    },


    /*
        Renaming
     */
    onRenameBegin: function(category) {
        this.setState(update(this.state, {
            mode: {$set: 'RENAME'},
            renamingId: {$set: category.id},
            renamingText: {$set: category.title},
        }))
        window.a = this.refs;
        for(var a in this.refs) {
            console.log(a);
        }
        console.log(this.refs, this.refs.title_edit_input);
        //ReactDOM.findDOMNode(this.refs["title_edit_input"]).focus();
    },

    onRenameFinished: function(e) {
        this.props.onRenameCategory(this.state.renamingId, this.state.renamingText)
        this.setState(update(this.state, {
            mode: {$set: null},
        }))
    },

    onRenameCanceled: function(e) {
        this.setState(update(this.state, {
            mode: {$set: null},
        }))
    },

    onRename: function(e) {
        this.setState(update(this.state, {
            renamingText: {$set: e.target.value},
        }))
    },

    /*
        Moving
     */
    onMove: function(id, e) {
        const toId = parseInt(e.target.value);
        if(id >= 0) {
            this.props.onMoveCategory(id, toId)
        }
    },

    /*
        New category
     */
    onNewCategoryBegin: function(parentId) {
        this.setState(update(this.state, {
            mode: {$set: 'NEW_CATEGORY'},
            newCategoryTitle: {$set: ''},
            newCategoryParentId:  {$set: parentId}
        }))
    },

    onNewCategoryCanceled: function(){
        this.setState(update(this.state, {
            mode: {$set: ''},
        }))
    },

    onNewCategoryTitleChange: function(e){
        console.log(e.target.value);
        this.setState(update(this.state, {
            newCategoryTitle: {$set: e.target.value},
        }))
    },

    onNewCategoryFinished: function(){
        this.props.onNewCategory(this.state.newCategoryTitle, this.state.newCategoryParentId)
        this.setState(update(this.state, {
            mode: {$set: ''},
        }))
    },


    /*
        Delete
     */
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
                             onClick={() => this.onRenameTitleBegin(category)}>
                            {category.title}
                        </div>
                        {' '}
                        <div className="edit-category-list__category__controls">
                            <a href="#" onClick={(e) => this.onRenameBegin(category)} className="pseudo">Rename</a>
                            <a href="#" onClick={(e) => this.onNewCategoryBegin(category.id)} className="pseudo">Add sub-category</a>
                            <select onChange={(e) => this.onMove(category.id, e)}>
                                <option value={-1}>Move to...</option>
                                {renderMoveToOptions(rootCategory, category.id)}
                            </select>
                            <a href="#" onClick={(e) => this.onDeleteCategory(e, category.id)} className="pseudo  warning">Delete</a>
                        </div>

                    </div>,
                    <div key={category.id + '-children'} className="edit-category-list__children">
                        {childListRendered}
                    </div>
                ]
            }
            else {
                return [
                    <div key={category.id} className={classes}>
                        <div className="edit-category-list__category__title" onClick={() => this.onRenameBegin(category)}>
                            {category.title}
                        </div>
                        <div className="edit-category-list__category__controls">
                            <a href="#" onClick={(e) => this.onRenameBegin(category)} className="pseudo">Rename</a>
                            <a href="#" onClick={(e) => this.onNewCategoryBegin(category.id)} className="pseudo">Add sub-category</a>
                            <select  onChange={(e) => this.onMove(category.id, e)}>
                                <option value={-1}>Move to...</option>
                                {renderMoveToOptions(rootCategory, category.id)}
                            </select>
                            <a href="#" onClick={(e) => this.onDeleteCategory(e, category.id)} className="pseudo warning">Delete</a>
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

        const onShowInput = (input) => {
            if(input) {
                input.focus()
            }
        }

        return  (
            <div className="edit-category-list">
                <ModalContainer visible={this.state.mode === 'RENAME'}
                                onCancel={this.onRenameCanceled}
                                onSave={this.onRenameFinished}>
                    <label>New title: <input value={this.state.renamingText} onChange={this.onRename} ref={onShowInput}/></label>
                    <button onClick={this.onRenameFinished}>Save</button>
                </ModalContainer>
                <ModalContainer visible={this.state.mode === 'NEW_CATEGORY'}
                                onCancel={this.onNewCategoryCanceled}
                                onSave={this.onNewCategoryFinished}>
                    <label>New category title: <input value={this.state.newCategoryTitle} onChange={this.onNewCategoryTitleChange} ref={onShowInput}/></label>
                    <button onClick={this.onNewCategoryFinished}>Save</button>
                </ModalContainer>
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
