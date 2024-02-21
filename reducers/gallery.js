import * as types from "../constants/action-types";

export default function galleryReducer(state = [], action) {
  
    switch (action.type) {
        case types.LOAD_GALLERY_SUCCESS:
            return action.gallery
        default:
            return state;
    };
    
};