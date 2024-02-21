import React from 'react';
import { Easing, Animated } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createCompatNavigatorFactory } from '@react-navigation/compat';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/Home';
import StaffProfileScreen from '../screens/StaffProfile';
import ProScreen from '../screens/Pro';
import ServiceScreen from '../screens/Service';
import StaffScreen from '../screens/Staff';
import ServiceProfileScreen from '../screens/ServiceProfile';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import BookScreen from '../screens/Book';
import SlideShowScreen from '../screens/SlideShowScreen';
import BookingsScreen from '../screens/Bookings';
import BookingEditScreen from '../screens/BookingEdit';
import SettingsScreen from '../screens/Settings';
import AccountScreen from '../screens/Account';
import AccountManagementScreen from '../screens/AccountManagement';
import AccountDeletionScreen from '../screens/AccountDeletion';
import SignInScreen from '../screens/SignIn';
import SignUpScreen from '../screens/SignUp';
import ReportProblemScreen from '../screens/ReportProblem';
import ProductScreen from '../screens/Product';
import ProductProfileScreen from '../screens/ProductProfile';
import WaitListScreen from '../screens/WaitList';
import WaitListAddScreen from '../screens/WaitListAdd';
import PaymentMethodScreen from '../screens/PaymentMethod';
import PaymentMethodAddScreen from '../screens/PaymentMethodAdd';
import BookingPolicies from '../screens/BookingPolicies';
import BookServiceScreen from '../screens/BookService';

//import Menu from './Menu';
import DrawerContainer from './DrawerContainer';
import Header from '../components/Header';
import materialTheme from '../constants/Theme';


const transitionConfig = (transitionProps, prevTransitionProps) => ({
  transitionSpec: {
    duration: 400,
    easing: Easing.out(Easing.poly(4)),
    timing: Animated.timing,
  },
  screenInterpolator: sceneProps => {
    const { layout, position, scene } = sceneProps;
    const thisSceneIndex = scene.index
    const width = layout.initWidth
    
    const scale = position.interpolateNode({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [4, 1, 1]
    })
    const opacity = position.interpolateNode({
      inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
      outputRange: [0, 1, 1],
    })
    const translateX = position.interpolateNode({
      inputRange: [thisSceneIndex - 1, thisSceneIndex],
      outputRange: [width, 0],
    })

    const scaleWithOpacity = { opacity };
    const screenName = "Search";

    if (screenName === transitionProps.scene.route.routeName ||
      (prevTransitionProps && screenName === prevTransitionProps.scene.route.routeName)) {
      return scaleWithOpacity;
    }
    return { transform: [{ translateX }] }
  }
})

const HomeStack = createCompatNavigatorFactory(createStackNavigator)({
  Home: {
    screen: HomeScreen, 
    navigationOptions: ({navigation}) => ({
      header: () => <Header tabs title="" tabTitleRight={'Book'} navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      }
    })
  },
  Pro: {
    screen: ProScreen,
    navigationOptions: ({navigation}) => ({
      header: () => <Header transparent disabled title="" navigation={navigation} />,
      headerTransparent: true,
      gesturesEnabled: false,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      }
    })
  },
});

