import React from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../../actions/index';

import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { Block, Text, Icon, theme } from 'galio-framework';

import { imageBaseUrl } from '../../constants/utils';

class serviceDetailBlock extends React.Component {

  constructor() {
    super();
  }

  renderDescription() {
    const { serviceDetailData } = this.props;
    if(serviceDetailData?.service_business_detail_split === 1) {
      duration = serviceDetailData?.service_business_detail_duration_a + serviceDetailData?.service_business_detail_duration_break + serviceDetailData?.service_business_detail_duration_b;
    } else {
      duration = serviceDetailData?.service_business_detail_duration_a;
    }
    let descriptionStr = `${duration} mins`;
    if(serviceDetailData?.service_business_detail_description?.length > 0) {
      descriptionStr += ` | ${serviceDetailData?.service_business_detail_description}`;
    }
    descriptionStr = descriptionStr.replace('%comma%', ',').replace('%apostrophe%', "'");
    return (
      <Text color={theme.COLORS.MUTED} size={13} style={{ fontFamily: 'poppins-medium' }}>
        {descriptionStr}
      </Text>
    );
  }

  renderServiceDetailInformation = () => {
    const { serviceDetailData, businessLocationId } = this.props;
    let serviceStaffIds = this.props.serviceStaffMap.filter(x => x.service_business_detail_id === serviceDetailData.service_business_detail_id).map(a => a.staff_id);
    let locationStaffIds = this.props.businessLocationStaffMap.filter(x => x.business_location_id === businessLocationId).map(a => a.staff_id);
    let serviceStaffData = this.props.staff.filter(x => serviceStaffIds.includes(x.id) && locationStaffIds.includes(x.id));
    let serviceDetailSelected = this.props.bookings.find(x => x.service_business_detail_id === serviceDetailData.service_business_detail_id);
    return (
      <View style={{ flex: 1 }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            size={15}
            color={this.props.settings.book_page_one_card_service_detail_text}
            style={{ fontFamily: 'poppins-medium' }}
          >
            {serviceDetailData?.service_business_detail_name?.replace('%comma%', ',').replace('%apostrophe%', "'")}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text
              size={15}
              color={this.props.settings.book_page_one_card_service_detail_text}
              style={{ fontFamily: 'poppins-medium' }}
            >
              {this.renderPrice()}
            </Text>
            <Icon
              family="Feather"
              name={serviceDetailSelected ? "check" : "plus"}
              color={serviceDetailSelected ? theme.COLORS.SUCCESS : this.props.settings.book_page_one_card_service_detail_text}
              size={18}
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>
        <Block row>
          {this.renderDescription()}
        </Block>
        <Block row>
          {serviceStaffData.map((staffObj, i) => 
            <Image
              key={'image' + i}
              source={{ uri: imageBaseUrl + staffObj.staff_img }}
              style={{ height: 22, width: 22, borderRadius: 11, marginRight: 5 }}
            />
          )}
          {serviceStaffData?.length === 0 ? (
            <Text size={13} color={'#f44336'} style={{ fontFamily: 'poppins-regular' }}>No staff available</Text>
          ) : null}
        </Block>
      </View>
    );
  }

  renderPrice() {
    const { serviceDetailData } = this.props;
    if(serviceDetailData?.service_business_detail_poa === 1) {
      return 'POA';
    } else {
      let currencySymbol = this.props.business_settings?.currency_symbol;
      let servicePrice = Number(serviceDetailData?.service_business_detail_price / 100).toFixed(2);
      return currencySymbol + servicePrice
    }
  }

  render() {
    const { handleServiceToggle, serviceDetailData, serviceDetailIndex } = this.props;
    return (  
      <View style={{backgroundColor: '#f7f7f7' }}>
        <View>
          <TouchableOpacity onPress={() => handleServiceToggle(serviceDetailData?.service_business_detail_id)}>
            <Block flex row space="between" style={[styles.defaultStyle, serviceDetailIndex !== 0 ? styles.defaultBorder : null, {paddingHorizontal: theme.SIZES.BASE }, {backgroundColor: this.props.settings.book_page_one_card_service_detail_background}]}>
              {this.renderServiceDetailInformation()}
            </Block>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
 
  function mapStateToProps(state, ownProps) {
    return {
      settings: state.settings,
      staff: state.staff,
      services: state.services,
      serviceStaffMap: state.serviceStaffMap,
      businessLocationStaffMap: state.businessLocationStaffMap,
      bookings: state.bookings,
      business_settings: state.details
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(serviceDetailBlock));


  
const styles = StyleSheet.create({
      arrow: {
        paddingVertical: 10,
        paddingHorizontal: 10,
      },
      defaultStyle: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        //marginLeft: 10,
        //marginRight: 10,
      },
      defaultBorder: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      },
      bgColour: {
        backgroundColor: theme.COLORS.BLOCK,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      },
});