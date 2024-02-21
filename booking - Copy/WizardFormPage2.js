import React from 'react';
import { reduxForm } from 'redux-form';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import * as services from '../api/services';

import { Calendar } from 'react-native-calendars';

import Spinner from 'react-native-loading-spinner-overlay';

import Times from './components/times';
import moment from 'moment-timezone';

import NetInfo from "@react-native-community/netinfo";

import { Block } from 'galio-framework';
import { StyleSheet, Alert } from 'react-native';

import ServicesApi from '../api/services';

const very_busy = { key: 'very_busy', color: 'red' };
const busy = { key: 'busy', color: 'blue' };
const quiet = { key: 'quiet', color: 'green' };

class WizardFormPage2 extends React.Component {
  
  constructor(props, context) {

    super(props, context);
    this.state= {
      closed_days: [],
      date: new Date(),
      available_times: [],
      selected_times: [],
      chosen_date: null,
      times_loading: true,
      booking_range: this.props.business_settings.advance_booking,
    }

  }

  componentDidMount() {
    // Fetch closed days
    
    let curDate = moment().tz(this.props.business_settings.timezone_name);
    
    if(this.props.isInReview) {
      this.setState({
        closed_days: [],
        chosen_date: curDate.format('YYYY-MM-DD')
      });
      this.fetchAvailableTimes(curDate.format('YYYY-MM-DD'));
    } else {
      services.getOpeningHours(curDate.format('YYYY-MM-DD'), moment(curDate).add(this.state.booking_range, 'month').format('YYYY-MM-DD'), this.props.businessLocationId).then(closed_days => {
        let closed = closed_days.data.filter(x => x.open === 0);
        this.setState({
          closed_days: closed.map(x => moment(x.date, 'YYYY-MM-DD').format('YYYY-MM-DD')),
          chosen_date: curDate.format('YYYY-MM-DD')
        });
        
        this.fetchAvailableTimes(curDate.format('YYYY-MM-DD'));
      }).catch(e => {
        console.log(e);
      });
    }
    this.props.actions.paymentStatus({});
  }

  createKey(locationId, businessId, staffId) {
    if(!staffId)
        staffId = "*";
    
    var skey = "sensor_" + locationId + "_" + businessId + "_" + staffId;
    return skey;
 }


  filterAvailableTimes(available_times, date) { 
      var splitRedisData = [];
      
      const times = available_times.filter(x => new Date(x.timestamp * 1000).toDateString() == new Date(date).toDateString());
      const interval = times[0].value;

      for (const y of times) {

        var tstart2 = y.timestamp;
        var tend2 = 0;
        var matchingKeys  = '';
        var exists = false;
        var newStart;
        var t = new Date(y.timestamp * 1000);
        
         for  (const f of this.props.bookings) {
          
              var duration = f.duration;
              if(duration < interval) 
                  duration = interval;
              else { 
                  if (duration % interval > 0) 
                      duration = (duration / interval) + 1;
                  else 
                      duration = (duration / interval);
              } 
              
              tend2 = (tstart2 + (duration * 60));
              
              var skey = this.createKey(this.props.businessLocationId,services.getBusinessId(),f.staff_id);
              // if(matchingKeys == '')
              //     matchingKeys = await redisClient.keys(skey)
              
              for (const match of [skey]) {
                
                  let redisData2;
                  if(!redisData2)
                      redisData2 = times.filter(x => x.key == match && x.timestamp >= tstart2 && x.timestamp <= tend2);
                  
                  var searchSpan = (tend2 - tstart2) / (interval * 60);
                 
                  if(redisData2.length > 0)
                  {
                      if(t >= new Date().getTime()) {
                          if(duration == interval) {
                              exists = true;
                              newStart = redisData2[0].timestamp;
                          }
                          else if(duration > interval) {
                              if(searchSpan == redisData2.length){
                                  exists = true;
                                  newStart = redisData2[0].timestamp;
                              }
                          }

                      }
                  } else
                      exists = false;

              }
              
              if(!exists) 
                  break;
                  
              if(newStart)
                  tstart2 = tend2;
              else
                  tstart2 = newStart + (duration * 60);

          }

          if(exists && (moment(t).format('hh:mm:ss') != "12:00:59")) {
            splitRedisData.push(t);
          }
      }

      const passedDate = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD HH:MM');
      this.setState({selected_times: splitRedisData, chosen_date: passedDate});
  }

  fetchAvailableTimes(date) {
    
    let that = this;
    this.setState({times_loading: true});
    let passedDate = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
    
    if(this.props.isInReview) {
      this.setState({
        chosen_date: passedDate,
        date: date,
        available_times: [{ booking_time: "09:00" }],
        times_loading: false
      });
      return;
    }
   
    if(moment(date).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
      let f = new Date().getHours();
      let g = new Date().getMinutes();
      passedDate = moment(date, 'YYYY-MM-DD').add(f, 'hour').add(g, 'minute').format('YYYY-MM-DD HH:MM');
    } else {
      passedDate = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD HH:MM');
    }
    
    let duration;
    let totalDuration = 0;

    let booking_data = this.props.type === 'add' ? this.props.bookings : this.props.bookingData;

    booking_data.forEach(f => {
      let serviceDetailData = this.props.serviceDetail.find(x => x.service_business_detail_id == f.service_business_detail_id);
      if(serviceDetailData?.service_business_detail_split === 1) {
        duration = serviceDetailData?.service_business_detail_duration_a + serviceDetailData?.service_business_detail_duration_break + serviceDetailData?.service_business_detail_duration_b;
        totalDuration = totalDuration + duration;
        f.duration = duration;
      } else {
        duration = serviceDetailData?.service_business_detail_duration_a;
        totalDuration = totalDuration + duration;
        f.duration = duration;
      }
    });

    NetInfo.fetch().then(state => {
      if(state.isConnected){

        let input_data = {
          business_id: services.getBusinessId(),
          booking_date: passedDate,
          booking_data: booking_data,
          user_id: this.props.user.user_id,
          business_location_id: this.props.businessLocationId,
          duration: totalDuration
        };

        ServicesApi.bookingTimes(input_data).then(response => { 
          return response.data;
        }).then((data) => {
          that.setState({ chosen_date: passedDate, date: date, available_times: data ? data : [], times_loading: false});
          that.filterAvailableTimes(data, date);
        }).catch(function(error) {
          console.log(error);
          that.setState({ available_times: [], times_loading: false, chosen_date: passedDate, date: date });
        });
      } else {
        that.setState({ times_loading: false, available_times: [] });
        Alert.alert(
            "You're offline",
            "Unable to get availability.",
            [ 
                { text: "Ok" }
            ],
            { cancelable: false }
        );
      }
    });
  }

