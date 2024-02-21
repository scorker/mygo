import React from 'react';
import { Image } from 'react-native';
import { Block, Button, Text } from 'galio-framework';
import { firebaseApp } from '../../api/firebase/config';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import * as Notifications from 'expo-notifications';
import ServicesApi from '../../api/services';
import * as Google from 'expo-auth-session/providers/google';
export const isAndroid = () => Platform.OS === 'android';
import Constants from "expo-constants";

function getClientId() {
    switch(Platform.OS) {
        case 'ios':
            if(Constants.appOwnership === 'expo') {
                return Constants.expoConfig.extra.google.expoClientId;
            } else {
                return Constants?.manifest?.extra?.google?.iosStandaloneClientId;
            }
        case 'android':
            if(Constants.appOwnership === 'expo') {
                return Constants.expoConfig.extra.google.expoClientId;
            } else {
                return Constants.expoConfig.extra.google.androidStandaloneClientId;
            }
        default:
            return undefined;
    }
}
  
export default function GoogleSignInButton(props) {
    const [request1, response1, promptAsync1] = Google.useAuthRequest({
        iosClientId: Constants.expoConfig.extra.google.iosStandaloneClientId,
        androidClientId: Constants.expoConfig.extra.google.androidStandaloneClientId,
        expoClientId: Constants.expoConfig.extra.google.expoClientId,
        //redirectUri: redirectUri,
    });
    React.useEffect(() => {
        const fun = async() => {
        if (response1?.type === 'success') {
            try {
                const auth = getAuth(firebaseApp);
                setPersistence(auth, browserLocalPersistence);
                const { accessToken, idToken } = response1.authentication;
                const credential = GoogleAuthProvider.credential(idToken, accessToken);
                const userData = await signInWithCredential(auth, credential);
                // Get push notification data
                let notificationToken;
                try {
                    let notificationTokenData = await Notifications.getExpoPushTokenAsync();
                    notificationToken = notificationTokenData.data;
                } catch(tokenErr) {
                    console.log(tokenErr);
                }
                // Get id token from signed in user
                const firebaseToken = JSON.parse(JSON.stringify(userData.user)).stsTokenManager.accessToken;
                const response = await ServicesApi.socialSignIn({
                    idToken: firebaseToken,
                    app_key: ServicesApi.getBusinessAppKey(),
                    business_id: ServicesApi.getBusinessId(),
                    token: notificationToken,
                    platform: Platform.OS
                });
                if(props.onResponse) {
                    props?.onResponse({ status: 'success', user: response.data.user});
                    return;
                }
            } catch(err) {
                console.log(err);
                if (err === 'auth/account-exists-with-different-credential') {
                    props?.onResponse({ status: 'exists-with-different-credential'});
                    return;
                } else {
                    props?.onResponse({ status: 'fail'});
                    return;
                }
            }
        }};
        fun();
    }, [response1]);
    async function handleClick() { 
        await promptAsync1();
    }
    return (
        <Block row flex>
            <Button round shadowless color={'#ffffff'} style={[{ flex: 1 }]} onPress={handleClick}>
                <Block row flex center>
                    <Image source={require('../../assets/images/googleicon.png')} style={{ width: 20, height: 20, marginRight: 10 }} />
                    <Text color={'#000000'} style={{fontFamily: 'poppins-medium'}}>Sign in with Google</Text>
                </Block>
            </Button>
        </Block>
    );
}