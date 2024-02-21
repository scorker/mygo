// Expo
import Constants from "expo-constants";
// Firebase
import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
//import { initializeAuth, getReactNativePersistence } from "firebase/auth/react-native";

// Storage
//import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.firebase.apiKey,
    authDomain: Constants.expoConfig.extra.firebase.authDomain
};
let firebaseApp;
let firebaseApps = getApps();
if (firebaseApps.length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    initializeAuth(firebaseApp, {
       persistence: getReactNativePersistence//getReactNativePersistence(AsyncStorage)
    });
}

const auth = getAuth(firebaseApp);

export { auth };