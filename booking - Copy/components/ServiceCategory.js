import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../../actions/index';
import { withNavigation } from '@react-navigation/compat';

import { Images } from "../../constants/";
import { Block, Text, theme } from 'galio-framework';
import {  View, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

import ServiceBlockContainer from './serviceBlockContainer';

class ServiceCategory extends Component {
  constructor() {
    super();
  }

  shouldComponentUpdate(nextProps,) {
    if (nextProps.expanded !== this.props.expanded) {
      return true;
    }
    return false;
  }
 
  renderAccordianTitle = () => {
    const { categoryData } = this.props;
    return (
      <Block flex row style={[styles.headerStyle, styles.shadow]}>
        <ImageBackground source={{uri: Images.BusinessCover}} style={{width: '100%', height: '100%'}} imageStyle={{borderRadius: 8}}>
          <View style={[styles.headerViewStyle, {backgroundColor: this.props.settings.book_page_one_category_background}, this.props.expanded ? styles.headerViewNotCollapsed : null ]}>
            <Text color={this.props.settings.book_page_one_category_text} style={{textAlign: 'center', fontFamily: 'poppins-light', paddingVertical: 10, fontSize: 27}}>
              {categoryData?.service_business_category}
            </Text>
          </View>
        </ImageBackground>
      </Block> 
    )
  }

  renderAccordianBody = () => {
    if(!this.props.expanded) {
      return;
    }
    return (
      <Block flex style={[
          {backgroundColor: this.props.settings.book_page_one_card_background, borderBottomLeftRadius: 8, borderBottomRightRadius: 8},
          this.props.serviceCategory?.length === 1 ? { borderTopLeftRadius: 8, borderTopRightRadius: 8 } : null
        ]}>
        <ServiceBlockContainer 
          nextPage={this.props.nextPage}
          categoryId={this.props.categoryData.service_business_category_id}
          businessLocationId={this.props.businessLocationId}
          handleServiceToggle={this.props.handleServiceToggle}
        />
      </Block>
    )
  }

  render() {
    const { expanded } = this.props;
    return (
      <View style={styles.Panel_Holder}>
        {this.props.serviceCategory?.length > 1 ? (
          <TouchableOpacity activeOpacity={0.3} onPress={() => this.props.handleCategoryPress()} style={styles.Btn}>
            {this.renderAccordianTitle()}
          </TouchableOpacity>
        ) : null}
        <Block style={{ height: expanded ? null : 0, overflow: 'hidden' }}>
            {this.renderAccordianBody()}
        </Block>
      </View>
    );
  }
}
 
function mapStateToProps(state, ownProps) {
  return {
    serviceCategory: state.serviceCategory,
    settings: state.settings
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ServiceCategory));
  
const styles = StyleSheet.create({
  Panel_Holder: {
    marginTop: 0,
    marginBottom: 10
  },
  Btn: {
    padding: 0,
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
  headerStyle: {
  paddingTop: 0,
  paddingBottom: 0,
  },
  headerViewStyle: {
  backgroundColor: 'rgba(0,0,0,0.75)',
  borderRadius: 8,
  flex: 1
  },
  headerViewNotCollapsed: {
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  }
  });