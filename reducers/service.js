
import * as types from "../constants/action-types";

export default function serviceReducer(state = [], action) {
  
    switch (action.type) {
        case types.LOAD_SERVICE_SUCCESS:
            return action.service;
        default:
            return state;
    };
};