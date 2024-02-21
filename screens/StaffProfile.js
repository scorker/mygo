import React from 'react';
import { StyleSheet, Dimensions, ScrollView, Image, ImageBackground, Linking, TouchableWithoutFeedback, View, Platform } from 'react-native';
import { Block, Text, theme, Icon, Button } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';
import { withNavigation } from '@react-navigation/compat';
import { Images } from '../constants';
import ImageViewer from '../components/ImageViewer';
import { HeaderHeight, imageBaseUrl } from "../constants/utils";
import { getFormattedGradient } from '../utilities/formatting';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

const { width, height } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

class StaffProfile extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      staff: {
        staff_img: '',
        firstname: '',
        lastname: '',
        staff_bio: '',
        position: ''
      },
      imageViewerVisible: false,
      imageViewerIndex: null
    }
  } 

  componentDidMount = () => {
    let self = this;
    self.setState({
      staff: this.props.staff.find(x => x.id === this.props.navigation.getParam('id'))
    });
  }

  render() {
    const { navigation } = this.props;

    let galleryMapData = this.props.gallery_mapping.filter(x => x.business_gallery_map_item_id === this.state.staff.id && x.business_gallery_map_type_id === 3).map(x => x.business_gallery_id);
    let galleryData = this.props.gallery.filter(x => galleryMapData.includes(x.business_gallery_id));
    if(galleryData.length % 3 === 2){
      galleryData.push("");
    }
    return (
      <Block flex center style={[styles.profile, {backgroundColor: this.props.settings.staff_profile_background}]}>
        <ImageBackground style={styles.profileContainer} source={{uri: Images.BusinessCover}}>
          <ImageBackground
            source={this.state.staff?.staff_menu_img ? {uri: imageBaseUrl + this.state.staff.staff_menu_img} : null}
            style={styles.profileContainer}
            imageStyle={styles.profileImage}
          >
            <Block flex style={styles.profileDetails}>
              <Block style={styles.profileTexts}>
                <Text color={this.props.settings.staff_profile_title} size={22} style={{ fontFamily: 'poppins-medium' }}>{this.state.staff.firstname + ' ' + this.state.staff.lastname}</Text>
                <Block row space="between">
                  <Text color={this.props.settings.staff_profile_title} style={{ fontFamily: 'poppins-regular', letterSpacing: 1.1 }} size={15}>{this.state.staff.position}</Text>
                  {this.state.staff.staff_instagram ? 
                    <Block>
                      <Text color={theme.COLORS.MUTED} size={16}>
                        <Icon name="instagram" family="Feather" color={this.props.settings.staff_profile_title} size={20} onPress={() => Linking.openURL(`instagram://user?username=` + this.state.staff.staff_instagram)} />
                      </Text>
                    </Block>
                  : null}
                </Block>
              </Block>
              <LinearGradient
                colors={getFormattedGradient(this.props.settings.staff_profile_gradient_start, this.props.settings.staff_profile_gradient_end)}
                style={styles.gradient}
              />
            </Block>
          </ImageBackground>
        </ImageBackground>
        <Block flex style={[styles.options, {backgroundColor: this.props.settings.staff_profile_card_background}]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Block row flex style={[styles.sectionTitle, { marginTop: theme.SIZES.BASE}]}>
              <Text
                style={{fontFamily: 'poppins-regular'}}
                color={this.props.settings.staff_profile_card_text}
                size={19}
              >
                  Bio
              </Text>
            </Block>
            <Block style={{ paddingVertical: 12 }}>
              <Text
                size={14}
                color={this.props.settings.staff_profile_card_text}
                style={{fontFamily: 'poppins-regular'}}
              >
                {this.state.staff.staff_bio}
              </Text>
            </Block>
            {galleryData?.length > 0 ?
              <Block row flex style={styles.sectionTitle}>
                <Text
                  style={{fontFamily: 'poppins-regular'}}
                  color={this.props.settings.staff_profile_card_text}
                  size={19}
                >
                  Gallery
                </Text>
              </Block>
            : null}
            <Block>
              <Block row space="between" style={{ flexWrap: 'wrap', flex: 1 }}>
                {galleryData?.map((galleryObj, galleryIndex) => 
                  <Block key={`staffimage-${galleryIndex}`}>
                    <TouchableWithoutFeedback onPress={() => this.setState({ imageViewerVisible: true, imageViewerIndex: galleryIndex }) }>
                    <Image
                      source={{ uri: imageBaseUrl + galleryObj.business_gallery_img }}  
                      resizeMode="cover"
                      style={styles.thumb}
                    />
                    </TouchableWithoutFeedback>
                  </Block>             
                )}
              </Block>
            </Block>
            <Block flex row style={{ paddingBottom: HeaderHeight * 1.95 }}>
              <Button
                shadowless
                style={[styles.button, styles.shadow, {backgroundColor: this.props.settings.staff_profile_card_button, marginHorizontal: 0, flex: 1}]}
                onPress={() => navigation.navigate('Book')}
              >
                <Text
                  color={this.props.settings.staff_profile_card_button_text}
                  style={{ fontFamily: 'poppins-medium' }}
                >
                  BOOK
                </Text>
              </Button>
            </Block>        
          </ScrollView>
        </Block>
        <ImageViewer
          visible={this.state.imageViewerVisible}
          index={this.state.imageViewerIndex}
          images={slideshowImages(galleryData.map(x => x.business_gallery_img))}
          toggleVisible={() => this.setState({ imageViewerVisible: !this.state.imageViewerVisible })}
        />
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
    staff: state.staff,
    gallery: state.gallery,
    gallery_mapping: state.gallery_mapping
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(StaffProfile))


const styles = StyleSheet.create({
  profile: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0,
    marginBottom: -HeaderHeight * 2,
  },
  profileImage: {
    width: width * 1.1,
    height: 'auto',
  },
  profileContainer: {
    width: width,
    height: height / 1.7,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  profileDetails: {
    paddingTop: theme.SIZES.BASE * 4,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  profileTexts: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE * 3.8,
    zIndex: 2
  },
  sectionTitle: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 5,
    marginBottom: 10
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
    width: thumbMeasure,
    height: thumbMeasure
  },
  gradient: {
    zIndex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    position: 'absolute',
  },
  button: {
    marginBottom: theme.SIZES.BASE,
    //width: width - (theme.SIZES.BASE * 2),
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 2,
  },
});
