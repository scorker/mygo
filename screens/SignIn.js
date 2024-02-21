import React from 'react';
import { ImageBackground, StyleSheet, ScrollView, View, Dimensions, Platform } from 'react-native';
import ServicesApi from '../api/services';
import { UserContext } from "../providers/userProvider";
import { withNavigation } from '@react-navigation/compat';
import { firebaseApp } from '../api/firebase/config';
import {
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence
} from 'firebase/auth';
import { Button, Block, Text, Input, theme } from 'galio-framework';
import * as Notifications from 'expo-notifications';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import NetInfo from "@react-native-community/netinfo";
import { Icon } from '../components';
import { Images, materialTheme } from '../constants';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import { signInWithFacebook } from '../api/facebook';
//import { signInWithGoogle } from '../api/google';
import { signInWithApple } from '../api/apple';
import GoogleSignInButton from '../components/Authentication/GoogleSignInButton';

const { height, width } = Dimensions.get('screen');

class SignIn extends React.Component {
 
  static contextType = UserContext
  focusSubscription

  constructor(props, context) {
    super(props, context);
    this.state = {
      focusSubscription: {},
      passwordVisible: false,
      manualEmail: '',
      manualPassword: '',
      manualEmailValid: true,
      manualPasswordValid: true,
      signInError: null,
      signInLoading: false,
      facebookProfileData: ''
    };
    this.handleChange = this.handleChange.bind(this);
    
  }

  componentDidMount() {
    const { navigation } = this.props;  
    const { refresh } = this.context

    //this.props.navigation will come in every component which is in navigator
    focusSubscription = navigation.addListener(
      'willFocus',
      payload => {
        refresh().then(f => {
          if(!f){
              navigation.navigate('SignIn')
          }
        }).catch(e => {
           navigation.navigate('SignIn')
        })
      }
    );
    this.setState({focusSubscription: focusSubscription});
  }

