import * as types from "../constants/action-types";

export default function businessLocationStaffMapReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_BUSINESS_LOCATION_STAFF_MAP_SUCCESS:
            return action.businessLocationStaffMap;
        default:
            return state;
    };
};