import React from 'react';
import { StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { Block, Text, theme, Icon } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import ServiceApi from './../api/services';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import Spinner from 'react-native-loading-spinner-overlay';
import NetInfo from "@react-native-community/netinfo";
import { RectButton, GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { materialTheme } from '../constants/';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { firebaseApp } from './../api/firebase/config';
import { getAuth } from 'firebase/auth';
import { UserContext } from "../providers/userProvider";

class PaymentMethod extends React.Component {
    static contextType = UserContext
    constructor(props, context) {
        super(props, context);
        this.state = {
            focusSubscription: {},
            loading: false,
            payment_methods: null,
            default_source: null,
            swipeableId: null,
            swipeableIndex: 0,
            swipeableRow: []
        }
    }

    componentDidMount() {
        this.getPaymentMethods();
        
        // Refresh booking settings on focus
        focusSubscription = this.props.navigation.addListener(
            'willFocus',
            payload => {     
                this.getPaymentMethods();
            } 
        );
        this.setState({focusSubscription: focusSubscription});
    }

    componentWillUnmount() {
        this.state.focusSubscription.remove();
    }

    close = (index) => {
        this.state.swipeableRow[index].close();
    };

    getPaymentMethods = async() => {
        this.setState({ loading: true });
        let networkState = await NetInfo.fetch();
        if(networkState.isConnected){
            try {
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                if(user) {
                    let idToken = await user.getIdToken();
                    const businessId = ServiceApi.getBusinessId();
                    const appKey = ServiceApi.getBusinessAppKey();
                    const customer = await ServiceApi.getStripeCustomer(appKey, businessId, idToken);
                    const default_source = customer.data.default_source;
                    this.setState({ default_source, payment_methods: customer.data.sources, loading: false });
                } else {
                    this.setState({ loading: false });
                    this.context.logout();
                    this.props.navigation.navigate('Home');
                }
            } catch(getPaymentMethodErr) {
                console.log(getPaymentMethodErr);
                this.setState({ loading: false });
                Alert.alert(
                    "We're sorry",
                    "An error occured. If the problem persists, please contact support@styler.digital.",
                    [
                        { text: "Ok" }
                    ],
                    { cancelable: false }
                );
            }
        } else {
            Alert.alert(
                "You're offline",
                "Unable to get payment methods.",
                [
                    { text: "Ok" }
                ],
                { cancelable: false }
            );
        }
    }

    deletePaymentMethod = async() => {
        if(((this.props.business_settings.cancellation_fee_enabled && this.props.business_settings.cancellation_fee_enabled === 1) || (this.props.business_settings.no_show_fee_enabled && this.props.business_settings.no_show_fee_enabled === 1)) && this.state.payment_methods && this.state.payment_methods.length === 1) {
            Alert.alert(
                "Oops",
                "At least one valid payment method is required on file.",
                [
                    { text: "Ok" }
                ],
                { cancelable: false }
            );
            return;
        }
        this.setState({ loading: true });
        let networkState = await NetInfo.fetch();
        if(networkState.isConnected){
            try {
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                if(user) {
                    let idToken = await user.getIdToken();
                    const businessId = ServiceApi.getBusinessId();
                    const appKey = ServiceApi.getBusinessAppKey();
                    await ServiceApi.deletePaymentMethod(appKey, businessId, idToken, this.state.swipeableId);
                    this.close(this.state.swipeableIndex);
                    this.setState({ loading: false, payment_methods: this.state.payment_methods.filter(x => x.id !== this.state.swipeableId) });
                } else {
                    this.setState({ loading: false });
                    this.context.logout();
                    this.props.navigation.navigate('Home');
                }
            } catch(deletePaymentMethodErr) {
                console.log(deletePaymentMethodErr);
                this.setState({ loading: false });
                Alert.alert(
                    "We're sorry",
                    "An error occured. If the problem persists, please contact support@styler.digital.",
                    [
                        { text: "Ok" }
                    ],
                    { cancelable: false }
                );
            }
        } else {
            Alert.alert(
                "You're offline",
                "Unable to delete payment method.",
                [
                    { text: "Ok" }
                ],
                { cancelable: false }
            );
        }
    }

    renderRightAction = (progress, index, payment_method_id) => {
        const trans = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [60, 0],
        });
        const pressHandler = () => {
            this.setState({ swipeableIndex: index, swipeableId: payment_method_id });
            Alert.alert(
                "Are you sure?",
                "Are you sure that you want to delete this payment method?",
                [
                    {
                        text: "No",
                        style: "cancel",
                        onPress: () => {
                            this.close(this.state.swipeableIndex);
                        }
                    },
                    {
                        text: "Yes",
                        onPress: () => {
                            this.deletePaymentMethod();
                        }
                    }
                ],
                { cancelable: false }
            );
        };
        return (
            <Block style={{ width: 60, flexDirection: 'row' }}>
                <Animated.View useNativeDriver={true} style={{ flex: 1, transform: [{ translateX: trans }] }}>
                    <RectButton
                    style={[{alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#f44336' }]}
                    onPress={pressHandler}>
                        <Text style={{color: 'white', fontSize: 16, backgroundColor: 'transparent', padding: 10}}><Icon family="Feather" name="x" size={20} /></Text>
                    </RectButton>
                </Animated.View>
            </Block>
        );
    };

    renderCard = (card, index) => {
        let icon_name, icon_colour = null;
        if(card.brand === 'visa'){
            icon_name = 'cc-visa';
            icon_colour = '#1A1F71';
        } else if(card.brand === 'mastercard'){
            icon_name = 'cc-mastercard';
            icon_colour = '#EB001B';
        } else if(card.brand === 'amex'){
            icon_name = 'cc-amex';
            icon_colour = '#1D8ECE';
        } else {
            icon_name = 'credit-card';
            icon_colour = '#000000';
        }
        let curDate = new Date(), cardValid = true;
        if(card.exp_month < curDate.getMonth() + 1 && card.exp_year === curDate.getFullYear() || card.exp_year < curDate.getFullYear()){
            cardValid = false;
        }
        return (
            <Block row style={{ marginBottom: theme.SIZES.BASE }}>
                <Block flex>
                    <GestureHandlerRootView>
                        <Swipeable ref={ref => this.state.swipeableRow[index] = ref} friction={2} rightThreshold={10} renderRightActions={(data) => this.renderRightAction(data, index, card.id) }>
                            <Block style={[styles.paymentMethodContainer, { backgroundColor: this.props.settings.payment_method_card_background }]}>
                                <Block row space="between">
                                    <Block row center>
                                        <Icon name={icon_name} family="Font-Awesome" color={icon_colour} size={24} />
                                        <Text size={17} style={{ marginLeft: 10 }}>{'•••• ' + card.last4}</Text>
                                    </Block>
                                    {card.id === this.state.default_source ?
                                    <Block row center>
                                        <Block middle style={{ paddingHorizontal: 6, backgroundColor: materialTheme.COLORS.LABEL, borderRadius: 2 }}>
                                            <Text size={11} color={'#ffffff'}>Default</Text>
                                        </Block>
                                    </Block>
                                    : null}
                                    <Block row center>
                                        <Text size={14} color={cardValid ? this.props.settings.payment_method_card_valid : this.props.settings.payment_method_card_expired}>{'Exp ' + card.exp_month + '/' + card.exp_year}</Text>
                                    </Block>
                                </Block>
                            </Block>
                        </Swipeable>
                    </GestureHandlerRootView>
                </Block>
            </Block>
        )
    }

    render() {
        const { navigation } = this.props;
       
        return (
            <Block flex style={{ padding: theme.SIZES.BASE, backgroundColor: this.props.settings.payment_method_background }}>
                {this.state.loading ?
                    <Block>
                        <Spinner visible={true} />
                    </Block>
                : null}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {this.state.payment_methods && this.state.payment_methods.map((x,i) => (this.renderCard(x, i)) )}
                    <Block row style={{ marginBottom: theme.SIZES.BASE }}>
                        <Block flex>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('PaymentMethodAdd')}>
                                <Block style={[styles.paymentMethodContainer, { backgroundColor: this.props.settings.payment_method_card_background }]}>
                                    <Block row space="between">
                                        <Block row center>
                                            <Icon name={'plus'} family="Feather" color={this.props.settings.payment_method_card_text} size={20} />
                                            <Text size={17} style={{ marginLeft: 10 }} color={this.props.settings.payment_method_card_text}>New payment method</Text>
                                        </Block>
                                        <Block row center>
                                            <Icon name="chevron-right" family="Feather" color={theme.COLORS.MUTED} size={24} />
                                        </Block>
                                    </Block>
                                </Block>
                            </TouchableOpacity>
                        </Block>
                    </Block>
                </ScrollView>
            </Block>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        business_settings: state.details,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(PaymentMethod));

const styles = StyleSheet.create({
    paymentMethodContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 5,
        flex: 1,
        padding: theme.SIZES.BASE / 1.25
    }
});