import React from 'react';
import { StyleSheet, Alert, ScrollView, View, Text } from 'react-native';
// Expo packages
import * as Sentry from 'sentry-expo';
import * as Linking from 'expo-linking';
import Constants from "expo-constants";
// Third party packages
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Button, theme, Icon } from 'galio-framework';
import {
    initStripe,
    initPaymentSheet,
    presentPaymentSheet,
    PlatformPay
} from '@stripe/stripe-react-native';
// Redux
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
// API
import ServicesApi from '../api/services';
// Theme
import { materialTheme } from '../constants';
// Firebase
import { getAuth } from 'firebase/auth';
import { firebaseApp } from './../api/firebase/config';
import { UserContext } from "../providers/userProvider";

class WizardFormPage3 extends React.Component {
    static contextType = UserContext
    constructor(props, context) {
        super(props, context);
        this.state = {
            confirmed: false,
            loading: false,
            error: null,
            success: null,
            total: 0,
            deposit: 0,
            stripe_customer_id: '',
            default_payment_method: null,
            payment_methods: null
        };
    }

    componentDidMount = async () => {
        // Init Stripe
        let publishableKey;
        if (Constants.appOwnership === 'expo' || Constants.debugMode) {
            publishableKey = Constants.expoConfig.extra.stripe.publishableKeyDev;
        } else {
            publishableKey = Constants.expoConfig.extra.stripe.publishableKeyProd;
        }
        await initStripe({
            publishableKey,
            merchantIdentifier: 'merchant.com.styler.digital',
            urlScheme: Constants.appOwnership === 'expo' ? Linking.createURL('/--/') : Linking.createURL('')
        });
    }

    createBooking = async () => {
        let that = this;
        this.setState({ loading: true, error: null });
        if(this.props.isInReview) {
            this.setState({
                confirmed: true,
                loading: false,
                error: null
            });
            return;
        }
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if (!user) {
            this.setState({ loading: false });
            this.props.actions.clearBooking();
            this.props.resetPage();
            this.context.logout();
            this.props.navigation.navigate('Home');
        }
        try {
            const idToken = await user.getIdToken();
            let bodyData = {
                booking_data: that.props.bookings,
                business_id: ServicesApi.getBusinessId(),
                business_location_id: that.props.businessLocationId,
                app_key: ServicesApi.getBusinessAppKey(),
                idToken: idToken,
                payment_intent_id: null,
                booking_date: moment(that.props.bookings[0].booking_date).format('YYYY-MM-DD'),
                booking_time: that.props.bookings[0].booking_time
            };
            try {
                
                const { data } = await ServicesApi.newBooking(bodyData);
                switch (data.status) {
                    case "success":
                        this.setState({
                            confirmed: true,
                            loading: false,
                            error: null
                        });
                        break;
                    case "email not verified":
                        this.setState({
                            loading: false,
                            error: "Please verify your email address using the verification email we sent you."
                        });
                        break;
                }
            } catch (requestErr) {
                const responseMsg = requestErr?.response?.data?.message;
                let errorMsg;
                switch (responseMsg) {
                    case "booking time unavailable":
                        errorMsg = "This booking time is no longer available. Please choose another booking time.";
                        break;
                    case "user blocked":
                        errorMsg = "Your account has been temporarily suspended from making bookings with us.";
                        break;
                    case "email not verified":
                        errorMsg = "Please verify your email address using the verification email we sent you.";
                        break;
                    case "payment required":
                        errorMsg = "A payment is required for this booking.";
                        break;
                }
                if (!errorMsg) {
                    throw requestErr;
                }
                this.setState({
                    loading: false,
                    error: errorMsg
                });
            }
        } catch (bookingErr) {
            this.setState({
                error: 'Unable to book. Please contact us at support@styler.digital.',
                loading: false
            });
            Sentry.Native.captureException(bookingErr);
        };
    }

