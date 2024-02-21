import React from 'react';
import {
  Animated,
  StyleSheet,
  Dimensions,
  ImageBackground,
  View,
  Image,
  FlatList,
  LayoutAnimation,
  TouchableWithoutFeedback,
  TouchableOpacity
} from 'react-native';
import { Block, Text, theme, Icon } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import moment from "moment-timezone";
import LottieView from 'lottie-react-native';
import { Images, materialTheme } from "../constants/";
import ServicesApi from '../api/services';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import { imageBaseUrl } from '../constants/utils';
import GalleryCard from '../components/GalleryCard';
import BusinessLocationPickerModal from '../components/BusinessLocationPickerModal';
import ImageViewer from '../components/ImageViewer';
const { width } = Dimensions.get('screen');

class Home extends React.Component {
  focusSubscription;

  constructor(props) {
    super(props);
    
    this.state = {
      businessLocationId: null,
      businessLocationPickerVisible: false,
      imageViewerVisible: false,
      imageViewerIndex: 0,
      BusinessStatus: 0,
      DayOfWeek: 1,
      Days: [{DayName: 'Monday', DayNumber: 1, Date: null, start_time: '--', end_time: '--', open: 0}, {DayName: 'Tuesday', DayNumber: 2, Date: null, start_time: '--', end_time: '--', open: 0}, {DayName: 'Wednesday', DayNumber: 3, Date: null, start_time: '--', end_time: '--', open: 0}, {DayName: 'Thursday', DayNumber: 4, Date: null, start_time: '--', end_time: '--', open: 0}, {DayName: 'Friday', DayNumber: 5, Date: null, start_time: '--', end_time: '--', open: 0}, {DayName: 'Saturday', DayNumber: 6, Date: null, start_time: '--', end_time: '--', open: 0}, {DayName: 'Sunday', DayNumber: 7, Date: null, start_time: '--', end_time: '--', open: 0}],
      showHours: false,
      refreshing: false,
      page: 1,
      images: this.props.gallery.slice(0, 4),
      focusSubscription: {},
      logoAnim: new Animated.Value(0)
    }
  }

  _keyExtractor = (item, index) => item.business_gallery_id + '';

  componentDidMount = async () => {
    const { navigation } = this.props;
    this.getBusinessHours();
    focusSubscription = navigation.addListener(
      'willFocus',
      payload => {
        this.getBusinessHours();
      }
    );
    let DayOfWeek;
    if(this.props.business?.timezone_name) {
      DayOfWeek = moment().tz(this.props.business?.timezone_name, false).format('E');
    } else {
      DayOfWeek = moment().format('E');
    }
    this.setState({focusSubscription: focusSubscription, DayOfWeek});
    // Start logo animation
    Animated.timing(this.state.logoAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }

  componentWillUnmount() {
    this.state.focusSubscription.remove();
  }

  getBusinessHours = async () => {
    // Get opening hours for this week
    try {
      if(this.props.businessLocation?.length === 0) {
        return;
      }
      // Compute date range for this week
      let businessDate = moment().tz(this.props.business.timezone_name, false);
      let curDate = moment(businessDate).startOf('isoweek');
      let startDate = moment(businessDate).startOf('isoweek');
      let endDate = moment(businessDate).endOf('isoweek');
      let daysArr = [...this.state.Days];
      for (var i=0; i<7; i++) {
        daysArr[i].Date = curDate.format('YYYY-MM-DD');
        curDate.add(1, 'd');
      }
      let businessLocationId = this.state.businessLocationId ? this.state.businessLocationId : this.props.businessLocation[0]?.business_location_id;
      let response = await ServicesApi.getOpeningHours(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), businessLocationId);
      let hoursData = response.data;
      if(hoursData?.length > 0 && Array.isArray(hoursData)){
        hoursData.forEach((resultObj) => {
          let foundIndex = daysArr?.findIndex(dayObj => dayObj.DayNumber === parseInt(moment(resultObj.date, 'YYYY-MM-DD').format('E')));
          if(foundIndex >= 0) {
            daysArr[foundIndex].start_time = resultObj.start_time;
            daysArr[foundIndex].end_time = resultObj.end_time;
            daysArr[foundIndex].open = resultObj.open;
          }
        });
        this.setState({ Days: daysArr, businessLocationId }, this.checkBusinessStatus());
      } else {
        this.setState({ BusinessStatus: 0, businessLocationId });
      }
    } catch(e) {
      console.log(e);
      console.log('Unable to get business hours');
    }
  }

