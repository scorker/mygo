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

class TimePicker extends React.Component {

  render() {
    const { isVisible, toggleTimePickerVisibility, changeTime, currentTime } = this.props;
    if(Platform.OS === 'ios'){
      return (
        <View key={0} style={{flex: 1}}>
          <Modal backdropOpacity={0.5} isVisible={isVisible} onBackdropPress={() => toggleTimePickerVisibility(false)} style={{justifyContent: 'flex-end', marginHorizontal: theme.SIZES.BASE, marginVertical: 0}}>
            <Block style={{backgroundColor: this.props.settings.time_picker_background, borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
                <Text size={24} style={{textAlign: 'center', padding: theme.SIZES.BASE, color: this.props.settings.time_picker_title, fontFamily: 'poppins-regular'}}>Select Time</Text>
                <Block style={{ width: '100%' }}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={currentTime ? moment(currentTime, 'HH:mm').toDate() : new Date()}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    minuteInterval={5}
                    textColor={this.props.settings.time_picker_time}
                    onChange={(e, date) => changeTime(date)}
                  />
                  <Button shadowless style={{ width: '100%', borderRadius: 0, margin: 0 }} color={this.props.settings.time_picker_button} onPress={() => toggleTimePickerVisibility(false)}>
                    <Text color={this.props.settings.time_picker_button_text} style={{ fontFamily: 'poppins-medium' }}>Confirm</Text>
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
          value={currentTime ? moment(currentTime, 'HH:mm').toDate() : new Date()}
          mode={'time'}
          is24Hour={true}
          display="default"
          onChange={(e, date) => { toggleTimePickerVisibility(false); changeTime(date); }}
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(TimePicker));