  onAppleButtonPress = async () => {
    // Make a request to apple.
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: AppleAuthRequestOperation.LOGIN,
      requestedScopes: [
        AppleAuthRequestScope.EMAIL,
        AppleAuthRequestScope.FULL_NAME,
      ],
    });

    // Get the credential for the user.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user
    );

    // If the Auth is authorized, we call our API and pass the authorization code.
    if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
      console.log(appleAuthRequestResponse.authorizationCode);
    }

  };

  componentWillUnmount() {
    this.state.focusSubscription.remove();
  }

  submitManualLogin() {
    let emailValid, passwordValid;
    var business_id = ServicesApi.getBusinessId();
    var appKey = ServicesApi.getBusinessAppKey();

    if(this.validateEmail(this.state.manualEmail)){
      emailValid = true;
    } else {
      emailValid = false;
    }
    if(this.state.manualPassword.length > 0){
      passwordValid = true;
    } else {
      passwordValid = false;
    }
    this.setState({manualEmailValid: emailValid, manualPasswordValid: passwordValid});
    if(emailValid && passwordValid){
      let that = this;
      that.setState({signInError: null, signInLoading: true});
      NetInfo.fetch().then(state => {
        if(state.isConnected){
          const auth = getAuth(firebaseApp);
          setPersistence(auth, browserLocalPersistence);
          // When the user signs in with email and password.
          signInWithEmailAndPassword(auth, this.state.manualEmail, this.state.manualPassword).then(user_data => {
            auth.currentUser.getIdToken().then(function(idToken) {
              Notifications.getExpoPushTokenAsync().then((tokenData) => {
                // Associate push token with this user
                ServicesApi.signIn({ idToken: idToken, app_key: appKey, business_id: business_id, token: tokenData.data, platform: Platform.OS }).then(response => {
                  // Store user data
                  that.props.actions.loadUser(response.data.user);
                  // Reset component state
                  that.setState({signInLoading: false, manualEmail: '', manualPassword: ''});
                });
              }).catch(error => {
                // Likely failed due to invalid permissions
                ServicesApi.signIn({ idToken: idToken, app_key: appKey, business_id: business_id, token: null, platform: Platform.OS }).then(response => {
                  // Store user data
                  that.props.actions.loadUser(response.data.user);
                  // Reset component state
                  that.setState({signInLoading: false, manualEmail: '', manualPassword: ''});
                });
              });
            }).catch(function(error) {
              // Unknown error
              console.log('Unable to get Id token');
              that.setState({signInLoading: false, manualEmail: '', manualPassword: ''});
            });

            //this.nextPage();
            const { navigation } = this.props;
            navigation.navigate('Home')
          
          }).catch(function(error) {
            console.log(error);
            let errorCode = error.code;
            if(errorCode === 'auth/invalid-email'){
              that.setState({signInError: 'Invalid email address'});
            } else if(errorCode === 'auth/user-disabled'){
              that.setState({signInError: 'Account disabled'});
            } else if(errorCode === 'auth/user-not-found'){
              that.setState({signInError: 'Account does not exist'});
            } else if(errorCode === 'auth/wrong-password'){
              that.setState({signInError: 'Incorrect password'});
            } else if(error.message.includes("TOO_MANY_ATTEMPTS_TRY_LATER") || error.message.includes("Too many unsuccessful login")){
              that.setState({signInError: 'Too many unsuccessful login attempts. Please try again later.'});
            } else if(error.message == 'Email not verified'){
              that.setState({signInError: 'Please verify your email address using the verification email which we sent you.'});
            } else {
              that.setState({signInError: 'Sorry, an unexpected error has occured'});
            }
            that.setState({signInLoading: false});
          });
        } else {
          that.setState({signInLoading: false, signInError: 'You are currently offline'});
        }
      });
    } else {
      return;
    }
  }

  forgotPassword() {
    const { navigation } = this.props;

    navigation.navigate('ForgotPassword')
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  handleChange(event, name) {
    event.persist();
    if(name == 'manualEmail'){            
      this.setState((state) => state.manualEmail = event.nativeEvent.text);
    } else if(name == 'manualPassword'){
      this.setState((state) => state.manualPassword = event.nativeEvent.text);
    }
  }
  
  submitGoogleLogin() {
    let that = this;
    that.setState({signInError: null, signInLoading: true});
    return signInWithGoogle(this.props.navigation)
  }

  
  submitGoogleLoginWrapper = async (result) =>  {
    //const { navigation } = this.props;
    //const result = await this.submitGoogleLogin();
    //console.log(result);
    if (result.status === "success") {
      this.props.actions.loadUser(result.user);
      this.props.navigation.navigate("Home"); 
      //after Google login redirect to Profile
    } else if(result && result.status === 'fail'){
      this.setState({signInError: 'An error occured whilst trying to sign in with Google.', signInLoading: false});
    } else if(result && result.status === 'cancelled'){
      this.setState({signInError: null, signInLoading: false});
    }
  }

  submitFacebookLogin() {
    let that = this;
    that.setState({signInError: null, signInLoading: true});
    return signInWithFacebook();
  }

  submitFacebookLoginWrapper = async () =>  {
    if(Platform.OS === 'ios') {
      await requestTrackingPermissionsAsync();
    }
    const { navigation } = this.props;
    const result = await this.submitFacebookLogin();
    if(result && result.status === 'success'){
      this.props.actions.loadUser(result.user);
      navigation.navigate('Home');
    } else if(result && result.status === 'fail'){
      this.setState({signInError: 'An error occured whilst trying to sign in with Facebook.', signInLoading: false});
    } else if(result && result.status === 'exists-with-different-credential'){
      this.setState({signInError: 'Account already exists with a different sign-in method.', signInLoading: false});
    } else if(result?.status === 'tracking-disabled') {
      this.setState({signInError: 'Tracking is required for Sign in with Facebook to function.', signInLoading: false});
    } else if(result && result.status === 'cancelled'){
      this.setState({signInError: null, signInLoading: false});
    }
  }

  submitAppleLogin = async () => {
    let that = this;
    that.setState({signInError: null, signInLoading: true});
    return signInWithApple()
  }

  submitAppleLoginWrapper = async () =>  {
    const { navigation } = this.props;
    const result = await this.submitAppleLogin();
    console.log(result);
    if (result.status === "success") {
      this.props.actions.loadUser(result.user);
      this.props.navigation.navigate("Home"); 
      //after Google login redirect to Profile
    } else if(result && result.status === 'fail'){
      this.setState({signInError: 'An error occured whilst trying to sign in with Apple.', signInLoading: false});
    } else if(result && result.status === 'cancelled'){
      this.setState({signInError: null, signInLoading: false});
    }
  }

  render() {
    let that = this;
    return (
        <Block flex style={styles.container}>
        <Block flex>
          <ImageBackground
            source={{ uri: Images.BusinessCover }}
            style={{ height: height / 1, width, zIndex: 2 }}
          >
            {/*<LinearGradient
            style={styles.gradient}
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}/>*/}
            <Block style={{backgroundColor: 'rgba(0,0,0,0.8)', height: '100%', width: '100%', paddingTop: theme.SIZES.BASE * 2}}>
                <ScrollView>
                <Block style={{marginTop: theme.SIZES.BASE * 3}}>
                    <Icon name="styler_logo" family="Styler" size={10} color={'#ffffff'} style={{textAlign: 'center', fontSize: 60, marginBottom: 10}} />
                    <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                        <Input
                        type="email-address"
                        placeholder="Email"
                        id="manualEmail"
                        error={!this.state.manualEmailValid}
                        value={this.state.manualEmail}
                        onChange={(e) => this.handleChange(e, 'manualEmail')}
                        placeholderTextColor={'#ffffff'}
                        style={[{ borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0}, styles.input, !this.state.manualEmailValid ? styles.inputDanger: null]}
                        />
                    </Block>
                    <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                        <Input
                          right
                          placeholder="Password"
                          id="manualPassword"
                          error={!this.state.manualPasswordValid}
                          value={this.state.manualPassword}
                          onChange={(e) => this.handleChange(e, 'manualPassword')}
                          password
                          viewPass
                          iconColor={'#ffffff'}
                          placeholderTextColor={'#ffffff'}
                          style={[{ borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0 }, styles.input, !this.state.manualPasswordValid ? styles.inputDanger: null]}
                        />
                    </Block>
                    <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 4 }}>
                      <Text muted onPress={() => this.props.navigation.navigate('ForgotPassword')} style={{fontFamily: 'poppins-medium'}}>Forgot Password</Text>
                    </Block>
                    <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE * 1.5}}>
                        <Button style={{backgroundColor: this.props.settings.signin_button, width: '100%'}} loading={this.state.signInLoading} 
                        onPress={() => this.submitManualLogin()}>
                          <Text color={this.props.settings.signin_button_text} style={{fontFamily: 'poppins-medium'}}>Sign In</Text>
                        </Button>
                    </Block>
                    {this.state.signInError ? <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE * 1.5}}>
                      <Block style={{backgroundColor: materialTheme.COLORS.ERROR, width: '100%', padding: theme.SIZES.BASE, borderRadius: 3}}>
                        <Text size={13} color={'#ffffff'} style={{fontFamily: 'poppins-regular'}}>{this.state.signInError}</Text>
                      </Block>
                    </Block> : null}
                    <Block row style={{ paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE * 1.5}}>
                        <View style={{borderBottomColor: 'white', borderBottomWidth: 1, width: '40%', alignSelf:'center'}} />
                        <View style={{width: '20%'}}>
                            <Text color={'#ffffff'} style={{textAlign: 'center', fontFamily: 'poppins-regular'}}>OR</Text>
                        </View>
                        <View style={{borderBottomColor: 'white', borderBottomWidth: 1, width: '40%', alignSelf:'center'}} />
                    </Block>
                    <Block style={{ paddingHorizontal: theme.SIZES.BASE, paddingTop: theme.SIZES.BASE / 2, paddingBottom: theme.SIZES.BASE}}>
                      {this.props.details.business_account_type_id === 1 && (
                        <Block center flex>
                          {Platform.OS === 'ios' && (
                            <Block row flex>
                              <Button round shadowless color={'#ffffff'} style={[styles.shadow, { flex: 1 }]} onPress={() => this.submitAppleLoginWrapper()}>
                                <Block row flex center>
                                  <Text style={{marginRight: 10}}><Icon name="apple" family="font-awesome" color={'#000000'} size={20}/></Text>
                                  <Text color={'#000000'} style={{fontFamily: 'poppins-medium'}}>Sign in with Apple</Text>
                                </Block>
                              </Button>
                            </Block>
                          )}
                          <GoogleSignInButton onResponse={this.submitGoogleLoginWrapper}/>
                          <Block row flex>
                            <Button round shadowless color={'#ffffff'} style={[styles.shadow, { flex: 1 }]} onPress={() => this.submitFacebookLoginWrapper()}>
                              <Block row flex center>
                                <Text style={{marginRight: 10}}><Icon name="facebook" family="font-awesome" color={'#3b5998'} size={18}/></Text>
                                <Text color={'#000000'} style={{fontFamily: 'poppins-medium'}}>Sign in with Facebook</Text>
                                <Text color={'#ffffff'}>{this.state.facebookProfileData}</Text>
                              </Block>
                            </Button>
                          </Block>
                        </Block>
                      )}
                      <Block flex style={{ justifyContent: 'center', paddingVertical: theme.SIZES.BASE, paddingHorizontal: theme.SIZES.BASE * 1.5}}>
                          <Text style={{textAlign: 'center', marginBottom: 10, fontFamily: 'poppins-regular'}} color={'#ffffff'}>Don't have an account?</Text>
                          <Block flex center row>
                            <Button style={{backgroundColor: this.props.settings.signin_button, alignSelf: 'center', flex: 0.75}} size={'small'} onPress={() => this.props.navigation.navigate('SignUp')}>
                                <Text color={this.props.settings.signin_button_text} style={{ fontFamily: 'poppins-medium' }}>Create an account</Text>
                            </Button>
                          </Block>
                      </Block>
                    </Block>
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
    settings: state.settings,
    details: state.details
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(SignIn));


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
      zIndex: -1,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
    },
    input: {
        zIndex: 5,
        borderBottomWidth: 1
    },
    inputDefault: {
      borderBottomColor: materialTheme.COLORS.PLACEHOLDER,
    },
    inputTheme: {
      borderBottomColor: materialTheme.COLORS.PRIMARY,
    },
    inputTheme: {
      borderBottomColor: materialTheme.COLORS.PRIMARY,
    },
    inputInfo: {
      borderBottomColor: materialTheme.COLORS.INFO,
    },
    inputSuccess: {
      borderBottomColor: materialTheme.COLORS.SUCCESS,
    },
    inputWarning: {
      borderBottomColor: materialTheme.COLORS.WARNING,
    },
    inputDanger: {
      borderBottomColor: materialTheme.COLORS.ERROR,
    },
    social: {
        width: theme.SIZES.BASE * 3.5,
        height: theme.SIZES.BASE * 3.5,
        borderRadius: theme.SIZES.BASE * 1.75,
        justifyContent: 'center',
      },
  });