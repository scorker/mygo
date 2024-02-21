import React from 'react';
import { StyleSheet, Image, ScrollView, Dimensions , TouchableWithoutFeedback, RefreshControl} from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import { imageBaseUrl } from '../constants/utils';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

const { width } = Dimensions.get('screen');

class Staff extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    }
  }

  render() {
    const { navigation } = this.props;

    const imageStyles = [styles.image, styles.horizontalImage];

    return (
      <Block flex center style={{backgroundColor: this.props.settings.staff_background}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.staffScroll}
          refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.getStaff}/>}
        >
          <Block flex>
            {this.props.staff?.map((staffObj,) => (
              <Block row card flex key={`viewed-${staffObj.id}`} style={[styles.product, styles.shadow, {backgroundColor: this.props.settings.staff_card_background}]}>
                <TouchableWithoutFeedback onPress={() => navigation.navigate('StaffProfile', { id : staffObj.id, })}>
                  <Block flex style={[styles.imageContainer, styles.shadow]}>
                    <Image
                      source={staffObj?.staff_menu_img ? { uri: imageBaseUrl + staffObj.staff_menu_img } : null}
                      style={imageStyles}
                    />
                  </Block>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => navigation.navigate('StaffProfile', { id : staffObj.id, })}>
                  <Block flex style={styles.productDescription}>
                    <Text size={16} color={this.props.settings.staff_card_name} style={styles.productTitle}>{staffObj.firstname + ' ' + staffObj.lastname}</Text>
                    <Text size={12} color={this.props.settings.staff_card_title} style={{ fontFamily: 'poppins-regular', letterSpacing: 1.1 }} muted>{staffObj.position}</Text>
                    {/*<Icon name="chevron-right" family="Feather" size={18} style={{position: 'absolute', right: 6, top: '50%'}} />*/}
                  </Block>
                </TouchableWithoutFeedback>
              </Block>
            ))} 
          </Block>
        </ScrollView>
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings,
    staff: state.staff
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Staff));

const styles = StyleSheet.create({
  staffScroll: {
    paddingHorizontal: theme.SIZES.BASE,
    width: width,
    marginTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE
  },
  product: {
    //backgroundColor: theme.COLORS.WHITE,
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    minHeight: 80,
    //height: 100
  },
  productTitle: {
    flexWrap: 'wrap',
    paddingBottom: 0,
    fontFamily: 'poppins-medium'
  },
  productDescription: {
    padding: theme.SIZES.BASE / 2,
    //textAlignVertical: 'center',
    justifyContent: 'center'
  },
  imageContainer: {
    elevation: 1,
  },
  image: {
    marginHorizontal: theme.SIZES.BASE / 2,
    marginTop: -22,
  },
  horizontalImage: {
    height: 125,
    width: 'auto',
    resizeMode: 'contain'
  },
  fullImage: {
    height: 215,
    width: width - theme.SIZES.BASE * 3,
  },
  shadow: {
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});