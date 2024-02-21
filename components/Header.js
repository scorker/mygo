import React from 'react';
import { withNavigation } from '@react-navigation/compat';
import { TouchableOpacity, StyleSheet, Dimensions, Linking, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button, Block, NavBar, Input, Text, theme } from 'galio-framework';
import moment from "moment-timezone";

import Modal from "react-native-modal";

//import Icon from './Icon';
import materialTheme from '../constants/Theme';
import { iPhoneX } from '../constants/utils';
import { TouchableWithoutFeedback } from 'react-native';
import { UserContext } from "../providers/userProvider";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import Icon from './Icon';


const { width } = Dimensions.get('window');

class Header extends React.Component {
  
  static contextType = UserContext;

  constructor(props) {
    super(props);
    this.state = {
      contactModalVisible: false,
      searchResultVisible: false,
      notificationModalVisible: false,
      helpModalVisible: false,
      search: ''
    }
  }

  handleChange = (name, value) => {
    let that = this;
    this.setState({ 
      [name]: value,
      searchResultVisible: value !== ''
    }, that.props.renderSearchResults);
  }

  setContactModalVisible(visible) {
    this.setState({contactModalVisible: visible});
  }

  setNotificationModalVisible(visible) {
    this.setState({notificationModalVisible: visible});
  }

  setHelpModalVisible(visible) {
    this.setState({ helpModalVisible: visible });
  }
  
  renderContactButton = () => {
    return [
      <View key={0}>
      <TouchableOpacity style={styles.button} onPress={() => this.setContactModalVisible(true)}>
        <Icon
          family="Feather"
          size={16}
          name="phone"
          color={this.props.settings.header_icon}
        />
      </TouchableOpacity>
    </View>
    ]
  }

  renderContactModal = () => {
    return [
      <View key={0}>
        <Modal isVisible={this.state.contactModalVisible} onBackdropPress={() => this.setContactModalVisible(false)} style={{justifyContent: 'flex-end', margin: 0}}>
          <View style={{backgroundColor: this.props.settings.contact_background}}>
            <Text size={25} style={{fontFamily: 'poppins-light', textAlign: 'center', padding: 10, color: this.props.settings.contact_title}}>Contact Us</Text>
            <Block row space="evenly" style={{marginBottom: 10, marginHorizontal: 10}}>
              {this.props.settings.contact_call_enabled === 1 ?
                <Block flex style={{ marginHorizontal: 5 }}>
                  <Button shadowless color='white' style={{ width: '100%', borderColor: this.props.settings.contact_call, borderWidth: 1, backgroundColor: this.props.settings.contact_background, marginHorizontal: 0 }} textStyle={{color: this.props.settings.contact_call, fontFamily: 'poppins-medium'}} onPress={() => Linking.openURL(`tel:` + this.props.details.business_phone_no)}>
                    CALL
                  </Button>
                </Block>
              : null}
              {this.props.settings.contact_sms_enabled === 1 ?
                <Block flex style={{ marginHorizontal: 5 }}>
                  <Button shadowless color='white' style={{ width: '100%', borderColor: this.props.settings.contact_sms, borderWidth: 1, backgroundColor: this.props.settings.contact_background, marginHorizontal: 0 }} textStyle={{color: this.props.settings.contact_sms, fontFamily: 'poppins-medium'}} onPress={() => Linking.openURL(`sms:` + this.props.details.business_phone_no)}>
                    SMS
                  </Button>
                </Block>
              : null}
              {this.props.settings.contact_email_enabled === 1 ?
                <Block flex style={{ marginHorizontal: 5 }}>
                  <Button shadowless color='white' style={{ width: '100%', borderColor: this.props.settings.contact_email, borderWidth: 1, backgroundColor: this.props.settings.contact_background, marginHorizontal: 0 }} textStyle={{color: this.props.settings.contact_email, fontFamily: 'poppins-medium'}} onPress={() => Linking.openURL(`mailto:` + this.props.details.business_email)}>
                    EMAIL
                  </Button>
                </Block>
              : null}
            </Block>
          </View>
        </Modal>
      </View>
    ]
  }

  renderNotificationButton = () => {
    return [
    <View key={0}>
      <TouchableOpacity style={styles.button} onPress={() => this.setNotificationModalVisible(true)}>
        <Icon
          family="Feather"
          size={17}
          name="bell"
          color={this.props.settings.header_icon}
        />
        { this.props.notifications && this.props.notifications.length > 0 ? <Block middle style={styles.notify} /> : null}
      </TouchableOpacity>
    </View>
    ]
  };