const StaffStack = createCompatNavigatorFactory(createStackNavigator)({
  Staff: {
    screen: StaffScreen,
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Staff" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  StaffProfile: {
    screen: StaffProfileScreen,
    navigationOptions: ({ navigation }) => ({
      header: () => <Header white transparent back title="" navigation={navigation} />,
      headerTransparent: true,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  }
});

const ServiceStack = createCompatNavigatorFactory(createStackNavigator)({
  Service: {
    screen: ServiceScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header search title="Services" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  ServiceProfile: {
    screen: ServiceProfileScreen,
    
    navigationOptions: ({ navigation }) => ({
      header: () => <Header white back transparent title="Service" navigation={navigation} />,
      headerTransparent: true,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  BookService: {
    screen: BookServiceScreen,
    
    navigationOptions: ({ navigation }) => ({
      header: () => <Header back title="Book Service" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  }
});

const BookStack = createCompatNavigatorFactory(createStackNavigator)({
  Book: {
    screen: BookScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Book" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  WaitListAdd: {
    screen: WaitListAddScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Join Wait List" back navigation={navigation} />,
    })
  },
  PaymentMethod: {
    screen: PaymentMethodScreen,
    
    navigationOptions: ({ navigation }) => ({
      header: () => <Header back title="Select Payment Method" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  PaymentMethodAdd: {
    screen: PaymentMethodAddScreen,
    
    navigationOptions: ({ navigation }) => ({
      header: () => <Header back title="Add Payment Method" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  }
});

const ProductStack = createCompatNavigatorFactory(createStackNavigator)({
  Product: {
    screen: ProductScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Products" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  ProductProfile: {
    screen: ProductProfileScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Product" white back transparent navigation={navigation} />,
      headerTransparent: true,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  SlideShow: {
    screen: SlideShowScreen,
    
    navigationOptions: ({ navigation }) => ({
      header: () => <Header white transparent back title="" navigation={navigation} />,
      headerTransparent: true,
      gesturesEnabled: false,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  }
});

const WaitListStack = createCompatNavigatorFactory(createStackNavigator)({
  WaitList: {
    screen: WaitListScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Wait List" navigation={navigation} />,
    })
  },
  WaitListAdd: {
    screen: WaitListAddScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Join Wait List" back navigation={navigation} />,
    })
  }
},);

const BookingsStack = createCompatNavigatorFactory(createStackNavigator)({
  Bookings: {
    screen: BookingsScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Bookings" navigation={navigation} />,
    })
  },
  BookingEdit: {
    screen: BookingEditScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Edit Booking" back navigation={navigation} />,
    })
  },
});

const SettingsStack = createCompatNavigatorFactory(createStackNavigator)({
  Settings: {
    screen: SettingsScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Settings" navigation={navigation} />,
    })
  },
  Account: {
    screen: AccountScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header back title="Account" navigation={navigation} />,
    })
  },
  AccountManagement: {
    screen: AccountManagementScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header back title="Account Management" navigation={navigation} />,
    })
  },
  AccountDeletion: {
    screen: AccountDeletionScreen,
    navigationOptions: ({navigation}) => ({
      header: () => <Header back title="Delete Account" navigation={navigation} />,
    })
  },
  ReportProblem: {
    screen: ReportProblemScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header back title="Report Problem" navigation={navigation} />,
    })
  },
  BookingPolicies: {
    screen: BookingPolicies,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header back title="Booking Policies" navigation={navigation} />,
    })
  },
  PaymentMethod: {
    screen: PaymentMethodScreen,
    
    navigationOptions: ({ navigation }) => ({
      header: () => <Header back title="Select Payment Method" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  },
  PaymentMethodAdd: {
    screen: PaymentMethodAddScreen,
    
    navigationOptions: ({ navigation }) => ({
      header: () => <Header back title="Add Payment Method" navigation={navigation} />,
      cardStyle: { 
        backgroundColor: materialTheme.THEME.BACKGROUND, //this is the backgroundColor for the app
      },
    })
  }
});
// {
//   transitionConfig,
//   headerMode: 'screen'
// });

const SignInStack = createCompatNavigatorFactory(createStackNavigator)({
  SignIn: {
    screen: SignInScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header title="Sign In" white transparent navigation={navigation} />,
      headerTransparent: true,
    })
  },
  SignUp: {
    screen: SignUpScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header back title="Sign Up" white transparent navigation={navigation} />,
      headerTransparent: true,
    })
  },
  ForgotPassword: {
    screen: ForgotPasswordScreen,
    
    navigationOptions: ({navigation}) => ({
      header: () => <Header back title="Forgot Password" white transparent navigation={navigation} />,
      headerTransparent: true,
    })
  }
},
{
  cardStyle: { 
    backgroundColor: materialTheme.THEME.BACKGROUND //this is the backgroundColor for the app
  },
  transitionConfig
});

const Drawer = createDrawerNavigator();

function AppStack(props) {
  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={props => <DrawerContainer {...props} />}
      initialRouteName="Home"
      screenOptions={{headerMode: 'screen'}}
    >
      <Drawer.Screen name="Home" component={HomeStack}/>
      <Drawer.Screen name="Services" component={ServiceStack}/>
      <Drawer.Screen name="Staff" component={StaffStack}/>
      <Drawer.Screen name="Products" component={ProductStack}/>
      <Drawer.Screen name="WaitList" component={WaitListStack}/>
      <Drawer.Screen name="Book" component={BookStack}/>
      <Drawer.Screen name="Bookings" component={BookingsStack}/>
      <Drawer.Screen name="Settings" component={SettingsStack}/>
      <Drawer.Screen name="SignIn" component={SignInStack}/>
    </Drawer.Navigator>
  );
}

export default AppStack;