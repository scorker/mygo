import React from 'react';
import { StyleSheet, Platform, ScrollView, TextInput, KeyboardAvoidingView } from 'react-native';
import { Block, Text, Button, theme } from 'galio-framework';
import { materialTheme } from '../constants/';
import { firebaseApp } from './../api/firebase/config';
import { getAuth } from 'firebase/auth';
import { withNavigation } from '@react-navigation/compat';
import NetInfo from "@react-native-community/netinfo";
import { HeaderHeight } from "../constants/utils";

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import ServicesApi from '../api/services';
import { UserContext } from "../providers/userProvider";

class ReportProblem extends React.Component {
    static contextType = UserContext
    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false,
            summary: null,
            problem: null,
            error: null,
            success: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    reportProblem() {
        let that = this;
        if(!this.state.summary || !this.state.problem) {
            this.setState({ error: 'A summary and description are required' });
            return;
        }
        if(this.state.summary && this.state.summary.length > 50){
            this.setState({ error: 'Maximum of 50 characters allowed in the summary' });
            return;
        }
        if(this.state.problem && this.state.problem.length > 500){
            this.setState({ error: 'Maximum of 500 characters allowed in the description' });
            return;
        }
        if(!this.state.success){
            this.setState({ loading: true });
            NetInfo.fetch().then(state => {
                if(state.isConnected){
                    const auth = getAuth(firebaseApp);
                    const user = auth.currentUser;
                    if(user) {
                        user.getIdToken().then(function(idToken) {
                            ServicesApi.reportProblem({ idToken: idToken, summary: that.state.summary, problem: that.state.problem, business_id: ServicesApi.getBusinessId() }).then(response => {
                                that.setState({ loading: false, success: true });
                            });
                        }).catch(function(error) {
                            // Unknown error
                            that.setState({ loading: false, error: 'An unexpected error has occured.' });
                            console.log(error);
                        });
                    } else {
                        that.context.logout();
                        that.props.navigation.navigate('Home');
                    }
                } else {
                    that.setState({ error: 'You are currently offline', loading: false});
                }
            });
        }
    }

  handleChange(event, type) {
    event.persist();
    if(type === 'summary'){
        this.setState({ summary: event.nativeEvent.text });
    } else if(type === 'description'){
        this.setState({ problem: event.nativeEvent.text });
    }
  }

  render() {
    return (
        <Block flex style={{ backgroundColor: this.props.settings.report_problem_background }}>
        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={10}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <Block style={{marginTop: theme.SIZES.BASE}}>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                    <Text color={this.props.settings.report_problem_text} size={15} style={{ fontFamily: 'poppins-semi-bold' }}>Experiencing an issue with our app? Fill in the form below and our app development team will be in touch. If you have a question about a booking, our opening hours, services, staff, or products, please contact us using the provided contact details on the app.</Text>
                </Block>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 2 }}>
                    <Text color={this.props.settings.report_problem_text} size={15} style={{ fontFamily: 'poppins-regular' }}>Reporting a bug or usability issue will help us to improve the app. To help us diagnose the cause of the problem, please describe the error and what you were doing when the problem occured. This information will be securely sent to the Styler Development Team.</Text>
                </Block>
                <Block style={{ marginTop: theme.SIZES.BASE / 2, marginHorizontal: theme.SIZES.BASE * 1.5, padding: theme.SIZES.BASE / 2, borderColor: this.props.settings.report_problem_input, borderWidth: 1, borderRadius: 3 }}>
                    <TextInput
                        multiline
                        numberOfLines={2}
                        placeholderTextColor={this.props.settings.report_problem_input}
                        underlineColorAndroid="transparent"
                        placeholder="Summarise the problem..."
                        value={this.state.summary}
                        style={{ paddingBottom: theme.SIZES.BASE / 3, color: this.props.settings.report_problem_input_text, fontFamily: 'poppins-regular' }}
                        onChange={(e) => this.handleChange(e, 'summary')}
                    />
                </Block>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 4 }} right>
                    <Text color={this.props.settings.report_problem_input} size={12}>{this.state.summary ? 50 - this.state.summary.length : 50}</Text>
                </Block>
                <Block style={{ marginTop: theme.SIZES.BASE / 2, marginHorizontal: theme.SIZES.BASE * 1.5, padding: theme.SIZES.BASE / 2, borderColor: this.props.settings.report_problem_input, borderWidth: 1, borderRadius: 3 }}>
                    <TextInput
                        multiline
                        numberOfLines={3}
                        placeholderTextColor={this.props.settings.report_problem_input}
                        underlineColorAndroid="transparent"
                        placeholder="Describe the problem..."
                        value={this.state.problem}
                        style={{ paddingBottom: theme.SIZES.BASE / 3, color: this.props.settings.report_problem_input_text, fontFamily: 'poppins-regular' }}
                        onChange={(e) => this.handleChange(e, 'description')}
                    />
                </Block>
                <Block style={{ paddingHorizontal: theme.SIZES.BASE * 1.5, paddingVertical: theme.SIZES.BASE / 4 }} right>
                    <Text color={this.props.settings.report_problem_input} size={12}>{this.state.problem ? 500 - this.state.problem.length : 500}</Text>
                </Block>
                <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE}}>
                    <Button fullwidth
                    shadowless
                    color={this.state.success ? materialTheme.COLORS.SUCCESS : this.props.settings.report_problem_button}
                    style={{flex: 1}}
                    loading={this.state.loading}
                    onPress={() => this.reportProblem()}>
                        <Text style={{ fontFamily: 'poppins-medium' }} color={this.state.success ? '#ffffff' : this.props.settings.report_problem_button_text}>
                            {this.state.success ? 'Problem reported successfully' : 'Report Problem'}
                        </Text>
                    </Button>
                </Block>
                {this.state.error ?
                <Block row flex style={{justifyContent: 'center', paddingVertical: theme.SIZES.BASE / 2, paddingHorizontal: theme.SIZES.BASE * 1.5}}>
                    <Block style={{backgroundColor: materialTheme.COLORS.ERROR, width: '100%', padding: theme.SIZES.BASE, borderRadius: 3}}>
                        <Text color={'#ffffff'} style={{ fontFamily: 'poppins-regular' }}>{this.state.error}</Text>
                    </Block>
                </Block>
                : null}
            </Block>
            </ScrollView>
            </KeyboardAvoidingView>
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ReportProblem));

const styles = StyleSheet.create({ 
  container: {
      backgroundColor: theme.COLORS.BLACK,
      marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
  },
  buttons: {
    backgroundColor: theme.COLORS.BLACK,
  },
  input: {
    zIndex: 5,
    borderBottomWidth: 1,
  },
  inputDanger: {
    borderBottomColor: materialTheme.COLORS.ERROR,
  },
})