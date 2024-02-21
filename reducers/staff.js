import * as types from "../constants/action-types";

export default function staffReducer(state = [], action) {
  
    switch (action.type) {
        
        case types.LOAD_STAFF_SUCCESS:
            return action.staff
        default:
            return state;
    };
    
};