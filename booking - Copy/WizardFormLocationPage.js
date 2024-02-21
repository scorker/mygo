import React from 'react';
import { withNavigation } from '@react-navigation/compat';
import { Block, theme, Text, Icon } from 'galio-framework';
import { StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { getFormattedAddress } from '../utilities/formatting';
import { imageBaseUrl } from '../constants/utils';
import { Images, materialTheme } from "../constants/";

function renderLocationCard(data, props) {
    const { settings, selectedBusinessLocationId, onChange } = props;
    return (
        <TouchableOpacity key={'location' + data.business_location_id} onPress={() => onChange(data.business_location_id)}>
            <Block style={[styles.locationCard, settings?.book_page_location_card_background ? { backgroundColor: settings?.book_page_location_card_background } : null]}>
                <Block>
                    <Image
                        source={{ uri: data.business_location_img ? imageBaseUrl + data.business_location_img : Images.BusinessCover }}
                        style={styles.locationCardImage}
                    />
                </Block>
                <Block style={{ margin: theme.SIZES.BASE }}>
                    <Block flex row space="between" style={{ marginBottom: theme.SIZES.BASE / 2 }}>
                        <Text
                            size={16}
                            color={settings?.book_page_location_card_name ? settings?.book_page_location_card_name : '#000000'}
                            style={{ fontFamily: 'poppins-medium' }}
                        >
                            {data.business_location_name}
                        </Text>
                        <Icon
                            family="Feather"
                            name={selectedBusinessLocationId === data.business_location_id ? "check" : "plus" }
                            color={selectedBusinessLocationId === data.business_location_id ? materialTheme.COLORS.SUCCESS : (settings.book_page_location_card_name ? settings.book_page_location_card_name : '#000000')}
                            style={{ fontFamily: 'poppins-regular' }}
                        />
                    </Block>
                    <Block>
                        <Text
                            color={settings?.book_page_location_card_address ? settings.book_page_location_card_address : theme.COLORS.MUTED}
                            size={13}
                        >
                            {getFormattedAddress(data)}
                        </Text>
                    </Block>
                </Block>
            </Block>
        </TouchableOpacity>
    );
}

function renderLocationCards(props) {
    return props.businessLocation.map((businessLocationObj,) => {
        return renderLocationCard(businessLocationObj, props)
    });
}

let WizardFormLocationPage = props => {
    return (
        <Block flex={0.88}>
            <ScrollView style={{ paddingTop: theme.SIZES.BASE }}>
                {renderLocationCards(props)}
            </ScrollView>
        </Block>
    );
};

export default withNavigation(WizardFormLocationPage)

const styles = StyleSheet.create({
    locationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 7,
        marginHorizontal: theme.SIZES.BASE * 0.75,
        marginBottom: theme.SIZES.BASE
    },
    locationCardImage: {
        height: theme.SIZES.CARD_IMAGE_HEIGHT * 0.7,
        borderRadius: 7,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    }
});