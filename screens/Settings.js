import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, View } from "react-native";
import { Block, Text, theme, Icon } from "galio-framework";
import Constants from 'expo-constants';
import { UserContext } from "../providers/userProvider";

import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

import { firebaseApp } from '../api/firebase/config';
import { getAuth } from 'firebase/auth';
import materialTheme from '../constants/Theme';
import * as StoreReview from 'expo-store-review';
import { Popup } from 'react-native-map-link';
import { getFormattedAddress } from '../utilities/formatting';

import BusinessLocationPickerModal from '../components/BusinessLocationPickerModal';

import ServicesApi from '../api/services';

class Settings extends React.Component {
  
  static contextType = UserContext
  focusSubscription
  
  constructor(props) {
    super(props);
    this.state = {
      focusSubscription: {},
      emailVerified: false,
      mapModalVisible: false,
      mapModalData: null,
      businessLocationPickerVisible: false
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
            } else {
              this.checkEmailVerified();
            }
        }).catch(e => {
            navigation.navigate('SignIn')
        })
      }
    );
    this.checkEmailVerified();
    this.setState({focusSubscription: focusSubscription});
  }

  componentWillUnmount() {
    this.state.focusSubscription.remove();
  }

  checkEmailVerified() {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if(user) {
      this.setState({ emailVerified: user.emailVerified });
    }
  }

  manualSignout() {
    const { logout } = this.context;
    Alert.alert(
      "Confirm sign out",
      "Are you sure that you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {logout(); this.props.navigation.navigate('Home'); }
        }
      ],
      { cancelable: false }
    );
  }

  verifyEmail() {
    if(!this.state.emailVerified){
      Alert.alert(
        "Email Verification",
        "We sent you a verification email when you created your account which expires after 24 hours. Would you like us to send you another verification email?",
        [
            {
                text: "No",
                style: "cancel",
            },
            {
                text: "Yes",
                onPress: () => {
                  this.submitVerifyEmail();
                }
            }
        ],
        { cancelable: false }
      );
    }
  }

  async submitVerifyEmail() {
    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
      if(user) {
        let idToken = await user.getIdToken();
        await ServicesApi.verifyEmail({ idToken, business_id: ServicesApi.getBusinessId(), app_key: ServicesApi.getBusinessAppKey() });
        console.log('Verification email sent');
      } else {
        this.context.logout();
        this.props.navigation.navigate('Home');
      }
    } catch(e) {
      console.log('Verification email failed to send');
    }
  }

  handleFindUs = () => {
    if(this.props.businessLocation?.length > 1) {
      this.setState({ businessLocationPickerVisible: true });
    } else if(this.props.businessLocation?.length === 1) {
      this.setState({ mapModalVisible: true, mapModalData: this.props.businessLocation[0] });
    } else {
      return;
    }
  }

  submitBusinessLocation = (e) => {
    this.setState({
      businessLocationPickerVisible: false,
      mapModalData: this.props.businessLocation.find(x => x.business_location_id === e),
    });
    setTimeout(() => {
      this.setState({ mapModalVisible: true });
    }, 200);
  }

  render() {
    return (
      <Block flex style={{ backgroundColor: this.props.settings.settings_background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settings}>
        {/* User section start */}
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Account') }>
          <Block row style={{ margin: theme.SIZES.BASE, marginBottom: 0, padding: theme.SIZES.BASE, borderRadius: 5, borderColor: this.props.settings.settings_account_border, borderWidth: 1, backgroundColor: this.props.settings.settings_account_background }}>
            <Icon size={25} name="user" family="Feather" color={this.props.settings.settings_account_text} />
            <Text size={22} color={this.props.settings.settings_account_text} style={{fontFamily: 'poppins-light', marginLeft: 15}}>{this.props.user && this.props.user.user_firstname && this.props.user.user_lastname ? this.props.user.user_firstname + " " + this.props.user.user_lastname : "My Account"}</Text>
            <Icon size={14} color={this.props.settings.settings_account_text} name="edit-2" family="Feather" style={{position: 'absolute', top: theme.SIZES.BASE * 1.4, right: theme.SIZES.BASE}} />
          </Block>
        </TouchableOpacity>
        {/* User section end */}
        {/* Payments section start */}
        {this.props.business_settings.stripe_account && this.props.business_settings.stripe_account === true ?
        <Block>
          <Block style={[styles.title]}>
            <Text
              muted
              size={15}
              style={styles.titleText}
              color={this.props.settings.settings_card_label}
            >
              Payments
            </Text>
          </Block>
          <Block style={[styles.rowsContainer, { backgroundColor: this.props.settings.settings_card_background }]}>
            <Block style={styles.rows}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('PaymentMethod')}>
                <Block row middle space="between" style={{paddingTop:7}}>
                  <Block row>
                    <Icon name="credit-card" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                    <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Payment methods</Text>
                  </Block>
                  <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
                </Block>
              </TouchableOpacity>
            </Block>
          </Block>
        </Block>
        : null}
        {/* Payments section end */}
        {/* Account section start */}
        <Block style={styles.title}>
          <Text
            muted
            size={15}
            style={styles.titleText}
            color={this.props.settings.settings_card_label}
          >
            Account
          </Text>
        </Block>
        <Block style={[styles.rowsContainer, { backgroundColor: this.props.settings.settings_card_background }]}>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('AccountManagement')}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="user" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Account management</Text>
                </Block>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings?.settings_card_text} />
              </Block>
            </TouchableOpacity>
          </Block>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => this.verifyEmail()}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="mail" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Email verified</Text>
                </Block>
                <Icon name={this.state.emailVerified ? "check" : "x"} family="feather" color={this.state.emailVerified ? materialTheme.COLORS.SUCCESS : materialTheme.COLORS.ERROR} style={{ paddingRight: 5 }} />
              </Block>
            </TouchableOpacity>
          </Block>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => StoreReview.requestReview()}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="star" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Rate us on the App Store</Text>
                </Block>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>
        {/* Account section end */}
        {/* Help section start */}
        <Block style={[styles.title, {paddingTop: theme.SIZES.BASE}]}>
          <Text
            muted
            size={15}
            style={styles.titleText}
            color={this.props.settings.settings_card_label}
          >
            Help
          </Text>
        </Block>
        <Block style={[styles.rowsContainer, { backgroundColor: this.props.settings.settings_card_background }]}>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => this.handleFindUs()}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="map-pin" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Find us</Text>
                </Block>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
              </Block>
            </TouchableOpacity>
            {this.state.businessLocationPickerVisible ? (
              <BusinessLocationPickerModal
                data={this.props.businessLocation}
                visible={this.state.businessLocationPickerVisible}
                toggleVisible={() => this.setState({ businessLocationPickerVisible: !this.state.businessLocationPickerVisible })}
                submit={(e) => this.submitBusinessLocation(e)}
                settings={this.props.settings}
              />
            ) : null}
          </Block>
          {this.props.business_settings.booking_terms_enabled && this.props.business_settings.booking_terms_enabled === 1 ?
            <Block style={styles.rows}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('BookingPolicies')}>
                <Block row middle space="between" style={{paddingTop:7}}>
                  <Block row>
                    <Icon name="list" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                    <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Booking Policies</Text>
                  </Block>
                  <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
                </Block>
              </TouchableOpacity>
            </Block>
          : null}
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ReportProblem')}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="life-buoy" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Report a problem</Text>
                </Block>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>
        {/* Help section end */}
        {/* Legal section start */}
        <Block style={[styles.title]}>
          <Text
            muted
            size={15}
            style={styles.titleText}
            color={this.props.settings.settings_card_label}
          >
            Legal
          </Text>
        </Block>
        <Block style={[styles.rowsContainer, { backgroundColor: this.props.settings.settings_card_background }]}>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => Linking.openURL('https://help.styler.digital/legal/privacy_policy')}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="file-text" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Privacy Policy</Text>
                </Block>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
              </Block>
            </TouchableOpacity>
          </Block>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => Linking.openURL('https://help.styler.digital/legal/terms_of_use')}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="file-text" family="feather" color={this.props.settings.settings_card_text} style={{ paddingRight: theme.SIZES.BASE }} />
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Terms Of Use</Text>
                </Block>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
              </Block>
            </TouchableOpacity>
          </Block>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => Linking.openURL('https://help.styler.digital/legal/booking_terms')}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Block row>
                  <Icon name="file-text" family="feather" style={{ paddingRight: theme.SIZES.BASE }} color={this.props.settings.settings_card_text}/>
                  <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>Booking Terms</Text>
                </Block>
                <Icon name="angle-right" family="font-awesome" style={{ paddingRight: 5 }} color={this.props.settings.settings_card_text}/>
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>
        {/* Legal section end */}
        {/* Logout section start */}
        <Block style={[styles.rowsContainer, {marginTop: theme.SIZES.BASE, backgroundColor: '#f33527'}]}>
          <Block style={styles.rows}>
            <TouchableOpacity onPress={() => this.manualSignout()}>
              <Block row middle space="between" style={{paddingTop:7}}>
                <Text size={14} color={'#ffffff'} style={{ fontFamily: 'poppins-regular' }}>Sign Out</Text>
                <Icon name="log-out" family="Feather" color={'#ffffff'} style={{ paddingRight: 5 }} />
              </Block>
            </TouchableOpacity>
          </Block>
        </Block>
        {/* Logout section end */}
        <Text muted center style={{ margin: theme.SIZES.BASE, fontFamily: 'poppins-regular' }} color={this.props.settings.settings_card_label}>Version {Constants.expoConfig.version}</Text>
      </ScrollView>
      <Popup
          isVisible={this.state.mapModalVisible}
          onCancelPressed={() => this.setState({ mapModalVisible: false })}
          onBackButtonPressed={() => this.setState({ mapModalVisible: false })}
          modalProps={{
            onBackdropPress: () => this.setState({ mapModalVisible: false }),
            style: { justifyContent: 'flex-end', margin: 0 }
          }}
          appsWhiteList={['apple-maps', 'google-maps', 'citymapper', 'uber', 'lyft']}
          options={{
            latitude: this.state.mapModalData ? this.state.mapModalData.address_latitude : this.props.business_settings.address_latitude,
            longitude: this.state.mapModalData ? this.state.mapModalData.address_longitude : this.props.business_settings.address_longitude,
            googleForceLatLon: true,
            alwaysIncludeGoogle: true,
            title: this.props.business_settings.business_name,
          }}
          style={{
            container: { borderRadius: 0 },
            itemText: { fontWeight: '400' }
          }}
          customHeader={
            <Block style={{ borderBottomColor: '#F4F4F4', borderBottomWidth: 1 }}>
              <Text size={28} style={{fontFamily: 'poppins-light', textAlign: 'center', padding: 10, color: '#000000'}}>Find Us</Text>
              <View style={{ marginBottom: 10, marginHorizontal: 20 }}>
                  <Block row>
                    <Block style={{ paddingHorizontal: 3 }} middle center>
                      <Icon name="map-pin" family="feather" size={16} color={'#9FA5AA'}/>
                    </Block>
                    <Block middle style={{ paddingHorizontal: theme.SIZES.BASE }}>
                      <Text muted size={14} style={{ fontFamily: 'poppins-regular' }}>{this.state.mapModalData ? getFormattedAddress(this.state.mapModalData) : null}</Text>
                    </Block>
                  </Block>
              </View>
            </Block>
          }
          customFooter={<Block></Block>}
      />
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    settings: state.settings,
    business_settings: state.details,
    businessLocation: state.businessLocation
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Settings));

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE / 3
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
    marginHorizontal: theme.SIZES.BASE,
    fontFamily: 'poppins-regular'
  },
  titleText: {
    paddingBottom: 5,
    fontFamily: 'poppins-medium'
  },
  rowsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginHorizontal: theme.SIZES.BASE
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginVertical: theme.SIZES.BASE / 2,
  }
});
