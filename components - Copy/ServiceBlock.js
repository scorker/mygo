import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { Block, Text, theme } from 'galio-framework';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import Icon from './Icon';

class ServiceBlock extends React.Component {

  renderIcon = () => {
    return (
      <Icon
        size={this.props.settings.services_card_icon_size}
        name={this.props.settings.services_card_icon_name}
        family={this.props.settings.services_card_icon_family}
        color={this.props.settings.services_card_text}
      />
    );
  }
  
  renderServiceInformation = () => {
    const { serviceData } = this.props;
    return (
      <Block flex={0.9}>
        <Text
          size={16}
          style={{ fontFamily: 'poppins-medium' }}
          color={this.props.settings.services_card_text}
        >
          {serviceData?.service_name?.replace('%comma%', ',').replace('%apostrophe%', "'")}
        </Text>
        {serviceData?.service_description?.length > 0 ?
          <Text
            size={13}
            numberOfLines={3}
            color={this.props.settings.services_card_description ? this.props.settings.services_card_description : theme.COLORS.MUTED}
          >
            {serviceData?.service_description?.replace('%comma%', ',').replace('%apostrophe%', "'")}
          </Text>
        : null}
      </Block>
    )
  }

  renderArrow = () => {
    return (
      <Block middle right>
        <Icon
          name="chevron-right"
          color={this.props.settings.services_card_text}
          family="Feather"
          size={20}
        />
      </Block>
    )
  }

  render() {
    const { navigation, serviceData } = this.props;
    return (
      <TouchableWithoutFeedback onPress={() => navigation.navigate('ServiceProfile', { serviceData })}>
        <Block row space="between" style={{ padding: theme.SIZES.BASE, borderTopWidth: 1, borderTopColor: theme.COLORS.MUTED }}>
          {this.renderServiceInformation()}
          {this.renderArrow()}
        </Block>
      </TouchableWithoutFeedback>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ServiceBlock));