import React from 'react';
import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import WizardForm from '../booking/WizardForm'
import NetInfo from "@react-native-community/netinfo";
import { Block, Text, theme, Icon } from 'galio-framework';

import { getIsInReview } from '../utilities/review';

import WebView from '../components/WebView';
import BusinessTerms from '../components/BusinessTerms';

class Book extends React.Component {

  focusSubscription;

  constructor() {
    super();
    this.state = {
      connected: true,
      termsVisible: true,
      focusSubscription: {},
      webViewRef: null,
      isInReview: false
    };
  }

  componentDidMount() {
    if(!this.props.details.booking_terms_enabled || this.props.details.booking_terms_enabled === 0) {
      this.setState({ termsVisible: false });
    }
    this.unsubscribe = NetInfo.addEventListener(connectionObj => {
      this.setState({ connected: connectionObj.isConnected });
    });
    // Refresh booking settings on focus
    focusSubscription = this.props.navigation.addListener(
      'willFocus',
      payload => {     
        this.props.actions.loadBusinessDetails();
        this.fetchIsInReview();
      } 
    );
    this.setState({ focusSubscription: focusSubscription });
    this.fetchIsInReview();
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.state.focusSubscription.remove();
  }

  fetchIsInReview() {
    const isInReview = getIsInReview(
      this.props.settings?.app_version,
      this.props.settings?.app_status,
      this.props.details.business_account_type_id,
      this.props.details.sensitive_services === 1
    );
    this.setState({ isInReview });
  }

  render() {
    if(this.state.connected){
      if(this.state.termsVisible) {
        return (
          <BusinessTerms
            settings={this.props.settings}
            details={this.props.details}
            setTermsVisible={(visible) => this.setState({ termsVisible: visible })}
          />
        );
      } else {
        if(this.props.details.business_account_type_id === 3 && !this.state.isInReview) {
          return (
            <WebView url={this.props.details.booking_url}/>
          );
        } else if(this.props.details.enable_booking && this.props.details.enable_booking === 1) {
          return (
            <WizardForm
              isInReview={this.state.isInReview}
            />
          );
        } else {
          return (
            <Block flex center style={{ justifyContent: 'center', maxWidth: '70%' }}>
              <Block center style={{backgroundColor: '#ffffff', padding: theme.SIZES.BASE, borderRadius: 5}}>
                <Icon family="Feather" color={'#ed5565'} name="minus-circle" size={50} />
                <Text style={{ marginTop: 10, textAlign: 'center' }}>We are not currently accepting new online bookings.</Text>
              </Block>
            </Block>
          );
        }
      }
    } else {
      return (
        <Block flex center style={{ justifyContent: 'center' }}>
          <Block center style={{backgroundColor: '#ffffff', padding: theme.SIZES.BASE, borderRadius: 5}}>
            <Icon family="Feather" name="wifi-off" size={35} />
            <Text size={16} style={{ marginTop: 10 }}>You're offline</Text>
          </Block>
        </Block>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    details: state.details,
    settings: state.settings
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Book));