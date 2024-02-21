import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Modal from "react-native-modal";
import { theme, Text, Block, Icon } from 'galio-framework';
import { getFormattedAddress } from '../utilities/formatting';

const BusinessLocationPickerModal = props => {
    return (
        <View>
            <Modal
                isVisible={props.visible}
                onBackdropPress={() => props.toggleVisible()}
                style={{justifyContent: 'flex-end', margin: 0}}
            >
                <View style={styles.modalContainer}>
                    <Block style={[styles.modalHeader, { backgroundColor: props.settings?.business_location_picker_header_background }]}>
                        <Text size={20} center color={props.settings?.business_location_picker_header_text} style={{ fontFamily: 'poppins-medium' }}>Select Location</Text>
                    </Block>
                    <Block style={{ width: '100%', backgroundColor: props.settings?.business_location_picker_body_background }}>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {props.data?.map((dataObj,) => {
                                return (
                                    <TouchableOpacity onPress={() => props.submit(dataObj?.business_location_id)}>
                                        <Block
                                            row
                                            space="between"
                                            style={styles.businessLocationOptionContainer}
                                            key={'businessLocation' + dataObj?.business_location_id}
                                        >
                                            <Block flex>
                                                <Block middle left style={{ marginRight: 20 }}>
                                                    <Text size={16} style={{ fontFamily: 'poppins-medium' }}>{dataObj.business_location_name}</Text>
                                                    <Text size={13} style={{ fontFamily: 'poppins-regular' }} color={theme.COLORS.MUTED}>{getFormattedAddress(dataObj)}</Text>
                                                </Block>
                                            </Block>
                                            <Block middle>
                                                <Icon
                                                    family="feather"
                                                    name={props.id === dataObj.business_location_id ? "check" : "plus"}
                                                    size={18}
                                                    color={props.id === dataObj.business_location_id ? '#4caf50' : "#000000"}
                                                />
                                            </Block>
                                        </Block>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </Block>
                </View>
            </Modal>
        </View>
    );
}

export default BusinessLocationPickerModal;

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 5
    },
    modalHeader: {
        paddingVertical: theme.SIZES.BASE * 1.2,
        backgroundColor: '#ffffff'
    },
    businessLocationOptionContainer: {
        padding: theme.SIZES.BASE,
        borderTopWidth: 1,
        borderTopColor: theme.COLORS.MUTED
    }
});