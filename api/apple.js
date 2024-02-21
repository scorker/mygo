import * as Notifications from 'expo-notifications';
import { firebaseApp } from './firebase/config';
import {
    getAuth,
    OAuthProvider,
    signInWithCredential,
    setPersistence,
    browserLocalPersistence,
    updateProfile
} from 'firebase/auth';
import { Platform } from 'react-native';
import ServicesApi from './services'
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from "expo-crypto";

export async function signInWithApple() {
    let notificationToken = null, userData = null, error;
    try {
        const csrf = Math.random().toString(36).substring(2, 15);
        const nonce = Math.random().toString(36).substring(2, 10);
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
        const appleCredential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL
            ],
            state: csrf,
            nonce: hashedNonce
        });
        const { identityToken, fullName } = appleCredential;
        const auth = getAuth(firebaseApp);
        const provider = new OAuthProvider("apple.com");
        // Sign in with Facebook credential
        const credential = provider.credential({
            idToken: identityToken,
            rawNonce: nonce // nonce value from above
        });
        setPersistence(auth, browserLocalPersistence);
        userData = await signInWithCredential(auth, credential);
        if(fullName.givenName && fullName.familyName) {
            await updateProfile(
                userData.user,
                {
                    displayName: `${fullName.givenName} ${fullName.familyName}`
                }
            );
        }
        try {
            let notificationTokenData = await Notifications.getExpoPushTokenAsync();
            notificationToken = notificationTokenData.data;
        } catch(tokenErr) {
            console.log(tokenErr);
        }
    } catch (e) {
        error = e
    } finally {
        if (error) {
            return { status: 'fail'};
        } else {
            const accessToken = JSON.parse(JSON.stringify(userData.user)).stsTokenManager.accessToken;
            const response = await ServicesApi.socialSignIn({ idToken: accessToken, app_key: ServicesApi.getBusinessAppKey(), business_id: ServicesApi.getBusinessId(), token: notificationToken, platform: Platform.OS });
            return { status: 'success', user: response.data.user };   
        }
    }
}