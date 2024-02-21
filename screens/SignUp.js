import React from 'react';
import { StyleSheet, Dimensions, Platform, ScrollView, ImageBackground, Linking } from 'react-native';
import { Block, theme, Input, Text, Checkbox, Button } from 'galio-framework';
import * as Notifications from 'expo-notifications';
import PhoneInput from 'react-native-phone-input';
import Spinner from 'react-native-loading-spinner-overlay';
import { materialTheme, Images } from '../constants/';
import ServicesApi from './../api/services';
import { firebaseApp } from './../api/firebase/config';
import {
  getAuth,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import NetInfo from "@react-native-community/netinfo";

import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

const { width, height } = Dimensions.get('screen');

class SignUp extends React.Component {
  
  constructor(props, context) {
    super(props, context);
    
    this.phone;

    this.state = {
      passwordVisible: false,
      signupFirstName: '',
      signupFirstNameValid: true,
      signupLastName: '',
      signupLastNameValid: true,
      signupEmail: '',
      signupEmailValid: true,
      signupPhone: '+44',
      signupPhoneValid: true,
      signupPassword: '',
      signupPasswordValid: true,
      signupTermsChecked: false,
      signupTermsValid: true,
      signupError: null,
      signupLoading: false,
      signupRecaptcha: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  validatePassword(password) {
    var re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!$%@#£€*?&]{8,}$/;
    return re.test(String(password));
  }

  handleChange(event, name) {
    event.persist();
    if(name == 'firstname'){            
      this.setState((state) => state.signupFirstName = event.nativeEvent.text);
    } else if(name == 'lastname'){
      this.setState((state) => state.signupLastName = event.nativeEvent.text);
    } else if(name == 'email'){
      this.setState((state) => state.signupEmail = event.nativeEvent.text);
    } else if(name == 'phone'){
      this.setState((state) => state.signupPhone = event.nativeEvent.text); 
    } else if(name == 'password'){
      this.setState((state) => state.signupPassword = event.nativeEvent.text);
    }
  }

  submitCreateAccount() {
    let firstnameValid, lastnameValid, emailValid, passwordValid, phoneValid, termsValid;
    if(this.state.signupFirstName.length > 0){
      firstnameValid = true;
    } else {
      firstnameValid = false;
    }
    if(this.state.signupLastName.length > 0){
      lastnameValid = true;
    } else {
      lastnameValid = false;
    }
    if(this.validateEmail(this.state.signupEmail)){
      emailValid = true;
    } else {
      emailValid = false;
    }
    let parsedValidNumber = this.phone.isValidNumber();
    if(parsedValidNumber && parsedValidNumber == true){
      phoneValid = true;
    } else {
      phoneValid = false;
    }
    if(this.validatePassword(this.state.signupPassword)){
      passwordValid = true;
    } else {
      passwordValid = false;
      this.setState({signupError: 'Password must be a minimum of eight characters, at least one letter and one number.'});
    }
    
    termsValid = this.state.signupTermsChecked;

    this.setState({signupFirstNameValid: firstnameValid, signupLastNameValid: lastnameValid, signupEmailValid: emailValid, signupPhoneValid: phoneValid, signupPasswordValid: passwordValid, signupTermsValid: termsValid});
    
    if(firstnameValid && lastnameValid && emailValid && phoneValid && passwordValid && termsValid){  
      let that = this;

      this.setState({
        signupError: null,
        signupLoading: true,
        signupFirstNameValid: true,
        signupLastNameValid: true,
        signupEmailValid: true,
        signupPhoneValid: true,
        signupPasswordValid: true
      });
      // Fetch business id from services
      var business_id = ServicesApi.getBusinessId();
      // Fetch app key from services
      var appKey = ServicesApi.getBusinessAppKey();

      var parsedPhoneNumber = this.phone.getValue();
      var parsedPhoneNumberIso = this.phone.getISOCode();
      var parsedPhoneNumberCountryCode = this.phone.getCountryCode();
      // Common user error. Insert zero after country code in GB number.
      if(parsedPhoneNumberIso == 'gb' && parsedPhoneNumber.charAt(parsedPhoneNumberCountryCode.length + 1) == 0){
        parsedPhoneNumber = parsedPhoneNumber.replace('+440','+44');
      }
      
      NetInfo.fetch().then(state => {
        if(state.isConnected){
          const auth = getAuth(firebaseApp);
          setPersistence(auth, browserLocalPersistence);
          // Creates user and signs them in
          createUserWithEmailAndPassword(auth, this.state.signupEmail, this.state.signupPassword).then(user => {
            return user.user.getIdToken().then(idToken => {
                return ServicesApi.signUp({ idToken: idToken, app_key: appKey, firstname: that.state.signupFirstName, lastname: that.state.signupLastName, email: that.state.signupEmail, phone: parsedPhoneNumber, phone_iso: parsedPhoneNumberIso, business_id: business_id, token: 'ExponentPushToken[]' }).then(response => {
                  return;
                });
            });
          }).then(() => {
            // Now associate push token with user
            auth.currentUser.getIdToken().then(function(idToken) {
              Notifications.getExpoPushTokenAsync().then((tokenData) => {
                // Associate push token with this user
                ServicesApi.signIn({ idToken: idToken, app_key: appKey, business_id: business_id, token: tokenData.data, platform: Platform.OS }).then(response => {
                  // Store user data
                  that.props.actions.loadUser(response.data.user);
                  return;
                });
              }).catch(error => {
                // Likely failed due to invalid permissions
                console.log(error);
                return;
              });
            }).catch(function(error) {
              console.log(error);
              // Unknown error
              console.log('Unable to get Id token');
              return;
            });
          }).then(() => {
            that.setState({signupLoading: false});
            this.props.navigation.navigate('Home');
          }).catch(function(error) {
            // Handle Errors here.
            let errorCode = error.code;
            if(errorCode === 'auth/email-already-in-use'){
              that.setState({signupError: 'An account already exists with this email address', signupLoading: false});
            } else if(errorCode === 'auth/invalid-email'){
              that.setState({signupError: 'Invalid email address', signupLoading: false});
            } else if(errorCode === 'auth/operation-not-allowed'){
              that.setState({signupError: 'Operation denied', signupLoading: false});
            } else if(errorCode === 'auth/weak-password'){
              that.setState({signupError: 'Password is too weak', signupLoading: false});
            } else {
              that.setState({signupError: 'Sorry, an unexpected error has occured', signupLoading: false});
            }
          });
        } else {
          that.setState({signupError: 'You are currently offline', signupLoading: false});
        }
      });
    } else {
      this.setState({signupLoading: false});
      return;
    }
  }

  render() {
    return (
      <Block flex style={styles.container}>
        <Block flex>
          <ImageBackground
            source={{ uri: Images.BusinessCover }}
            style={{ height: height / 1, width, zIndex: 2 }}
          >
            <Block style={{backgroundColor: 'rgba(0,0,0,0.8)', height: '100%', width: '100%', paddingTop: theme.SIZES.BASE * 2}}>
              <ScrollView>
              {this.state.signupLoading ?
              <Block className="loading-container">
                <Block className="loading-container-spinner">
                  <Spinner visible={true} />
                </Block>
              </Block>
              : null}

              <Block style={{marginTop: theme.SIZES.BASE * 3}}>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                  <Input
                    type="default"
                    placeholder="First name"
                    id="firstname"
                    error={!this.state.signupFirstNameValid}
                    onChange= {(e) => this.handleChange(e, 'firstname')}
                    placeholderTextColor={'#ffffff'}
                    style={[{ borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0}, styles.input, !this.state.signupFirstNameValid ? styles.inputDanger: null]}
                  />
                </Block>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                  <Input
                    type="default"
                    placeholder="Last name"
                    id="lastname"
                    error={!this.state.signupLastNameValid}
                    onChange= {(e) => this.handleChange(e, 'lastname')}
                    placeholderTextColor={'#ffffff'}
                    style={[{ borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0}, styles.input, !this.state.signupLastNameValid ? styles.inputDanger: null]}
                  />
                </Block>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                <Input
                  type="email-address"
                  placeholder="Email"
                  id="email"
                  error={!this.state.signupEmailValid}
                  onChange= {(e) => this.handleChange(e, 'email')}
                  placeholderTextColor={'#ffffff'}
                  style={[{ borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0}, styles.input, !this.state.signupEmailValid ? styles.inputDanger: null]}
                />
                </Block>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                  <PhoneInput
                    ref={(ref) => { this.phone = ref; }}
                    placeholder="Mobile number"
                    initialCountry="gb"
                    value={this.state.signupPhone}
                    onSelectCountry={(iso2) => { this.setState({signupPhone: '+' + this.phone.getCountryCode()}) }}
                    textStyle={{ color: '#ffffff', fontSize: 16 }}
                    offset={theme.SIZES.BASE}
                    style={this.state.signupPhoneValid ? { padding: theme.SIZES.BASE, borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0, zIndex: 5, borderBottomWidth: 1} : { padding: theme.SIZES.BASE, borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0, zIndex: 5, borderBottomWidth: 1, borderBottomColor: materialTheme.COLORS.ERROR}}
                  />
                </Block>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                  <Input
                    right
                    placeholder="Password"
                    id="password"
                    error={!this.state.signupPasswordValid}
                    onChange= {(e) => this.handleChange(e, 'password')}
                    password
                    viewPass
                    iconColor={'#ffffff'}
                    placeholderTextColor={'#ffffff'}
                    style={[{ borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0}, styles.input, !this.state.signupPasswordValid ? styles.inputDanger: null]}
                  />
                </Block>
                <Block row style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                  <Checkbox
                    checked={this.state.signupTermsChecked}
                    onChange={() => this.setState({signupTermsChecked: !this.state.signupTermsChecked})}
                    name="checkedB"
                    label=""
                    color="primary"
                    checkboxStyle={{borderColor: '#ffffff'}}
                  />
                  
                  <Block flex row style={styles.terms}>
                      <Text p color="#ffffff" size={14} style={{ fontFamily: 'poppins-regular' }}>
                        I agree to the Styler <Text p color={'#ff2b54'} size={14} style={{ fontFamily: 'poppins-semi-bold' }} onPress={() => Linking.openURL("https://help.styler.digital/legal/booking_terms")}>Booking Terms</Text>, <Text p color={'#ff2b54'} size={14} style={{ fontFamily: 'poppins-semi-bold' }} onPress={() => Linking.openURL("https://help.styler.digital/legal/privacy_policy")}>Privacy Policy</Text> and <Text p color={'#ff2b54'} size={14} style={{ fontFamily: 'poppins-semi-bold' }} onPress={() => Linking.openURL("https://help.styler.digital/legal/terms_of_use")}>Terms Of Use</Text>.
                      </Text>
                  </Block>
                </Block>
                <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE}}>
                  <Button fullWidth 
                    disabled={!this.state.signupTermsChecked}
                    color={this.state.signupTermsChecked ? this.props.settings.signup_button : '#787878'}
                    style={{ flex: 1 }}
                    loading={this.state.signupLoading}
                    onPress={() => { this.setState({signupLoading: true}); this.submitCreateAccount(); } }>
                      <Text style={{ fontFamily: 'poppins-medium' }} color={this.state.signupTermsChecked ? this.props.settings.signup_button_text : 'white'}>Create Account</Text>
                  </Button>
                </Block>
                {this.state.signupError ? <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE * 1.5}}>
                  <Block style={{backgroundColor: materialTheme.COLORS.ERROR, width: '100%', padding: theme.SIZES.BASE, borderRadius: 3}}>
                  <Text color={'#ffffff'} style={{ fontFamily: 'poppins-regular' }}>{this.state.signupError}</Text>
                  </Block>
                </Block> : null}
              </Block>
              </ScrollView>
            </Block>
          </ImageBackground>
        </Block>
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(SignUp));

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BLACK,
    marginTop: 0,
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    zIndex: 3,
    position: 'absolute',
    bottom: Platform.OS === 'android' ? theme.SIZES.BASE * 2 : theme.SIZES.BASE * 3,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 8,
    marginLeft: 12,
    borderRadius: 2,
    height: 22
  },
  gradient: {
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 66,
  },
  page: {
    height: '100%',
    width: '93%',
    alignItems: 'center'
  },
  termsButton: {
    marginTop: '10%',
    marginBottom: 15,
  },
  terms:{
    flexWrap: 'wrap',
    paddingLeft: '5%',
  },
  input: {
    zIndex: 5,
    borderBottomWidth: 1,
  },
  inputDanger: {
    borderBottomColor: materialTheme.COLORS.ERROR,
  },
});
