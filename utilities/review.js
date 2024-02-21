import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function getIsInReview(appVersion, appStatus, businessAccountTypeId, sensitiveServices=false) {
    return Platform.OS === "ios" &&
    appVersion === Constants.expoConfig.version &&
    appStatus === 4 &&
    (businessAccountTypeId === 3 || (businessAccountTypeId === 1 && sensitiveServices))
}

export function getServiceCategory() {
    return [
        {
            service_business_category_id: 1,
            service_business_category: "Consultations"
        }
    ]
}

export function getService() {
    return [
        {
            service_id: 1,
            service_name: "Consultation",
            service_business_category_id: 1,
            enabled: 1,
            service_booking_enabled: 1,
            service_description: "A consultation about with one of our experts."
        }
    ]
}

export function getServiceDetail() {
    return [
        {
            service_business_detail_id: 1,
            service_business_id: 1,
            service_business_detail_price: 1000,
            service_business_detail_name: 1,
            service_business_detail_description: "A consultation about with one of our experts.",
            service_business_detail_split: 0,
            service_business_detail_duration_a: 30,
            service_business_detail_duration_break: 0,
            service_business_detail_duration_b: 0,
            service_business_detail_enabled: 1,
            service_business_detail_deposit_required: 1,
            service_business_detail_deposit_amount: 1000,
            service_business_detail_poa: 1
        }
    ]
}