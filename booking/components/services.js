import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../../actions/index';
import { withNavigation } from '@react-navigation/compat';
import {  StyleSheet, LayoutAnimation } from 'react-native';
import {  Block, theme } from 'galio-framework';

import ServiceCategory from './ServiceCategory';
import StaffPickerModal from '../../components/StaffPickerModal';

class Services extends Component {
  constructor(props) {
    super(props);
    this.state = {
        service_categories: [],
        services: [],
        loading: true,
        expandedCategoryId: 0,
        categories: [],
        refreshing: false,
        staffPickerVisible: false,
        staffPickerData: null,
        staffPickerServiceBusinessDetailId: null
    };
  }

  componentDidMount = () => {
    // Expand first category
    if(this.props.serviceCategory?.length > 0) {
      this.setState({ expandedCategoryId: this.props.serviceCategory[0].service_business_category_id })
    }
    this.props.actions.loadServices();
    this.props.actions.loadStaff();
  }

  handleCategoryPress = (expandedCategoryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if(this.state.expandedCategoryId !== expandedCategoryId) {
      this.setState({ expandedCategoryId });
    } else {
      this.setState({ expandedCategoryId: null });
    }
  }

  toggleStaffPickerModal = () => {
    this.setState({ staffPickerVisible: !this.state.staffPickerVisible });
  }

  handleServiceToggle = (service_business_detail_id) => {
    let existingBookingService = this.props.bookings.find(x => x.service_business_detail_id === service_business_detail_id);
    if(existingBookingService) {
      this.props.actions.removeBookingService(existingBookingService);
    } else {
        let staff_id = null;
        let locationStaffIds = this.props.businessLocationStaffMap.filter(x => x.business_location_id === this.props.businessLocationId).map(a => a.staff_id);
        let serviceStaffIds = this.props.serviceStaffMap.filter(x => x.service_business_detail_id === service_business_detail_id).map(a => a.staff_id);
        let serviceStaffData = this.props.staff.filter(x => serviceStaffIds.includes(x.id) && locationStaffIds.includes(x.id));
        
        if(serviceStaffData?.length > 1) {
            this.setState({
              staffPickerVisible: true,
              staffPickerData: serviceStaffData,
              staffPickerServiceBusinessDetailId: service_business_detail_id
            });
            return;
        } else if(serviceStaffData?.length === 1) {
            staff_id = serviceStaffData[0]?.id;
        } else {
            // No staff assigned to this service
            return;
        }
        let bookingObj = {
          service_business_detail_id,
          staff_id
        };
        
        this.props.actions.addBookingService(bookingObj);
    }
  }

  submitStaffPickerSelection = (staff_id) => {
    this.props.actions.addBookingService({
      service_business_detail_id: this.state.staffPickerServiceBusinessDetailId,
      staff_id
    });
    this.setState({ staffPickerVisible: false });
  }

  renderServiceCategories() {
    return this.props.serviceCategory.map((serviceCategoryObj, serviceCategoryIndex) => {
      return (
        <Block key={'serviceCategory' + serviceCategoryObj.service_business_category_id}>
          <ServiceCategory
            handleCategoryPress={() => this.handleCategoryPress(serviceCategoryObj.service_business_category_id)}
            categoryData={serviceCategoryObj}
            nextPage={this.props.nextPage}
            businessLocationId={this.props.businessLocationId}
            handleServiceToggle={this.handleServiceToggle}
            expanded={this.state.expandedCategoryId === serviceCategoryObj.service_business_category_id}
          />
        </Block>
      );
    });
  }
  
  render() {
    return (
      <Block flex row style={[styles.page]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.serviceScroll}
          >
              <Block flex>                   
                {this.renderServiceCategories()}
              </Block>
          </ScrollView>
          <StaffPickerModal
            visible={this.state.staffPickerVisible}
            toggleVisible={this.toggleStaffPickerModal}
            data={this.state.staffPickerData}
            submit={this.submitStaffPickerSelection}
            settings={this.props.settings}
          />
      </Block>
    )
  }

}

function mapStateToProps(state, ownProps) {
  return {
      staff: state.staff,
      serviceCategory: state.serviceCategory,
      settings: state.settings,
      business_settings: state.details,
      serviceStaffMap: state.serviceStaffMap,
      businessLocationStaffMap: state.businessLocationStaffMap
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Services))


const styles = StyleSheet.create({
  page: {
    width: '100%',
    height: '100%',
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  serviceScroll: {
    paddingHorizontal: theme.SIZES.BASE,
    marginTop: theme.SIZES.BASE,
  },

})