import React from 'react';
import { StyleSheet, Dimensions, ScrollView, RefreshControl, Platform, LayoutAnimation, UIManager } from 'react-native';
import { Block, theme } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import ServiceCategory from '../components/ServiceCategory';

const { width } = Dimensions.get('screen');

class Services extends React.Component {

  constructor(props) {
    super(props);
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      expandedCategoryId: null,
      refreshing: false
    }
  } 
 
  componentDidMount = () => {
    this.props.actions.loadServices();
    // Expand first category
    if(this.props.serviceCategory?.length > 0) {
      this.setState({ expandedCategoryId: this.props.serviceCategory[0].service_business_category_id })
    }
  }

  handleCategoryPress = (expandedCategoryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if(this.state.expandedCategoryId !== expandedCategoryId) {
      this.setState({ expandedCategoryId });
    } else {
      this.setState({ expandedCategoryId: null });
    }
  }

  render() {
    let that = this;
    let categoryData = this.props.serviceCategory.map(function(serviceCategoryObj,){
      return (
        <Block key={'serviceCategory' + serviceCategoryObj.service_business_category_id}>
          <ServiceCategory
            handleCategoryPress={() => that.handleCategoryPress(serviceCategoryObj.service_business_category_id)}
            categoryData={serviceCategoryObj}
            expanded={that.state.expandedCategoryId === serviceCategoryObj.service_business_category_id}
          />
        </Block>
      );  
    });
    return (
      <Block center style={{backgroundColor: this.props.settings.services_background, flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.serviceScroll}
          refreshControl={<RefreshControl refreshing={this.state.refreshing} />}
        >
          <Block flex>
            {categoryData}
          </Block>
        </ScrollView>
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    services: state.services,
    settings: state.settings,
    serviceCategory: state.serviceCategory
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Services));


const styles = StyleSheet.create({
  
  serviceScroll: {
    paddingHorizontal: theme.SIZES.BASE,
    width: width,
    marginTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE
  },
  product: {
    backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 80,
    //height: 100
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: (Platform.OS === 'ios') ? 20 : 0
  }
})