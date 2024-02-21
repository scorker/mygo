import * as types from "../constants/action-types";

export default function galleryMappingReducer(state = [], action) {
    switch (action.type) {
        case types.LOAD_GALLERY_MAPPING_SUCCESS:
            return action.gallery_mapping;
        default:
            return state;
    };
    
};