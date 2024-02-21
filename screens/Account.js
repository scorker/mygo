import React from 'react';
import { StyleSheet, ScrollView, Alert } from "react-native";
import { Block, Text, theme, Input, Button } from "galio-framework";
import { UserContext } from "../providers/userProvider";
import PhoneInput from 'react-native-phone-input';
import ServicesApi from './../api/services';
import { firebaseApp } from './../api/firebase/config';
import { getAuth } from 'firebase/auth';
import NetInfo from "@react-native-community/netinfo";

import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

import materialTheme from '../constants/Theme';

class Account extends React.Component {
  
  static contextType = UserContext;
  focusSubscription;
  constructor(props) {
    super(props);
    this.state = {
      focusSubscription: {},
      firstName: '',
      firstNameValid: true,
      lastName: '',
      lastNameValid: true,
      phone: '+44',
      phoneValid: true,
      email: '',
      emailValid: true,
      loading: false,
      error: null,
      success: false
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const { refresh } = this.context;
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
    this.setState({
        focusSubscription: focusSubscription,
        firstName: this.props.user.user_firstname,
        lastName: this.props.user.user_lastname,
        phone: this.props.user.user_phone,
        email: this.props.user.user_email
    });
  }

  componentWillUnmount() {
    this.state.focusSubscription.remove();
  }

  handleChange(event, name) {
    event.persist();
    if(name == 'firstname'){            
      this.setState((state) => state.firstName = event.nativeEvent.text);
    } else if(name == 'lastname'){
      this.setState((state) => state.lastName = event.nativeEvent.text);
    } else if(name == 'email'){
      this.setState((state) => state.email = event.nativeEvent.text); 
    } else if(name == 'phone'){
      this.setState((state) => state.phone = event.nativeEvent.text); 
    }
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  handleSubmitUpdateAccount() {
    // If user has changed their email address
    if(this.state.email !== this.props.user.user_email) {
    // Tell user that they will need to verify new email address before booking.
      Alert.alert(
        "Are you sure?",
        "We have detected a change in your email address. If you continue you will be automatically signed out and you will need to verify your new email address before booking. Are you sure that you would like to change your email address?",
        [
          {
            text: "No",
            style: "cancel",
            onPress: () => {
              this.setState({ loading: false });
            }
          },
          {
            text: "Yes",
            onPress: () => {
              this.submitUpdateAccount();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      this.submitUpdateAccount();
    }
  }

  submitUpdateAccount(){
    const { logout } = this.context;
    if(
      this.state.firstName == this.props.user.user_firstname &&
      this.state.lastName == this.props.user.user_lastname &&
      this.phone.getValue() == this.props.user.user_phone &&
      this.props.user.user_email === this.state.email
    ){
      this.setState({ error: 'No changes detected', loading: false });
      return;
    }
    let that = this;
    let firstnameValid, lastnameValid, emailValid, phoneValid;
    if(this.state.firstName.length > 0 && /^[a-z ]+$/i.test(this.state.firstName)){
      firstnameValid = true;
    } else {
      firstnameValid = false;
    }
    if(this.state.lastName.length > 0 && /^[a-z ]+$/i.test(this.state.lastName)){
      lastnameValid = true;
    } else {
      lastnameValid = false;
    }
    if(this.state.email !== this.props.user.user_email) {
      emailValid = this.validateEmail(this.state.email);
    } else {
      emailValid = true;
    }
    let parsedValidNumber = this.phone.isValidNumber();
    if(parsedValidNumber && parsedValidNumber == true){
      phoneValid = true;
    } else {
      phoneValid = false;
    }
    this.setState({ firstNameValid: firstnameValid, lastNameValid: lastnameValid, phoneValid: phoneValid, emailValid, error: null });
    if(firstnameValid && lastnameValid && emailValid && phoneValid){
      this.setState({
        firstNameValid: true,
        lastNameValid: true,
        emailValid: true,
        phoneValid: true
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
          const user = auth.currentUser;
          if(user) {
            user.getIdToken().then(function(idToken) {
              return ServicesApi.updateUser({ idToken: idToken, app_key: appKey, firstname: that.state.firstName, lastname: that.state.lastName, phone: parsedPhoneNumber, phone_iso: parsedPhoneNumberIso, business_id: business_id, email: that.state.email }).then(response => {
                if(that.state.email !== that.props.user.user_email) {  
                  logout();
                  that.props.navigation.navigate('Home');
                }
                let curUserObj = Object.assign({}, that.props.user);
                curUserObj.user_firstname = that.state.firstName;
                curUserObj.user_lastname = that.state.lastName;
                curUserObj.user_email = that.state.email;
                curUserObj.user_phone = parsedPhoneNumber;
                curUserObj.user_phone_iso = parsedPhoneNumberIso;
                that.props.actions.loadUser(curUserObj);
                that.setState({ loading: false, success: true });
                return;
              });
            }).catch(function(error) {
              console.log(error);
              if(error.response && error.response.data && error.response.data.message) {
                that.setState({ loading: false, error: error.response.data.message });
              } else {
                that.setState({ loading: false, error: 'An unexpected error has occured.' });
              }
            });
          } else {
            that.setState({ loading: false });
            that.context.logout();
            that.props.navigation.navigate('Home');
          }
        } else {
          this.setState({ loading: false, error: "You're offline." });
        }
      });
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <Block flex style={{ backgroundColor: this.props.settings.account_background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ margin: theme.SIZES.BASE }}>
        <Block style={{ paddingHorizontal: theme.SIZES.BASE / 2, paddingVertical: theme.SIZES.BASE / 2 }}>
            <Input
                type="default"
                color={this.props.settings.account_input_text}
                placeholder="First name"
                id="firstname"
                value={this.state.firstName}
                error={!this.state.firstNameValid}
                onChange= {(e) => this.handleChange(e, 'firstname')}
                placeholderTextColor={'#bababa'}
                style={[{ borderRadius: 3, borderColor: this.props.settings.account_input, backgroundColor: 'transparent', borderWidth: 0}, styles.input, !this.state.firstNameValid ? styles.inputDanger: null]}
            />
        </Block>
        <Block style={{ paddingHorizontal: theme.SIZES.BASE / 2, paddingVertical: theme.SIZES.BASE / 2 }}>
            <Input
                type="default"
                color={this.props.settings.account_input_text}
                placeholder="Last name"
                id="lastname"
                value={this.state.lastName}
                error={!this.state.lastNameValid}
                onChange= {(e) => this.handleChange(e, 'lastname')}
                placeholderTextColor={'#bababa'}
                style={[{ borderRadius: 3, borderColor: this.props.settings.account_input, backgroundColor: 'transparent', borderWidth: 0 }, styles.input, !this.state.lastNameValid ? styles.inputDanger: null]}
            />
        </Block>
        <Block style={{ paddingHorizontal: theme.SIZES.BASE / 2, paddingVertical: theme.SIZES.BASE / 2 }}>
            <Input
                type="email-address"
                color={this.props.settings.account_input}
                placeholder="Email"
                id="email"
                value={this.state.email}
                error={!this.state.emailValid}
                onChange= {(e) => this.handleChange(e, 'email')}
                placeholderTextColor={'#bababa'}
                style={[{ borderRadius: 3, borderColor: this.props.settings.account_input, backgroundColor: 'transparent', borderWidth: 0 }, styles.input, !this.state.emailValid ? styles.inputDanger: null]}
            />
        </Block>
        <Block style={{ paddingHorizontal: theme.SIZES.BASE / 2, paddingVertical: theme.SIZES.BASE / 2 }}>
            <PhoneInput
                ref={(ref) => { this.phone = ref; }}
                placeholder="Mobile number"
                initialCountry="gb"
                initialValue={this.props.user.user_phone}
                onSelectCountry={(iso2) => { this.setState({phone: '+' + this.phone.getCountryCode()}) }}
                textStyle={{ color: this.props.settings.account_input_text, fontSize: 14 }}
                offset={theme.SIZES.BASE}
                style={this.state.phoneValid ? { padding: theme.SIZES.BASE, borderRadius: 3, borderColor: this.props.settings.account_input, backgroundColor: 'transparent', borderWidth: 0, zIndex: 5, borderBottomWidth: 1} : { padding: theme.SIZES.BASE, borderRadius: 3, borderColor: materialTheme.COLORS.INPUT, backgroundColor: 'transparent', borderWidth: 0, zIndex: 5, borderBottomWidth: 1, borderBottomColor: materialTheme.COLORS.ERROR}}
            />
        </Block>
        <Block row style={{ paddingVertical: theme.SIZES.BASE }}>
          <Button
            shadowless
            color={this.state.success ? materialTheme.COLORS.SUCCESS : this.props.settings.account_button}
            disabled={this.state.success}
            loading={this.state.loading}
            style={{ flex: 1 }}
            onPress={() => { this.setState({loading: true}); this.handleSubmitUpdateAccount(); } }>
              <Text color={this.state.success ? '#ffffff' : this.props.settings.account_button_text}>{this.state.success ? 'Account Updated' : 'Update'}</Text>
          </Button>
        </Block>
        {this.state.error ?
          <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE / 2}}>
            <Block style={{backgroundColor: materialTheme.COLORS.ERROR, width: '100%', padding: theme.SIZES.BASE, borderRadius: 3}}>
              <Text color={'#ffffff'}>{this.state.error}</Text>
            </Block>
          </Block>
        : null}
      </ScrollView>
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    settings: state.settings
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Account));

const styles = StyleSheet.create({
    input: {
        zIndex: 5,
        borderBottomWidth: 1,
    },
    inputDanger: {
        borderBottomColor: materialTheme.COLORS.ERROR,
    },
});