    submitBooking = async () => {
        if (this.state.confirmed || this.props.bookings.length == 0) {
            return;
        }
        if (this.props.user && (this.props.user.user_firstname === 'N/A' || this.props.user.user_lastname === 'N/A')) {
            this.setState({ error: 'Please go to the Settings screen and update your name before making a booking.', loading: false });
            return;
        }
        let that = this;
        let timeSelectDiff = moment().diff(this.props.bookings[0].booking_added, 'm');
        if (timeSelectDiff >= 15) {
            this.handleBookingTimeOut();
            return;
        }
        this.setState({ error: null, loading: true });
        
        if (this.state.deposit > 0) {
            try {
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                if (user) {
                    const idToken = await user.getIdToken();
                    const appKey = await ServicesApi.getBusinessAppKey();
                    const businessId = await ServicesApi.getBusinessId();
                    const businessLocationId = this.props.businessLocationId;
                    let selectedServices = [];
                    let selectedStaff = [];
                    this.props.bookings.map((bookingServiceObj,) => {
                        selectedServices.push(bookingServiceObj.service_business_detail_id);
                        selectedStaff.push(bookingServiceObj.staff_id);
                    });
                    let booking_date = this.props.bookings[0].booking_date;
                    let booking_time = this.props.bookings[0].booking_time;
                    let payment_intent_data = null;
                    try {
                        payment_intent_data = await ServicesApi.createPaymentIntent(idToken, appKey, businessId, businessLocationId, selectedServices, selectedStaff, null, moment(booking_date).format('YYYY-MM-DD'), booking_time);
                        console.log(payment_intent_data)
                    } catch (e) {
                        if (e.response && e.response.data && e.response.data.message) {
                            let errData = e.response.data;
                            if (errData.message == "email not verified") {
                                this.setState({ error: "Please verify your email address using the verification email.", loading: false });
                            } else if (errData.message == "booking time unavailable") {
                                this.setState({ error: "This booking time is no longer available. Please choose another booking time.", loading: false });
                            } else if (errData.message == "user blocked") {
                                this.setState({ error: "Your account has been temporarily suspended from making bookings with us.", loading: false });
                            } else {
                                this.setState({ error: "We're sorry. An unexpected error occured. You have not been charged.", loading: false });
                            }
                        } else {
                            this.setState({ error: "We're sorry. An unexpected error occured. You have not been charged.", loading: false });
                        }
                        return;
                    }
                    // Payment sheet
                    await initPaymentSheet({
                        paymentIntentClientSecret: payment_intent_data.data.client_secret,
                        customerId: payment_intent_data.data.customer_id,
                        customerEphemeralKeySecret: payment_intent_data.data.customer_ephemeral_key,
                        customFlow: false,
                        merchantDisplayName: this.props.business_settings.business_name,
                        style: 'alwaysLight',
                        applePay: {
                            merchantCountryCode: 'GB',
                            cartItems: [
                                {
                                    paymentType: PlatformPay.PaymentType.Immediate,
                                    label: `Deposit for your booking with ${this.props.business_settings.business_name}`,
                                    amount: "" + this.state.deposit
                                }
                            ]
                        },
                        googlePay: {
                            merchantCountryCode: 'GB',
                            testEnv: Constants.appOwnership === 'expo' || Constants.debugMode
                        },
                        appearance: {
                            colors: {
                                icon: '#FFFFFF'
                            },
                            primaryButton: {
                                colors: {
                                    background: this.props.settings.book_page_three_book_button_background,
                                    text: this.props.settings.book_page_three_book_button_text
                                }
                            }
                        }
                    });
                    const { error: presentError } = await presentPaymentSheet();
                    if (presentError) {
                        this.handlePaymentSheetError(
                            presentError,
                            idToken,
                            payment_intent_data.data.payment_intent_id
                        );
                        return;
                    }
                    this.setState({
                        confirmed: true,
                        loading: false,
                        error: null,
                        success: "We'll send you a booking confirmation once your booking is confirmed."
                    });
                } else {
                    that.setState({ loading: false });
                    that.props.actions.clearBooking();
                    that.props.resetPage();
                    that.context.logout();
                    that.props.navigation.navigate('Home');
                }
            } catch (paymentErr) {
                this.setState({ loading: false });
                console.log(paymentErr);
                Alert.alert(
                    "We're sorry",
                    "An error occured during the payment process. If the problem persists, please contact support@styler.digital.",
                    [
                        { text: "Ok" }
                    ],
                    { cancelable: false }
                );
            }
        } else {
            // Card capture handling
            if (
                this.props.business_settings.stripe_account === true &&
                this.state.deposit === 0 &&
                (this.props.business_settings.cancellation_fee_enabled === 1 || this.props.business_settings.no_show_fee_enabled === 1 || this.props.isInReview)
            ) {
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                const idToken = await user.getIdToken();
                const appKey = await ServicesApi.getBusinessAppKey();
                const businessId = await ServicesApi.getBusinessId();
                
                let setupIntentData = await ServicesApi.createSetupIntent(idToken, appKey, businessId);
                
                const {error: initPaymentSheetError} =  await initPaymentSheet({
                    merchantDisplayName: this.props.business_settings.business_name,
                    setupIntentClientSecret: setupIntentData.data.client_secret,
                    customerId: setupIntentData.data.customer_id,
                    customerEphemeralKeySecret: setupIntentData.data.customer_ephemeral_key,
                    customFlow: false,
                    style: 'alwaysLight',
                    primaryButtonLabel: 'Select payment method',
                    appearance: {
                        colors: {
                            icon: '#FFFFFF'
                        },
                        primaryButton: {
                            colors: {
                                background: this.props.settings.book_page_three_book_button_background,
                                text: this.props.settings.book_page_three_book_button_text
                            }
                        }
                    }
                });
                if(initPaymentSheetError) {
                    console.log(initPaymentSheetError);
                }
                const { error: presentError } = await presentPaymentSheet();
                if (presentError) {
                    this.handlePaymentSheetError(presentError);
                    return;
                }
                // Check timeout is not exceeded
                let timeSelectDiff = moment().diff(this.props.bookings[0].booking_added, 'm');
                if (timeSelectDiff >= 15) {
                    this.handleBookingTimeOut();
                    return;
                }
            }
            this.createBooking();
        }
    }

