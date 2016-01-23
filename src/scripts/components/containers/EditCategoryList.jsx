"use strict"
import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react-addons-update'
import {find} from '../../arrays'
import ModalContainer from '../presentational/ModalContainer'

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
    },

    onRenameFinished: function(e) {
        if(this.state.renamingText!=='') {
            this.props.onRenameCategory(this.state.renamingId, this.state.renamingText)
            this.setState(update(this.state, {
                mode: {$set: null},
            }))
        }
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

    onMoveBegin: function(category) {
        this.setState(update(this.state, {
            mode: {$set: 'MOVE'},
            moveCategoryId: {$set: category.id},
            moveOldParentId: {$set: category.parentId},
            moveNewParentId: {$set: category.parentId}
        }))
    },

    onMoveFinished: function(e) {
        if(this.state.moveNewParentId !== -1) {
            this.props.onMoveCategory(this.state.moveCategoryId, this.state.moveNewParentId)
            this.setState(update(this.state, {
                mode: {$set: null},
            }))
        }
    },

    onMoveCanceled: function(e) {
        this.setState(update(this.state, {
            mode: {$set: null},
        }))
    },

    onMoveParentChange: function(e) {
        this.setState(update(this.state, {
            mode: {$set: 'MOVE'},
            moveNewParentId: {$set: parseInt(e.target.value)}
        }))
    },

    /*
        New category
     */
    onNewCategoryBegin: function(parent) {
        this.setState(update(this.state, {
            mode: {$set: 'NEW_CATEGORY'},
            newCategoryTitle: {$set: ''},
            newCategoryParentId:  {$set: parent.id}
        }))
    },

    onNewCategoryCanceled: function(){
        this.setState(update(this.state, {
            mode: {$set: ''},
        }))
    },

    onNewCategoryTitleChange: function(e){
        this.setState(update(this.state, {
            newCategoryTitle: {$set: e.target.value},
        }))
    },

    onNewCategoryFinished: function(){
        if(this.state.newCategoryTitle !== '') {
            this.props.onNewCategory(this.state.newCategoryTitle, this.state.newCategoryParentId)
            this.setState(update(this.state, {
                mode: {$set: ''},
            }))
        }
    },


    /*
        Delete
     */

    onDeleteBegin: function(category) {
        const {history} = this.context.store.getState();
        const categoryExpenseList = history.filter(x => x.categoryId === category.id)

        if(categoryExpenseList.length === 0) {
            this.props.onDeleteCategory(category.id)
        }
        else {
            this.setState(update(this.state, {
                mode: {$set: 'DELETE'},
                deleteId: {$set: category.id}
            }))
        }
    },

    onDeleteCanceled: function(){
        this.setState(update(this.state, {
            mode: {$set: ''},
        }))
    },

    onDeleteFinished: function(){
        if(this.state.newCategoryTitle !== '') {
            this.props.onDeleteCategory(this.state.deleteId)
            this.setState(update(this.state, {
                mode: {$set: ''},
            }))
        }
    },

    renderRecurse: function(list, level) {
        let {categoryList, rootCategoryId} = this.context.store.getState();



        let rootCategory = categoryList.filter(x => x.id === rootCategoryId)[0]

        let sorted = list.slice().sort((c1, c2) => c1.order - c2.order)
        return sorted.map((category) => {
            const childList = category.childIdList.map(id => categoryList.filter(x => x.id === id)[0])
            let classes = ["edit-category-list__category"]
            classes = classes.join(" ")

            let childListHtml = null
            if(childList.length > 0) {
                const childListRendered = childList.length > 0 ? this.renderRecurse(childList, level + 1) : ""
                childListHtml = (
                    <div key={category.id + '-children'} className="edit-category-list__children">
                        {childListRendered}
                    </div>
                )
            }
            return [
                <div key={category.id} className={classes} >
                    <div className="edit-category-list__category__content">
                        <div className="edit-category-list__category__title">
                            {category.title}
                        </div>
                        {' '}
                        <div className="edit-category-list__category__controls">
                            <i title="Rename..." onClick={(e) => this.onRenameBegin(category)} className="icon icon-pen icon1x" aria-hidden="true"/>
                            <i title="Add sub category..." onClick={(e) => this.onNewCategoryBegin(category)} className="icon icon-plus icon1x" aria-hidden="true"/>
                            <i title="Move..." onClick={(e) => this.onMoveBegin(category)}  className="icon icon-reply icon1x" aria-hidden="true"/>
                            <i  title="Delete..."  onClick={(e) => this.onDeleteBegin(category)}  className="icon icon-trash_can icon1x warning" aria-hidden="true"/>
                        </div>
                    </div>
                </div>,
                childListHtml
            ]
        })
    },

    render: function() {
        let {rootCategoryId,categoryList, history} = this.context.store.getState();
        const rootCategory = categoryList.filter(x => x.id === rootCategoryId)[0]
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

        const expensesForDelete = history.filter(x => x.categoryId === this.state.deleteId).length

        return  (
            <div className="edit-category-list">
                <ModalContainer visible={this.state.mode === 'RENAME'}
                                onCancel={this.onRenameCanceled}
                                onSave={this.onRenameFinished}>
                    <label>New title: <input value={this.state.renamingText} onChange={this.onRename} ref={onShowInput}/></label>
                    <button onClick={this.onRenameFinished} disabled={this.state.renamingText===''}>Save</button>
                    <button onClick={this.onRenameCanceled}>Cancel</button>
                </ModalContainer>
                <ModalContainer visible={this.state.mode === 'NEW_CATEGORY'}
                                onCancel={this.onNewCategoryCanceled}
                                onSave={this.onNewCategoryFinished}>
                    <label>New category title: <input value={this.state.newCategoryTitle} onChange={this.onNewCategoryTitleChange} ref={onShowInput}/></label>
                    <button onClick={this.onNewCategoryFinished}  disabled={this.state.newCategoryTitle===''}>Save</button>
                    <button onClick={this.onNewCategoryCanceled}>Cancel</button>
                </ModalContainer>
                <ModalContainer visible={this.state.mode === 'MOVE'}
                                onCancel={this.onMoveCanceled}
                                onSave={this.onMoveFinished}>
                    <label>Move to:{' '}
                        <select onChange={this.onMoveParentChange} value={this.state.moveNewParentId}>
                            {renderMoveToOptions(rootCategory, this.state.moveCategoryId)}
                        </select>
                    </label>
                    <button onClick={this.onMoveFinished} disabled={this.state.moveNewParentId === this.state.moveOldParentId}>Save</button>
                    <button onClick={this.onMoveCanceled}>Cancel</button>
                </ModalContainer>
                <ModalContainer visible={this.state.mode === 'DELETE'}
                                onCancel={this.onDeleteCanceled}
                                onSave={this.onDeleteFinished}>
                    <div className="modal-container__msg warning">Are you sure that you want to delete this category?</div>
                    <div className="modal-container__msg warning">
                        {
                            expensesForDelete > 0
                            ? (expensesForDelete > 1
                               ? "You have " + expensesForDelete + " expenses in this category, all of them will be deleted too!"
                               : "You have 1 expense in this category, it will be removed too!")
                           : null
                        }
                    </div>
                    <div className="modal-container__controls">
                        <button className="warning" onClick={this.onDeleteFinished}>Delete</button>
                        <button onClick={this.onDeleteCanceled}>Cancel</button>
                    </div>
                </ModalContainer>
                {children}
                <div className="edit-category-list__new-root-category">
                    <a href="#" className="pseudo edit-category-list__new-root-category__link"  onClick={(e) => this.onNewCategoryBegin(rootCategory)} >Add new root category...</a>
                </div>
            </div>
        )
    },
})

EditCategoryList.contextTypes = {
    store: React.PropTypes.object
}

export default EditCategoryList
