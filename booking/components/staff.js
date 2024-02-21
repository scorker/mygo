import React, { Component } from 'react';

import { Block, Text } from 'galio-framework';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { withNavigation } from '@react-navigation/compat';
import * as serviceActions from '../../../../actions/index';
import { imageBaseUrl } from 'constants/utils';

class Staff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      service_staff: []
    };
  }

  componentDidMount() {
     
    let service_staff_holder = [];
    let service_business_detail_id = this.props.booking_data[this.props.booking_data_index].service_business_detail_id; //inside service tier

    let service_business_id = this.props.booking_data[this.props.booking_data_index].service_business_id; 

    let service_staff_blob = JSON.parse(this.props.services.find(x => x.service_id == service_business_id).service_staff);

    this.props.staff.forEach(staff_member => {
      let foundIndex = service_staff_blob.findIndex(x => x.service_business_detail_staff == staff_member.id && x.service_business_detail_id == service_business_detail_id);
      if(foundIndex >= 0){
        service_staff_holder.push(staff_member);
      }
    });

    if(service_staff_holder.length == 1 && this.props.booking_data[this.props.booking_data_index].staff_id == null){
      this.props.addStaff(service_staff_holder[0].id);
    } else {
      this.setState({service_staff: service_staff_holder});
    }
    
  }

  renderNoPreference() {
    if(this.state.service_staff.length > 1){
      return (
        <Block key="staff0" data-firstname="No Preference" onClick={() => this.props.addStaff(0)}>
          <Block className="service">
            <Block className="service-info">
              <FiUsers size={'2.4em'} style={{paddingTop: 6, paddingBottom: 6, marginRight: 22, marginLeft: 6}} />
              <Text className="item-title">No preference</Text>
            </Block>
          </Block>
        </Block>
      );
    }
  }

  render() {
    return (
      <Block className="services-container" style={{backgroundColor: this.props.business_settings.staff_background}}>
        {this.state.service_staff.map(staff_member => 
        <Block key={'staff' + staff_member.id}>
          <Block className="service-line"></Block>
            <Block data-id={staff_member.id} onClick={() => this.props.addStaff(staff_member.id)}>
              <Block className="service">
                <Block>
                  <Block className="service-info">
                  <img src={imageBaseUrl + staff_member.staff_img} className="staff-img" height="45" width="45"></img>
                  <Block className="item-title" style={{color: this.props.business_settings.staff_name_title}}>{staff_member.firstname + ' ' + staff_member.lastname}<Block className="service-description" style={{color: this.props.business_settings.staff_position_title}}><Text>{staff_member.position}</Text></Block></Block>
                </Block>
              </Block>
            </Block>
          </Block>
        </Block>
        )}
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
      services: state.services,
      staff: state.staff,
      settings: state.settings,
      business_settings: state.details
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Staff))