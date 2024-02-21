import React from 'react';
import { View, Platform } from 'react-native'
import { Block, theme, Text, Button } from 'galio-framework';
import Modal from "react-native-modal";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import { withNavigation } from '@react-navigation/compat';

class DatePicker extends React.Component {

  render() {
    const { isVisible, toggleDatePickerVisibility, changeDate, currentDate } = this.props;
    if(Platform.OS === 'ios'){
      return (
        <View key={0} style={{flex: 1}}>
          <Modal backdropOpacity={0.5} isVisible={isVisible} onBackdropPress={() => toggleDatePickerVisibility(false)} style={{justifyContent: 'flex-end', marginHorizontal: theme.SIZES.BASE, marginVertical: 0}}>
            <Block style={{backgroundColor: this.props.settings.date_picker_background, borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
                <Text size={24} style={{textAlign: 'center', padding: theme.SIZES.BASE, color: this.props.settings.date_picker_title, fontFamily: 'poppins-regular'}}>Select Date</Text>
                <Block style={{ width: '100%' }}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={currentDate ? moment(currentDate, 'HH:mm').toDate() : new Date()}
                    mode="date"
                    is24Hour={true}
                    display="spinner"
                    textColor={this.props.settings.date_picker_date}
                    onChange={(e, date) => changeDate(date)}
                  />
                  <Button shadowless style={{ width: '100%', borderRadius: 0, margin: 0 }} color={this.props.settings.date_picker_button} onPress={() => toggleDatePickerVisibility(false)}>
                    <Text color={this.props.settings.date_picker_button_text} style={{ fontFamily: 'poppins-medium' }}>Confirm</Text>
                  </Button>
                </Block>
            </Block>
          </Modal>
        </View>
      );
    } else if(Platform.OS === 'android') {
      return (
        <View>
          {isVisible &&
          <DateTimePicker
            testID="dateTimePicker"
            value={currentDate ? moment(currentDate, 'HH:mm').toDate() : new Date()}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={(e, date) => { toggleDatePickerVisibility(false); changeDate(date); }}
          />}
        </View>
      );
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(DatePicker));