  checkBusinessStatus = () => {
    let todayMoment = moment().tz(this.props.business.timezone_name, false);
    let todayData = this.state.Days.find(Day => Day.Date === todayMoment.format('YYYY-MM-DD'));
    if(todayData.open === 1
      && todayMoment.isSameOrAfter(moment(todayData.start_time, 'HH:mm:ss').tz(this.props.business.timezone_name, true), 'minute')
      && todayMoment.isSameOrBefore(moment(todayData.end_time, 'HH:mm:ss').tz(this.props.business.timezone_name, true), 'minute')){
      this.setState({BusinessStatus: 1});
    } else {
      this.setState({BusinessStatus: 0});
    }
  }
 
  renderBusinessHoursContainer = (i) => {
    let isCurrentDay = i.DayNumber == this.state.DayOfWeek;
    return (
      <Block key={'Day' + i.DayNumber}>
        <View style={styles.headerCardHoursRow}>
          <Text style={isCurrentDay ? { fontFamily: 'poppins-semi-bold' } : { fontFamily: 'poppins-regular' }} size={15} color={this.props.settings?.home_card_title}>
            {i.DayName}
          </Text>
          <Text style={isCurrentDay ? { fontFamily: 'poppins-semi-bold' } : { fontFamily: 'poppins-regular' }} size={15} color={this.props.settings?.home_card_title}>
            {i.open === 1 ? i.start_time.substring(0,5) + ' - ' + i.end_time.substring(0,5) : 'Closed'}
          </Text>
        </View>
      </Block>
    );
  }

  renderBusinessStatusPulse(isClosed) {
    // Note repeated code here due to bug in react-lottie which meant that
    // loading the animation outside of the component meant that autoplay
    // doesn't work. Wait for update to lottie-react-native before change.
    return (
      <Block>
        {isClosed === true ? (
          <LottieView
            source={require('../assets/animations/closedPulse.json')}
            autoPlay
            loop
            style={{ width: 40, height: 40, marginRight: -7 }}
          />
        ) : (
          <LottieView
            source={require('../assets/animations/openPulse.json')}
            autoPlay
            loop
            style={{ width: 40, height: 40, marginRight: -7 }}
          />
        )}
      </Block>
    );
  }

  submitBusinessLocation = (e) => {
    this.setState({ businessLocationId: e, businessLocationPickerVisible: false }, () => this.getBusinessHours());
  }

  renderLocationSelector = () => {
    const businessLocationName = this.props.businessLocation?.find(x => x.business_location_id === this.state.businessLocationId)?.business_location_name;
    if(this.props.businessLocation?.length < 2) {
      return null;
    }
    return (
      <Block>
        <TouchableOpacity onPress={() => this.setState({ businessLocationPickerVisible: true })}>
          <Block row middle space="between" style={{ marginBottom: theme.SIZES.BASE }}>
            <Block middle row>
              <Icon
                size={11}
                name={"map-pin"}
                family="feather"
                color={this.props.settings?.home_card_title}
                style={{ paddingRight: 5 }}
              />
              <Text size={14} color={this.props.settings?.home_card_title} style={{ fontFamily: 'poppins-medium' }}>
                {businessLocationName}
              </Text>
            </Block>
            <Icon
                size={15}
                name={"align-justify"}
                family="feather"
                color={this.props.settings?.home_card_title}
                style={{ paddingRight: 5 }}
            />
          </Block>
        </TouchableOpacity>
        <BusinessLocationPickerModal
          data={this.props.businessLocation}
          id={this.state.businessLocationId}
          visible={this.state.businessLocationPickerVisible}
          toggleVisible={() => this.setState({ businessLocationPickerVisible: !this.state.businessLocationPickerVisible })}
          submit={(e) => this.submitBusinessLocation(e)}
          settings={this.props.settings}
        />
      </Block>
    );
  }

