// src/js/store/index.js
import { configureStore } from '@reduxjs/toolkit';
//import { applyMiddleware } from "redux";
import rootReducer from "../reducers";

//import thunk from 'redux-thunk';
import { persistStore, persistReducer, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, } from 'redux-persist';
//import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['bookings']
}
 

const persistedReducer = persistReducer(persistConfig, rootReducer);
 
export default function configureStoreFunc(initalState) {
 
    let store = configureStore({reducer: persistedReducer, middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })});
      //applyMiddleware(thunk));
    let persistor = persistStore(store);
    return { store, persistor };
}