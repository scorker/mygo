import React from 'react';
import { StyleSheet, Dimensions, Platform, TouchableWithoutFeedback, ScrollView, Alert, FlatList, RefreshControl, Animated } from 'react-native';
import { materialTheme } from '../constants';
import { UserContext } from "../providers/userProvider";
import { withNavigation } from '@react-navigation/compat';
import Spinner from 'react-native-loading-spinner-overlay';
import { Block, Text, theme, Button, Icon } from 'galio-framework';
import { firebaseApp } from '../api/firebase/config';
import { getAuth } from 'firebase/auth';
import ServicesApi from '../api/services';
import moment from 'moment-timezone';
import NetInfo from "@react-native-community/netinfo";
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

const { width } = Dimensions.get('screen');

class Bookings extends React.Component {

    static contextType = UserContext
    focusSubscription
    
    constructor() {
      super();
      this.state = {
        loading: true,
        horizontalListSelection: 'upcoming',
        focusSubscription: {},

        userUpcomingOrderData: [],
        userPreviousOrderData: [],
        userOrderEventData: [],
        userRecurringOrderData: [],
        userRecurringEventData: [],

        swipeableRow: [],
        swipeableUid: null,
        swipeableIndex: 0,
      };
    }

    componentDidMount() {
      const { navigation } = this.props;
      const { refresh} = this.context;
     
      //this.props.navigation will come in every component which is in navigator
      focusSubscription = navigation.addListener(
        'willFocus',
        payload => {
            this.GetUserBookings();
            refresh().then(f => {
                if(!f){
                    navigation.navigate('SignIn')
                }
            }).catch(e => {
                navigation.navigate('SignIn')
              })
        }
      )
      this.setState({focusSubscription: focusSubscription});
      this.GetUserBookings();
    }

    componentWillUnmount() {
      this.state.focusSubscription.remove();
    }

