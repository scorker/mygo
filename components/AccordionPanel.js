import React, { Component } from 'react';
import { Images } from "../constants/";
import {  View, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import ServiceBlock from './ServiceBlock';
import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

class Accordion_Panel extends Component {
 
  constructor() {
 
    super();
    this.state = {
      updated_Height: 0,
    }
  }

  componentDidMount() {
    this.setState({ updated_Height: !this.props.item.expanded ? null : 0 })
    if(this.props.item.isFirst)
      this.props.onClickFunction()
  }
 
  //Warning, method may not be available in future
  componentDidUpdate(update_Props) {
    if (update_Props.item.expanded) {
      this.setState(() => {
        return {
          updated_Height: null
        }
      });
    }
    else {
      this.setState(() => {
        return {
          updated_Height: 0
        }
      });
    }
  }


  shouldComponentUpdate(update_Props, nextState) {
 
    if (update_Props.item.expanded !== this.props.item.expanded) {
 
      return true;
 
    }
 
    return false;
 
  }
 
  renderDescription = () => {
    const { item } = this.props;
    return (
        <Block flex row style={[styles.headerStyle, styles.shadow]}>
          <ImageBackground source={{uri: Images.BusinessCover}} style={{width: '100%', height: '100%'}} imageStyle={{borderRadius: 8}}>
            <View style={[styles.headerViewStyle, {backgroundColor: this.props.settings.services_category_card_background}, this.props.item.expanded ? styles.headerViewNotCollapsed : null ]}>
              <Text color={this.props.settings.services_card_title} style={{textAlign: 'center', fontWeight: '200', paddingVertical: 12, fontSize: 30}}>
                {item.service_business_category}
              </Text>
            </View>
          </ImageBackground>
        </Block> 
    )

  }

  renderRow = () => {
    const { item } = this.props;
    var services = item.services.map(function(category, index){
      return <ServiceBlock key={'service' + category.service_id} index={index} focused={true} service={category} />;
    })  

    return (
         <Block flex style={{backgroundColor: this.props.settings.services_card_background, borderBottomLeftRadius: 8, borderBottomRightRadius: 8}}>
            {services}
        </Block>  
    )
  }

  render() {
 
    return (
 
      <View style={styles.Panel_Holder}>
 
        <TouchableOpacity activeOpacity={0.7} onPress={this.props.onClickFunction} style={styles.Btn}>

          {this.renderDescription()}
          
        </TouchableOpacity>
 
        <View style={{ height: this.state.updated_Height, overflow: 'hidden' }}>

            {this.renderRow()}

        </View>
 
      </View>
 
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Accordion_Panel));


  
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