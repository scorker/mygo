import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

import TearLines from "react-native-tear-lines";

import WizardFormLocationPage from './WizardFormLocationPage';
import WizardFormPage1 from './WizardFormPage1';
import WizardFormPage2 from './WizardFormPage2';
import WizardFormPage3 from './WizardFormPage3';

import { Block, theme, Text, Button, Icon } from 'galio-framework';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { UserContext } from "../providers/userProvider";

import { firebaseApp } from '../api/firebase/config';
import { getAuth } from 'firebase/auth';
import ServicesApi from '../api/services';

import Modal from "react-native-modal";
import Spinner from 'react-native-loading-spinner-overlay';

class WizardForm extends Component {
  static contextType = UserContext
  focusSubscription

  constructor(props, context) { 
    super(props, context);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.resetPage = this.resetPage.bind(this);
    this.onDateChanged = this.onDateChanged.bind(this);
    this.onFocusChanged = this.onFocusChanged.bind(this);
    this.removeBookingServiceFromCart = this.removeBookingServiceFromCart.bind(this);
    this.removeBookingServiceDateTime = this.removeBookingServiceDateTime.bind(this);
    this.state = {
      focusSubscription: {},
      page: 0,
      focusedInput: false,
      selectionModalVisible: false,
      total: 0,
      loading: false,
      date: null,
      businessLocationId: null
    };
  }

  nextPage() {
    if(this.state.page === 0 && !this.state.businessLocationId) {
      Alert.alert(
        "No location selected",
        "Please select a location to continue.",
        [
            { text: "Ok" }
        ],
        { cancelable: false }
      );
    } else if(this.state.page === 1 && this.props.bookings.length === 0){
      Alert.alert(
        "No services selected",
        "Please select a service to continue.",
        [
            { text: "Ok" }
        ],
        { cancelable: false }
      );
    } else if(this.state.page === 2) {
      if(!this.props.bookings[0].booking_time){
        Alert.alert(
          "No time selected",
          "Please select a time to continue.",
          [
              { text: "Ok" }
          ],
          { cancelable: false }
        );
      } else  {
        let that = this;
        this.setState({ loading: true });
        const auth = getAuth(firebaseApp);
        console.log(auth)
        const user = auth.currentUser;
        console.log(user)
        if(user) {
          if(this.props.isInReview) {
            this.setState({
              page: that.state.page + 1,
              loading: false
            });
            return;
          }
          user.getIdToken().then(function(idToken) {
            let services = that.props.bookings.map(x => x.service_business_detail_id);
            ServicesApi.reserveTime({
              idToken,
              business_id: ServicesApi.getBusinessId(),
              business_location_id: that.state.businessLocationId,
              staff_id: that.props.bookings[0].staff_id,
              date: that.props.bookings[0].booking_date,
              time: that.props.bookings[0].booking_time, services
            }).then(response => {
              return response.data;
            }).then((data) => {
              that.setState({ page: that.state.page + 1, loading: false });
            }).catch(function(error) {
              that.setState({ page: that.state.page + 1, loading: false });
            });
          }).catch(function(error) {
            that.setState({ page: that.state.page + 1, loading: false });
          });
        } else {
          // User not signed in
          that.setState({ page: 1, loading: false });
          that.context.logout();
          that.props.navigation.navigate('Home');
        }
      }
    } else {
      this.setState({ page: this.state.page + 1 });
    }
  }

  previousPage() {
    if(this.state.page == 2) {
      // Erase booking time
      let that = this;
      this.props.bookings.forEach(element => {
          var booking = Object.assign({}, element);
          booking.booking_date = null;
          booking.booking_time = null;
          booking.booking_added = null;
          that.props.actions.updateBookingService(booking);
      });
    }
    this.setState({ page: this.state.page - 1 });
  }

  resetPage() {
    this.setState({ page: 0 });
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
    this.setState({focusSubscription: focusSubscription});
    // Move to next page if there is only one location
    if(this.props.businessLocation?.length === 1) {
      this.setState({ page: 1, businessLocationId: this.props.businessLocation[0].business_location_id })
    }
  }

  removeBookingServiceFromCart(bookingServiceObj, bookingServiceIndex) {
    // Go to page 1 to select services again if no services remain
    if(this.props.bookings && this.props.bookings.length === 1 && this.state.page !== 1) {
      this.setState({ page: 1 });
    }
    // If on page 3 and the service removed is not the last service then booking time must be reselected
    if(this.state.page === 3 && bookingServiceIndex !== this.props.bookings.length - 1) {
      this.removeBookingServiceDateTime();
      this.setState({ page: 2 });
    }
    // Remove booking service
    this.props.actions.removeBookingService(bookingServiceObj);
  }

  removeBookingServiceDateTime() {
    let that = this
    this.props.bookings.forEach(element => {
        var booking = Object.assign({}, element);
        booking.booking_date = null;
        booking.booking_time = null;
        booking.booking_added = null;
        that.props.actions.updateBookingService(booking);
    });
  }

