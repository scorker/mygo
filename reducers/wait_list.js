import * as types from "../constants/action-types";

export default function waitListReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_WAIT_LIST_SUCCESS:
            return action.wait_list;
        case types.ADD_WAIT_LIST_SUCCESS:
            return [...state, action.wait_list];
        case types.DELETE_WAIT_LIST_SUCCESS:
            return [...state.filter(x => x.user_wait_list_id != action.wait_list.user_wait_list_id)];
        default:
            return state;
    };  
};