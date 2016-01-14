package ru.koluch.wordlist

/**
 * Created by Nikolai_Mavrenkov on 30/12/15.
 */
const val ACTION_TYPE = "type"
const val ACTION_NEW_EXPENSE = "NEW_EXPENSE"
const val ACTION_EDIT_EXPENSE = "EDIT_EXPENSE"
const val ACTION_DELETE_EXPENSE = "DELETE_EXPENSE"
const val ACTION_NEW_CATEGORY = "NEW_CATEGORY"
const val ACTION_DELETE_CATEGORY = "DELETE_CATEGORY"
const val ACTION_EDIT_CATEGORY = "EDIT_CATEGORY"
const val ACTION_SET_CURRENCY = "SET_CURRENCY"


const val STATE_HISTORY = "history"
const val STATE_ROOT_CATEGORY_ID = "rootCategoryId"
const val STATE_CATEGORY_LIST = "categoryList"
const val STATE_USER_SETTINGS = "userSettings"

/*
	Common props
*/
const val PROP_ID = "id"

/*
    User props
 */
const val USER_KIND = "User";
const val USER_PROP_NAME = "name"
const val USER_PROP_ROOT_CATEGORY_ID = "rootCategoryId";
const val USER_PROP_CURRENCY = "currency";


/*
    Expense props
 */
const val EXPENSE_KIND = "Expense";
const val EXPENSE_PROP_AMOUNT = "amount"
const val EXPENSE_PROP_CATEGORY_ID = "categoryId"
const val EXPENSE_PROP_DATE = "date"
const val EXPENSE_PROP_COMMENT = "comment"


/*
    Category props
 */
const val CATEGORY_KIND = "Category";
const val CATEGORY_PROP_TITLE = "title";
const val CATEGORY_PROP_PARENT_ID = "parentId";
const val CATEGORY_PROP_CHILD_ID_LIST = "childIdList";
const val CATEGORY_PROP_ORDER = "order";
