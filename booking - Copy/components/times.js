import React, { Component } from 'react';
import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../../actions/index';
import moment from 'moment';

import { Block, Text, theme, Icon, Button } from 'galio-framework';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

class Times extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedTime: null,
      selectedDate: null
    };
  }

  addDateTime(date, time){
    
    let that = this;
    if(this.props.type && this.props.type === 'add') {
      this.props.bookings.forEach(element => {
        var booking = Object.assign({}, element);
        booking.booking_date = date;
        booking.booking_time = time;
        booking.booking_added = moment();
        that.props.actions.addBookingService(booking);
      });
    } else if(this.props.type && this.props.type === 'edit') {
      this.setState({ selectedTime: time, selectedDate: date });
      this.props.modifyDateTime(date, time);
    }
  }

  render() {
     if(this.props.times.length > 0){
      
      return (
        <Block flex style={{ marginBottom: 70}}>
          <ScrollView overScrollMode='always'>
          {this.props.times.length > 0 && this.props.times.map((time, i) => {
           
            let selected = null;
            
            if(this.props.type && this.props.type === 'add') {
              selected = this.props.bookings[0].booking_time === moment(time).format('HH:SS') && this.props.bookings[0].booking_date === this.props.chosen_date;
            } else if(this.props.type && this.props.type === 'edit') {
              selected = (this.props.bookingData[0].booking_time === moment(time).format('HH:SS') && this.props.bookingData[0].booking_date === this.props.chosen_date) || (this.state.selectedTime === moment(time).format('HH:SS') && this.state.selectedDate === this.props.chosen_date);
            } 
            return (
              
            <Block key={'time' + time} style={{backgroundColor: this.props.settings.book_page_two_time_background, marginHorizontal:theme.SIZES.BASE, marginTop: theme.SIZES.BASE, padding: theme.SIZES.BASE, borderRadius: 5}}>
               <TouchableOpacity onPress={ () => {this.addDateTime(this.props.chosen_date, moment(time).format('HH:SS'))}}>
                 <Block row space="between">
                   <Text
                     size={18}
                     style={{color: this.props.settings.book_page_two_time_text, fontFamily: 'poppins-medium', marginBottom: -6}}
                   >
                     {moment(time).format('HH:mm')}
                   </Text>
                   <Block middle>
                     <Icon
                       name={selected ? 'check' : 'plus'}
                       family="Feather"
                       color={selected ? '#4caf50' : this.props.book_page_two_time_text}
                       size={20}
                     />
                   </Block>
                 </Block>
               </TouchableOpacity>
             </Block>
            );
          })}
          </ScrollView>
        </Block>
      );
    } else {
      return(
        <Block center flex style={{ marginBottom: 70, justifyContent: 'center', alignItems: 'center' }}>
          <Block style={{ backgroundColor: this.props.settings.book_page_two_availability_background, borderRadius: 5}}>
            <Block style={{ padding: theme.SIZES.BASE }}>
              <Text color={this.props.settings.book_page_two_availability_text} size={18} style={{ fontFamily: 'poppins-regular' }}>No availability</Text>
            </Block>
            {this.props.settings.wait_list_enabled === 1 ?
            <TouchableOpacity onPress={() => this.props.navigation.navigate('WaitListAdd', { date: this.props.chosen_date })}>
              <Block style={{ backgroundColor: this.props.settings.book_page_two_availability_wait_list_background, padding: theme.SIZES.BASE / 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                <Block center>
                  <Text
                    style={{ fontFamily: 'poppins-medium' }}
                    color={this.props.settings.book_page_two_availability_wait_list_text}
                  >Join Wait List</Text>
                </Block>
              </Block>
            </TouchableOpacity>
            : null}
          </Block>
        </Block>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    bookings: state.bookings,
    settings: state.settings,
    business_settings: state.details
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Times));


const styles = StyleSheet.create({

})