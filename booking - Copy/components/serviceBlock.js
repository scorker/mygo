import React from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../../actions/index';

import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { Block, Text, theme } from 'galio-framework';
import { Icon } from '../../components';

import ServiceDetailBlock from './serviceDetailBlock';

class ServiceBlock extends React.Component {
  constructor() {
    super();
    this.state = {
      isExpandable: false,
      isExpanded: true,
      arrowAnimationEnabled: true
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Prevent rerender of large service list if one of the following conditions is true:
    // 1) The selected service has changed AND
    // 1a) The selected service has changed to this service
    // 1b) The selected service was this service but is no longer
    // 2) Is description expanded changes
    if(nextProps.selectedService !== this.props.selectedService &&
      (nextProps.selectedService === this.props.serviceData?.service_id) ||
      (this.props.selectedService === this.props.serviceData?.service_id && nextProps.selectedService !== this.props.serviceData?.service_id) ||
      nextState.isExpanded !== this.state.isExpanded ||
      nextState.isExpandable !== this.state.isExpandable
    ) {
      return true;
    } else {
      return false;
    }
  }
    
  toggleServiceTiers = () => {
    this.props.updateSelectedService(this.props.serviceData?.service_id);
  };
  
  setExpanded = () => {
    this.setState({ isExpanded: !this.state.isExpanded, arrowAnimationEnabled: false });
    setTimeout(() => {
      this.setState({ arrowAnimationEnabled: true });
    }, 10);
  }

  onTextLayout = (e) => {
    if(!this.state.isExpandable) {
      this.setState({ isExpandable: e.nativeEvent.lines.length > 3, isExpanded: false });
    }
  }

  renderServiceInformation = () => {
    const { serviceData } = this.props;
    return (
      <Block flex={0.9}>
        <Text
          size={16}
          style={{ fontFamily: 'poppins-medium' }}
          color={this.props.settings.book_page_one_card_service_text}
        >
          {serviceData?.service_name?.replace('%comma%', ',').replace('%apostrophe%', "'")}
        </Text>
        {serviceData?.service_description?.length > 0 ?
          <View>
            <Text
              size={13}
              color={this.props.settings.services_card_description ? this.props.settings.services_card_description : theme.COLORS.MUTED}
              numberOfLines={this.state.isExpanded ? 0 : 3}
              onTextLayout={this.onTextLayout}
            >
              {serviceData?.service_description?.replace('%comma%', ',').replace('%apostrophe%', "'")}
            </Text>
            {this.state.isExpandable ? (
              <View style={{ marginTop: 4 }}>
                <TouchableWithoutFeedback onPress={this.setExpanded}>
                  <Text
                    bold
                    color={this.props.settings.services_card_description ? this.props.settings.services_card_description : theme.COLORS.MUTED}
                    muted
                    style={{ fontFamily: 'poppins-semi-bold' }}
                  >
                    Read {this.state.isExpanded ? 'less' : 'more'}
                  </Text>
                </TouchableWithoutFeedback>
              </View>
            ) : null}
          </View>
        : null}
      </Block>
    )
  }

  renderArrow = () => {
    let serviceSelected = this.props.selectedService === this.props.serviceData?.service_id;
    let arrowRotation = '0deg', arrowRotationAnimation;
    arrowRotationAnimation = new Animated.Value(serviceSelected ? 1 : 0);
    Animated.timing(arrowRotationAnimation, {
      toValue: serviceSelected ? 0 : 1,
      duration: this.state.arrowAnimationEnabled ? 200 : 0,
      useNativeDriver: true
    }).start();
    arrowRotation = arrowRotationAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });
    return (
      <Block middle right>
        <Animated.View
          style={{transform: [{rotate: arrowRotation}] }}
        >
          <Icon
            name={"chevron-up"}
            color={this.props.settings.book_page_one_card_service_text}
            family="Feather"
            size={20}
          />
        </Animated.View>
      </Block>
    )
  }

  renderStaff = () =>{
    let that = this;
    const { service, categoryId, businessLocationId, handleServiceToggle } = this.props;
    var staffInfo = service.service_tiers.map(function(staffs, index){
      return (
        <ServiceDetailBlock
          key={'staff' + staffs.service_business_detail_name}
          service={service}
          categoryId={categoryId}
          index={index}
          tier={staffs}
          nextPage={that.props.nextPage}
          businessLocationId={businessLocationId}
          handleServiceToggle={handleServiceToggle}
        />
      );
    })
    return(
      <Block>
        {staffInfo}
      </Block>
    )
  }

  renderServiceTiers() {
    let that = this;
    if(this.props.selectedService === this.props.serviceData?.service_id) {
      return (
        <Block flex style={[{shadowColor: 'rgba(0, 0, 0, 0.9)', shadowOffset: {width: 0, height: 1} , shadowRadius: 3, shadowOpacity: 1}]}>
          {this.props.serviceDetail.filter(x => x.service_business_id === this.props.serviceData?.service_id).map(function(serviceDetailObj, serviceDetailIndex){
            return (
              <ServiceDetailBlock
                key={'serviceDetail' + serviceDetailObj.service_business_detail_id}
                serviceDetailData={serviceDetailObj}
                serviceDetailIndex={serviceDetailIndex}
                nextPage={that.props.nextPage}
                businessLocationId={that.props.businessLocationId}
                handleServiceToggle={that.props.handleServiceToggle}
              />
            );
          })}
        </Block>
      )
    }
  }

  render() {
    return (
      <Block>
        <TouchableOpacity onPress={() => this.toggleServiceTiers()}>
          <Block row space="between" style={{ padding: theme.SIZES.BASE, borderTopWidth: 1, borderTopColor: theme.COLORS.MUTED }}>
            {this.renderServiceInformation()}
            {this.renderArrow()}
          </Block>
        </TouchableOpacity>
        {this.renderServiceTiers()}
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings,
    serviceDetail: state.serviceDetail
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ServiceBlock));


const styles = StyleSheet.create({
  defaultStyle: {
    padding: theme.SIZES.BASE * 1.5
  },
  defaultBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F4F4F4'
  },
});