import React from "react";
import { TouchableWithoutFeedback, ScrollView, StyleSheet, Image, ImageBackground, View } from "react-native";
import { Block, Text, theme } from "galio-framework";

import Icon from './Icon';
import DrawerItem from './DrawerItem';
import { Images, materialTheme } from "../constants/";
import { iPhoneX } from '../constants/utils';
import MenuItems from "../constants/MenuItems";

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

const profile = {
  avatar: Images.BusinessLogo,
  cover: Images.BusinessCover,
};

class Menu extends React.Component {

  constructor(props) {
    super(props);
  }

  renderMenuItems() {
    if(this.props.settings?.app_enabled === 1) {
      return (
        <Block>
          {MenuItems.map((item, index) => {
            return (
              <DrawerItem
                title={item}
                key={index}
                navigation={this.props.navigation}
                focused={this.props.state.index === index ? true : false}
              />
            );
          })}
        </Block>
      )
    } else {
      return null;
    }
  }

  render(){
    return(
      <Block style={[styles.container, {backgroundColor: this.props.settings.menu_background}]} forceInset={{ top: 'always', horizontal: 'never' }}>
        <Block flex={0.3}>
          <ImageBackground source={{ uri: profile.cover }} style={{width: '100%', height: '100%'}}>
          <View style={[styles.overlay, { backgroundColor: this.props.settings.menu_header_background }]} />
          <Block style={styles.header}>
            <TouchableWithoutFeedback>
              <Block style={styles.profile}>
                <Image source={{ uri: profile.avatar}} style={[styles.avatar, { width: '100%', height: this.props.settings.menu_header_logo_width}]} />
              </Block>
            </TouchableWithoutFeedback>
          </Block>
          </ImageBackground>
        </Block>
        <Block flex>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12 }}>
            {this.renderMenuItems()}
          </ScrollView>
          <Block row center middle style={{ marginBottom: 10 }}>
            <Text size={11} color={this.props.settings.menu_text} style={{textAlign: 'center', fontFamily: 'poppins-regular', color: this.props.settings.menu_text, marginRight: 4}}>Powered by</Text>
            <Icon name="styler_logo" family="Styler" color={this.props.settings.menu_text} size={15} />
          </Block>
        </Block>
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
    return {
        settings: state.settings
    };
}
  
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 2,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  footer: {
    paddingHorizontal: 28,
    justifyContent: 'flex-end'
  },
  profile: {
    marginBottom: theme.SIZES.BASE / 2,
  },
  avatar: {
    height: '75%',
    width: '75%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: iPhoneX() ? theme.SIZES.BASE * 3 : theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: 8,
    borderRadius: 4,
    height: 19,
    width: 38,
  },
  seller: {
    marginRight: 16,
  }
});