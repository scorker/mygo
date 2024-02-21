import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Block, Text, theme, Button, Input } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import Spinner from 'react-native-loading-spinner-overlay';
import ServicesApi from '../api/services';

import { CardView } from '../components/CardInput';
import { materialTheme } from '../constants/';
import { firebaseApp } from './../api/firebase/config';
import { getAuth } from 'firebase/auth';
import { UserContext } from "../providers/userProvider";

import NetInfo from "@react-native-community/netinfo";
import Constants from 'expo-constants';

const valid = require("card-validator");

let STRIPE_PUBLISHABLE_KEY = null;
if(Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.production === true) {
    // PROD
    STRIPE_PUBLISHABLE_KEY = 'pk_live_51GxzB6FQ8tU2VmRuSkgfhmWioyfOQwEYnCX2TBrbKNYlKGD9YZkufezTf9Zy5CCTmxsOz1HwagrrmGPcxvlgPYiY00odjejsAJ';
} else {
    // DEV
    STRIPE_PUBLISHABLE_KEY = 'pk_test_51GxzB6FQ8tU2VmRuTC3ufD9Vty8befyESFWsIsl9q5pyZEjl996fwL2bRx2wwLA1QCDfAHe5mo5dqNzidEkOGf9l00uBZXYCNp';
}

