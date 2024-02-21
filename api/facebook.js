import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import {
  getAuth,
  FacebookAuthProvider,
  signInWithCredential,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { firebaseApp } from './firebase/config';
import ServicesApi from './services'
import { FirebaseError } from 'firebase/app';

export async function signInWithFacebook() {
  let exp;
  try {
    exp = await import('react-native-fbsdk-next');
  } catch(err) {
    console.log(err);
    return { status: 'fail'};
  }
  const { AccessToken, LoginManager } = exp;
  const permissions = ['public_profile', 'email'];
  try {
    // Limited login
    const result = await LoginManager.logInWithPermissions(
      permissions
    );
    if(result.isCancelled) {
      return { status: 'cancelled'};
    }
    const auth = getAuth(firebaseApp);
    setPersistence(auth, browserLocalPersistence);
    let data = await AccessToken.getCurrentAccessToken();
    if(!data) {
      return { status: 'fail'};
    }
    let facebookCredential = FacebookAuthProvider.credential(data.accessToken);
    // Sign in with Facebook credential
    let userData = await signInWithCredential(auth, facebookCredential);
    // Get push token
    let notificationToken;
    try {
      let notificationTokenData = await Notifications.getExpoPushTokenAsync();
      notificationToken = notificationTokenData.data;
    } catch(tokenErr) {
      console.log(tokenErr);
    }
    const accessToken = JSON.parse(JSON.stringify(userData.user)).stsTokenManager.accessToken;
    const response = await ServicesApi.socialSignIn({
      idToken: accessToken,
      app_key: ServicesApi.getBusinessAppKey(),
      business_id: ServicesApi.getBusinessId(),
      token: notificationToken, platform: Platform.OS
    });
    return { status: 'success', user: response.data.user};
  } catch(err) {
    if(err instanceof FirebaseError &&
      err.message.includes('auth/account-exists-with-different-credential')) {
        return { status: 'exists-with-different-credential'};
    }
    return { status: 'fail'};
  }
}