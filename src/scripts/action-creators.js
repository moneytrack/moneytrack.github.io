"use strict"

import ajax from "./ajax"

const DISPATCH_URL = "http://localhost:8080/dispatch"

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

export const deleteExpense = (id) => {
	return asyncDispatch((result) => {
    	return {
	        type: 'DELETE_EXPENSE',
	        id 
	    }	
    })
}