    GetUserBookings() {
        let that = this;
        that.setState({ loading: true });
        // Check if online
        NetInfo.fetch().then(state => {
            if(state.isConnected){
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                if(user) {
                    user.getIdToken().then(function(idToken) {
                        let business_id = ServicesApi.getBusinessId();
                        let app_key = ServicesApi.getBusinessAppKey();
                        ServicesApi.getBookings({ idToken: idToken, app_key: app_key, business_id: business_id }).then(response => {
                            return response.data;
                        }).then((data) => {
                            let userUpcomingOrderData = [];
                            let userPreviousOrderData = [];
                            // Sort into upcoming and previous
                            data.order_data.forEach((order_data_obj,) => {
                            let order_data_events = data.order_event_data.filter(x => x.user_order_id == order_data_obj.user_order_id);
                            if(order_data_events.some(x => moment(x.start, 'YYYY-MM-DD HH:mm:ss').tz(that.props.business_settings.timezone_name, true) > moment().tz(that.props.business_settings.timezone_name, false))){
                                userUpcomingOrderData.push(order_data_obj);
                            } else {
                                userPreviousOrderData.push(order_data_obj);
                            }
                            });
                            // Arrange upcoming orders by date
                            if(userUpcomingOrderData.length > 0){
                            userUpcomingOrderData.sort((a,b) => {
                                let a_data_events = data.order_event_data.filter(x => x.user_order_id == a.user_order_id);
                                let b_data_events = data.order_event_data.filter(x => x.user_order_id == b.user_order_id);
                                if(moment(a_data_events[0].start, 'YYYY-MM-DD HH:mm:ss') < moment(b_data_events[0].start, 'YYYY-MM-DD HH:mm:ss')){
                                    return -1;
                                }
                                if(moment(a_data_events[0].start, 'YYYY-MM-DD HH:mm:ss') > moment(b_data_events[0].start, 'YYYY-MM-DD HH:mm:ss')){
                                    return 1;
                                }
                                return 0;
                            });
                            }
                            // Arrange previous orders by date
                            if(userPreviousOrderData.length > 0){
                                userPreviousOrderData.sort((a,b) => {
                                    let a_data_events = data.order_event_data.filter(x => x.user_order_id == a.user_order_id);
                                    let b_data_events = data.order_event_data.filter(x => x.user_order_id == b.user_order_id);
                                    if(moment(a_data_events[0].start, 'YYYY-MM-DD HH:mm:ss') > moment(b_data_events[0].start, 'YYYY-MM-DD HH:mm:ss')){
                                        return -1;
                                    }
                                    if(moment(a_data_events[0].start, 'YYYY-MM-DD HH:mm:ss') < moment(b_data_events[0].start, 'YYYY-MM-DD HH:mm:ss')){
                                        return 1;
                                    }
                                    return 0;
                                });
                            }
                            // Go through recurring orders and assign next date
                            if(data.order_recurring_data.length > 0){
                                data.order_recurring_data.forEach((order_recurring_data_obj, index) => {
                                    try {
                                    let order_recurring_data_events = data.order_recurring_event_data.filter(x => x.user_order_recurring_id == order_recurring_data_obj.user_order_recurring_id);
                                    let cur_date = moment(order_recurring_data_events[0].start_date, 'YYYY-MM-DD').tz(that.props.business_settings.timezone_name, true);
                                    // If start date has not occured yet
                                    if(cur_date < moment().tz(that.props.business_settings.timezone_name, false)){
                                        // Loop to find next occurrence
                                        while (cur_date < moment().tz(that.props.business_settings.timezone_name, false)) {
                                            cur_date.add(order_recurring_data_events[0].frequency_magnitude, order_recurring_data_events[0].frequency_unit);
                                        }
                                        if(order_recurring_data_events[0].end_date && moment(order_recurring_data_events[0].end_date, 'YYYY-MM-DD').tz(that.props.business_settings.timezone_name, true) < cur_date){
                                            cur_date = null;
                                        }
                                    } else {
                                        cur_date = null;
                                    }
                                    } catch(err) {
                                    var cur_date = null;
                                    }
                                    data.order_recurring_data[index].next_date = cur_date;
                                });
                            }
                            // Set state
                            that.setState({ loading: false, userUpcomingOrderData: userUpcomingOrderData, userPreviousOrderData: userPreviousOrderData, userOrderEventData: data.order_event_data, userRecurringOrderData: data.order_recurring_data, userRecurringEventData: data.order_recurring_event_data });
                        });
                    }).catch(function(error) {
                        // Unknown error
                        that.setState({ loading: false });
                        console.log(error);
                    });
                } else {
                    that.setState({ loading: false });
                    that.context.logout();
                    that.props.navigation.navigate('Home');
                }
            } else {
                that.setState({ loading: false });
                Alert.alert(
                    "You're offline",
                    "Unable to get bookings.",
                    [
                        { text: "Ok" }
                    ],
                    { cancelable: false }
                );
            }
        });
    }

