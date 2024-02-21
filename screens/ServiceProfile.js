import React from 'react';
import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  ImageBackground,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Block, Text, theme, Icon, Button } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';
import { withNavigation } from '@react-navigation/compat';
import { HeaderHeight, imageBaseUrl } from "../constants/utils";
import { getFormattedGradient } from '../utilities/formatting';
import ImageViewer from '../components/ImageViewer';
import ServiceDetailAccordion from '../components/ServiceDetailAccordion';
import { Images } from '../constants';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

import { getIsInReview } from '../utilities/review';

const { width, height } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

class ServiceProfile extends React.Component {
 
  constructor(props) {
    super(props);
    this.state = {
      serviceData: null,
      serviceDetailIds: null,
      galleryData: null,
      imageViewerVisible: false,
      imageViewerIndex: 0
    }
  } 

  componentDidMount = () => {
    const { navigation } = this.props;
    const serviceData = navigation.getParam('serviceData');
    if(serviceData) {
      let serviceDetailIds = this.props.serviceDetail.filter(x => x.service_business_id === serviceData?.service_id).map(x => x.service_business_detail_id);
      let galleryMapData = this.props.gallery_mapping.filter(x => serviceDetailIds.includes(x.business_gallery_map_item_id) && x.business_gallery_map_type_id === 2).map(x => x.business_gallery_id);
      let galleryData = this.props.gallery.filter(x => galleryMapData.includes(x.business_gallery_id));
      this.setState({ serviceData, galleryData, serviceDetailIds });
    } else {
      navigation.goBack();
    }
  }

  setCollapsedIndex = (i) => {
    this.setState({
      collapsedIndex: i
    });
  }

  bookService() {
    const { navigation } = this.props;
    const isInReview = getIsInReview(
      this.props.settings?.app_version,
      this.props.settings?.app_status,
      this.props.business_settings.business_account_type_id,
      this.props.business_settings.sensitive_services === 1
    );
    if(this.state.serviceData.booking_url && !isInReview) {
      navigation.navigate('BookService', { url: this.state.serviceData.booking_url });
    } else {
      navigation.navigate('Book');
    }
  }

  renderServiceDetailAccordion = (serviceDetailObj, serviceDetailIndex) => {
    let staffIds = this.props.serviceStaffMap.filter(x => x.service_business_detail_id === serviceDetailObj.service_business_detail_id).map(x => x.staff_id);
    let staffData = this.props.staff.filter(x => staffIds.includes(x.id));
    return (
      <Block key={'serviceTier' + serviceDetailIndex} style={{marginBottom: 10}}>
        <ServiceDetailAccordion
          data={serviceDetailObj}
          staffData={staffData}
          index={serviceDetailIndex}
          settings={this.props.settings}
          businessSettings={this.props.business_settings}
          navigation={this.props.navigation}
        />
      </Block>
    );
  }
  renderServiceTiers() {
    let serviceDetailData = this.props.serviceDetail.filter(x => x.service_business_id === this.state.serviceData?.service_id);
    return (
      <View>
        <Block row flex style={styles.sectionTitle}>
          <Text
            style={{fontFamily: 'poppins-regular'}}
            size={19}
            color={this.props.settings.service_profile_card_text}
          >
            Tiers
          </Text>
        </Block>
        {serviceDetailData?.map((serviceDetailObj, serviceDetailIndex) =>
          this.renderServiceDetailAccordion(serviceDetailObj, serviceDetailIndex)
        )}
      </View>
    );
  }

  renderGallery() {
    if(this.state.galleryData?.length > 0) {
      let galleryData = [...this.state.galleryData];
      if(galleryData.length % 3 === 2){
        galleryData.push("");
      }
      return (
        <View>
          <Block row flex style={styles.sectionTitle}>
            <Text
              style={{fontFamily: 'poppins-regular'}}
              color={this.props.settings.service_profile_card_text}
              size={19}
            >
              Gallery
            </Text>
          </Block>
          <Block>
            <Block row space="between" style={{ flexWrap: 'wrap', flex: 1 }} >
              {galleryData?.map((galleryObj,galleryIndex) => 
                <Block key={`serviceProfile${galleryIndex}`}>
                  <TouchableWithoutFeedback onPress={() => this.setState({ imageViewerVisible: true, imageViewerIndex: galleryIndex })}>
                    <Image
                      source={{ uri: imageBaseUrl + galleryObj.business_gallery_img }}  
                      resizeMode="cover"
                      style={styles.galleryTile}
                    />
                  </TouchableWithoutFeedback>
                </Block>             
              )}
            </Block>
          </Block>
          <ImageViewer
            visible={this.state.imageViewerVisible}
            index={this.state.imageViewerIndex}
            images={slideshowImages(galleryData.map(x => x.business_gallery_img))}
            toggleVisible={() => this.setState({ imageViewerVisible: !this.state.imageViewerVisible })}
          />
        </View>
      );
    }
  }

