import React, { useState } from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    LayoutAnimation,
    TouchableWithoutFeedback,
    Image,
    StyleSheet,
    Dimensions
} from 'react-native';
import { Block, Text, Icon, theme } from 'galio-framework';
import { imageBaseUrl } from "../constants/utils";

const { width } = Dimensions.get('screen');
const thumbMeasure = (width - 48 - 32) / 3;

export default function ServiceDetailAccordion(props) {
    const { data, index, settings, businessSettings, staffData, navigation } = props;
    const [visible, setVisible] = useState(false);
    renderInformationCell = (label) => {
        let formattedValue, rightBorder;
        switch(label) {
            case "Price":
                if(data.service_business_detail_poa === 1) {
                    formattedValue = 'POA';
                } else {
                    if(data.service_business_detail_price === 0) {
                        formattedValue = 'FREE';
                    } else {
                        formattedValue = businessSettings.currency_symbol + Number(data.service_business_detail_price / 100).toFixed(2);
                    }
                }
                rightBorder = true;
                break;
            case "Minutes":
                if(data.service_business_detail_split === 1) {
                    formattedValue = data.service_business_detail_duration_a + data.service_business_detail_duration_break + data.service_business_detail_duration_b;
                } else {
                    formattedValue = data.service_business_detail_duration_a;
                }
                rightBorder = data.service_business_detail_deposit_required === 1;
                break;
            case "Deposit":
                if(data.service_business_detail_deposit_required !== 1) {
                    return;
                }
                formattedValue = businessSettings.currency_symbol + Number(data.service_business_detail_deposit_amount / 100).toFixed(2);
                rightBorder = false;
                break;
            default:
                return;
        }
        return (
            <Block middle style={[rightBorder ? {borderRightWidth: 1, borderRightColor: '#979797'} : null, data.service_business_detail_deposit_required === 1 ? { width: '33.33%' } : { width: '50%' }]}>
                <Text style={{ fontFamily: 'poppins-semi-bold', marginBottom: 5 }} color={settings.service_profile_card_text} size={16}>{formattedValue}</Text>
                <Text style={{ fontFamily: 'poppins-regular' }} muted color={settings.service_profile_card_text} size={13}>{label}</Text>
            </Block>
        )
    }
    renderArrow = () => {
        let arrowRotation = '0deg', arrowRotationAnimation;
        arrowRotationAnimation = new Animated.Value(visible ? 1 : 0);
        Animated.timing(arrowRotationAnimation, {
            toValue: visible ? 0 : 1,
            duration: 200,
            useNativeDriver: true
        }).start();
        arrowRotation = arrowRotationAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
        });
        return (
            <Animated.View style={{transform: [{rotate: arrowRotation}] }}>
                <Icon
                    name={'chevron-down'}
                    family="Feather"
                    size={18}
                    color={settings.service_profile_card_button_text}
                />
            </Animated.View>
        );
    }
    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setVisible(!visible);
                }}
            >
                <Block row space="between" style={[{ padding: theme.SIZES.BASE, backgroundColor: settings.service_profile_card_button, borderRadius: 5 }, visible ? {borderBottomLeftRadius: 0, borderBottomRightRadius: 0} : null]}>
                    <Text
                        size={15}
                        color={settings.service_profile_card_button_text}
                        style={{ fontFamily: 'poppins-medium' }}
                    >
                        {data?.service_business_detail_name?.replace('%comma%', ',').replace('%apostrophe%', "'")}
                    </Text>
                    {renderArrow()}
                </Block>
            </TouchableOpacity>
            {visible &&
                <View>
                    <View style={{ borderWidth: 1, borderColor: '#979797', borderTopWidth: 0, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
                        <Block row style={{ padding: theme.SIZES.BASE, paddingBottom: theme.SIZES.BASE }} space="between">
                            {renderInformationCell('Price')}
                            {renderInformationCell('Minutes')}
                            {renderInformationCell('Deposit')}
                        </Block>
                        {data?.service_business_detail_description ? (
                            <View style={{ paddingHorizontal: theme.SIZES.BASE, paddingBottom: 5 }}>
                                <Block style={{borderBottomWidth: 1, marginBottom: 5, borderBottomColor: '#979797' }}>
                                    <Text size={16} color={settings.service_profile_card_text} style={{ paddingVertical: 5, fontFamily: 'poppins-medium' }}>Description</Text>
                                </Block>
                                <Block>
                                    <Text
                                        color={settings.service_profile_card_text}
                                        style={{ fontFamily: 'poppins-regular' }}
                                    >
                                        {data.service_business_detail_description.replace('%comma%', ',').replace('%apostrophe%', "'")}
                                    </Text>
                                </Block>
                            </View>
                        ) : null}
                        {staffData?.length > 0 ? (
                            <Block style={{ paddingHorizontal: theme.SIZES.BASE, paddingBottom: 5 }}>
                                <Block style={{borderBottomWidth: 1, marginBottom: 5, borderBottomColor: '#979797' }}>
                                    <Text size={16} color={settings.service_profile_card_text} style={{ paddingVertical: 5, fontFamily: 'poppins-medium' }}>Staff</Text>
                                </Block>
                                <Block row style={{ flexWrap: 'wrap' }} >
                                    {staffData?.map((staffObj, staffIndex) => {
                                        return (
                                            <TouchableWithoutFeedback key={`tierStaff${staffObj.id}ServiceTier${data.service_business_detail_id}`} onPress={() => navigation.navigate('StaffProfile', { id : staffObj.id })}>
                                                <Block style={{ marginRight: 5 }}>
                                                    <Image
                                                        source={staffObj?.staff_menu_img ? { uri: imageBaseUrl + staffObj.staff_menu_img } : { uri: imageBaseUrl + staffObj.staff_menu_img }}  
                                                        resizeMode="cover"
                                                        style={styles.thumb}
                                                    />
                                                </Block>
                                            </TouchableWithoutFeedback>
                                        );
                                    })}
                                </Block>
                            </Block>
                        ) : null}
                    </View>
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    thumb: {
        borderRadius: 200,
        marginVertical: 4,
        alignSelf: 'center',
        width: thumbMeasure - 55,
        height: thumbMeasure - 55,
        borderWidth: 1,
        borderColor: theme.COLORS.MUTED
    },
});