    cancelBooking(booking_fee = false){
        this.setState({loading: true});
        let that = this;
        NetInfo.fetch().then(state => {
            if(state.isConnected){
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                if(user) {
                    user.getIdToken().then(function(idToken) {
                        let business_id = ServicesApi.getBusinessId();
                        let app_key = ServicesApi.getBusinessAppKey();
                        ServicesApi.cancelBooking({ idToken: idToken, app_key: app_key, business_id: business_id, user_order_id: that.state.swipeableUid, booking_fee }).then(response => {
                            return response.data;
                        }).then((data) => {
                            that.close(that.state.swipeableIndex);
                            let order_events = that.state.userOrderEventData;
                            order_events.forEach(function(obj, index) {
                                if(obj.user_order_id == that.state.swipeableUid){
                                    order_events[index].status = 'Cancelled';
                                }
                            });
                            that.setState({loading: false, userOrderEventData: order_events});
                        }).catch(function(respError) {
                            let errorMessage = null;
                            if(respError.response && respError.response.data && respError.response.data.message) {
                                errorMessage = "We were unable to cancel this booking. " + respError.response.data.message;
                            } else {
                                errorMessage = "An error occurred and we were unable to cancel this booking. If the problem persists, please contact support@styler.digital."
                            }
                            Alert.alert(
                                "We're sorry",
                                errorMessage,
                                [
                                    { text: "Ok", onPress: () => { that.setState({loading: false}); that.close(that.state.swipeableIndex); } }
                                ],
                                { cancelable: false }
                            );
                        });
                    }).catch(function(error) {
                        that.setState({loading: false});
                        that.close(that.state.swipeableIndex);
                        Alert.alert(
                            "We're sorry",
                            "An error occured. If the problem persists, please contact support@styler.digital.",
                            [
                                { text: "Ok" }
                            ],
                            { cancelable: false }
                        );
                    });
                } else {
                    that.setState({ loading: false });
                    that.context.logout();
                    that.props.navigation.navigate('Home');
                }
            } else {
                that.setState({loading: false});
                that.close(that.state.swipeableIndex);
                Alert.alert(
                    "You're offline",
                    "Unable to cancel booking.",
                    [
                        { text: "Ok" }
                    ],
                    { cancelable: false }
                );
            }
        });
    }

