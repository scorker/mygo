import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Block, theme, Button, Text } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment-timezone';
import ServicesApi from '../api/services';
import Spinner from 'react-native-loading-spinner-overlay';
import * as serviceActions from '../actions/index';
import WizardFormPage2 from '../booking/WizardFormPage2';
import * as services from '../api/services';
import { firebaseApp } from './../api/firebase/config';
import { getAuth } from 'firebase/auth';
import { UserContext } from "../providers/userProvider";

class BookingEdit extends React.Component {
    static contextType = UserContext
    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false,
            date: null,
            booking_data: null,
            business_location_id: null
        };
        this.onDateChanged = this.onDateChanged.bind(this);
        this.modifyDateTime = this.modifyDateTime.bind(this);
    }

    componentDidMount() {
        if(!this.props.navigation.state.params  || !this.props.navigation.state.params.orderEvents || this.props.navigation.state.params.orderEvents.length === 0) {
            this.props.navigation.goBack();
        }
        let order_data = this.props.navigation?.state?.params?.orderData;
        let booking_data = this.props.navigation?.state?.params?.orderEvents;
        booking_data[0].booking_date =  moment(booking_data[0].start, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
        booking_data[0].booking_time = moment(booking_data[0].start, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
        this.setState({ booking_data, business_location_id: order_data.business_location_id });
    }

    onDateChanged(date)  {
        return new Promise((resolve) => {
            this.setState({ date });
            resolve();
        });
    }

    modifyDateTime(date, time) {
        let booking_data = [...this.state.booking_data];
        booking_data.forEach((element, index) => {
            var bookingObj = Object.assign({}, element);
            bookingObj.booking_time = time;
            bookingObj.booking_date = date;
            booking_data[index] = bookingObj;
        });
        this.setState({ booking_data });
    }

    async submitUpdateBooking() {
        let that = this;
        this.setState({ loading: true });
        // Check to see if the booking date/time has changed
        let parsedInputDatetime = moment(this.props.navigation.state.params.orderEvents[0].start, 'YYYY-MM-DD HH:mm:ss');
        if(this.state.booking_data[0].booking_time === parsedInputDatetime.format('HH:mm') && 
            this.state.booking_data[0].booking_date === parsedInputDatetime.format('YYYY-MM-DD')) {
            Alert.alert(
                "No changes detected",
                "Please select a new date and time to update the booking.",
                [
                    { text: "Ok" }
                ],
                { cancelable: false }
            );
            return;
        }
        let netInfoState = await NetInfo.fetch();
        if(netInfoState.isConnected){
            try {
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                if(user) {
                    const idToken = await user.getIdToken();
                    const business_id = services.getBusinessId();
                    const app_key = services.getBusinessAppKey();
                    let input_data = {
                        app_key,
                        business_id,
                        business_location_id: this.state.business_location_id,
                        idToken,
                        booking_date: this.state.booking_data[0].booking_date,
                        booking_time: this.state.booking_data[0].booking_time,
                        user_order_id: this.state.booking_data[0].user_order_id
                    };
                    await ServicesApi.updateBooking(input_data);
                    Alert.alert(
                        "Booking Updated",
                        "Your booking has been updated successfully.",
                        [
                            {
                                text: "Ok",
                                onPress: () => {
                                    that.setState({ loading: false });
                                    that.props.navigation.goBack();
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                } else {
                    that.setState({ loading: false });
                    that.context.logout();
                    that.props.navigation.navigate('Home');
                }
            } catch(e) {
                if(e.response && e.response.data && e.response.data.message){
                    let errData = e.response.data;
                    console.log(errData);
                    if(errData.message === "booking time unavailable"){
                        Alert.alert(
                            "Time Unavailable",
                            "This booking time is no longer available. Please choose another booking time.",
                            [
                                {
                                    text: "Ok",
                                    onPress: () => {
                                        that.setState({ loading: false });
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    } else {
                        Alert.alert(
                            "We're sorry",
                            "An error occured and we were unable to update your booking. If the problem persists, please contact support@styler.digital.",
                            [
                                {
                                    text: "Ok",
                                    onPress: () => {
                                        that.setState({ loading: false });
                                        that.props.navigation.goBack();
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    }
                } else {
                    Alert.alert(
                        "We're sorry",
                        "An error occured and we were unable to update your booking. If the problem persists, please contact support@styler.digital.",
                        [
                            {
                                text: "Ok",
                                onPress: () => {
                                    that.setState({ loading: false });
                                    that.props.navigation.goBack();
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                }
            }
        } else {
            Alert.alert(
                "You're offline",
                "Unable to get update booking.",
                [
                    { text: "Ok" }
                ],
                { cancelable: false }
            );
            return;
        }
    }

    getBusinessLocationId() {
        if(this.state.business_location_id) {
            return this.state.business_location_id;
        } else {
            let order_data = this.props.navigation?.state?.params?.orderData;
            return order_data?.business_location_id;
        }
    }

    render() {
        return (
            <Block flex style={{ backgroundColor: this.props.settings.book_background }}>
                {this.state.loading ?
                    <Spinner visible={true} />
                : null
                }
                <Block flex>
                    <WizardFormPage2
                        dateChanged={this.onDateChanged}
                        navigation={this.props.navigation}
                        bookingData={this.state.booking_data}
                        type={'edit'}
                        modifyDateTime={this.modifyDateTime}
                        businessLocationId={this.getBusinessLocationId()}
                    />
                </Block>
                <Block center style={{position: 'absolute', bottom: theme.SIZES.BASE / 2, width: '100%'}}>
                    <Block flex row style={{marginHorizontal: theme.SIZES.BASE / 2}}>
                        <Button
                            center
                            color={this.props.settings.book_footer_next_button}
                            textStyle={styles.optionsText}
                            onPress={() => this.submitUpdateBooking()}
                            style={[styles.footerButton, styles.shadow]}
                        >
                            <Text
                                size={15}
                                color={this.props.settings.book_footer_next_button_text}
                                style={{ fontFamily: 'poppins-medium' }}
                            >
                                Update Booking Time
                            </Text>
                        </Button>
                    </Block>
                </Block>
            </Block>
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(BookingEdit));

const styles = StyleSheet.create({
    wizardHeader: {
      backgroundColor: '#333333',
    },
    footerButton: {
      flex: 1
    }
});