  renderNotificationModal = () => {
    return [
      <View key={0} style={{flex: 1}}>
        <Modal
          isVisible={this.state.notificationModalVisible}
          animationInTiming={250}
          animationOutTiming={250}
          onBackdropPress={() => this.setNotificationModalVisible(false)}
          style={{margin: 15}}
          swipeDirection={['up', 'down']}
          onSwipeComplete={() => this.setNotificationModalVisible(false)}
        >
          <View style={{backgroundColor: this.props.settings.notification_background, borderRadius: 8}}>
          <Text size={25} style={{fontWeight: '200', textAlign: 'center', padding: 15, color: this.props.settings.notification_title, fontFamily: 'poppins-light'}}>{this.props.notifications && this.props.notifications.length > 0 ? 'Notifications': 'No notifications'}</Text>
            <View style={{width: '100%', paddingHorizontal: 10, marginBottom: 10}}>
            {this.props.notifications && Array.isArray(this.props.notifications) && this.props.notifications.map(function(result, index){
              if(result.notification_important == 1){
                return (
                  <Block key={'notification' + index}>
                    <Text size={12} style={{color: this.props.settings.notification_important_item_date, textAlign: 'center', marginBottom: 4, fontFamily: 'poppins-regular'}}><Text style={{ fontFamily: 'poppins-semi-bold' }}>{moment(result.notification_date).tz(this.props.details.timezone_name, false).format('ddd D MMM YYYY')}</Text>, {moment(result.notification_date).tz(this.props.details.timezone_name, false).format('HH:mm')} - <Text bold style={{color: materialTheme.THEME.DANGER}}>IMPORTANT</Text></Text>
                    <Block style={{padding: 8, backgroundColor: this.props.settings.notification_important_item_background, borderRadius: 6, marginBottom: 14}}>
                      <Text style={{marginBottom: 5, color: this.props.settings.notification_important_item_text, fontFamily: 'poppins-regular'}} size={14}>{result.notification_body}</Text>
                    </Block>
                  </Block>
                )
              } else {
                return (
                  <Block key={'notification' + index}>
                    <Text size={12} style={{color: this.props.settings.notification_item_date, textAlign: 'center', marginBottom: 4, fontFamily: 'poppins-regular'}}><Text style={{ fontFamily: 'poppins-semi-bold' }}>{moment(result.notification_date).tz(this.props.details.timezone_name, false).format('ddd D MMM YYYY')}</Text>, {moment(result.notification_date).tz(this.props.details.timezone_name, false).format('HH:mm')}</Text>
                    <Block style={{padding: 8, backgroundColor: this.props.settings.notification_item_background, borderRadius: 6, marginBottom: 14}}>
                      <Text style={{marginBottom: 5, color: this.props.settings.notification_item_text, fontFamily: 'poppins-regular'}} size={14}>{result.notification_body}</Text>
                    </Block>
                  </Block>
                )
              }
            }, this)
            }
            </View>
          </View>
        </Modal>
      </View>
    ]
  }

  renderHelpButton = () => {
    return [
    <View key={0}>
      <TouchableOpacity style={styles.button} onPress={() => this.setHelpModalVisible(true)}>
        <Icon
          family="AntDesign"
          size={17}
          name="questioncircleo"
          color={this.props.settings.header_icon}
        />
      </TouchableOpacity>
    </View>
    ]
  };

  renderHelpModal = () => {
    const { routeName } = this.props.navigation.state;
    let icon = null, family = null, title = null, description = null;
    if(routeName === "WaitList") {
      icon="zap";
      family="feather"
      title="Wait List";
      description="Our wait list allows you to be notified when a booking slot becomes available. This is a great way to be notified of last-minute availability when we're really busy!";
    } else if(routeName === "Bookings") {
      icon="gesture-swipe-left"
      family="material-community"
      title="Swipe Left"
      description="Swipe a booking left to see the available editing and cancellation options. You cannot cancel recurring bookings - please contact us and we will cancel these for you."
    }
    return [
      <View key={0} style={{flex: 1}}>
        <Modal isVisible={this.state.helpModalVisible} onBackdropPress={() => this.setHelpModalVisible(false)} style={{margin: 15}} swipeDirection={['up', 'down']} onSwipeComplete={() => this.setHelpModalVisible(false)}>
          <View style={{backgroundColor: this.props.settings.wait_list_help_background, borderRadius: 8}}>
            <Icon size={35} name={icon} family={family} color={this.props.settings.wait_list_help_text} style={{ textAlign: 'center', padding: 15 }} />
            <Text size={28} style={{fontFamily: 'poppins-light', textAlign: 'center', color: this.props.settings.wait_list_help_text}}>{title}</Text>
            <View style={{paddingHorizontal: 20, marginVertical: 20}}>
              <Text
                size={14}
                color={this.props.settings.wait_list_help_text}
                style={{ lineHeight: 22, fontFamily: 'poppins-regular' }}
              >
                {description}
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    ]
  }
  