    renderRightAction = (progress, index, user_order_id) => {
        const trans = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [160, 0],
        });
        const editPressHandler = () => {
            this.setState({ swipeableIndex: index, swipeableUid: user_order_id });
            let orderData = this.state.userUpcomingOrderData.find(x => x.user_order_id === user_order_id);
            let orderEvents = this.state.userOrderEventData.filter(x => x.user_order_id === user_order_id);
            if(orderEvents[0].status == 'Cancelled'){
                this.close(index);
                return;
            }
            let isEditAllowed = moment(orderEvents[0].start, 'YYYY-MM-DD HH:mm:ss').tz(this.props.business_settings.timezone_name, true).diff(moment().tz(this.props.business_settings.timezone_name, false), 'hour', true) > this.props.business_settings.cancellation_period;
            if(isEditAllowed){
                this.props.navigation.navigate('BookingEdit', { orderData, orderEvents });
            } else {
                Alert.alert(
                    "Unable to edit",
                    this.props.business_settings.business_name + " operates a " + this.props.business_settings.cancellation_period + " hour cancellation policy.",
                    [
                        {
                            text: "Ok",
                            onPress: () => {
                                this.close(this.state.swipeableIndex);
                            }
                        }
                    ],
                    { cancelable: false }
                );
            }
        };
        const cancelPressHandler = () => {

            this.setState({ swipeableIndex: index, swipeableUid: user_order_id });

            let orderEvents = this.state.userOrderEventData.filter(x => x.user_order_id == user_order_id);
            if(orderEvents[0].status == 'Cancelled'){
                this.close(index);
                return;
            }
            let isCancelAllowed = moment(orderEvents[0].start, 'YYYY-MM-DD HH:mm:ss').tz(this.props.business_settings.timezone_name, true).diff(moment().tz(this.props.business_settings.timezone_name, false), 'hour', true) > this.props.business_settings.cancellation_period;
            if(isCancelAllowed){
                Alert.alert(
                    "Are you sure?",
                    "Are you sure that you want to cancel this booking?",
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
                                this.cancelBooking(false);
                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                if(this.props.business_settings.cancellation_fee_enabled && this.props.business_settings.cancellation_fee_enabled === 1 && this.props.business_settings.cancellation_fee_percentage && this.props.business_settings.cancellation_fee_percentage > 0) {
                    Alert.alert(
                        "Cancellation Fee",
                        this.props.business_settings.business_name + " operates a " + this.props.business_settings.cancellation_period + " hour cancellation policy. You can still choose to cancel but you will be charged a late-cancellation fee of " + this.props.business_settings.cancellation_fee_percentage + "% of the total booking value. Are you sure you want to cancel?",
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
                                    this.cancelBooking(true);
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                } else {
                    Alert.alert(
                        "Unable to cancel",
                        this.props.business_settings.business_name + " operates a " + this.props.business_settings.cancellation_period + " hour cancellation policy.",
                        [
                            {
                                text: "Ok",
                                onPress: () => {
                                    this.close(this.state.swipeableIndex);
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                }
            }
        };
        return (
            <Block style={{ width: 160, flexDirection: 'row' }}>
                <Animated.View useNativeDriver={true} style={{ flex: 1, flexDirection: 'row', transform: [{ translateX: trans }] }}>
                    <RectButton
                    style={[{alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#ff9800' }]}
                    onPress={editPressHandler}>
                        <Text style={{color: 'white', fontSize: 16, backgroundColor: 'transparent', padding: 10}}>Edit</Text>
                    </RectButton>
                    <RectButton
                    style={[{alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#f44336' }]}
                    onPress={cancelPressHandler}>
                        <Text style={{color: 'white', fontSize: 16, backgroundColor: 'transparent', padding: 10}}>Cancel</Text>
                    </RectButton>
                </Animated.View>
            </Block>
        );
    };

    close = (index) => {
        if(this.state.swipeableRow) {
            this.state.swipeableRow[index].close();
        }
    };

    renderBookings(){
        if(this.state.horizontalListSelection == 'previous' && this.state.userPreviousOrderData?.length > 0){
            return(
                <Block style={{margin: theme.SIZES.BASE}}>
                    {this.state.userPreviousOrderData.map((userOrderObj, index) => {
                        let orderEvents = this.state.userOrderEventData.filter(x => x.user_order_id == userOrderObj.user_order_id);
                        if(orderEvents?.length === 0) {
                            return;
                        }
                        let total = 0;
                        let total_poa = false;
                        orderEvents?.forEach((orderEvent, index) => {
                            if(orderEvent.service_business_detail_poa === 1){
                                total_poa = true;
                            } else {
                                total = total + Number(orderEvent.service_business_detail_price);
                            }
                        });
                        let cancelled = orderEvents[0].status == 'Cancelled';
                        return (
                            <Block flex style={[{ borderRadius: 5, backgroundColor: '#ffffff', borderLeftWidth: 8, padding: theme.SIZES.BASE, marginBottom: theme.SIZES.BASE }, cancelled ? {borderColor: '#f44336'} : {borderColor: '#8a8a8a'}]} key={"Previous" + index}>
                                <Block row flex>
                                    <Text size={15} style={{ fontFamily: 'poppins-semi-bold' }}>{moment(orderEvents[0].start, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')}</Text>
                                    <Text size={15} style={{ fontFamily: 'poppins-regular' }}>, {moment(orderEvents[0].start, 'YYYY-MM-DD HH:mm:ss').format('ddd Do MMM YYYY')}</Text>
                                    {cancelled ? <Text color={'#f44336'} style={{ fontFamily: 'poppins-semi-bold' }}> CANCELLED</Text> : null}
                                </Block>
                                {userOrderObj?.business_location_name ? (
                                    <Block flex row style={{ marginTop: theme.SIZES.BASE, alignItems: 'center' }}>
                                        <Icon name="map-pin" family="Feather" size={13} />
                                        <Text size={13.5} style={{ fontFamily: 'poppins-regular', marginLeft: 5 }}>{userOrderObj?.business_location_name}</Text>
                                    </Block>
                                ) : null}
                                <Block flex style={{ paddingVertical: theme.SIZES.BASE }}>
                                    {orderEvents?.map((userOrderEventObj, index) => {
                                        let E_start = moment(userOrderEventObj.start, 'YYYY-MM-DD HH:mm:ss');
                                        let E_end = moment(userOrderEventObj.end, 'YYYY-MM-DD HH:mm:ss');
                                        return (
                                            <Block flex key={'PreviousEvent' + userOrderEventObj.business_event_id} style={orderEvents.length > 1 ? {marginBottom: 10} : null}>
                                                <Text size={14} style={{ fontFamily: 'poppins-regular' }}>{userOrderEventObj.service_name ? userOrderEventObj.service_name.replace('%comma%', ',').replace('%apostrophe%', "'") : null} ({userOrderEventObj.service_business_detail_name ? userOrderEventObj.service_business_detail_name.replace('%comma%', ',').replace('%apostrophe%', "'") : null})</Text>
                                                <Text size={13} muted style={{ fontFamily: 'poppins-regular' }}>{E_end.diff(E_start, 'minutes')} mins with {userOrderEventObj.firstname + ' ' + userOrderEventObj.lastname}</Text>
                                                <Text size={14} style={{position: 'absolute', right: 10, fontFamily: 'poppins-regular' }}>{userOrderEventObj.service_business_detail_poa === 1 ? null : this.props.business_settings.currency_symbol}{userOrderEventObj.service_business_detail_poa === 1 ? 'POA' : Number(userOrderEventObj.service_business_detail_price / 100).toFixed(2)}</Text>
                                            </Block>
                                        );
                                    })}
                                    {orderEvents && orderEvents.length > 1 ?
                                    <Block row flex style={{marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#000000'}}>
                                        <Text size={14} style={{ fontFamily: 'poppins-semi-bold' }}>Total</Text>
                                        <Text size={14} style={{position: 'absolute', right: 10, top: 10, fontFamily: 'poppins-semi-bold'}}>{total_poa ? 'POA + ': null}{this.props.business_settings.currency_symbol}{Number(total / 100).toFixed(2)}</Text>
                                    </Block>
                                    : null}
                                </Block>
                                <Block row flex>
                                    <Text size={11} style={{ fontFamily: 'poppins-regular' }}>Booking Ref: </Text>
                                    <Text size={11} style={{ fontFamily: 'poppins-semi-bold' }}>{userOrderObj.user_order_uid}</Text>
                                </Block>
                            </Block>
                        );
                    })
                    }
                </Block>
            );
        } else if(this.state.horizontalListSelection == 'upcoming' && this.state.userUpcomingOrderData?.length > 0){          
            return(
                <Block style={{margin: theme.SIZES.BASE}}>
                    {this.state.userUpcomingOrderData.map((userOrderObj, index) => {
                        let orderEvents = this.state.userOrderEventData.filter(x => x.user_order_id == userOrderObj.user_order_id);
                        if(orderEvents?.length === 0) {
                            return;
                        }
                        let total = 0;
                        let total_poa = false;
                        orderEvents?.forEach((orderEvent, index) => {
                            if(orderEvent.service_business_detail_poa === 1){
                                total_poa = true;
                            } else {
                                total = total + Number(orderEvent.service_business_detail_price);
                            }
                        });
                        let cancelled = orderEvents[0].status == 'Cancelled';
                        return (
                                <Block flex style={[{ borderRadius: 5, backgroundColor: '#ffffff', borderLeftWidth: 8, marginBottom: theme.SIZES.BASE }, cancelled ? {borderColor: '#f44336'} : {borderColor: '#4caf50'}]} key={"Upcoming" + index}>
                                    <GestureHandlerRootView>
                                        <Swipeable ref={ref => this.state.swipeableRow[index] = ref} friction={2} rightThreshold={15} renderRightActions={(data) => this.renderRightAction(data, index, userOrderObj.user_order_id) }>
                                            <Block style={{padding: theme.SIZES.BASE}}>
                                                <Block row flex>
                                                    <Text size={15} style={{ fontFamily: 'poppins-semi-bold' }}>{moment(orderEvents[0].start, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')}</Text>
                                                    <Text size={15} style={{ fontFamily: 'poppins-regular' }}>, {moment(orderEvents[0].start, 'YYYY-MM-DD HH:mm:ss').format('ddd Do MMM YYYY')}</Text>
                                                    {cancelled ? <Text bold color={'#f44336'} style={{ fontFamily: 'poppins-semi-bold' }}> CANCELLED</Text> : null}
                                                </Block>
                                                {userOrderObj?.business_location_name ? (
                                                    <Block flex row style={{ marginTop: theme.SIZES.BASE, alignItems: 'center' }}>
                                                        <Icon name="map-pin" family="Feather" size={13} />
                                                        <Text size={13.5} style={{ fontFamily: 'poppins-regular', marginLeft: 5 }}>{userOrderObj?.business_location_name}</Text>
                                                    </Block>
                                                ) : null}
                                                <Block flex style={{ paddingVertical: theme.SIZES.BASE }}>
                                                    {orderEvents.map((userOrderEventObj, index) => {
                                                        var E_start = moment(userOrderEventObj.start, 'YYYY-MM-DD HH:mm:ss');
                                                        var E_end = moment(userOrderEventObj.end, 'YYYY-MM-DD HH:mm:ss');
                                                        return (
                                                            <Block flex key={'UpcomingEevent' + userOrderEventObj.business_event_id} style={orderEvents.length > 1 ? {marginBottom: 10} : null}>
                                                                <Text size={14} style={{ fontFamily: 'poppins-regular' }}>{userOrderEventObj.service_name} ({userOrderEventObj.service_business_detail_name})</Text>
                                                                <Text size={13} muted style={{ fontFamily: 'poppins-regular' }}>{E_end.diff(E_start, 'minutes')} mins with {userOrderEventObj.firstname + ' ' + userOrderEventObj.lastname}</Text>
                                                                <Text size={14} style={{position: 'absolute', right: 10, fontFamily: 'poppins-regular'}}>{userOrderEventObj.service_business_detail_poa === 1 ? null : this.props.business_settings.currency_symbol}{userOrderEventObj.service_business_detail_poa === 1 ? 'POA' : Number(userOrderEventObj.service_business_detail_price / 100).toFixed(2)}</Text>
                                                            </Block>
                                                        );
                                                    })}
                                                    {orderEvents && orderEvents.length > 1 ?
                                                        <Block row flex style={{marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#000000'}}>
                                                            <Text size={14} style={{ fontFamily: 'poppins-semi-bold' }}>Total</Text>
                                                            <Text size={14} style={{position: 'absolute', right: 10, top: 10, fontFamily: 'poppins-semi-bold'}}>{total_poa ? 'POA + ': null}{this.props.business_settings.currency_symbol}{Number(total / 100).toFixed(2)}</Text>
                                                        </Block>
                                                    : null}
                                                </Block>
                                                <Block row flex>
                                                    <Text size={11} style={{ fontFamily: 'poppins-regular' }}>Booking Ref: </Text>
                                                    <Text size={11} style={{ fontFamily: 'poppins-semi-bold' }}>{userOrderObj.user_order_uid}</Text>
                                                </Block>
                                            </Block>
                                        </Swipeable>
                                    </GestureHandlerRootView>
                                </Block>
                        );
                    })
                    }
                </Block>
            );
        } else if(this.state.horizontalListSelection == 'recurring' && this.state.userRecurringOrderData?.length > 0){
            return(
                <Block style={{margin: theme.SIZES.BASE}}>
                    {this.state.userRecurringOrderData.map((userOrderObj, index) => {
                        let orderEvents = this.state.userRecurringEventData.filter(x => x.user_order_recurring_id == userOrderObj.user_order_recurring_id);
                        if(orderEvents?.length === 0) {
                            return;
                        }
                        let total = 0;
                        let total_poa = false;
                        orderEvents?.forEach((orderEvent, index) => {
                            if(orderEvent.service_business_detail_poa === 1){
                                total_poa = true;
                            } else {
                                total = total + Number(orderEvent.service_business_detail_price);
                            }
                        });
                        return (
                            <Block flex style={[{ borderRadius: 5, backgroundColor: '#ffffff', borderLeftWidth: 8, padding: theme.SIZES.BASE, marginBottom: theme.SIZES.BASE }, orderEvents[0].end_date && moment().tz(this.props.business_settings.timezone_name, false) > moment(orderEvents[0].end_date, 'YYYY-MM-DD').tz(this.props.business_settings.timezone_name, true) ? {borderColor: '#8a8a8a'} : {borderColor: '#4caf50'}]} key={"Recurring" + index}>
                                <Block row flex>
                                    <Text size={15} style={{ fontFamily: 'poppins-semi-bold' }}>{moment(orderEvents[0].start_time, 'HH:mm:ss').format('HH:mm')} - {moment(orderEvents[orderEvents.length - 1].end_time, 'HH:mm:ss').format('HH:mm')}</Text>
                                    <Icon name="repeat" family="Feather" color={'#000000'} size={12} style={{position: 'absolute', right: 10}} />
                                </Block>
                                <Block flex>
                                    {userOrderObj.next_date ? <Text style={{paddingTop: 3, fontFamily: 'poppins-regular'}}>Next date: {userOrderObj.next_date.format('ddd Do MMM YYYY')}</Text> : null}
                                    <Text style={{paddingVertical: 3, fontFamily: 'poppins-regular'}}>Start date: {moment(orderEvents[0].start_date, 'YYYY-MM-DD').format('ddd Do MMM YYYY')}</Text>
                                    <Text style={{paddingTop: 3, fontFamily: 'poppins-regular'}}>End date: {orderEvents[0].end_date ? moment(orderEvents[0].end_date, 'YYYY-MM-DD').format('ddd Do MMM YYYY') : '------'}</Text>
                                </Block>
                                {userOrderObj?.business_location_name ? (
                                    <Block flex row style={{ marginTop: theme.SIZES.BASE, alignItems: 'center' }}>
                                        <Icon name="map-pin" family="Feather" size={13} />
                                        <Text size={13.5} style={{ fontFamily: 'poppins-regular', marginLeft: 5 }}>{userOrderObj?.business_location_name}</Text>
                                    </Block>
                                ) : null}
                                <Block flex style={{paddingVertical: theme.SIZES.BASE}}>
                                    {orderEvents.map((userOrderEventObj, index) => {
                                        let E_start = moment(userOrderEventObj.start_time, 'HH:mm:ss');
                                        let E_end = moment(userOrderEventObj.end_time, 'HH:mm:ss');
                                        return (
                                            <Block flex key={'RecurringEvent' + userOrderEventObj.business_event_recurring_id} style={orderEvents.length > 1 ? {marginBottom: 10} : null}>
                                                <Text size={14} style={{ fontFamily: 'poppins-regular' }}>{userOrderEventObj.service_name} ({userOrderEventObj.service_business_detail_name})</Text>
                                                <Text size={13} muted style={{ fontFamily: 'poppins-regular' }}>{E_end.diff(E_start, 'minutes')} mins with {userOrderEventObj.firstname + ' ' + userOrderEventObj.lastname}</Text>
                                                <Text size={14} style={{position: 'absolute', right: 10, fontFamily: 'poppins-regular'}}>{userOrderEventObj.service_business_detail_poa === 1 ? null : this.props.business_settings.currency_symbol}{userOrderEventObj.service_business_detail_poa === 1 ? 'POA' : Number(userOrderEventObj.service_business_detail_price / 100).toFixed(2)}</Text>
                                            </Block>
                                        );
                                    })}
                                    {orderEvents && orderEvents.length > 1 ?
                                    <Block row flex style={{marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#000000'}}>
                                        <Text size={14} style={{ fontFamily: 'poppins-semi-bold' }}>Total</Text>
                                        <Text size={14} style={{position: 'absolute', right: 10, top: 10, fontFamily: 'poppins-semi-bold'}}>{total_poa ? 'POA + ': null}{this.props.business_settings.currency_symbol}{Number(total / 100).toFixed(2)}</Text>
                                    </Block>
                                    : null}
                                </Block>
                                <Block row flex>
                                    <Text size={11} style={{ fontFamily: 'poppins-regular' }}>Booking Ref: </Text>
                                    <Text size={11} style={{ fontFamily: 'poppins-semi-bold' }}>{userOrderObj.user_order_recurring_uid}</Text>
                                </Block>
                            </Block>
                        );
                    })
                    }
                </Block>
            );
        } else {
            return(null);
        }
    }

    toggleHorizontalList(id) {
        this.setState({ horizontalListSelection: id });
    }

    render(){
        const horizontalListData = [
            {
                id: 'upcoming',
                title: 'Upcoming'
            },
            {
                id: 'recurring',
                title: 'Recurring'
            },
            {
                id: 'previous',
                title: 'Previous'
            }
        ];
        const renderHorizontalListItem = ({ item }) => (
            <TouchableWithoutFeedback onPress={() => { this.toggleHorizontalList(item.id) }}>
                <Block style={[{marginLeft: theme.SIZES.BASE, marginRight: theme.SIZES.BASE, paddingVertical: theme.SIZES.BASE}, this.state.horizontalListSelection == item.id ? {borderColor: this.props.settings.bookings_header_active_text, borderBottomWidth: 2} : null]}>
                    <Text
                        color={this.state.horizontalListSelection === item.id ? this.props.settings.bookings_header_active_text : this.props.settings.bookings_header_text}
                        size={16}
                        style={this.state.horizontalListSelection === item.id ? { fontFamily: 'poppins-medium' } : { fontFamily: 'poppins-regular' }}
                    >
                        {item.title}
                    </Text>
                </Block>
            </TouchableWithoutFeedback>
        );
        return(
            <Block flex style={[styles.container, {backgroundColor: this.props.settings.bookings_background}]}>
                <Spinner visible={this.state.loading} />
                <Block style={{backgroundColor: this.props.settings.bookings_header}}>
                    <FlatList horizontal={true}
                        data={horizontalListData}
                        keyExtractor={item => item.id}
                        renderItem={renderHorizontalListItem}
                    />
                </Block>
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={this.state.loading} onRefresh={() => {this.GetUserBookings()}} />
                    }
                >
                    {this.renderBookings()}
                    {this.state.horizontalListSelection == 'upcoming' && this.state.userUpcomingOrderData.length == 0 || this.state.horizontalListSelection == 'recurring' && this.state.userRecurringOrderData.length == 0 || this.state.horizontalListSelection == 'previous' && this.state.userPreviousOrderData.length == 0 ?
                        <Block style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: '55%'}}>
                            <Text
                                color={this.props.settings.bookings_background_text}
                                size={16}
                                center
                                style={{ fontFamily: 'poppins-regular' }}
                            >
                                You have no {this.state.horizontalListSelection} bookings
                            </Text>
                        </Block>
                    : null}
                </ScrollView>
            </Block>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
      settings: state.settings,
      business_settings: state.details
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
  }

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Bookings))

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BLACK,
    marginTop: 0,
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    zIndex: 3,
    position: 'absolute',
    bottom: Platform.OS === 'android' ? theme.SIZES.BASE * 2 : theme.SIZES.BASE * 3,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 8,
    marginLeft: 12,
    borderRadius: 2,
    height: 22
  },
  gradient: {
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 66,
  },
  productTitle: {
    alignItems: 'center'
  },
  userInfo: {
      paddingLeft:'5%',
      paddingRight: '5%',
      paddingBottom: '2%'
  },
  orderHistory: {
      backgroundColor: theme.COLORS.WHITE,
      flexDirection: 'row',
  },
  orderButton: {
      width:'45%',
  },
  orders: {
      paddingBottom:'100%',
  },
});
