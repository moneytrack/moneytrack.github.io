package ru.koluch.wordlist

/**
 * Created by Nikolai_Mavrenkov on 30/12/15.
 */
const val ACTION_TYPE = "type"
const val ACTION_NEW_EXPENSE = "NEW_EXPENSE"
const val ACTION_NEW_CATEGORY = "NEW_CATEGORY"
const val ACTION_DELETE_EXPENSE = "DELETE_EXPENSE"


const val STATE_HISTORY = "history"
const val STATE_CATEGORY_LIST = "categoryList"

/*
	Common props
*/
const val PROP_ID = "id"

/*
    Expense props
 */
const val EXPENSE_KIND = "Expense";
const val EXPENSE_PROP_AMOUNT = "amount"
const val EXPENSE_PROP_CATEGORY_ID = "categoryId"
const val EXPENSE_PROP_COMMENT = "comment"

/*
    Category props
 */
const val CATEGORY_KIND = "Category";
const val CATEGORY_PROP_TITLE = "title";
const val CATEGORY_PROP_PARENT_ID = "parentId";
const val CATEGORY_PROP_CHILDREN = "children";