class PaymentMethodAdd extends React.Component {
    static contextType = UserContext
    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false,
            cardField: 'card',
            cardBrand: null,
            cardName: null,
            cardNameErr: null,
            cardNumber: null,
            cardNumberErr: false,
            cardExpMonth: null,
            cardExpMonthErr: false,
            cardExpYear: null,
            cardExpYearErr: false,
            cardCvc: null,
            cardCvcErr: false,
            cardGaps: null,
            error: null
        }
    }

    handleChange(event, name) {
        event.persist();
        if(name == 'cardName'){
            this.setState({ cardName: event.nativeEvent.text });
        } else if(name == 'cardNumber'){
            let numberValidation = valid.number(event.nativeEvent.text);
            if(numberValidation.card){
                this.setState({ cardBrand: numberValidation.card.type, cardGaps: numberValidation.card.gaps, cardNumberErr: false });
            } else {
                this.setState({ cardNumberErr: true });
            }
            this.setState({ cardNumber: event.nativeEvent.text ? event.nativeEvent.text.substring(0, 19) : null });
        } else if(name == 'cardExpMonth'){
            let validExpiry = valid.expirationDate({month: this.state.cardExpMonth, year: this.state.cardExpYear});
            if(validExpiry.isPotentiallyValid){
                this.setState({ cardExpMonthErr: false, cardExpYearErr: false });
            } else {
                this.setState({ cardExpMonthErr: true, cardExpYearErr: true });
            }
            this.setState({ cardExpMonth: event.nativeEvent.text ? event.nativeEvent.text.substring(0, 2) : null }); 
        } else if(name == 'cardExpYear'){
            let validExpiry = valid.expirationDate({month: this.state.cardExpMonth, year: this.state.cardExpYear});
            if(validExpiry.isPotentiallyValid){
                this.setState({ cardExpMonthErr: false, cardExpYearErr: false });
            } else {
                this.setState({ cardExpMonthErr: true, cardExpYearErr: true });
            }
            this.setState({ cardExpYear: event.nativeEvent.text ? event.nativeEvent.text.substring(0, 2) : null });
        } else if(name == 'cardCvc'){
            this.setState({ cardCvc: event.nativeEvent.text ? event.nativeEvent.text.substring(0, 4) : null }); 
        }   
    }

    addPaymentMethod = async(payment_method_id) => {
        let appKey = ServicesApi.getBusinessAppKey();
        let businessId = ServicesApi.getBusinessId();
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if(user) {
            let idToken = await user.getIdToken();
            await ServicesApi.addPaymentMethod(appKey, businessId, idToken, payment_method_id);
        }
    }

    getPaymentMethodToken = () => {
        const card = {
            'card[name]': this.state.cardName,
            'card[number]': this.state.cardNumber.replace(/ /g, ''),
            'card[exp_month]': this.state.cardExpMonth,
            'card[exp_year]': '20' + this.state.cardExpYear,
            'card[cvc]': this.state.cardCvc
        };
        return fetch('https://api.stripe.com/v1/tokens', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`
            },
            method: 'post',
            // Format the credit card data to a string of key-value pairs divided by &
            body: Object.keys(card).map(key => key + '=' + card[key]).join('&')
        }).then(response => response.json());
    };


    submitPaymentMethod = async() => {
        this.setState({ loading: true, error: null,  });
        if(!this.state.cardName || this.state.cardName.length === 0){
            this.setState({ error: 'A name on the card is required', loading: false });
            return;
        }
        if(!this.state.cardNumber || this.state.cardNumber.length === 0){
            this.setState({ error: 'Invalid card number', loading: false });
            return;
        }
        if(!this.state.cardExpMonth || this.state.cardExpMonth.length === 0 || this.state.cardExpMonth > 12 || this.state.cardExpMonth <= 0){
            this.setState({ error: 'Invalid expiry month', loading: false });
            return;
        }
        if(!this.state.cardExpYear || this.state.cardExpYear.length === 0){
            this.setState({ error: 'Invalid expiry year', loading: false });
            return;
        }
        if(!this.state.cardCvc || this.state.cardCvc.length === 0){
            this.setState({ error: 'A CVC number is required', loading: false });
            return;
        }
        let networkState = await NetInfo.fetch();
        if(networkState.isConnected){
            try {
                let paymentMethodData = await this.getPaymentMethodToken();
                if(paymentMethodData.error){
                    this.setState({ loading: false, error: paymentMethodData.error.message });
                    return;
                }
                try {
                    await this.addPaymentMethod(paymentMethodData.id);
                } catch(e) {
                    if(e.response && e.response.data){
                        let errData = e.response.data;
                        if(errData.status == "failed"){
                            this.setState({ error: errData.message, loading: false });
                        } else {
                            this.setState({ error: "We're sorry. An error occured and we were unable to add this payment method.", loading: false });
                        }
                    } else {
                        this.setState({ error: "We're sorry. An error occured and we were unable to add this payment method.", loading: false });
                    }
                    return;
                }
                this.setState({ loading: false });
                this.props.navigation.goBack();
            } catch(cardTokenErr) {
                console.log(cardTokenErr);
                this.setState({ loading: false, error: 'Sorry, an unexpected error occured' });
            }
        } else {
            this.setState({ error: "You're offline", loading: false });
        }
    }

    render() {
        const { navigation } = this.props;
        return (
            <Block flex style={{ backgroundColor: this.props.settings.payment_method_add_background }}>
                {this.state.loading ?
                    <Block>
                        <Spinner visible={true} />
                    </Block>
                : null}
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={70}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Block style={[styles.cardContainer, { backgroundColor: this.props.settings.payment_method_add_card_background }]}>
                            <Block center>
                                <CardView brand={this.state.cardBrand} gaps={this.state.cardGaps} focused={this.state.cardField} number={this.state.cardNumber} name={this.state.cardName} cvc={this.state.cardCvc} expiry={(this.state.cardExpMonth ? this.state.cardExpMonth : '--') + '/' + (this.state.cardExpYear ? this.state.cardExpYear : '--')} />
                            </Block>
                            <Block>
                                <Input
                                    type="number-pad"
                                    color={this.props.settings.payment_method_add_card_input_text}
                                    placeholder="Card Number"
                                    id="cardNumber"
                                    onChange= {(e) => this.handleChange(e, 'cardNumber')}
                                    onFocus={() => this.setState({ cardField: 'number' })}
                                    value={this.state.cardNumber}
                                    placeholderTextColor={this.props.settings.payment_method_add_card_input}
                                    style={[styles.input, { borderColor: this.props.settings.payment_method_add_card_input }, this.state.cardNumberErr ? styles.inputDanger : null]}
                                    label={this.state.cardNumber && this.state.cardNumber.length > 0 ? 'Card Number' : null}
                                />
                            </Block>
                            <Block>
                                <Input
                                    type="default"
                                    color={this.props.settings.payment_method_add_card_input_text}
                                    placeholder="Name On Card"
                                    id="cardName"
                                    onChange= {(e) => this.handleChange(e, 'cardName')}
                                    onFocus={() => this.setState({ cardField: 'name' })}
                                    value={this.state.cardName}
                                    placeholderTextColor={this.props.settings.payment_method_add_card_input}
                                    style={[styles.input, { borderColor: this.props.settings.payment_method_add_card_input }, this.state.cardNameErr ? styles.inputDanger : null]}
                                    label={this.state.cardName && this.state.cardName.length > 0 ? 'Name On Card' : null}
                                />
                            </Block>
                            <Block row>
                                <Block flex={0.5} style={{ marginRight: theme.SIZES.BASE / 2 }}>
                                    <Input
                                        type="number-pad"
                                        color={this.props.settings.payment_method_add_card_input_text}
                                        placeholder="Exp Month"
                                        id="cardExpMonth"
                                        onChange= {(e) => this.handleChange(e, 'cardExpMonth')}
                                        onFocus={() => this.setState({ cardField: 'expiry' })}
                                        value={this.state.cardExpMonth}
                                        placeholderTextColor={this.props.settings.payment_method_add_card_input}
                                        style={[styles.input, { borderColor: this.props.settings.payment_method_add_card_input }, this.state.cardExpMonthErr ? styles.inputDanger : null]}
                                        label={this.state.cardExpMonth || this.state.cardExpYear ? 'Exp Month' : null}
                                    />
                                </Block>
                                <Block flex={0.5} style={{ marginLeft: theme.SIZES.BASE / 2 }}>
                                    <Input
                                        type="number-pad"
                                        color={this.props.settings.payment_method_add_card_input_text}
                                        placeholder="Exp Year"
                                        id="cardExpYear"
                                        onChange= {(e) => this.handleChange(e, 'cardExpYear')}
                                        onFocus={() => this.setState({ cardField: 'expiry' })}
                                        value={this.state.cardExpYear}
                                        placeholderTextColor={this.props.settings.payment_method_add_card_input}
                                        style={[styles.input, { borderColor: this.props.settings.payment_method_add_card_input }, this.state.cardExpYearErr ? styles.inputDanger : null]}
                                        label={this.state.cardExpMonth || this.state.cardExpYear ? 'Exp Year' : null}
                                    />
                                </Block>
                            </Block>
                            <Block>
                                <Input
                                    type="number-pad"
                                    color={this.props.settings.payment_method_add_card_input_text}
                                    placeholder="CVC"
                                    id="cardCvc"
                                    onChange= {(e) => this.handleChange(e, 'cardCvc')}
                                    onFocus={() => this.setState({ cardField: 'cvc' })}
                                    value={this.state.cardCvc}
                                    placeholderTextColor={this.props.settings.payment_method_add_card_input}
                                    style={[styles.input, { borderColor: this.props.settings.payment_method_add_card_input }, this.state.cardCvcErr ? styles.inputDanger : null]}
                                    label={this.state.cardCvc ? 'CVC' : null}
                                />
                            </Block>
                            <Block row>
                                <Button
                                    shadowless
                                    color={this.props.settings.payment_method_add_card_button}
                                    disabled={this.state.success}
                                    loading={this.state.loading}
                                    onPress={() => this.submitPaymentMethod()}
                                    style={{ flex: 1, marginHorizontal: 0 }}>
                                    <Text color={this.props.settings.payment_method_add_card_button_text}>Add Payment Method</Text>
                                </Button>
                            </Block>
                            {this.state.error ?
                                <Block row>
                                    <Block flex={1}>
                                    <TouchableOpacity onPress={() => this.setState({ error: null })}>
                                        <Block row style={{padding: theme.SIZES.BASE, backgroundColor: '#f44336', borderRadius: 5}}>
                                            <Text color={'#ffffff'}>{this.state.error}</Text>
                                        </Block>
                                    </TouchableOpacity>
                                    </Block>
                                </Block>
                            : null}
                        </Block>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Block>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        settings: state.settings,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(PaymentMethodAdd));

const styles = StyleSheet.create({
    cardContainer: {
        margin: theme.SIZES.BASE,
        backgroundColor: '#FFFFFF',
        padding: theme.SIZES.BASE,
        borderRadius: 5
    },
    input: {
        zIndex: 5,
        borderBottomWidth: 1,
        borderRadius: 0,
        borderColor: '#000000',
        backgroundColor: 'transparent',
        borderWidth: 0
    },
    inputDanger: {
        borderColor: materialTheme.COLORS.ERROR,
    }
});