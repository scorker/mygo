import React from 'react';
import { StyleSheet, Dimensions, ScrollView, ImageBackground } from 'react-native';
import { Block, Text, Input, Button, theme } from 'galio-framework';
import Spinner from 'react-native-loading-spinner-overlay';
import { materialTheme, Images } from '../constants/';
import { withNavigation } from '@react-navigation/compat';
import NetInfo from "@react-native-community/netinfo";
import ServicesApi from '../api/services';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import { validateEmail } from '../utilities/validation';

const { width, height } = Dimensions.get('screen');

class ForgotPassword extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      forgotPasswordLoading: false,
      manualEmailValid: true,
      manualEmail: '',
      forgotPasswordError: null,
      sent: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  async sendPasswordResetEmail() {
    let that = this;
    if(!this.state.sent){
      if(!validateEmail(this.state.manualEmail)) {
        this.setState({forgotPasswordError: 'Invalid email address', forgotPasswordLoading: false});
        return;
      }
      this.setState({ forgotPasswordLoading: true });
      let state = await NetInfo.fetch();
      if(state.isConnected){
        try {
          await ServicesApi.resetPassword({ email: that.state.manualEmail, business_id: ServicesApi.getBusinessId(), app_key: ServicesApi.getBusinessAppKey() });
          that.setState({sent: true, forgotPasswordError: null, forgotPasswordLoading: false});
        } catch(e) {
          if(e.response && e.response.data && e.response.data.message) {
            that.setState({forgotPasswordError: e.response.data.message, forgotPasswordLoading: false});
          } else {
            that.setState({forgotPasswordError: 'Unable to send reset password email', forgotPasswordLoading: false});
          }
        }
      } else {
        that.setState({forgotPasswordError: 'You are currently offline', forgotPasswordLoading: false});
      }
    }
  }

  handleChange(event) {
    event.persist();           
    this.setState({manualEmail: event.nativeEvent.text});
  }

  render() {
    return (
      <Block flex style={styles.container}>
        <Block flex>
          <ImageBackground
            source={{ uri: Images.BusinessCover }}
            style={styles.backgroundImage}
          >
            <Block style={styles.formContainer}>
              <ScrollView>
                {this.state.forgotPasswordLoading ?
                  <Block>
                    <Spinner visible={true} />
                  </Block>
                : null}
                <Block style={{marginTop: theme.SIZES.BASE * 3}}>
                  <Block style={styles.labelContainer}>
                    <Text color={'#ffffff'} size={15} style={{ fontFamily: 'poppins-regular' }}>
                      Enter your email address below and we'll get you back into your account in no time.
                    </Text>
                  </Block>
                  <Block style={styles.inputContainer}>
                    <Input
                      type="email-address"
                      placeholder="Email"
                      id="email"
                      error={!this.state.manualEmailValid}
                      onChange= {(e) => this.handleChange(e)}
                      placeholderTextColor={'#ffffff'}
                      style={[styles.input, !this.state.manualEmailValid ? styles.inputDanger: null]}
                    />
                  </Block>
                  <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE}}>
                    <Button
                      fullwidth
                      color={this.state.sent ? materialTheme.COLORS.SUCCESS : this.props.settings.forgot_password_button}
                      style={{flex: 1}}
                      loading={this.state.forgotPasswordLoading}
                      onPress={() => this.sendPasswordResetEmail()}>
                      <Text color={this.props.settings.forgot_password_button_text} style={{ fontFamily: 'poppins-medium' }}>
                        {this.state.sent ? 'Email verification sent' : 'Reset Password'}
                      </Text>
                    </Button>
                  </Block>
                  {this.state.forgotPasswordError ?
                    <Block row flex style={styles.errorContainer}>
                      <Block style={styles.error}>
                        <Text color={'#ffffff'} size={13} style={{ fontFamily: 'poppins-regular' }}>{this.state.forgotPasswordError}</Text>
                      </Block>
                    </Block>
                  : null}
                </Block>
              </ScrollView>
            </Block>
          </ImageBackground>
        </Block>
      </Block>
    );
  }
};

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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ForgotPassword));

const styles = StyleSheet.create({ 
  container: {
      backgroundColor: theme.COLORS.BLACK,
      marginTop: 0,
  },
  backgroundImage: {
    height: height / 1,
    width,
    zIndex: 2
  },
  formContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    height: '100%',
    width: '100%',
    paddingTop: theme.SIZES.BASE * 2
  },
  labelContainer: {
    paddingHorizontal: theme.SIZES.BASE * 1.5,
    paddingVertical: theme.SIZES.BASE / 2
  },
  inputContainer: {
    paddingHorizontal: theme.SIZES.BASE * 1.5,
    paddingVertical: theme.SIZES.BASE / 2
  },
  input: {
    zIndex: 5,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 3,
    borderColor: materialTheme.COLORS.INPUT,
    backgroundColor: 'transparent'
  },
  inputDanger: {
    borderBottomColor: materialTheme.COLORS.ERROR,
  },
  errorContainer: {
    justifyContent: 'center',
    paddingVertical: theme.SIZES.BASE / 2,
    paddingHorizontal: theme.SIZES.BASE * 1.5
  },
  error: {
    backgroundColor: materialTheme.COLORS.ERROR,
    width: '100%',
    padding: theme.SIZES.BASE,
    borderRadius: 3
  }
})