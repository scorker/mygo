import { Platform } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const businessId = Constants.expoConfig.extra.businessId;
const businessAppKey = Constants.expoConfig.extra.businessAppKey;
const isProduction = (Constants.expoConfig.extra.production === true);

const baseUrl = isProduction ? 'https://api.styler.digital' : 'http://192.168.0.7:8080';

const getRequestConfig = (idToken = null) => {
    let requestHeaders = {
        'App-Authorization': `${businessAppKey}:${businessId}`,
        'App-OS': Platform.OS,
        'App-Version': Constants.expoConfig.version
    };
    if(idToken) {
        requestHeaders['Authorization'] = `Bearer ${idToken}`;
    }
    return {
        headers: requestHeaders
    }
}

const ServicesApi = {

    getBusinessId: () => { return businessId },

    getBusinessAppKey: () => { return businessAppKey },

    addPaymentMethod: (appKey, businessId, idToken, payment_method_id) => {
        return axios.post(baseUrl + '/app/add_payment_method', { appKey, businessId, idToken, payment_method_id });
    },

    deletePaymentMethod: (appKey, businessId, idToken, payment_method_id) => {
        return axios.post(baseUrl + '/app/delete_payment_method', { appKey, businessId, idToken, payment_method_id });
    },

    setDefaultPaymentMethod: (appKey, businessId, idToken, payment_method_id) => {
        return axios.post(baseUrl + '/app/set_default_payment_method', { appKey, businessId, idToken, payment_method_id });
    },

    getStripeCustomer: (appKey, businessId, idToken) => {
        return axios.post(baseUrl + '/app/get_stripe_customer', {appKey, businessId, idToken});
    },

    createPaymentIntent: (idToken, appKey, businessId, businessLocationId, selectedServices, selectedStaff, payment_method_id, booking_date, booking_time) => {
        return axios.post(
            baseUrl + '/app/create_payment_intent',
            { idToken, appKey, businessId, businessLocationId, services: selectedServices, staff: selectedStaff, payment_method_id, booking_date, booking_time},
            getRequestConfig(idToken)
        );
    },

    deletePaymentIntent: (idToken, paymentIntentId) => {
        return axios.delete(`${baseUrl}/app/payment_intent/${paymentIntentId}`, getRequestConfig(idToken));
    },

    createSetupIntent: (idToken, appKey, businessId) => {
        return axios.post(baseUrl + '/app/create_setup_intent', { idToken, appKey, businessId });
    },

    getCategories: () => {
        return axios.get(baseUrl + '/app/allBusinessServiceCategories/' + businessAppKey + '&' + businessId);
    },

    getAll: () => {
        return axios.get(baseUrl + '/app/allbusinessServices/' + businessAppKey + '&' + businessId);
    },

    getServices: () => {
        return axios.get(`${baseUrl}/app/get_services/${businessAppKey}&${businessId}`, getRequestConfig());
    },

    getAllStaff: () => {
        return axios.get(baseUrl + '/app/allbusinessStaff/' + businessAppKey + '&' + businessId);
    },

    getAllProducts: () => {
        return axios.get(baseUrl + '/app/get_products/' + businessAppKey + '&' + businessId);
    },

    getOpeningHours: (startDate, endDate, businessLocationId) => {
        return axios.get(baseUrl + '/app/businessOpeningHours/' + businessAppKey + '&' + businessId + '&' + startDate + '&' + endDate + '?businessLocationId=' + businessLocationId);
    },

    getColourSettings: () => {
        return axios.get(`${baseUrl}/app/businessColourSettings/${businessAppKey}&${businessId}`, getRequestConfig());
    },

    getGallery: () => {
        return axios.get(baseUrl + '/app/get_gallery/' + businessAppKey + '&' + businessId);
    },

    getNotifications: () => {
        return axios.get(baseUrl + '/app/businessNotifications/' + businessAppKey + '&' + businessId);
    },

    getDetails: () => {
        return axios.get(baseUrl + '/app/businessDetails/' + businessAppKey + '&' + businessId);
    },

    getBusinessLocations: () => {
        return axios.get(baseUrl + '/app/business_locations/' + businessAppKey + '&' + businessId);
    },

    postPushToken: (token, platform) => {
        return axios.post(baseUrl + '/app/postPushToken', {token: token, platform: platform, business_id: businessId, app_key: businessAppKey});
    },

    confirmPaymentIntent: (payment_intent_id) => {
        return axios.post(baseUrl + '/app/confirm_payment_intent', {payment_intent_id: payment_intent_id}); 
    },

    getPaymentIntentStatus: (payment_intent_id) => {       
        return axios.post(baseUrl + '/app/get_payment_intent_status', {payment_intent_id: payment_intent_id}); 
    },

    // Authentication
    signIn: async (data) => {       
        return axios.post(baseUrl + '/app/signin', data);
    },
    socialSignIn: async (data) => {       
        return axios.post(baseUrl + '/app/social_signin', data);
    },
    signUp: async (data) => {       
        return axios.post(baseUrl + '/app/signup', data);
    },
    signOut: async (data) => {       
        return axios.post(baseUrl + '/app/signout', data);
    },
    resetPassword: async (data) => {       
        return axios.post(baseUrl + '/app/reset_password', data);
    },
    verifyEmail: async (data) => {       
        return axios.post(baseUrl + '/app/verify_email', data);
    },
    // Booking
    reserveTime: async (data) => {       
        return axios.post(baseUrl + '/app/reserve_time', data);
    },
    bookingTimes: async (data) => {
        return axios.get(baseUrl + '/app/getAvailableTimes/' + businessId + '&' + data.business_location_id + '&' +
        JSON.stringify(data.booking_data) + '&' + data.booking_date + '&' + data.duration);
    },
    newBooking: async (data) => {
        return axios.post(baseUrl + '/app/new_booking', data, getRequestConfig(data.idToken));
    },
    updateBooking: async (data) => {       
        return axios.post(baseUrl + '/app/update_booking', data);
    },
    cancelBooking: async (data) => {       
        return axios.post(baseUrl + '/app/cancel_booking', data);
    },
    getBookings: async (data) => {       
        return axios.post(baseUrl + '/app/getUserBookings', data);
    },
    // User
    updateUser: async (data) => {       
        return axios.post(baseUrl + '/app/update_user', data);
    },
    // Wait List
    getWaitList: async (data) => {       
        return axios.post(baseUrl + '/app/get_wait_list', data);
    },
    addWaitList: async (data) => {       
        return axios.post(baseUrl + '/app/add_wait_list', data);
    },
    deleteWaitList: async (data) => {       
        return axios.post(baseUrl + '/app/delete_wait_list', data);
    },
    // Account
    deleteAccount: async (data) => {       
        return axios.post(baseUrl + '/app/delete_account', data);
    },
    // Misc
    reportProblem: async (data) => {       
        return axios.post(baseUrl + '/app/report_problem', data);
    }
}

module.exports = ServicesApi;
