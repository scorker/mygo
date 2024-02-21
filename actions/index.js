import * as types from "../constants/action-types";
import ServicesApi from '../api/services';
import { beginAjaxCall, errorAjaxCall } from './ajaxStatus';

import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import { imageBaseUrl } from '../constants/utils';

export function loadServiceCategorySuccess(serviceCategory) {
    return {
        type: types.LOAD_SERVICE_CATEGORY_SUCCESS,
        serviceCategory
    }
};
export function loadServiceSuccess(service) { return { type: types.LOAD_SERVICE_SUCCESS, service }};
export function loadServiceDetailSuccess(serviceDetail) { return { type: types.LOAD_SERVICE_DETAIL_SUCCESS, serviceDetail }};
export function loadServiceBusinessLocationMapSuccess(serviceBusinessLocationMap) {
    return {
        type: types.LOAD_SERVICE_BUSINESS_LOCATION_MAP_SUCCESS,
        serviceBusinessLocationMap
    }
};
export function loadServiceStaffMapSuccess(serviceStaffMap) {
    return {
        type: types.LOAD_SERVICE_STAFF_MAP_SUCCESS,
        serviceStaffMap
    }
};

export function loadServices() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getServices().then(f => {
            return f.data
        }).then((result) => {
            dispatch(loadServiceCategorySuccess(result.serviceCategoryData));
            dispatch(loadServiceSuccess(result.serviceData));
            dispatch(loadServiceDetailSuccess(result.serviceDetailData));
            dispatch(loadServiceStaffMapSuccess(result.serviceStaffMapData));
            dispatch(loadServiceBusinessLocationMapSuccess(result.serviceBusinessLocationMapData));
        }).catch(error => {
            dispatch(errorAjaxCall());
            throw (error);
        });
    };
};

export function loadAppSettingsSuccess(settings) { return { type: types.LOAD_APP_SETTING_SUCCESS, settings }};

export function loadAppSettings() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getColourSettings().then(f => {
            return f.data;
            }).then((result) => {
                dispatch(loadAppSettingsSuccess(result));
            }).catch(error => {
                dispatch(errorAjaxCall());
                throw (error);
            });
    };
};

export function loadAppNotificationsSuccess(notifications) { return { type: types.LOAD_APP_NOTIFICATION_SUCCESS, notifications }};

export function loadAppNotifications() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getNotifications().then(f => {
            return f.data;
            }).then((result) => {
                dispatch(loadAppNotificationsSuccess(result));
            }).catch(error => {
                dispatch(errorAjaxCall());
                throw (error);
            });
    };
};

export function loadBusinessDetailsSuccess(details) { return { type: types.LOAD_DETAILS_SUCCESS, details }};

export function loadBusinessDetails() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getDetails().then(f => {
            return f.data;
            }).then((result) => {
                dispatch(loadBusinessDetailsSuccess(result));
            }).catch(error => {
                dispatch(errorAjaxCall());
                throw (error);
            });
    };
};

export function loadBusinessLocationSuccess(businessLocation) { return { type: types.LOAD_BUSINESS_LOCATION_SUCCESS, businessLocation }};
export function loadBusinessLocationStaffMapSuccess(businessLocationStaffMap) { return { type: types.LOAD_BUSINESS_LOCATION_STAFF_MAP_SUCCESS, businessLocationStaffMap }};

export function loadBusinessLocations() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getBusinessLocations().then(f => {
            return f.data;
            }).then((result) => {
                dispatch(loadBusinessLocationSuccess(result.businessLocationData));
                dispatch(loadBusinessLocationStaffMapSuccess(result.businessLocationStaffMapData));
            }).catch(error => {
                dispatch(errorAjaxCall());
                throw (error);
            });
    };
};

export function loadStaffSuccess(staff) { 
    // Cache staff images
    var fullpaths = staff.map(i => {
        if(i.staff_menu_img) { 
            imageBaseUrl + i.staff_menu_img 
        }
    });
    fullpaths.map(image => {
    if (typeof image === 'string') {
        Image.prefetch(image);
    } else if (image) {
        Asset.fromModule(image).downloadAsync();
    }
    }); 

    return { type: types.LOAD_STAFF_SUCCESS, staff }
};

