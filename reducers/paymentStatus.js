import * as types from "../constants/action-types";

export default function paymentStatusReducer(state = {}, action) {
    switch (action.type) {
        case types.PAYMENT_STATUS_SUCCESS:
            return action.status;
        default:
            return state;
    };
    
};