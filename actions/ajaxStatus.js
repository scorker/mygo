import * as types from '../constants/action-types'

export function  beginAjaxCall() {
    return {type: types.BEGIN_AJAX_CALL};
    }

export function  endAjaxCall() {
    return {type: types.END_AJAX_CALL};
    }

export function  errorAjaxCall() {
    return {type: types.ERROR_AJAX_CALL};
    }