import React from 'react';
import {
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Spinner from 'react-native-loading-spinner-overlay';
import { Block, Text, theme, Icon, Button } from "galio-framework";
import { UserContext } from "../providers/userProvider";

import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

import { firebaseApp } from '../api/firebase/config';
import { getAuth } from 'firebase/auth';

import ServicesApi from '../api/services';

class AccountDeletion extends React.Component {

    static contextType = UserContext;
  
    constructor(props) {
        super(props);
        this.state = {
            confirmInput: null
        };
    }

    handleDeleteAccountPress() {
        if(this.state.confirmInput !== 'CONFIRM') {
            return;
        }
        Alert.alert(
            "Are you sure?",
            "This action cannot be undone.",
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => this.submitDeleteAccount()
                }
            ],
            { cancelable: false }
        );
    }

    async submitDeleteAccount() {
        this.setState({ loading: true });
        let networkState = await NetInfo.fetch();
        if(networkState.isConnected){
            try {
                const auth = getAuth(firebaseApp);
                const idToken = await auth.currentUser.getIdToken();
                let data = {
                    appKey: ServicesApi.getBusinessAppKey(),
                    businessId: ServicesApi.getBusinessId(),
                    idToken
                };
                await ServicesApi.deleteAccount(data);
                this.setState({ loading: false });
                const { logout } = this.context;
                logout();
                this.setState({ confirmInput: null });
                this.props.navigation.navigate('Home');
                Alert.alert(
                    "All done",
                    "Your account deletion has been successful.",
                    [
                        {
                            text: "Ok"
                        }
                    ],
                    { cancelable: false }
                );
            } catch(err) {
                Alert.alert(
                    "We're sorry",
                    "An error occured and we were unable to delete your account. If the problem persists, please contact support@styler.digital.",
                    [
                        {
                            text: "Ok"
                        }
                    ],
                    { cancelable: false }
                );
            }
        } else {
            Alert.alert(
                "You're offline",
                "Unable to get delete account.",
                [
                    { text: "Ok" }
                ],
                { cancelable: false }
            );
        }
    }

    render() {
        return (
            <Block flex style={{ backgroundColor: this.props.settings.settings_background }}>
                {this.state.loading ? <Block><Spinner visible={true}/></Block> : null}
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={70}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.settings}
                    >
                        <Block style={[styles.rowsContainer, { backgroundColor: this.props.settings.settings_card_background }]}>
                            <Block style={styles.rows}>
                                <Block>
                                    <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular' }}>
                                        If you delete your account:
                                    </Text>
                                    <Block row style={{ marginTop: 15, marginRight: 15 }}>
                                        <Icon
                                            family="FontAwesome"
                                            name="circle"
                                            size={8}
                                            color={this.props.settings.settings_card_text}
                                            style={{ marginTop: 6, marginRight: 10 }}
                                        />
                                        <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular', lineHeight: 20 }}>
                                            You will no longer be able to log into any Styler Apps or Widgets with this account.
                                        </Text>
                                    </Block>
                                    <Block row style={{ marginTop: 15, marginRight: 15 }}>
                                        <Icon
                                            family="FontAwesome"
                                            name="circle"
                                            size={8}
                                            color={this.props.settings.settings_card_text}
                                            style={{ marginTop: 6, marginRight: 10 }}
                                        />
                                        <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular', lineHeight: 20 }}>You will not be able to create new bookings.</Text>
                                    </Block>
                                    <Block row style={{ marginTop: 15, marginRight: 15 }}>
                                        <Icon
                                            family="FontAwesome"
                                            name="circle"
                                            size={8}
                                            color={this.props.settings.settings_card_text}
                                            style={{ marginTop: 6, marginRight: 10 }}
                                        />
                                        <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular', lineHeight: 20 }}>
                                            You will not be able to view, edit or cancel any existing bookings.
                                        </Text>
                                    </Block>
                                    <Block row style={{ marginTop: 15, marginRight: 15 }}>
                                        <Icon
                                            family="FontAwesome"
                                            name="circle"
                                            size={8}
                                            color={this.props.settings.settings_card_text}
                                            style={{ marginTop: 6, marginRight: 10 }}
                                        />
                                        <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular', lineHeight: 20 }}>
                                            Any existing bookings will NOT be cancelled nor will any deposit payments be refunded.
                                        </Text>
                                    </Block>
                                    <Block row style={{ marginVertical: 15, marginRight: 15 }}>
                                        <Icon
                                            family="FontAwesome"
                                            name="circle"
                                            size={8}
                                            color={this.props.settings.settings_card_text}
                                            style={{ marginTop: 6, marginRight: 10 }}
                                        />
                                        <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular', lineHeight: 20 }}>
                                            You are still required to comply with all pre-agreed Booking Terms & Conditions until all existing bookings have concluded.
                                        </Text>
                                    </Block>
                                    <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular', marginBottom: 10, lineHeight: 20 }}>
                                        By continuing, your account will be deactivated and your details will be retained until any upcoming bookings have concluded. Once all outstanding bookings have complete, your details will be deleted permanently.
                                    </Text>
                                    <Text size={14} color={this.props.settings.settings_card_text} style={{ fontFamily: 'poppins-regular', marginBottom: 10, lineHeight: 20 }}>
                                        To continue, please type 'CONFIRM' below and click the Delete Account button.
                                    </Text>
                                    <Block style={{ padding: theme.SIZES.BASE / 2, borderColor: this.props.settings.report_problem_input, borderWidth: 1, borderRadius: 3, marginVertical: theme.SIZES.BASE / 3 }}>
                                        <TextInput
                                            placeholderTextColor={this.props.settings.report_problem_input}
                                            underlineColorAndroid="transparent"
                                            placeholder="Type CONFIRM to continue"
                                            value={this.state.confirmInput}
                                            style={{ color: this.props.settings.report_problem_input_text, fontFamily: 'poppins-regular', marginVertical: 3 }}
                                            onChange={(e) => this.setState({ confirmInput: e.nativeEvent.text })}
                                        />
                                    </Block>
                                    <Block>
                                        <Button
                                            shadowless
                                            style={{ marginHorizontal: 0, borderRadius: 3, width: '100%', marginBottom: 0 }}
                                            color={this.state.confirmInput === 'CONFIRM' ? '#f33527' : theme.COLORS.MUTED}
                                            onPress={() => this.handleDeleteAccountPress()}
                                        >
                                            <Text color={'#FFFFFF'} style={{ fontFamily: 'poppins-regular' }}>Delete Account</Text>
                                        </Button>
                                    </Block>
                                </Block>
                            </Block>
                        </Block>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Block>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        settings: state.settings,
        business_settings: state.details
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(AccountDeletion));

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
    marginHorizontal: theme.SIZES.BASE
  },
  rowsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginHorizontal: theme.SIZES.BASE
  },
  rows: {
    paddingHorizontal: theme.SIZES.BASE,
    marginVertical: theme.SIZES.BASE,
  }
});