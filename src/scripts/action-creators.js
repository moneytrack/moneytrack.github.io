"use strict"
export const newExpense = ({amount, categoryId, comment}) => {
	return {
        type: 'NEW_EXPENSE',
        amount,
        categoryId,
        comment
    }
}

export const deleteExpense = (id) => {
	return {
        type: 'DELETE_EXPENSE',
        id 
    }
}

