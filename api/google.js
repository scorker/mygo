import React from 'react';
import { Alert, Platform, UIManager, LayoutAnimation } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
export const isAndroid = () => Platform.OS === 'android';
import Constants from "expo-constants";

function getRedirectUrl() {
  switch(Platform.OS) {
      case 'ios':
        let ios_guid = 'com.googleusercontent.apps.' + Constants.expoConfig.extra.google.iosStandaloneClientId.replace('.apps.googleusercontent.com', '');
        return `${ios_guid}:/oauth2redirect/google`
      case 'android':
        let android_guid = Constants.expoConfig.extra.google.androidStandaloneClientId;
        return `${android_guid}:/oauthredirect`
      default:
          return undefined;
  }
}

function getClientId() {
  switch(Platform.OS) {
    case 'ios':
        return Constants.expoConfig.extra.google.iosStandaloneClientId;
    case 'android':
        return Constants.expoConfig.extra.google.androidStandaloneClientId;
    default:
        return undefined;
  }
}



const config = {
  issuer: 'https://accounts.google.com',
  clientId: getClientId(),
  redirectUri: getRedirectUrl(),
  scopes: ['profile', 'email']
};

export const signInWithGoogle = async () => {

  try {
    const [request1, response1, promptAsync1] = Google.useAuthRequest({
      ClientId: getRedirectUrl(),
      redirectUri: getRedirectUrl(),
    });

    React.useEffect(() => {
      if (response1?.type === 'success') {
        const { authentication } = response1;
        console.log(response1)
      }
    }, [response]);
  
    
    promptAsync1();

    return response;
    // result includes accessToken, accessTokenExpirationDate and refreshToken
  } catch (error) {
    console.log(error);
  }


};