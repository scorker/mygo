import * as types from "../constants/action-types";

export default function detailReducer(state = [], action) {
  
    switch (action.type) {
        case types.LOAD_DETAILS_SUCCESS:
            return action.details
        default:
            return state;
    };
    
};