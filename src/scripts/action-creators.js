"use strict"

import ajax from "./ajax"

const DISPATCH_URL = "http://localhost:8080/dispatch"

function confirm(dispatch, action) {
	dispatch(action)

	ajax.post(DISPATCH_URL, action).then((result) => {
        dispatch(Object.assign({}, action, {
            status: "success",
            result: result
        }))
    }, (err) => {
        dispatch(Object.assign({}, action, {
            status: "failed",
            result: err
        }))                
    })
}

export const newExpense = ({amount, categoryId, comment}) => {
	return dispatch => {
		var action = {
	        type: 'NEW_EXPENSE',
	        amount,
	        categoryId,
	        comment
	    };
	    confirm(dispatch, action)
	}
}

export const deleteExpense = (id) => {

	return dispatch => {
		var action = {
	        type: 'DELETE_EXPENSE',
	        id 
	    };
	    confirm(dispatch, action)
	}
}

