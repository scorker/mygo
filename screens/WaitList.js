import React from 'react';
import { StyleSheet, ScrollView, Dimensions, RefreshControl, Animated, Alert } from 'react-native';
import { Block, Text, theme, Button } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import { firebaseApp } from './../api/firebase/config';
import { getAuth } from 'firebase/auth';
import ServicesApi from '../api/services';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment-timezone';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton, GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserContext } from "../providers/userProvider";

const { height, width } = Dimensions.get('screen');

class WaitList extends React.Component {
    static contextType = UserContext;

    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: true,
            swipeableRow: [],
            swipeableIndex: 0
        }
    }

    componentDidMount() {
        this.loadWaitList();
    }

    close = (index) => {
        this.state.swipeableRow[index].close();
    };

    loadWaitList() {
        let that = this;
        this.setState({ loading: true });
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if(user) {
            user.getIdToken().then(function(idToken) {
                let bodyData = {
                    businessId: ServicesApi.getBusinessId(),
                    appKey: ServicesApi.getBusinessAppKey(),
                    idToken: idToken
                };
                ServicesApi.getWaitList(bodyData).then(response => {
                    return response.data;
                }).then((data) => {
                    that.props.actions.loadWaitList(data.waitListData);
                    that.setState({ loading: false });
                }).catch(function(error) {
                    console.log(error);
                    that.setState({ loading: false });
                });
            }).catch(function(error) {
                // Unknown error
                that.setState({ loading: false });
                console.log(error);
            });
        } else {
            // User not signed in
            that.setState({ loading: false });
            that.context.logout();
            that.props.navigation.navigate('Home');
        }
    }

    deleteWaitList(waitListObject) {
        let that = this;
        this.setState({ loading: true });
        const auth = getAuth(firebaseApp);
        const user = auth.currentUser;
        if(user) {
            user.getIdToken().then(function(idToken) {
                let bodyData = {
                    businessId: ServicesApi.getBusinessId(),
                    appKey: ServicesApi.getBusinessAppKey(),
                    idToken: idToken,
                    user_wait_list_id: waitListObject.user_wait_list_id
                };
                ServicesApi.deleteWaitList(bodyData).then(response => {
                    return response.data;
                }).then((data) => {
                    that.props.actions.deleteWaitList(waitListObject);
                    that.setState({ loading: false });
                }).catch(function(error) {
                    console.log(error);
                    that.setState({ loading: false });
                });
            }).catch(function(error) {
                // Unknown error
                that.setState({ loading: false });
                console.log(error);
            });
        } else {
            // User not signed in
            that.setState({ loading: false });
            that.context.logout();
            that.props.navigation.navigate('Home');
        }
    }

    renderRightAction = (progress, waitListIndex, waitListObject) => {
        const trans = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [80, 0],
        });
        const pressHandler = () => {
            this.setState({ swipeableIndex: waitListIndex });
            Alert.alert(
                "Are you sure?",
                "Please confirm that you want to delete this item from your wait list.",
                [
                  {
                    text: "No",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  { text: "Yes", onPress: () => this.deleteWaitList(waitListObject) }
                ],
                { cancelable: false }
            );
        };
        return (
            <Block style={{ width: 80, flexDirection: 'row' }}>
                <Animated.View useNativeDriver={true} style={{ flex: 1, transform: [{ translateX: trans }] }}>
                    <RectButton style={[{alignItems: 'center', flex: 1, justifyContent: 'center', backgroundColor: '#f44336' }]} onPress={pressHandler}>
                        <Text style={{color: 'white', fontSize: 15, backgroundColor: 'transparent', padding: 10, fontFamily: 'poppins-regular'}}>Delete</Text>
                    </RectButton>
                </Animated.View>
            </Block>
        );
    };

    render() {
        const { navigation } = this.props;
        return (
            <Block flex center style={{backgroundColor: this.props.settings.wait_list_background}}>
                {this.state.loading ?
                    <Block>
                        <Spinner visible={true} />
                    </Block>
                : null}
                {this.props.wait_list && this.props.wait_list.length > 0 ? 
                    <Block style={{ width: width, marginHorizontal: theme.SIZES.BASE, backgroundColor: this.props.settings.wait_list_header_background }}>
                        <Block style={{ paddingHorizontal: theme.SIZES.BASE, paddingVertical: theme.SIZES.BASE / 2 }}>
                            <Text size={12} color={this.props.settings.wait_list_header_text} style={{ fontFamily: 'poppins-regular' }}>You will be notified if a booking slot becomes available on any of the following dates:</Text>
                        </Block>
                    </Block>
                : null}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.waitListScroll}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.loadWaitList()}/>}>
                    {this.props.wait_list && this.props.wait_list.length > 0 ? this.props.wait_list.map((waitListObj, waitListIndex) => {
                        return (
                            <Block style={[styles.shadow, { marginBottom: theme.SIZES.BASE, backgroundColor: '#ffffff', borderRadius: 5, borderLeftWidth: 8, borderLeftColor: '#FF9800' }]}>
                                <GestureHandlerRootView>
                                    <Swipeable ref={ref => this.state.swipeableRow[waitListIndex] = ref} friction={2} rightThreshold={15} renderRightActions={(data) => this.renderRightAction(data, waitListIndex, waitListObj) }>
                                        <Block style={{ padding: theme.SIZES.BASE }}>
                                            {moment(waitListObj.start_date).format('YYYY-MM-DD') === moment(waitListObj.end_date).format('YYYY-MM-DD') ?
                                                <Block>
                                                    <Block flex row>
                                                        <Text style={{ fontFamily: 'poppins-semi-bold' }}>Date: </Text>
                                                        <Text style={{paddingBottom: theme.SIZES.BASE / 2, fontFamily: 'poppins-regular'}}>{moment(waitListObj.start_date).format('ddd D MMM YYYY')}</Text>
                                                    </Block>
                                                    <Block flex row>
                                                        <Text style={{ fontFamily: 'poppins-semi-bold' }}>Time: </Text>
                                                        <Text style={{ fontFamily: 'poppins-regular' }}>From </Text>
                                                        <Text style={{ fontFamily: 'poppins-semi-bold' }}>{moment(waitListObj.start_time, 'HH:mm:ss').format('HH:mm')}</Text>
                                                        <Text style={{ fontFamily: 'poppins-regular' }}> to </Text>
                                                        <Text style={{ fontFamily: 'poppins-semi-bold' }}>{moment(waitListObj.end_time, 'HH:mm:ss').format('HH:mm')}</Text>
                                                    </Block>
                                                </Block>
                                            : 
                                                <Block>
                                                    <Block flex row>
                                                        <Text style={{ fontFamily: 'poppins-semi-bold' }}>Dates: </Text>
                                                        <Text style={{paddingBottom: theme.SIZES.BASE / 2, fontFamily: 'poppins-regular'}}>{moment(waitListObj.start_date).format('ddd D MMM YYYY')} - {moment(waitListObj.end_date).format('ddd D MMM YYYY')}</Text>
                                                    </Block>
                                                    <Block flex row>
                                                        <Text style={{ fontFamily: 'poppins-semi-bold' }}>Time: </Text>
                                                        <Text style={{ fontFamily: 'poppins-regular' }}>{moment(waitListObj.start_time, 'HH:mm:ss').format('HH:mm') + ' - ' + moment(waitListObj.end_time, 'HH:mm:ss').format('HH:mm')}</Text>
                                                    </Block>
                                                </Block>
                                            }
                                        </Block>
                                    </Swipeable>
                                </GestureHandlerRootView>
                            </Block>
                        );
                    }) :
                        <Block center style={{ paddingTop: '50%' }}>
                            <Text
                                size={16}
                                color={this.props.settings.wait_list_empty_text}
                                style={{ fontFamily: 'poppins-regular' }}
                            >
                                Your wait list is empty
                            </Text>
                        </Block>
                    }
                </ScrollView>
                <Block flex center style={{position: 'absolute', bottom: 0, marginBottom: theme.SIZES.BASE, paddingHorizontal: theme.SIZES.BASE, width: '100%'}}>
                    <Button shadowless color={this.props.settings.wait_list_button} style={{ width: '100%', margin: 0 }} onPress={() => this.props.navigation.navigate('WaitListAdd')}>
                        <Text color={this.props.settings.wait_list_button_text} style={{ fontFamily: 'poppins-medium' }}>{this.props.wait_list && this.props.wait_list.length > 0 ? 'Add to wait list' : 'Join wait list'}</Text>
                    </Button>
                </Block>
            </Block>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        settings: state.settings,
        wait_list: state.wait_list,
        business: state.details
    }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(WaitList));

const styles = StyleSheet.create({
    waitListScroll: {
        paddingHorizontal: theme.SIZES.BASE,
        width: width,
        marginTop: theme.SIZES.BASE,
        paddingBottom: 70
    },
    product: {
        backgroundColor: theme.COLORS.WHITE,
        marginVertical: theme.SIZES.BASE,
        borderWidth: 0,
        minHeight: 114,
    },
    productTitle: {
        flex: 1,
        flexWrap: 'wrap',
        paddingBottom: 6,
    },
    productDescription: {
        padding: theme.SIZES.BASE / 2,
    },
    imageContainer: {
        elevation: 1,
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