export function loadStaff() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getAllStaff().then(f => {
            return f.data;
            }).then((result) => {
                dispatch(loadStaffSuccess(result));
            }).catch(error => {
                dispatch(errorAjaxCall());
                throw (error);
            });
    };
};

export function loadGallerySuccess(gallery) { 
    // Cache gallery images
    var fullpaths = gallery.filter(x => x.business_gallery_media_type === 'IMAGE').filter(x => {
        if(!x.business_gallery_img) {
            return false;
        }
        return true;
    }).map(i => {
        if(i.business_gallery_type === 'WS') {
            return imageBaseUrl + i.business_gallery_img;
        } else {
            return i.business_gallery_img;
        }
    });
    fullpaths.map(image => {
        if (typeof image === 'string') {
            Image.prefetch(image);
        } else {
            Asset.fromModule(image).downloadAsync();
        }
    });
    return { type: types.LOAD_GALLERY_SUCCESS, gallery }
};

export function loadGalleryMappingSuccess(gallery_mapping) {    
    return { type: types.LOAD_GALLERY_MAPPING_SUCCESS, gallery_mapping }
};

export function loadGallery() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getGallery().then(f => {
            return f.data;
            }).then((result) => {
                dispatch(loadGallerySuccess(result.galleryData));
                dispatch(loadGalleryMappingSuccess(result.galleryMappingData));
            }).catch(error => {
                dispatch(errorAjaxCall());
                throw (error);
            });
    };
};


export function clearBookingSuccess() { return { type: types.CLEAR_BOOKING_SUCCESS }};

export function clearBooking() {
    return function (dispatch) {
        dispatch(clearBookingSuccess());   
        dispatch(paymentStatus({}));     
    };
};


export function removeBookingSuccess(booking) { return { type: types.REMOVE_BOOKING_SUCCESS, booking }};

export function removeBookingService(booking) {
    return function (dispatch) {
        dispatch(removeBookingSuccess(booking));        
    };
};


export function addBookingSuccess(booking) { return { type: types.ADD_BOOKING_SUCCESS, booking }};
export function updateBookingSuccess(booking) { return { type: types.UPDATE_BOOKING_SUCCESS, booking }};

export function addBookingService(booking) {
    return function (dispatch) {
        if(booking.booking_time)
            dispatch(updateBookingSuccess(booking));  
        else
            dispatch(addBookingSuccess(booking));  
    };
};

export function updateBookingService(booking) {
    return function (dispatch) {
        dispatch(updateBookingSuccess(booking));
    }
}

export function loadUserSuccess(user) { return { type: types.LOAD_USER_SUCCESS, user }};

export function loadUser(userObj) {
    return function (dispatch) {
        dispatch(loadUserSuccess(userObj));
    };
};

export function loadProductSuccess(products) { return { type: types.LOAD_PRODUCT_SUCCESS, products }};

export function loadProducts() {
    return function (dispatch) {
        dispatch(beginAjaxCall());
        return ServicesApi.getAllProducts().then(f => {
            return f.data;
        }).then((result) => {
            dispatch(loadProductSuccess(result.productData));
        }).catch(error => {
                dispatch(errorAjaxCall());
                throw (error);
        });
    };
};

export function loadWaitListSuccess(wait_list) { return { type: types.LOAD_WAIT_LIST_SUCCESS, wait_list }};

export function loadWaitList(wait_list_data) {
    return function (dispatch) {
        dispatch(loadWaitListSuccess(wait_list_data));
    };
};

export function deleteWaitListSuccess(wait_list) { return { type: types.DELETE_WAIT_LIST_SUCCESS, wait_list }};

export function deleteWaitList(wait_list_obj) {
    return function (dispatch) {
        dispatch(deleteWaitListSuccess(wait_list_obj));        
    };
};

export function addWaitListSuccess(wait_list) { return { type: types.ADD_WAIT_LIST_SUCCESS, wait_list }};

export function addWaitList(wait_list_obj) {
    return function (dispatch) {
        dispatch(addWaitListSuccess(wait_list_obj));        
    };
};


export function paymentSuccess(status) { return { type: types.PAYMENT_STATUS_SUCCESS, status }};

export function paymentStatus(status) {
    return function (dispatch) {
        dispatch(paymentSuccess(status));        
    };
};