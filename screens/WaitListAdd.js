import React from 'react';
import { StyleSheet, ScrollView, Dimensions, TouchableOpacity  } from 'react-native';
import { Block, Text, theme, Button, Icon } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import { firebaseApp } from './../api/firebase/config';
import { getAuth } from 'firebase/auth';
import ServicesApi from '../api/services';
import { materialTheme } from '../constants/';
import NetInfo from "@react-native-community/netinfo";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment-timezone';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import { UserContext } from "../providers/userProvider";

const { width } = Dimensions.get('screen');

class WaitListAdd extends React.Component {
    static contextType = UserContext;

    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false,
            start_date: moment(),
            datePickerShow: false,
            timePickerShow: false,
            timePickerField: null,
            start_time: '09:00',
            end_time: '17:00',
            error: null
        }
        this.changeTime = this.changeTime.bind(this);
        this.toggleTimePickerVisibility = this.toggleTimePickerVisibility.bind(this);
        this.changeDate = this.changeDate.bind(this);
        this.toggleDatePickerVisibility = this.toggleDatePickerVisibility.bind(this);
    }

    componentDidMount() {
        if(this.props.navigation.state.params && this.props.navigation.state.params.date){
            this.setState({ start_date: moment(this.props.navigation.state.params.date, 'YYYY-MM-DD') }); 
        }
    }

    addWaitList() {
        let that = this;
        this.setState({ loading: true });
        if(!this.state.start_date){
            this.setState({ loading: false, error: 'A date is required' });
            return;
        }
        if(!this.state.start_time || !this.state.end_time){
            this.setState({ loading: false, error: 'A start and end time is required' });
            return;
        }
        if(moment(this.state.start_time, 'HH:mm') > moment(this.state.end_time, 'HH:mm')){
            this.setState({ loading: false, error: 'The start time must before the end time' });
            return;
        }
        if(moment(this.state.start_date).tz(this.props.business_settings.timezone_name, true) < moment().tz(this.props.business_settings.timezone_name, false).subtract(1, 'day')) {
            this.setState({ loading: false, error: 'The selected date must be in the future' });
            return;
        }
        if(moment(this.state.start_date).tz(this.props.business_settings.timezone_name, true) > moment().tz(this.props.business_settings.timezone_name, false).add(this.props.business_settings.advance_booking, 'month')) {
            this.setState({ loading: false, error: 'The selected date cannot be more than ' + this.props.business_settings.advance_booking + ' month/s in advance of todays date' });
            return;
        }
        let existingWaitListObj = that.props.wait_list.find(x => moment(x.start_date, 'YYYY-MM-DD').format('YYYY-MM-DD') === that.state.start_date.format('YYYY-MM-DD'));
        if(existingWaitListObj){
            this.setState({ loading: false, error: "You're already on the wait list for this date" });
            return;
        }
        NetInfo.fetch().then(state => {
            if(state.isConnected){
                const auth = getAuth(firebaseApp);
                const user = auth.currentUser;
                if(user) {
                    user.getIdToken().then(function(idToken) {
                        let bodyData = {
                            businessId: ServicesApi.getBusinessId(),
                            appKey: ServicesApi.getBusinessAppKey(),
                            idToken: idToken,
                            date: that.state.start_date.format('YYYY-MM-DD'),
                            start_time: that.state.start_time,
                            end_time: that.state.end_time
                        };
                        ServicesApi.addWaitList(bodyData).then(response => {
                            return response.data;
                        }).then((data) => {
                            let newWaitListObject = {
                                user_wait_list_id: data.waitListId,
                                start_date: that.state.start_date.format('YYYY-MM-DD'),
                                end_date: that.state.start_date.format('YYYY-MM-DD'),
                                start_time: that.state.start_time + ':00',
                                end_time: that.state.end_time + ':00'
                            }
                            that.props.actions.addWaitList(newWaitListObject);
                            that.setState({ loading: false });
                            that.props.navigation.goBack();
                        }).catch(function(error) {
                            console.log(error);
                            that.setState({ loading: false, error: 'An unexpected error occured' });
                        });
                    }).catch(function(error) {
                        // Unknown error
                        that.setState({ loading: false, error: 'An unexpected error occured' });
                        console.log(error);
                    });
                } else {
                    // User not signed in
                    that.setState({ loading: false });
                    that.context.logout();
                    that.props.navigation.navigate('Home');
                }
            } else {
                that.setState({ loading: false, error: 'You are currently offline' });
            }
        });
    }

    changeTime(time) {
        if(this.state.timePickerField === 'start'){
          this.setState({ start_time: moment(time).format('HH:mm') });
        } else if(this.state.timePickerField === 'end'){
          this.setState({ end_time: moment(time).format('HH:mm') });
        }
    }

    toggleTimePickerVisibility() {
        this.setState({ timePickerShow: !this.state.timePickerShow });
    }

    changeDate(date) {
        this.setState({ start_date: moment(date) });
    }

    toggleDatePickerVisibility() {
        this.setState({ datePickerShow: !this.state.datePickerShow });
    }

    render() {
        const { navigation } = this.props;
        return (
            <Block flex center style={{backgroundColor: this.props.settings.wait_list_add_background}}>
                {this.state.loading ?
                    <Block>
                        <Spinner visible={true} />
                    </Block>
                : null}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.waitListScroll}>
                    <Block row style={{ paddingBottom: 5 }}>
                        <Text color={this.props.settings.wait_list_add_input_label} style={{ fontFamily: 'poppins-semi-bold' }}>Date</Text>
                    </Block>
                    <Block style={{ paddingBottom: theme.SIZES.BASE }}>
                        <TouchableOpacity onPress={() => this.setState({ datePickerShow: true })}>
                            <Block row style={[styles.input, { borderColor: this.props.settings.wait_list_add_input_border }]}>
                                <Text style={{ padding: theme.SIZES.BASE / 1.2, fontFamily: 'poppins-regular' }} color={this.props.wait_list_add_input_text}>{this.state.start_date && moment.isMoment(this.state.start_date) ? this.state.start_date.format('ddd, Do MMM YYYY') : 'Select date...'}</Text>
                            </Block>
                        </TouchableOpacity>
                    </Block>
                    <Block row style={{ paddingBottom: 5 }}>
                        <Text style={{ fontFamily: 'poppins-semi-bold' }} color={this.props.settings.wait_list_add_input_label}>Time</Text>
                    </Block>
                    <Block row style={{ marginBottom: theme.SIZES.BASE }}>
                        <Block flex>
                            <TouchableOpacity onPress={() => this.setState({ timePickerShow: true, timePickerField: 'start' })}>
                            <Block center style={[styles.input, { borderTopRightRadius: 0, borderBottomRightRadius: 0, width: '100%', borderColor: this.props.settings.wait_list_add_input_border }]}>
                                <Text style={{ padding: theme.SIZES.BASE / 1.5, fontFamily: 'poppins-regular' }} color={this.props.wait_list_add_input_text}>{this.state.start_time ? this.state.start_time : '--:--'}</Text>
                            </Block>
                            </TouchableOpacity>
                        </Block>
                        <Block style={[styles.input, { borderRadius: 0, borderRightWidth: 0, borderLeftWidth: 0, borderColor: this.props.settings.wait_list_add_input_border }]}>
                            <Icon family="Feather" name="minus" style={{ padding: theme.SIZES.BASE / 1.5 }} color={this.props.wait_list_add_input_text}/>
                        </Block>
                        <Block flex>
                            <TouchableOpacity onPress={() => this.setState({ timePickerShow: true, timePickerField: 'end' })}>
                            <Block flex center style={[styles.input, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, width: '100%', borderColor: this.props.settings.wait_list_add_input_border }]}>
                                <Text style={{ padding: theme.SIZES.BASE / 1.5, fontFamily: 'poppins-regular' }} color={this.props.wait_list_add_input_text}>{this.state.end_time ? this.state.end_time : '--:--'}</Text>
                            </Block>
                            </TouchableOpacity>
                        </Block>
                    </Block>
                    <Block flex center style={{ marginBottom: theme.SIZES.BASE, width: '100%'}}>
                        <Button shadowless color={this.props.settings.wait_list_add_button} style={{ width: '100%' }} onPress={() => this.addWaitList()}>
                            <Text style={{ fontFamily: 'poppins-medium' }} color={this.props.settings.wait_list_add_button_text}>Join wait list</Text>
                        </Button>
                    </Block>
                    {this.state.error ?
                        <Block row flex style={{justifyContent: 'center', paddingBottom: theme.SIZES.BASE}}>
                            <Block style={{backgroundColor: materialTheme.COLORS.ERROR, width: '100%', padding: theme.SIZES.BASE, borderRadius: 3}}>
                                <Text color={'#ffffff'} style={{ fontFamily: 'poppins-regular' }}>{this.state.error}</Text>
                            </Block>
                        </Block>
                    : null}
                </ScrollView>
                <DatePicker isVisible={this.state.datePickerShow} currentDate={this.state.start_date} changeDate={this.changeDate} toggleDatePickerVisibility={this.toggleDatePickerVisibility} />
                <TimePicker isVisible={this.state.timePickerShow} currentTime={this.state.timePickerField === 'start' ? this.state.start_time : this.state.end_time} changeTime={this.changeTime} toggleTimePickerVisibility={this.toggleTimePickerVisibility} />
            </Block>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        settings: state.settings,
        business_settings: state.details,
        wait_list: state.wait_list
    }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(WaitListAdd));

const styles = StyleSheet.create({
    waitListScroll: {
        paddingHorizontal: theme.SIZES.BASE,
        width: width,
        marginTop: theme.SIZES.BASE,
        paddingBottom: 70
    },
    product: {
        backgroundColor: theme.COLORS.WHITE,
        marginVertical: theme.SIZES.BASE,
        borderWidth: 0,
        minHeight: 114,
    },
    productTitle: {
        flex: 1,
        flexWrap: 'wrap',
        paddingBottom: 6,
    },
    productDescription: {
        padding: theme.SIZES.BASE / 2,
    },
    imageContainer: {
        elevation: 1,
    },
    image: {
        borderRadius: 3,
        marginHorizontal: theme.SIZES.BASE / 2,
        marginTop: -22,
    },
    horizontalImage: {
        height: 125,
        width: 'auto',
        resizeMode: 'contain'
    },
    fullImage: {
        height: 215,
        width: width - theme.SIZES.BASE * 3,
    },
    shadow: {
        shadowColor: theme.COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
        elevation: 2,
    },
    input: {
        zIndex: 5,
        borderColor: '#e5e6e7',
        borderWidth: 1,
        borderRadius: 5
    },
});