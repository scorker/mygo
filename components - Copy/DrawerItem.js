import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Block, Text, theme } from "galio-framework";

import Icon from './Icon';

import materialTheme from '../constants/Theme';
import { UserContext } from "../providers/userProvider";

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

import { getIsInReview } from '../utilities/review';

const proScreens = [];

class DrawerItem extends React.Component {

  static contextType = UserContext;

  renderIcon = () => {
    const { title, focused } = this.props;
    switch (title) {
      case 'Home':
        return (
          <Icon
            size={16}
            name="shop"
            family="GalioExtra"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Services':
        return (
          <Icon
            size={this.props.settings.menu_service_icon_size}
            name={this.props.settings.menu_service_icon_name}
            family={this.props.settings.menu_service_icon_family}
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Staff':
        return (
          <Icon
            size={16}
            name="users"
            family="Feather"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Products':
        return (
          <Icon
            size={16}
            name="shopping-bag"
            family="Feather"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Wait List':
        return (
          <Icon
            size={16}
            name="zap"
            family="Feather"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Gallery':
          return (
            <Icon
              size={16}
              name="camera"
              family="feather"
              color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
            />
          );
      case 'Book':
        return (
          <Icon
            size={16}
            name="calendar"
            family="feather"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Bookings':
        return (
          <Icon
            size={16}
            name="book"
            family="Feather"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Settings':
        return (
          <Icon
            size={16}
            name="settings"
            family="Feather"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Sign in':
        return (
          <Icon
            size={16}
            name="ios-log-in"
            family="ionicon"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      case 'Sign Up':
        return (
          <Icon
            size={16}
            name="md-person-add"
            family="ionicon"
            color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
          />
        );
      default:
        return null;
    }
  }

  renderLabel = () => {
    const { title } = this.props;

    if (proScreens.includes(title)) {
      return (
        <Block middle style={styles.pro}>
          <Text size={12} color="white">PRO</Text>
        </Block>
      )
    }

    return null;
  }

  handleDrawerItemClick(title) {
    switch (title) {
      case 'Home':
        this.props.navigation.navigate('Home');
        return;
      case 'Services':
        this.props.navigation.navigate('Services');
        return;
      case 'Staff':
        this.props.navigation.navigate('Staff');
        return;
      case 'Products':
        this.props.navigation.navigate('Products');
        return;
      case 'Wait List':
        this.props.navigation.navigate('WaitList');
        return;
      case 'Gallery':
        this.props.navigation.navigate('Gallery');
        return;
      case 'Book':
        this.props.navigation.navigate('Book');
        return;
      case 'Bookings':
        this.props.navigation.navigate('Bookings');
        return;
      case 'Settings':
        this.props.navigation.navigate('Settings');
        return;
      case 'Sign in':
        this.props.navigation.navigate('SignIn');
        return;
      default:
        return null;
    }
  }

  render() {
    const { focused, title } = this.props;
    const proScreen = proScreens.includes(title);
    const user = this.context;
    const restrictedScreens = ['Bookings', 'Settings', 'Wait List'];

    const isInReview = getIsInReview(
      this.props.settings?.app_version,
      this.props.settings?.app_status,
      this.props.details.business_account_type_id,
      this.props.details.sensitive_services === 1
    );

    if(this.props.details.business_account_type_id === 3 && !isInReview)
      restrictedScreens.push('Sign in')
    else
      restrictedScreens.push('Book')

    if((!user.user && restrictedScreens.includes(title)) || (user.user && title === 'Sign in') || (title == 'Products' && this.props.settings.products_enabled !== 1) || (user.user && title == 'Wait List' && this.props.settings.wait_list_enabled !== 1)){
      return(null);
    } else {
      return (
        <TouchableOpacity onPress={() => this.handleDrawerItemClick(title)}>
          <Block flex row style={[styles.defaultStyle, focused ? [styles.activeStyle, styles.shadow, {backgroundColor: this.props.settings.menu_active_background}] : null]}>
            <Block middle flex={0.1} style={{ marginRight: 28 }}>
              {this.renderIcon()}
            </Block>
            <Block row center flex={0.9}>
              <Text
                size={18}
                color={focused ? this.props.settings.menu_active_text : this.props.settings.menu_text}
                style={focused ? { fontFamily: 'poppins-medium' } : { fontFamily: 'poppins-regular' }}
              >
                {title}
              </Text>
              {this.renderLabel()}
            </Block>
          </Block>
        </TouchableOpacity>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings,
    details: state.details
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerItem);

const styles = StyleSheet.create({
  defaultStyle: {
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  activeStyle: {
    //backgroundColor: materialTheme.THEME.ACTIVE,
    borderRadius: 4,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 8,
    shadowOpacity: 0.2
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginLeft: 8,
    borderRadius: 2,
    height: 16,
    width: 36,
  },
})