  handleLeftPress = () => {
    const { back, disabled, navigation } = this.props;
    if(disabled){
      return null;
    }
    return (back ? navigation.goBack() : navigation.openDrawer());
  }

  renderRight = () => {
    const { navigation } = this.props;
    const { routeName } = navigation.state;
    switch (routeName) {
      case 'Home':
        return ([
            this.renderContactButton(),
            this.renderNotificationButton()
        ]);
      case 'Deals':
        return ([
          this.renderNotificationButton()
        ]);
      case 'Services':
        return ([
          this.renderNotificationButton()
        ]);
      case 'Category':
        return ([
          this.renderNotificationButton()
        ]);
      case 'Profile':
        return ([
          //this.renderNotificationButton()
        ]);
      case 'Search':
        return ([
          this.renderNotificationButton()
        ]);
      case 'WaitList':
        return ([
          this.renderHelpButton()
        ]);
      case 'Bookings':
        return ([
          this.renderHelpButton()
        ]);
      case 'Settings':
        return ([
          //this.renderNotificationButton()
        ]);
      default:
        break;
    }
  }

  renderSearch = () => {
    return null;
    return (
      <Input
        right
        color={this.props.settings.header_title}
        style={[styles.search, {color: this.props.settings.header_search, backgroundColor: this.props.settings.header_background, borderColor: this.props.settings.header_search }]}
        onChangeText={text => this.handleChange('search', text)}
        placeholder="What are you looking for?"
        value={this.state.search}
        placeholderTextColor={this.props.settings.header_search}
        iconContent={this.state.search ? this.state.search.length == 0 ? <Icon size={16} color={this.props.settings.header_search} name="magnifying-glass" family="entypo" /> : <Icon size={16} color={this.props.settings.header_search} name="circle-with-cross" family="entypo" onPress={() =>  this.handleChange('search', '') }/> : <Icon size={16} color={this.props.settings.header_search} name="magnifying-glass" family="entypo" />}
      />
    )
  }

  renderSearchResults = () => {
    return null;
    const { navigation, service } = this.props;
    let that = this;
    let found = service.filter(x => x.serice_name.toLowerCase().includes(that.state.search && that.state.search.toLowerCase())).map((serviceObj,) => {
      return {
        title: serviceObj.service_name,
        service_business_id: serviceObj.service_id
      };
    });
    return (
    <View style={styles.searchResults}> 
      {found && found.map(function(result, index){
        if(result.services.length > 0) {
          return <Block key={'search_result_' + index}>
            
            {result.services.map(function(item, i) {
              return <TouchableWithoutFeedback key={'search_item_touchable_' + i} onPress={() => { 
                that.setState({search: undefined});
                navigation.navigate('ServiceProfile', { 
                serviceSummary: serviceSummary, 
                title: item.service_name, 
                service: item
                 })}
                }>
                  <Text style={styles.searchResult} key={'search_item_' + i}>{item.service_name ? item.service_name.replace('%comma%', ',').replace('%apostrophe%', "'") : null}</Text>
               
              </TouchableWithoutFeedback>
            })}
    
          </Block>
        }
        })
      }  
    </View>
    )
  }

  renderTabs = () => {
    const { navigation, tabTitleLeft, tabTitleRight } = this.props;
    const user = this.context;
    return (
      <Block row style={styles.tabs}>
        <Button shadowless style={[styles.tab, styles.divider, {borderRightColor: this.props.settings.header_title}]} onPress={() => navigation.navigate('Services')}>
          <Block row middle>
            <Icon size={this.props.settings.header_service_icon_size} name={this.props.settings.header_service_icon_name} family={this.props.settings.header_service_icon_family} style={{ paddingRight: 8, color: this.props.settings.header_icon }} />
            <Text size={15} style={[styles.tabTitle, {color: this.props.settings.header_title}]}>{tabTitleLeft || 'Services'}</Text>
          </Block>
        </Button>
        <Button shadowless style={styles.tab} onPress={() => {user ? navigation.navigate('Book') : navigation.navigate('SignIn')}}>
          <Block row middle>
            <Icon size={16} name="book" family="feather" style={{ paddingRight: 8, color: this.props.settings.header_icon }} />
            <Text size={15} style={[styles.tabTitle, {color: this.props.settings.header_title}]}>{tabTitleRight || 'Book'}</Text>
          </Block>
        </Button>
      </Block>
    )
  }

  renderHeader = () => {
    const { search, tabs } = this.props;
    if (search || tabs) {
      return (
        <Block center>
          {search ? this.renderSearch() : null}
          {tabs ? this.renderTabs() : null}
        </Block>
      )
    }
    return null;
  }

