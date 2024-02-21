import * as types from "../constants/action-types";

export default function serviceBusinessLocationMapReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_SERVICE_BUSINESS_LOCATION_MAP_SUCCESS:
            return action.serviceBusinessLocationMap
        default:
            return state;
    };
    
};