  renderHeaderCard = () => {
    const businessClosed = this.state.BusinessStatus === 0;
    const businessLocationName = this.props.businessLocation?.find(x => x.business_location_id === this.state.businessLocationId)?.business_location_name;
    return (
      <Block flex style={styles.cardContainer}>
        <Block flex style={[styles.card, { marginTop: theme.SIZES.BASE * 0.75 }]}>
          <TouchableWithoutFeedback
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              this.setState({
                showHours: !this.state.showHours
              });
            }}
          >
            <Block>
              <ImageBackground
                source={{uri: Images.BusinessCover}}
                style={styles.headerCardImageContainer}
                imageStyle={[
                  styles.headerCardImage,
                  this.state.showHours ? {borderBottomLeftRadius: 0, borderBottomRightRadius: 0} : null
                ]}
              >
                <View style={[
                  styles.headerCardOverlay,
                  {backgroundColor: this.props.settings.home_main_card_background},
                  this.state.showHours ? {borderBottomLeftRadius: 0, borderBottomRightRadius: 0} : null
                  ]} >
                    <Animated.View style={{ opacity: this.state.logoAnim }}>
                      <Image
                        style={[
                          styles.headerCardLogo,
                          {
                            height: this.props.settings.home_main_card_logo_width,
                            marginTop: this.props.settings.home_main_card_margin,
                          }
                        ]}
                        source={{uri: Images.BusinessLogo}}
                      />
                    </Animated.View>
                    <View style={styles.headerCardStatusContainer}>
                      {this.renderBusinessStatusPulse(businessClosed)}
                      <Text size={18} color={this.props.settings.home_main_card_status_text} style={styles.headerCardStatusText}>
                        {businessClosed ? "We're closed" : "We're open"}
                      </Text>
                    </View>
                    {this.props.businessLocation?.length > 1 && this.state.businessLocationId && !this.state.showHours ? (
                      <Block row middle style={{ justifyContent: 'center', marginBottom: 5 }}>
                        <Icon
                          size={10}
                          name={"map-pin"}
                          family="feather"
                          color={this.props.settings.home_main_card_status_text}
                          style={{ paddingRight: 5 }}
                        />
                        <Text color={this.props.settings.home_main_card_status_text} size={11} style={{ fontFamily: 'poppins-regular' }}>
                          {businessLocationName}
                        </Text>
                      </Block>
                    ) : null}
                </View>
              </ImageBackground>
            </Block>
          </TouchableWithoutFeedback>
          {this.state.showHours &&
            <View style={[styles.headerCardBody, {backgroundColor: this.props.settings.home_card_background}]}>
              {this.renderLocationSelector()}
              {this.state.Days.map(i => {
                return this.renderBusinessHoursContainer(i)
              })}
              <Block style={{ marginTop: theme.SIZES.BASE / 2 }}>
                <Text center size={10} style={{ fontFamily: 'poppins-regular' }} color={this.props.settings?.home_card_title}>
                  All times are shown in {this.renderTimezone()}
                </Text>
              </Block>
            </View> 
          }
        </Block>
      </Block>
    )
  }

  renderTimezone() {
    let todayMoment = moment().tz(this.props.business.timezone_name, false);
    return `${todayMoment.format('z')} (UTC ${todayMoment.format('Z')}).`;
  }

  toggleImageViewer = () => {
    this.setState({ imageViewerVisible: !this.state.imageViewerVisible });
  }

  renderImageViewer() {
    return (
      <ImageViewer
        visible={this.state.imageViewerVisible}
        index={this.state.imageViewerIndex}
        images={this.slideshowImages(this.state.images.filter(x => x.business_gallery_media_type !== 'VIDEO'))}
        toggleVisible={this.toggleImageViewer}
      />
    );
  }

  render() {
    return (
      <Block flex center style={[styles.container, {backgroundColor: this.props.settings.home_background}]}>
        {this.renderGalleryCards()}
        {this.renderImageViewer()}
      </Block>
    );
  }

  onScrollHandler = (event) => {
    // Check that next page exists
    if(this.props.gallery.length < this.state.page * 4) {
      return;
    }
    // Move to next page
    this.setState({
       page: this.state.page + 1
    }, () => {
      this.fetchRecords(this.state.page);
    });
  }

  fetchRecords = (page) => {
    const newRecords = this.props.gallery.slice(this.state.page * 4, this.state.page * 4 + 4);
    this.setState({
      images: [...this.state.images, ...newRecords]
    });
  }

  slideshowImages = (imgArray) => {
    return imgArray.map(x => x.business_gallery_type === 'WS' ? imageBaseUrl + x.business_gallery_img : x.business_gallery_img);
  }

  renderGalleryCards = () => {
    if(this.props.gallery && Array.isArray(this.props.gallery)){
      return(
          <FlatList data={this.state.images}
            keyExtractor={this._keyExtractor}
            ListHeaderComponent={this.renderHeaderCard}
            onEndReached={this.onScrollHandler}
            onEndThreshold={0}
            renderItem = {({item, separators}) => this.renderGalleryCard(item)}
            ListFooterComponent={
              <></>
            }
          />
      )
        
    } else {
      return null;
    }
  }

  handleGalleryCardPress = (item) => {
    if(item.business_gallery_media_type === 'VIDEO') {
      return;
    }
    this.setState({
      imageViewerVisible: true,
      imageViewerIndex: this.state.images.filter(x => x.business_gallery_media_type !== 'VIDEO').findIndex(x => x.business_gallery_id === item.business_gallery_id)
    });
  }

  renderGalleryCard(item) {
    let item_mapping = this.props.gallery_mapping.filter(x => x.business_gallery_id === item.business_gallery_id && x.business_gallery_map_type_id === 3);
    let avatarImg = null;
    if(item_mapping && item_mapping.length > 0) {
      let staffObj = this.props.staff.find(x => x.id === item_mapping[0].business_gallery_map_item_id);
      if(staffObj && staffObj.staff_menu_img) {
        avatarImg = imageBaseUrl + staffObj.staff_menu_img;
      }
    }
    // Format caption
    let timeSincePost;
    try {
      timeSincePost = moment(item.business_gallery_created, 'YYYY-MM-DD HH:mm:ss').tz(this.props.business.timezone_name, false).fromNow();
    } catch(err) {
      timeSincePost = moment().fromNow();
    }
    let caption = null;
    if(timeSincePost) {
      caption = timeSincePost.charAt(0).toUpperCase() + timeSincePost.slice(1);
    }
    return (
      <Block style={styles.cardContainer}>
        <GalleryCard
          key={'GalleryCard_' + item.business_gallery_id}
          data={item}
          flex
          borderless
          style={[styles.card, { backgroundColor: this.props.settings.home_card_background }]}
          title={item.business_gallery_caption}
          titleColor={this.props.settings.home_card_title}
          caption={caption}
          captionColor={this.props.settings.home_card_date}
          location={
            (this.props.business.address_city || item.business_gallery_type === "IG") ?
              <Block row middle>
                <Icon
                  size={13}
                  name={item.business_gallery_type === "IG" ? "instagram" : "map-pin"}
                  family="feather"
                  color={this.props.settings.home_card_date}
                  style={{ paddingRight: 5 }}
                />
                <Text
                  p muted size={theme.SIZES.FONT * 0.8}
                  color={this.props.settings.home_card_date}
                  style={{ fontFamily: 'poppins-regular' }}
                >
                  {item.business_gallery_type === "IG" ? "Instagram" : this.props.business.address_city}
                </Text>
              </Block>
            : null}
          avatar={avatarImg}
          imageStyle={[styles.cardImage, this.props.settings?.home_card_format === "square" ? { height: width - theme.SIZES.BASE * 1.5 } : null]}
          imageBlockStyle={styles.cardImageContainer}
          image={item.business_gallery_type === 'WS' ? imageBaseUrl + item.business_gallery_img : item.business_gallery_img}
          mediaType={item.business_gallery_media_type}
          onImagePress={this.handleGalleryCardPress}
        />
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings,
    gallery: state.gallery.filter(x => x.business_gallery_app_home_screen === 1),
    gallery_mapping: state.gallery_mapping,
    staff: state.staff,
    business: state.details,
    businessLocation: state.businessLocation
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Home));

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerCardImageContainer: {
    width: '100%',
    height: 150
  },
  headerCardImage: {
    borderRadius: 7
  },
  headerCardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 7,
    flex: 1
  },
  headerCardLogo: {
    height: 65,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    marginTop: 20
  },
  headerCardStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  headerCardStatusIcon: {
    height: 14,
    width: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  headerCardStatusText: {
    fontFamily: 'poppins-light',
    fontSize: 18
  },
  headerCardBody: {
    padding: theme.SIZES.BASE,
    borderRadius: 7,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  },
  headerCardHoursRow: {
    flexDirection: 'row',
    paddingBottom: 4,
    marginBottom: 4,
    borderBottomColor: '#F4F4F4',
    borderBottomWidth: 1,
    justifyContent: 'space-between'
  },
  closedStatus: {
    backgroundColor: materialTheme.THEME.DANGER,
  },
  openStatus: {
    backgroundColor: theme.COLORS.SUCCESS,
  },
  cardContainer: {
    width: width,
  },
  card: {
    borderRadius: 7,
    marginBottom: theme.SIZES.BASE * 0.75,
    marginHorizontal: theme.SIZES.BASE * 0.75
  },
  cardImageContainer: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  cardImage: {
    height: 250,
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  }
});
