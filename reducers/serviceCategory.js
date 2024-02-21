
import * as types from "../constants/action-types";

export default function serviceCategoryReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_SERVICE_CATEGORY_SUCCESS:
            return action.serviceCategory;
        default:
            return state;
    }; 
};