    handlePaymentSheetError(stripeError, idToken = null, paymentIntentId = null) {
        switch (stripeError.code) {
            case "Canceled":
                if (paymentIntentId) {
                    try {
                        ServicesApi.deletePaymentIntent(
                            idToken,
                            paymentIntentId
                        );
                    } catch (e) {
                        console.log('Unable to delete payment intent');
                    }
                }
                this.setState({ loading: false });
                break;
            case "Failed":
                this.setState({
                    loading: false,
                    error: stripeError.localizedMessage
                });
                break;
        }
    }

    handleBookingTimeOut() {
        Alert.alert(
            "Time Refresh Required",
            "We only reserve your booking slot for a period of 15 minutes. Please choose your booking time again.",
            [
                {
                    text: "Ok",
                    onPress: () => {
                        this.props.removeBookingServiceDateTime();
                        this.props.previousPage();
                    }
                }
            ],
            { cancelable: false }
        );
    }

    renderBookingDateTime() {
        let dateStr, timeStr;
        try {
            dateStr = moment(this.props.bookings[0].booking_date).format('ddd Do MMM YYYY');
            timeStr = this.props.bookings[0].booking_time;
        } catch(_) {
            dateStr = '----';
            timeStr = '--:--';
        }
        return `On ${dateStr} at ${timeStr}`;
    }

    renderBookButtonContent() {
        let deposit = this.state.deposit;
        let bookButtonStr, bookButtonColor;
        if(this.state.confirmed) {
            bookButtonColor = '#ffffff';
            if(deposit > 0) {
                bookButtonStr = "Processed";
            } else {
                bookButtonStr = "Booked";
            }
        } else {
            bookButtonColor = this.props.settings.book_page_three_book_button_text;
            if(deposit > 0) {
                bookButtonStr = "Pay deposit and book";
            } else {
                bookButtonStr = "Book";
            }
        }
        return (
            <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row' }}>
                    {this.state.confirmed ? (
                        <Icon
                            family="Feather"
                            name="check"
                            color={'#ffffff'}
                            size={20}
                            style={{ marginRight: theme.SIZES.BASE / 2 }}
                        />
                    ) : null}
                    <Text style={[styles.bookButtonText, { color: bookButtonColor }]}>{bookButtonStr}</Text>
                </View>
            </View>
        )
    }

    removeEncoding(inputStr) {
        return inputStr?.replace('%comma%', ',').replace('%apostrophe%', "'");
    }

