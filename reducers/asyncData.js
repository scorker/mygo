
import * as types from "../constants/action-types";

export default function asyncDataReducer(state = {}, action) {
  
    switch (action.type) {
    
        case types.LOAD_ASYNCDATA_SUCCESS:
            return action.data;
        default:
            return state || [];
    };
    
};
