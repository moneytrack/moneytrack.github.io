"use strict"

import ajax from "./ajax"

const DISPATCH_URL = window.context.backend_url + "/dispatch" //todo: move to common place

function asyncDispatch(cb) {
	return dispatch => {
		dispatch({type:"WAIT"})

		ajax.post(DISPATCH_URL, cb(null)).then((result) => {
			dispatch({type:"STOP_WAIT"})
	        dispatch(cb(result))
	    }, (err) => {
			dispatch({type:"STOP_WAIT"})
			dispatch(cb(err))
	    })
	}
}

export const newExpense = ({amount, categoryId, comment, date}) => {
	return asyncDispatch((id) => {
    	return {
	        type: 'NEW_EXPENSE',
	        amount,
	        categoryId,
	        comment,
	        id,
	        date
	    }
    })
}

export const editExpense = ({id, amount, categoryId, comment, date}) => {
	return asyncDispatch(() => {
    	return {
	        type: 'EDIT_EXPENSE',
	        id,
	        amount,
	        categoryId,
	        comment,
	        date
	    }
    })
}

export const deleteExpense = (id) => {
	return asyncDispatch((result) => {
    	return {
	        type: 'DELETE_EXPENSE',
	        id
	    }
    })
}

export const newCategory = ({title, parentId}) => {
	return asyncDispatch((id) => {
    	return {
	        type: 'NEW_CATEGORY',
            id,
	        title,
            parentId
	    }
    })
}

export const editCategory = ({id, title = null, parentId  = null}) => {
	return asyncDispatch((result) => {
		return {
			type: 'EDIT_CATEGORY',
			id,
			title,
			parentId
		}
	})
}

export const deleteCategory = ({id}) => {
	return asyncDispatch((result) => {
		return {
			type: 'DELETE_CATEGORY',
			id
		}
	})
}

export const setCurrency = ({currency}) => {
	return asyncDispatch((result) => {
		return {
			type: 'SET_CURRENCY',
			currency
		}
	})
}
