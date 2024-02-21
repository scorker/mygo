import { combineReducers } from 'redux';
import serviceCategory from './serviceCategory';
import service from './service';
import serviceDetail from './serviceDetail';
import settings from './settings';
import notifications from './notifications';
import details from './details';
import staff from './staff';
import gallery from './gallery';
import gallery_mapping from './gallery_mapping';
import bookings from './booking';
import user from './user';
import paymentStatus from './paymentStatus';
import asyncData from './asyncData';
import products from './products';
import wait_list from './wait_list';
import businessLocation from './businessLocation';
import businessLocationStaffMap from './businessLocationStaffMap';
import serviceStaffMap from './serviceStaffMap';
import serviceBusinessLocationMap from './serviceBusinessLocationMap';
import { reducer as reduxFormReducer } from 'redux-form';

export default combineReducers({
  serviceCategory,
  service,
  serviceDetail,
  serviceStaffMap,
  serviceBusinessLocationMap,
  settings,
  notifications,
  details,
  staff,
  paymentStatus,
  gallery,
  bookings,
  user,
  asyncData,
  products,
  gallery_mapping,
  wait_list,
  businessLocation,
  businessLocationStaffMap,
  form: reduxFormReducer
})
