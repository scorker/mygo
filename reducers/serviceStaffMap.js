import * as types from "../constants/action-types";

export default function serviceStaffMapReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_SERVICE_STAFF_MAP_SUCCESS:
            return action.serviceStaffMap;
        default:
            return state;
    }; 
};