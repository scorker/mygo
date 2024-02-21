import * as types from "../constants/action-types";

export default function serviceDetailReducer(state = [], action) {
  
    switch (action.type) {
        case types.LOAD_SERVICE_DETAIL_SUCCESS:
            return action.serviceDetail;
        default:
            return state;
    }; 
};