import React from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Platform, TouchableOpacity } from 'react-native';
import { Block, Text, theme, Icon } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';

import { materialTheme } from '../constants';
import { HeaderHeight, imageBaseUrl } from "../constants/utils";
import { getFormattedGradient } from '../utilities/formatting';

import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

const { width, height } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

class ProductProfile extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      product: null
    };
  }

  componentDidMount() {
    if(this.props.navigation.state.params.product){
      this.setState({ product: this.props.navigation.state.params.product });
    } else {
      this.props.navigation.goBack();
    }
  }

  render() {
    let productImg = this.props.navigation.state.params.product.product_img;
    return (
      <Block flex center style={[styles.profile, { backgroundColor: this.props.settings.product_profile_background }]}>
        <Block flex>
          <ImageBackground
            source={{uri: productImg ? imageBaseUrl + productImg : imageBaseUrl + 'productImg/product_default.png' }}
            style={styles.profileContainer}
            imageStyle={styles.profileImage}
          >
            <Block flex style={styles.profileDetails}>
              <LinearGradient
                colors={getFormattedGradient(this.props.settings.product_profile_gradient_start, this.props.settings.product_profile_gradient_end)}
                style={styles.gradient}
              />
            </Block>
          </ImageBackground>
        </Block>
        <Block flex style={[styles.options, { backgroundColor: this.props.settings.product_profile_card_background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Block style={{ paddingBottom: theme.SIZES.BASE / 2 }}>
              <Text color={this.props.settings.product_profile_card_title} size={30} style={{ fontFamily: 'poppins-regular' }}>{this.state.product ? this.state.product.product_name : null}</Text>
            </Block>
            <Block row space="between" style={{ padding: theme.SIZES.BASE, }}>
              <Block middle>
                <Text bold size={16} color={this.props.settings.product_profile_card_price} style={{marginBottom: 8, fontFamily: 'poppins-semi-bold'}}>{this.props.business_settings.currency_symbol}{this.state.product && this.state.product.product_price ? Number(this.state.product.product_price / 100).toFixed(2) : null}</Text>
                <Text muted size={16} color={this.props.settings.product_profile_card_labels} style={{ fontFamily: 'poppins-regular' }}>Price</Text>
              </Block>
              <Block middle>
                <Text bold size={16} color={this.props.settings.product_profile_card_volume} style={{marginBottom: 8, fontFamily: 'poppins-semi-bold'}}>{this.state.product ? this.state.product.product_volume : null}</Text>
                <Text muted size={16} color={this.props.settings.product_profile_card_labels} style={{ fontFamily: 'poppins-regular' }}>Size</Text>
              </Block>
              <Block middle>
                <Icon family="Feather" name={this.state.product && this.state.product.product_in_stock === 1 ? "check" : "x"} color={this.state.product && this.state.product.product_in_stock === 1 ? this.props.settings.product_profile_card_in_stock : this.props.settings.product_profile_card_out_of_stock} size={20} />
                <Text muted size={16} color={this.props.settings.product_profile_card_labels} style={{ paddingTop: 8, fontFamily: 'poppins-regular' }}>In stock</Text>
              </Block>
            </Block>
            {this.renderImgs()}
            <Block row flex style={{borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 5, marginBottom: 10}}>
              <Text style={{fontFamily: 'poppins-regular'}} size={19} color={this.props.settings.product_profile_card_subtitle}>Description</Text>
            </Block>
            <Block style={{ paddingTop: theme.SIZES.BASE / 2, paddingBottom: HeaderHeight * 2 }}>
              <Text color={this.props.settings.product_profile_card_text} size={14} style={{fontFamily: 'poppins-regular'}}>
                {this.state.product?.product_description}
              </Text>
            </Block>
          </ScrollView>
        </Block>
      </Block>
    );
  }

  slideShowImages() {
    let slideshowImages = [];
    let productGalleryMap = this.props.gallery_mapping.filter(x => x.business_gallery_map_type_id === 4 && x.business_gallery_map_item_id === this.props.navigation.state.params.product.id);
    productGalleryMap.map((galleryMapObj, gallerymapIndex) => {
      let galleryObj = this.props.gallery.find(x => x.business_gallery_id === galleryMapObj.business_gallery_id);
      slideshowImages.push(imageBaseUrl + galleryObj.business_gallery_img);
    });
    return slideshowImages;
  }

  renderImgs() {
    let productGalleryMap = this.props.gallery_mapping.filter(x => x.business_gallery_map_type_id === 4 && x.business_gallery_map_item_id === this.props.navigation.state.params.product.id);
    if(productGalleryMap && productGalleryMap.length > 0){
      return (
        <Block>
          <Block row space="between" style={{borderBottomWidth: 1, borderBottomColor: materialTheme.THEME.MUTED, paddingBottom: theme.SIZES.BASE / 2, alignItems: 'baseline'}}>
            <Text style={{fontWeight: '300'}} size={20} color={this.props.settings.product_profile_card_subtitle}>Gallery</Text>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('SlideShow', {images: this.slideShowImages(), index: 0})}>
              <Text size={12} muted color={this.props.settings.product_profile_card_labels}>View All</Text>
            </TouchableOpacity>
          </Block>
          <Block row space="between" style={{ flexWrap: 'wrap', paddingVertical: theme.SIZES.BASE / 2 }}>
            {productGalleryMap.map((galleryMapObj, gallerymapIndex) => {
              let galleryObj = this.props.gallery.find(x => x.business_gallery_id === galleryMapObj.business_gallery_id);
              // Render a maximum of three images
              if(gallerymapIndex < 3){
                return (
                  <TouchableOpacity key={galleryObj.business_gallery_id} onPress={() => this.props.navigation.navigate('SlideShow', {images: this.slideShowImages(), index: gallerymapIndex})}>
                    <Image
                      source={{ uri: imageBaseUrl + galleryObj.business_gallery_img }}
                      resizeMode="cover"
                      style={styles.thumb}
                    />
                  </TouchableOpacity>
                );
              } else {
                return (null);
              }
            })}
          </Block>
        </Block>
      );
    } else {
      return (null);
    }
  }

}

function mapStateToProps(state, ownProps) {
    return {
        settings: state.settings,
        business_settings: state.details,
        gallery: state.gallery,
        gallery_mapping: state.gallery_mapping
    }
}
  
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ProductProfile));

const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
    marginBottom: -HeaderHeight * 2,
  },
  profileImage: {
    width: width * 1,
    height: 'auto'
  },
  profileContainer: {
    width: width,
    height: height / 2,
  },
  profileDetails: {
    paddingTop: theme.SIZES.BASE * 4,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  profileTexts: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 2,
    zIndex: 2
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: theme.SIZES.BASE / 2,
    borderRadius: 4,
    height: 19,
    width: 38,
  },
  seller: {
    marginRight: theme.SIZES.BASE / 2,
  },
  options: {
    position: 'relative',
    padding: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE * 7,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.2,
    zIndex: 2,
    minWidth: '90%',
    maxWidth: '90%'
  },
  thumb: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: thumbMeasure,
    height: thumbMeasure
  },
  gradient: {
    zIndex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    height: '20%',
    position: 'absolute',
  },
});