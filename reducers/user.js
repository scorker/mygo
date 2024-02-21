import * as types from "../constants/action-types";

export default function userReducer(state = [], action) {
  
    switch (action.type) {
        case types.LOAD_USER_SUCCESS:
            return action.user
        default:
            return state;
    };
    
};