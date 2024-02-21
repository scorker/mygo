import React, { Component, createContext } from "react";
import { AppState } from "react-native";
import { firebaseApp } from "../api/firebase/config";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import * as Notifications from 'expo-notifications';
import ServicesApi from '../api/services';
import moment from 'moment';
import { Toast, theme, Text, Icon, Block } from 'galio-framework';
import { StyleSheet } from 'react-native';

export const UserContext = createContext({ user: null });

class UserProvider extends Component {
  state = {
    user: null,
    lastUpdate: moment().subtract(24, 'hours'),
    isShow: false,
    appState: AppState.currentState
  };

  componentDidMount = () => {
    // Listen for auth state change
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, userAuth => {
      if(userAuth && auth.currentUser){
        auth.currentUser.getIdToken().then(g => {
          this.setState({ user: g, lastUpdate: moment(), isShow: true });
          setTimeout(() => {
            this.setState({isShow: false});
            }, 3000); 
        })
      }
    });
    // Listen for app state change
    AppState.addEventListener('change', this.handleAppStateChange);
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    if(this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      new Promise(this.refresh).then(f => {
      });
    }
    this.setState({ appState: nextAppState });
  };

  refresh = () => {
    let that = this
    const auth = getAuth(firebaseApp);
    var re = function(resolve, reject) {
      if (that.state.lastUpdate && moment().diff(that.state.lastUpdate, 'minutes') > 30 && auth.currentUser) {
        auth.currentUser.getIdToken().then(g => {
          that.setState({ user: g, lastUpdate: moment(), isShow: true });
          setTimeout(() => {
            that.setState({isShow: false});
            }, 3000); 
          resolve(g)
          return
        });
      } else {
        resolve(that.state.user)
        return
      };
      return;
    }

    return new Promise(re);
  }

  logout = () => {
    let that = this;
    const auth = getAuth(firebaseApp);
    let business_id = ServicesApi.getBusinessId();
    let appKey = ServicesApi.getBusinessAppKey();
    signOut(auth).then(function() {
      that.setState({user: null});
      // Update push token user
      Notifications.getExpoPushTokenAsync().then((tokenData) => {
        ServicesApi.signOut({ app_key: appKey, business_id: business_id, token: tokenData.data });
      }).catch(error => {
        // Likely failed due to invalid permissions
        console.log(error);
      });
    }).catch(function(error) {
      console.log(error);
    });
  }

  render() {
    let that = this
    return (
      <UserContext.Provider value={{user: this.state.user, logout: this.logout, refresh: this.refresh}}>
        <Toast color={'#4caf50'} isShow={that.state.isShow} positionIndicator="bottom" style={{margin: theme.SIZES.BASE}}>
          <Block flex row>
            <Icon name="check" family="Feather" color={'#ffffff'} size={17} style={{marginRight: 10}} />
            <Text color={'#ffffff'}>Logged in successfully</Text>
          </Block>
        </Toast>
        {this.props.children}
      </UserContext.Provider>
    );
  }
  
}


export default UserProvider;

const styles = StyleSheet.create({ 

right: {
  height: '10%', //'100vh'
},
bottom: {
  justifyContent: 'flex-end',
  marginBottom: 36
}

})