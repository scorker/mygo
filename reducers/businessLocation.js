import * as types from "../constants/action-types";

export default function businessLocationReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_BUSINESS_LOCATION_SUCCESS:
            return action.businessLocation
        default:
            return state;
    };
};