  componentWillUnmount() {
    this.state.focusSubscription.remove();
  }

  onFocusChanged(focusedInput) {
    this.setState({ focusedInput })
  }

  onDateChanged(date)  {
    return new Promise((resolve) => {
      this.setState({date});
      resolve("Date changed");
    });
  }

  setSelectionModalVisible(visible) {
    this.setState({selectionModalVisible: visible});
  }

  setBusinessLocation = (businessLocationId) => {
    this.props.actions.clearBooking();
    if(businessLocationId !== this.state.businessLocationId) {
      this.setState({ businessLocationId });
    } else {
      this.setState({ businessLocationId: null });
    }
  }

  renderSelectionModal = () => {
    let total_poa = false, total = 0;
    return [
      <View key={'selectionModal'}>
        <Modal isVisible={this.state.selectionModalVisible} onBackdropPress={() => this.setSelectionModalVisible(false)} style={{margin: theme.SIZES.BASE}} swipeDirection={['up', 'down']} onSwipeComplete={() => this.setSelectionModalVisible(false)}>
          <View style={{backgroundColor: '#ffffff', borderRadius: 5}} onLayout={e => { this.refs.bottom.onLayout(e); }}>
            <Block style={{ padding: theme.SIZES.BASE, borderBottomWidth: 1, borderBottomColor: '#000000' }}>
              <Text
                size={24}
                style={{ textAlign: 'center', fontFamily: 'poppins-semi-bold'}}
                color={'#000000'}
              >
                Your Booking
              </Text>
              {this.state.businessLocationId ? (
                <Block row center>
                  <Icon family='feather' name="map-pin" size={13} style={{ marginRight: 5 }} />
                  <Text size={13} style={{ fontFamily: 'poppins-medium' }}>
                    {this.props.businessLocation.find(x => x.business_location_id === this.state.businessLocationId)?.business_location_name}
                  </Text>
                </Block>
              ) : null}
            </Block>
            <Block style={{width: '100%', padding: theme.SIZES.BASE}}>
              {this.props.bookings?.length > 0 ? 
                <Block>
                  {this.props.bookings.map((bookingServiceObj, bookingServiceIndex) => {
                    let serviceBusinessDetailObj = this.props.serviceDetail.find(x => x.service_business_detail_id === bookingServiceObj.service_business_detail_id);
                    let serviceBusinessObj = this.props.service.find(x => x.service_id === serviceBusinessDetailObj?.service_business_id);
                    let staffObj = this.props.staff.find(x => x.id === bookingServiceObj.staff_id);
                    if(serviceBusinessDetailObj?.service_business_detail_poa === 1){
                      total_poa = true;
                    } else {
                      total = total + serviceBusinessDetailObj?.service_business_detail_price;
                    }
                    let duration;
                    if(serviceBusinessDetailObj?.service_business_detail_split === 1) {
                      duration = serviceBusinessDetailObj?.service_business_detail_duration_a + serviceBusinessDetailObj?.service_business_detail_duration_break + serviceBusinessDetailObj?.service_business_detail_duration_b;
                    } else {
                      duration = serviceBusinessDetailObj?.service_business_detail_duration_a;
                    }
                    return(
                      <Block style={{ paddingVertical: theme.SIZES.BASE }} key={'selectionModalItemContainer' + bookingServiceIndex}>
                        <Block row space="between">
                          <Text size={16} style={{ maxWidth: '80%', fontFamily: 'poppins-medium' }}>{serviceBusinessObj?.service_name ? serviceBusinessObj?.service_name.replace('%comma%', ',').replace('%apostrophe%', "'") : null} ({serviceBusinessDetailObj?.service_business_detail_name ? serviceBusinessDetailObj?.service_business_detail_name?.replace('%comma%', ',').replace('%apostrophe%', "'") : null})</Text>
                          <Block row>
                            <Text size={16} style={{ fontFamily: 'poppins-medium' }}>
                              {serviceBusinessDetailObj?.service_business_detail_poa === 1 ? null : this.props.business_settings.currency_symbol}{serviceBusinessDetailObj?.service_business_detail_poa === 1 ? 'POA' : Number(serviceBusinessDetailObj?.service_business_detail_price / 100).toFixed(2)}</Text>
                            <TouchableOpacity onPress={() => this.removeBookingServiceFromCart(bookingServiceObj, bookingServiceIndex)} style={{ paddingLeft: theme.SIZES.BASE / 2 }}>
                              <Icon name="x" family="Feather" color="#ed5565" size={20}/>
                            </TouchableOpacity>
                          </Block>
                        </Block>
                        <Block row>
                          <Text muted style={{ fontFamily: 'poppins-regular' }}>{duration ? duration : '----'} mins with {staffObj ? staffObj.firstname + ' ' + staffObj.lastname : '----'}</Text>
                        </Block>
                      </Block>
                    );
                  })
                  }
                  <Block row space="between" style={{ borderTopWidth: 1, borderColor: '#000000', paddingVertical: theme.SIZES.BASE }}>
                    <Text size={18} style={{ fontFamily: 'poppins-semi-bold' }}>Total</Text>
                    <Text size={18} style={{ fontFamily: 'poppins-semi-bold' }}>{total_poa ? 'POA + ': null}{this.props.business_settings.currency_symbol}{Number(total / 100).toFixed(2)}</Text>
                  </Block>
                </Block>
              : 
              <Block center style={{ fontFamily: 'poppins-regular' }}>
                <Text size={16}>No services selected</Text>
              </Block>
              }
            </Block>
          </View>
          <TearLines isUnder ref="bottom" color="#FFFFFF" backgroundColor="rgb(0,0,0)"/>
        </Modal>
      </View>
    ];
  }