    renderBookingServices() {
        let total = 0, totalPoa = false, deposit = 0;
        let bookingServices = (
            <ScrollView contentContainerStyle={{ paddingVertical: theme.SIZES.BASE, gap: theme.SIZES.BASE }}>
                {this.props.bookings?.length > 0 && this.props.bookings.map((bookingServiceObj, bookingServiceIndex) => {
                    let serviceDetailObj = this.props.serviceDetail.find(x => x.service_business_detail_id === bookingServiceObj.service_business_detail_id);
                    let serviceObj = this.props.service.find(x => x.service_id === serviceDetailObj?.service_business_id);
                    let staffObj = this.props.staff.find(x => x.id == bookingServiceObj.staff_id);
                    // Get total
                    if (serviceDetailObj?.service_business_detail_poa === 1) {
                        totalPoa = true;
                    } else {
                        total += serviceDetailObj.service_business_detail_price;
                    }
                    // Get deposit
                    if (serviceDetailObj?.service_business_detail_deposit_required === 1) {
                        deposit += serviceDetailObj.service_business_detail_deposit_amount;
                    }
                    // Get service duration
                    let duration;
                    if (serviceDetailObj.service_business_detail_split === 1) {
                        duration = serviceDetailObj.service_business_detail_duration_a + serviceDetailObj.service_business_detail_duration_break + serviceDetailObj.service_business_detail_duration_b;
                    } else {
                        duration = serviceDetailObj.service_business_detail_duration_a;
                    }
                    let isPoa = serviceDetailObj?.service_business_detail_poa === 1
                    return (
                        <View key={'bookingService' + bookingServiceIndex}>
                            <View style={styles.serviceRow}>
                                <Text style={styles.serviceName}>
                                    {this.removeEncoding(serviceObj?.service_name)} ({this.removeEncoding(serviceDetailObj?.service_business_detail_name)})
                                </Text>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.servicePrice}>
                                        {isPoa ? 'POA' : `${this.props.business_settings.currency_symbol}${Number(serviceDetailObj.service_business_detail_price / 100).toFixed(2)}`}
                                    </Text>
                                    {!this.state.confirmed ? (
                                        <TouchableOpacity
                                            onPress={() => this.props.removeBookingServiceFromCart(bookingServiceObj, bookingServiceIndex)}
                                            style={{ paddingLeft: theme.SIZES.BASE / 2 }}
                                        >
                                            <Icon name="x" family="Feather" color="#ed5565" size={20} />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                            <View>
                                <Text style={styles.serviceDescription}>
                                    {duration} mins with {staffObj?.firstname} {staffObj?.lastname}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        );
        if(this.props.business_settings?.stripe_account !== true) {
            deposit = 0;
        }
        if (this.state.deposit !== deposit) {
            this.setState({ deposit });
        }
        return { total, totalPoa, deposit, bookingServices };
    }

    render() {
        const { total, totalPoa, deposit, bookingServices } = this.renderBookingServices();
        return (
            <View style={{ flex: 1 }}>
                {this.state.loading ?
                    <View style={{ display: 'flex' }}>
                        <Spinner visible={true} />
                    </View>
                : null}
                <View style={styles.bookingCard}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.bookingCardHeader}>
                            <Text style={styles.bookingCardTitle}>New Booking</Text>
                            <Text style={styles.bookingCardDateTime}>{this.renderBookingDateTime()}</Text>
                            {this.props.businessLocation?.length > 1 ? (
                                <View style={styles.locationRowContainer}>
                                    <Icon family='feather' name="map-pin" size={13} style={{ marginRight: 5 }} />
                                    <Text style={styles.locationName}>
                                        {this.props.businessLocation.find(x => x.business_location_id === this.props.businessLocationId)?.business_location_name}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                        <View style={{ flex: 1 }}>
                            {bookingServices}
                        </View>
                    </View>
                    <View style={styles.bookingCardFooter}>
                        {deposit > 0 ? (
                            <View style={styles.footerRow}>
                                <Text style={styles.footerTitle}>Deposit</Text>
                                <Text style={styles.footerTitle}>{this.props.business_settings.currency_symbol}{Number(deposit / 100).toFixed(2)}</Text>
                            </View>
                        ) : null}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerTitle}>Total</Text>
                            <Text style={styles.footerTitle}>{totalPoa ? 'POA + ' : null}{this.props.business_settings.currency_symbol}{Number(total / 100).toFixed(2)}</Text>
                        </View>
                        {deposit === 0 && ((this.props.business_settings?.cancellation_fee_enabled === 1) || (this.props.business_settings?.no_show_fee_enabled === 1)) ? (
                            <View style={styles.footerRow}>
                                <Text style={styles.footerMutedText}>No deposit is necessary but a payment method is required to be on file to make this booking.</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
                <View style={styles.buttonGroupContainer}>
                    <Button
                        center
                        color={this.state.confirmed ? '#4caf50' : this.props.settings.book_page_three_book_button_background}
                        disabled={this.state.confirmed}
                        loading={this.state.loading}
                        onPress={() => this.submitBooking()}
                        style={{ margin: 0, width: '100%' }}
                    >
                        {this.renderBookButtonContent()}
                    </Button>
                    {this.state.error ?
                        <View>
                            <TouchableOpacity onPress={() => this.setState({ error: null }) }>
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{this.state.error}</Text>
                                    <Icon family="Feather" name="x" color={'#ffffff'} size={16} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    : null}
                    {this.state.success ?
                        <View>
                            <View style={[styles.errorContainer, { backgroundColor: '#4caf50' }]}>
                                <Text style={styles.errorText}>{this.state.success}</Text>
                            </View>
                        </View>
                    : null}
                    <View style={styles.buttonRowContainer}>
                        <View style={{ flex: 1 }}>
                            <Button
                                center
                                color={this.state.confirmed ? materialTheme.COLORS.MUTED : this.props.settings.book_page_three_new_button_background}
                                disabled={this.state.confirmed}
                                onPress={() => {
                                    this.props.removeBookingServiceDateTime();
                                    this.props.previousPage();
                                }}
                                style={{ margin: 0, width: '100%' }}
                            >
                                <Text style={[styles.buttonText, { color: this.props.settings.book_page_three_new_button_text }]}>
                                    Back
                                </Text>
                            </Button>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button
                                center
                                color={this.props.settings.book_page_three_new_button_background}
                                onPress={() => {
                                    this.props.actions.clearBooking();
                                    this.props.resetPage();
                                }}
                                style={{ margin: 0, width: '100%' }}
                            >
                                <Text style={[styles.buttonText, { color: this.props.settings.book_page_three_new_button_text }]}>
                                    {this.state.confirmed ? 'New booking' : 'Clear booking'}
                                </Text>
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        staff: state.staff,
        service: state.service,
        serviceDetail: state.serviceDetail,
        bookings: state.bookings,
        business_settings: state.details,
        settings: state.settings,
        user: state.user,
        businessLocation: state.businessLocation
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
    form: 'wizard', //                 <------ same form name
    destroyOnUnmount: false, //        <------ preserve form data
    forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
})(WizardFormPage3));

//still not finished add in some 'theme' from galio
const styles = StyleSheet.create({
    bookingCard: {
        margin: theme.SIZES.BASE,
        padding: theme.SIZES.BASE,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        flex: 1,
        justifyContent: 'space-between'
    },
    bookingCardHeader: {
        paddingBottom: theme.SIZES.BASE / 2,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bookingCardFooter: {
        borderTopWidth: 2,
        borderColor: '#000000',
        paddingTop: theme.SIZES.BASE,
        gap: theme.SIZES.BASE / 2
    },
    bookingCardTitle: {
        fontFamily: 'poppins-medium',
        fontSize: 24
    },
    bookingCardDateTime: {
        fontFamily: 'poppins-regular',
        fontSize: 14,
        color: theme.COLORS.MUTED
    },
    locationRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3
    },
    locationName: {
        fontSize: 13,
        fontFamily: 'poppins-medium'
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerTitle: {
        fontSize: 16,
        fontFamily: 'poppins-semi-bold'
    },
    footerMutedText: {
        fontSize: 14,
        color: theme.COLORS.MUTED,
        fontFamily: 'poppins-medium'
    },
    buttonGroupContainer: {
        marginHorizontal: theme.SIZES.BASE,
        marginBottom: theme.SIZES.BASE / 2,
        gap: theme.SIZES.BASE
    },
    bookButtonText: {
        color: '#000000',
        fontSize: 17,
        fontFamily: 'poppins-medium'
    },
    errorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme.SIZES.BASE,
        backgroundColor: '#f44336',
        borderRadius: 5
    },
    errorText: {
        fontFamily: 'poppins-medium',
        color: '#ffffff'
    },
    buttonRowContainer: {
        flexDirection: 'row',
        gap: theme.SIZES.BASE
    },
    buttonText: {
        fontFamily: 'poppins-regular',
        fontSize: 16,
        color: '#000000'
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    serviceName: {
        fontSize: 16,
        fontFamily: 'poppins-medium',
        flex: 1
    },
    servicePrice: {
        fontSize: 16,
        fontFamily: 'poppins-medium'
    },
    serviceDescription: {
        color: theme.COLORS.MUTED,
        fontFamily: 'poppins-regular'
    }
});