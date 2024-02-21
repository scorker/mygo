import * as types from "../constants/action-types";

export default function notificationReducer(state = [], action) {
  
    switch (action.type) {
        
        case types.LOAD_APP_NOTIFICATION_SUCCESS:
            return action.notifications
        default:
            return state;
    };
    
};