  renderFormPage() {
    switch(this.state.page) {
      case 0:
        return (
          <WizardFormLocationPage
            businessLocation={this.props.businessLocation}
            settings={this.props.settings}
            selectedBusinessLocationId={this.state.businessLocationId}
            onChange={this.setBusinessLocation}
          />
        );
      case 1:
        return (
          <WizardFormPage1
            onSubmit={this.nextPage}
            nextPage={this.nextPage}
            onChange={this.onChange}
            bookings={this.props.bookings}
            isActive={this.isActive}
            businessLocationId={this.state.businessLocationId}
          />
        );
      case 2:
        return (
          <WizardFormPage2
            onSubmit={this.nextPage}
            nextPage={this.nextPage}
            previousPage={this.previousPage}
            onChange={this.onChange}
            dateChanged={this.onDateChanged}
            focusChanged={this.onFocusChanged}
            navigation={this.props.navigation}
            type={'add'}
            businessLocationId={this.state.businessLocationId}
            isInReview={this.props.isInReview}
          />
        );
      case 3:
        return (
          <WizardFormPage3
            previousPage={this.previousPage}
            resetPage={this.resetPage}
            removeBookingServiceFromCart={this.removeBookingServiceFromCart}
            navigation={this.props.navigation}
            removeBookingServiceDateTime={this.removeBookingServiceDateTime}
            businessLocationId={this.state.businessLocationId}
            isInReview={this.props.isInReview}
          />
        );
    }
  }

  render() {
    return (
      <Block flex style={{ backgroundColor: this.props.settings.book_background }}>
        {this.state.loading ?
            <Block>
              <Spinner visible={true} />
            </Block>
          : null
        }
        <Block flex>
          {this.renderSelectionModal()}
          {this.renderFormPage()}
        </Block>
        {this.state.page < 3 ? 
        <Block center style={{position: 'absolute', bottom: theme.SIZES.BASE / 2, width: '100%'}}>
          <Block flex row space="evenly" style={{marginHorizontal: theme.SIZES.BASE / 2}}>
            <Block flex={0.25} row>
              <Button
                center
                color={this.props.settings.book_footer_cart_button}
                textStyle={styles.optionsText}
                onPress={() => this.setSelectionModalVisible(true)}
                style={[styles.footerButton, styles.shadow]}
              >
                <Block row>
                  <Icon
                    name="shopping-cart"
                    family="Feather"
                    color={this.props.settings.book_footer_cart_button_text}
                    size={18}
                  />
                  <Text
                    size={16}
                    color={this.props.settings.book_footer_cart_button_text}
                    style={{marginLeft: 12, marginBottom: -6, fontFamily: 'poppins-regular'}}
                  >
                    {this.props.bookings && this.props.bookings.length > 0 ? this.props.bookings.length : 0}
                  </Text>
                </Block>
              </Button>
            </Block>
            {this.state.page === 1 || this.state.page === 2 ?
              <Block flex={0.375} row>
                <Button
                  center
                  color={this.props.settings.book_footer_back_button}
                  textStyle={styles.optionsText}
                  onPress={() => this.previousPage()}
                  style={[styles.footerButton, styles.shadow]}>
                  <Text
                    size={16}
                    color={this.props.settings.book_footer_back_button_text}
                    style={{ fontFamily: 'poppins-medium' }}
                  >
                    Back
                  </Text>
                </Button>
              </Block>
            :
            null}
            <Block flex={[1,2].includes(this.state.page) ? 0.375 : 0.75} row>
              <Button
                center
                color={this.props.settings.book_footer_next_button}
                textStyle={styles.optionsText}
                onPress={() => this.nextPage()}
                style={[styles.footerButton, styles.shadow]}>
                <Text
                  size={16}
                  color={this.props.settings.book_footer_next_button_text}
                  style={{ fontFamily: 'poppins-medium' }}
                >
                  Next
                </Text>
              </Button>
            </Block>
          </Block>
        </Block>
        : null}
      </Block> 
    );

  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings,
    staff: state.staff,
    service: state.service,
    serviceDetail: state.serviceDetail,
    bookings: state.bookings,
    businessLocation: state.businessLocation,
    business_settings: state.details
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(WizardForm))


//still not finished add in some 'theme' from galio
const styles = StyleSheet.create({
  wizardHeader: {
    backgroundColor: '#333333',
  },
  footerButton: {
    flex: 1
  }
});