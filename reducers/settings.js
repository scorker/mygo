import * as types from "../constants/action-types";

export default function settingReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_APP_SETTING_SUCCESS:
            return action.settings;
        default:
            return state;
    };
    
};