  renderBookButton() {
    return (
      <Block flex row style={{paddingBottom: HeaderHeight * 1.95}}>
        <Button
          shadowless
          style={{flex: 1, marginHorizontal: 0, marginBottom: theme.SIZES.BASE, backgroundColor: this.props.settings.service_profile_card_button}}
          onPress={() => this.bookService()}
        >
          <Text
            color={this.props.settings.service_profile_card_button_text}
            style={{ fontFamily: 'poppins-medium' }}
          >
            BOOK
          </Text>
        </Button>
      </Block>
    );
  }

  render() {
    return (
      <Block flex center style={[styles.service, {backgroundColor: this.props.settings.service_profile_background}]}>
        <ImageBackground
          source={this.state.galleryData?.length > 0 ? {uri: imageBaseUrl + this.state.galleryData[this.state.galleryData.length - 1]?.business_gallery_img} : { uri: Images.BusinessCover }}
          style={styles.serviceSummaryContainer}
          imageStyle={styles.serviceSummaryImage}
        >
          <Block flex style={styles.serviceSummaryDetails}>
            <Block style={styles.serviceSummaryTexts}>
              <Text
                color={this.props.settings.service_profile_title}
                size={26}
                style={{fontFamily: 'poppins-light'}}
              >
                {this.state.serviceData?.service_name.replace('%comma%', ',').replace('%apostrophe%', "'")}
              </Text>
            </Block>
            <LinearGradient
              colors={getFormattedGradient(this.props.settings.service_profile_gradient_start, this.props.settings.service_profile_gradient_end)}
              style={styles.gradient}
            />
          </Block>
        </ImageBackground>
        <Block flex style={[styles.options, {backgroundColor: this.props.settings.service_profile_card_background}]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Block row flex style={[styles.sectionTitle, { marginTop: theme.SIZES.BASE }]}>
              <Text
                style={{fontFamily: 'poppins-regular'}}
                color={this.props.settings.service_profile_card_text}
                size={19}
              >
                About
              </Text>
            </Block>
            <Block style={{ paddingVertical: 12 }}>
              <Text
                size={14}
                color={this.props.settings.service_profile_card_text}
                style={{fontFamily: 'poppins-regular'}}
              >
                {this.state.serviceData?.service_description?.replace('%comma%', ',').replace('%apostrophe%', "'")}
              </Text>
            </Block>
            {this.renderServiceTiers()}
            {this.renderGallery()}
            {this.renderBookButton()}
          </ScrollView>
        </Block>
      </Block>
    );
  }
}

function slideshowImages(imgArray) {
    return imgArray.map(x => imageBaseUrl + x);
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings,
    service: state.service,
    serviceDetail: state.serviceDetail,
    serviceStaffMap: state.serviceStaffMap,
    staff: state.staff,
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ServiceProfile));

const styles = StyleSheet.create({
  service: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
    marginBottom: -HeaderHeight * 2,
  },
  serviceSummaryImage: {
    width: width * 1.1,
    height: 'auto'
  },
  serviceSummaryContainer: {
    width: width,
    height: height / 2
  },
  image: {
    borderRadius: 3,
    marginHorizontal: theme.SIZES.BASE / 2,
    marginTop: -22,
  },
  horizontalImage: {
    height: 125,
    width: 'auto',
    resizeMode: 'contain'
  },
  options: {
    position: 'relative',
    paddingHorizontal: theme.SIZES.BASE,
    marginHorizontal: theme.SIZES.BASE,
    marginTop: -theme.SIZES.BASE * 3,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
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
    width: thumbMeasure - 35,
    height: thumbMeasure - 35
  },
  serviceSummaryDetails: {
    paddingTop: theme.SIZES.BASE * 4,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  serviceSummaryTexts: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 4,
    zIndex: 2
  },
  gradient: {
    zIndex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
    position: 'absolute',
  },
  sectionTitle: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 5,
    marginBottom: 10
  },
  galleryTile: {
    borderRadius: 4,
    marginVertical: 4,
    alignSelf: 'center',
    width: thumbMeasure,
    height: thumbMeasure
  }
});