  handleStatusBarState() {
    try {
      const { title, translucent } = this.props;
      let darkScreens = ["SignIn", "SignUp", "ForgotPassword"];
      if(darkScreens.includes(title)) {
        StatusBar.setHidden(false, 'none');
        StatusBar.setStyle('light');
        StatusBar.setTranslucent(false);
      } else if(translucent) {
        StatusBar.setHidden(true, 'none');
      } else {
        StatusBar.setHidden(false, 'none');
        StatusBar.setStyle(this.props.settings.theme_type === 'Dark' ? 'light': 'dark');
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor(this.props.settings.header_background, 'none')
      }
    } catch(err) {
      console.log('Unable to update status bar');
    }
  }

  /*render*/
  render() {
    const { back, title, white, transparent, navigation, disabled } = this.props;
    const { routeName } = navigation.state;
    const noShadow = ["Search", "Services", "Deals", "Pro", "Profile"].includes(routeName);
    const headerStyles = [
      !noShadow ? styles.shadow : null,
      transparent ? { backgroundColor: 'rgba(0,0,0,0)' } : { backgroundColor: this.props.settings.header_background },
    ];
    const helpModalVisible = ["WaitList", "Bookings"].includes(routeName);
    return (
      <Block style={headerStyles}>
        <StatusBar
          animated={true}
          backgroundColor={!transparent ? this.props.settings.header_background : null}
          style={this.props.settings.theme_type === 'Dark' ? 'light': 'dark'}
          translucent={false}
          hidden={false}
        />
        <NavBar
          back={back}
          title={title}
          style={[styles.navbar, transparent ? { backgroundColor: 'rgba(0,0,0,0)' } : { backgroundColor: this.props.settings.header_background }]}
          transparent={transparent}
          right={this.renderRight()}
          rightStyle={{ alignItems: 'center' }}
          leftStyle={{ flex: 0.3, paddingTop: 2 }}
          leftIconName={back ? 'chevron-left':'navicon'}
          leftIconSize={back ? 30 : 22}
          leftIconColor={!disabled ? transparent ? this.props.settings.header_icon_back_transparent : this.props.settings.header_icon_back : 'rgba(0,0,0,0)'}
          titleStyle={[
            styles.title,
            transparent ? {color: this.props.settings.header_title_transparent} : {color: this.props.settings.header_title},
          ]}
          onLeftPress={this.handleLeftPress}
        />
        {this.renderHeader()}
        {routeName == 'Home' ? this.renderContactModal() : null}
        {helpModalVisible ? this.renderHelpModal() : null}
        {this.renderNotificationModal()}
        {this.state.searchResultVisible && this.renderSearchResults()}
      </Block>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    service: state.service,
    settings: state.settings,
    notifications: state.notifications,
    details: state.details
  }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Header));


const styles = StyleSheet.create({
  button: {
    padding: 12,
    //marginRight: -30,
    position: 'relative',
  },
  title: {
    width: '100%',
    fontSize: 16,
    fontFamily: 'poppins-semi-bold'
  },
  navbar: {
    paddingVertical: 0,
    paddingBottom: Platform.OS === 'ios' ? theme.SIZES.BASE * 1.5 : 0,
    paddingTop: Platform.OS === 'ios' ? (iPhoneX() ? theme.SIZES.BASE * 4 : theme.SIZES.BASE * 3) : 0,
    zIndex: 5
  },
  shadow: {
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  notify: {
    backgroundColor: materialTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  header: {
    backgroundColor: materialTheme.THEME.PRIMARY,
  },
  divider: {
    borderRightWidth: 0.3,
    //borderRightColor: theme.COLORS.MUTED,
  },
  arrow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  search: {
    height: 48,
    width: width - 32,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 3
    //backgroundColor: materialTheme.THEME.PRIMARY,
    //color: materialTheme.THEME.MUTED
  },
  searchResults: {
   position: 'absolute',
   top: 130,
   width: width,
   shadowColor: '#000000',
   shadowOpacity: 0.9,
   elevation: 5
  },
  searchResult: {
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: materialTheme.THEME.LIGHTMUTED
  },
  tabs: {
    marginBottom: 24,
    marginTop: 10,
    elevation: 4,
  },
  tab: {
    backgroundColor: theme.COLORS.TRANSPARENT,
    width: width * 0.50,
    borderRadius: 0,
    borderWidth: 0,
    height: 24,
    elevation: 0,
  },
  tabTitle: {
    lineHeight: 19,
    fontFamily: 'poppins-regular',
    //color: materialTheme.THEME.ICON
  },
})