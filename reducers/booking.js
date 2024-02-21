
import * as types from "../constants/action-types";

export default function bookingReducer(state = [], action) {
    switch (action.type) {
        case types.CLEAR_BOOKING_SUCCESS:
              return [];
        case types.ADD_BOOKING_SUCCESS:
            return [...state, action.booking];
        case types.UPDATE_BOOKING_SUCCESS:
            return [...state.filter(x => x.service_business_detail_id != action.booking.service_business_detail_id), Object.assign({}, action.booking)]
        case types.REMOVE_BOOKING_SUCCESS:
            return [...state.filter(x => x.service_business_detail_id != action.booking.service_business_detail_id)];
        default:
            return state || [];
    };
    
};