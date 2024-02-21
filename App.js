/*!
 =========================================================
 * Styler Business App - v1.11.3
 =========================================================
 * Copyright 2023 Styler Digital (https://styler.digital)
 =========================================================
*/
import React from 'react';
import { Platform, Image, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Font from 'expo-font';
import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import ServicesApi from './api/services';
import { Block, GalioProvider } from 'galio-framework';
import AppContainer from './navigation/Screens';
import { NavigationContainer } from '@react-navigation/native';
import { materialTheme, Images } from './constants/';
import { Provider } from 'react-redux';
import configureStoreFunc from './store/index';
import { loadServices, loadAppSettings, loadAppNotifications, loadBusinessDetails, loadStaff, loadGallery, loadProducts, loadBusinessLocations } from './actions/index';
import { PersistGate } from 'redux-persist/integration/react';
import UserProvider from './providers/userProvider';
import * as Sentry from 'sentry-expo';
import { StripeProvider } from '@stripe/stripe-react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://31771673fe124a1a9fb4490672637b0f@o805225.ingest.sentry.io/5803206',
  enableInExpoDevelopment: true,
  debug: false, // Set this to `false` in production.
});


let obj = configureStoreFunc();
let store = obj.store;
let persistor = obj.persistor;

//cache app images
const assetImages = [
  Images.BusinessLogo,
  Images.BusinessCover
];

function cacheImages() {
  return assetImages.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
      appSettings: undefined
    };
    
  };

  requestPermissionsAsync = async () => {
    return await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
  }

  registerForPushNotificationsAsync = async () => {
    let token;
    try {
      
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      if (Constants.appOwnership !== 'expo') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await this.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return;
        }
        token = await Notifications.getExpoPushTokenAsync();
        ServicesApi.postPushToken(token.data, Platform.OS);
      }
    } catch(e) {
      console.log('Unable to register for push notifications');
    }
  };

  componentDidMount() {
    this.loadAppData();
  }

  async loadAppData() {
    this.registerForPushNotificationsAsync();
    try {
      await this.loadResourcesAsync();
    } catch(e) {
      console.log(e);
    } finally {
      this.setState({ isLoadingComplete: true });
    }
  }

  loadResourcesAsync = async () => {
    await Font.loadAsync({
      'poppins-bold': require('./assets/fonts/Poppins-Bold.ttf'),
      'poppins-semi-bold': require('./assets/fonts/Poppins-SemiBold.ttf'),
      'poppins-medium': require('./assets/fonts/Poppins-Medium.ttf'),
      'poppins-regular': require('./assets/fonts/Poppins-Regular.ttf'),
      'poppins-light': require('./assets/fonts/Poppins-Light.ttf')
    });
    return Promise.all([
      cacheImages(),
      store.dispatch(loadAppSettings()),
      store.dispatch(loadServices()),
      store.dispatch(loadStaff()),
      store.dispatch(loadBusinessDetails()),
      store.dispatch(loadBusinessLocations()),
      store.dispatch(loadAppNotifications()),
      store.dispatch(loadGallery()),
      store.dispatch(loadProducts())
    ]);
  };

  onLayoutRootView = async () => {
    if(this.state.isLoadingComplete) {
      await SplashScreen.hideAsync();
    }
  };
  
  render() {
    if(!this.state.isLoadingComplete) {
      return null;
    }
    return (
      <View style={{ flex: 1 }} onLayout={this.onLayoutRootView}>
        <StripeProvider>
          <UserProvider>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <GalioProvider theme={materialTheme}>
                  <Block flex>
                      <NavigationContainer>
                        <AppContainer />
                      </NavigationContainer>           
                  </Block>          
                </GalioProvider>
              </PersistGate>
            </Provider>
          </UserProvider>
        </StripeProvider>
      </View>
    );
  }
}