  render() {
    let that = this;
    const startDate = moment().tz(this.props.business_settings.timezone_name, false).format('YYYY-MM-DD');
    const endDate = moment().tz(this.props.business_settings.timezone_name, false).add(this.state.booking_range, 'month').format('YYYY-MM-DD');
    let markedDates = {};

    markedDates[this.state.chosen_date] = {selected: true};
    
    if(this.state.available_times.length > 0) {
      const dotDates = this.state.available_times.map(x => x.value > 1 ? x.value : moment(new Date(x.timestamp * 1000)).format('YYYY-MM-DD'));
    
      const distinctDates = dotDates.filter((date, i, self) => 
        self.findIndex(d => new Date(d).toDateString() === new Date(date).toDateString()) === i
      );
      
      distinctDates.forEach(x => {
        let slotsX = this.state.available_times.filter(y => moment(new Date(y.timestamp * 1000)).format('YYYY-MM-DD') == x && y.value == 1);
        
        if(slotsX.length > 0) {
         
          let start = moment(new Date(slotsX[0].timestamp * 1000));
          let slotEnd = slotsX[slotsX.length - 1];
          let end =  moment(new Date(slotEnd.timestamp * 1000));
          let interval = this.state.available_times.find(y => moment(new Date(y.timestamp * 1000)).format('YYYY-MM-DD') == x && y.value > 1);

          let proportion = 0;
        
          let diff = Math.floor(((new Date(end) - new Date(start)) / 1000) / 60);
          
          if(slotsX.length > 0 && diff > 0)
            proportion = slotsX.length / (diff / interval.value);
          
          if (proportion >= 0.75)
            markedDates[x] = {dots: [quiet, quiet, quiet]};
          else if(proportion >= 0.4 && proportion < 0.75)
            markedDates[x] =  {dots: [busy, busy]};
          else if(proportion > 0 && proportion < 0.4)
            markedDates[x] =   {dots: [very_busy]};
        
        }
      });
    }

    this.state.closed_days.forEach((closedDate, index) => {
      markedDates[closedDate] = {disabled: true, disableTouchEvent: true};
    });
    
    return (
      
        <Block flex>
          {this.state.times_loading ?
            <Block>
              <Spinner visible={true} />
            </Block>
          : null
          }
          <Block flex>
              <Block style={{backgroundColor: '#ffffff', height: 360 }}>
                <Calendar
                  current={this.state.date}
                  markingType={'multi-dot'}
                  minDate={startDate}
                  maxDate={endDate}
                  firstDay={1}
                  disableAllTouchEventsForDisabledDays={true}
                  onDayPress={(day) => { this.props.dateChanged(day.dateString).then(() => {that.filterAvailableTimes(that.state.available_times, day.dateString)}); }}
                  markedDates={markedDates}
                  theme={{
                    selectedDayBackgroundColor: this.props.settings.book_page_two_calendar_selected_background,
                    selectedDayTextColor: this.props.settings.book_page_two_calendar_selected_text,
                    todayTextColor: this.props.settings.book_page_two_calendar_selected_text,
                    arrowColor: this.props.settings.book_page_two_calendar_arrow,
                    textMonthFontSize: 22,
                    textDayFontSize: 18,
                    monthTextColor: this.props.settings.book_page_two_calendar_month,
                    calendarBackground: this.props.settings.book_page_two_calendar_background,
                    textSectionTitleColor: this.props.settings.book_page_two_calendar_day,
                    textDisabledColor: this.props.settings.book_page_two_calendar_disabled,
                    textDayFontFamily: 'poppins-regular',
                    textMonthFontFamily: 'poppins-medium',
                    textDayHeaderFontFamily: 'poppins-semi-bold',
                  }}
                />
            </Block>
            <Times chosen_date={this.state.chosen_date} times={this.state.selected_times} navigation={this.props.navigation} type={this.props.type} bookingData={this.props.type && this.props.type === 'edit' ? this.props.bookingData : null} modifyDateTime={this.props.type && this.props.type === 'edit' ? this.props.modifyDateTime : null} />
          </Block>
        </Block>
    );
  };
}

function mapStateToProps(state, ownProps) {
  return {
    bookings: state.bookings,
    business_settings: state.details,
    settings: state.settings,
    user: state.user,
    serviceDetail: state.serviceDetail
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

})(WizardFormPage2));



//still not finished add in some 'theme' from galio
const styles = StyleSheet.create({
})