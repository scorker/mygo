import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import Modal from "react-native-modal";
import { theme, Text, Block, Icon } from 'galio-framework';
import { imageBaseUrl } from '../constants/utils';

const StaffPickerModal = props => {
    return (
        <View>
            <Modal
                isVisible={props.visible}
                onBackdropPress={() => props.toggleVisible()}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <View style={styles.modalContainer}>
                    <Block style={[styles.modalHeader, { backgroundColor: props.settings?.book_page_one_card_staff_background }]}>
                        <Text size={20} center color={props.settings?.book_page_one_card_staff_text} style={{ fontFamily: 'poppins-medium' }}>Select Staff Member</Text>
                    </Block>
                    <Block style={{ width: '100%' }}>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {props.data?.map((dataObj,) => {
                                return (
                                    <TouchableOpacity onPress={() => props.submit(dataObj.id)}>
                                        <Block
                                            row
                                            space="between"
                                            style={styles.staffOptionContainer}
                                            key={'staff' + dataObj.id}
                                        >
                                            <Block row>
                                                <Block style={{ marginRight: 20 }}>
                                                    <Image
                                                        source={{ uri: imageBaseUrl + dataObj.staff_img }}
                                                        style={{ height: 60, width: 60, borderRadius: 30 }}
                                                    />
                                                </Block>
                                                <Block middle left>
                                                    <Text size={16} style={{ fontFamily: 'poppins-medium', marginBottom: -4 }}>{dataObj.firstname + ' ' + dataObj.lastname}</Text>
                                                    <Text size={13} style={{ fontFamily: 'poppins-medium' }} color={theme.COLORS.MUTED}>{dataObj.position}</Text>
                                                </Block>
                                            </Block>
                                            <Block middle>
                                                <Icon family="feather" name="plus" size={16} />
                                            </Block>
                                        </Block>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                        {!props.data || props.data?.length === 0 ? (
                            <Block style={{ marginVertical: theme.SIZES.BASE }}>
                                <Text center size={18} style={{ fontFamily: 'poppins-regular' }}>No staff available</Text>
                            </Block>
                        ) : null}
                    </Block>
                </View>
            </Modal>
        </View>
    );
}

export default StaffPickerModal;

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 5
    },
    modalHeader: {
        paddingVertical: theme.SIZES.BASE * 1.2,
        backgroundColor: '#333333'
    },
    staffOptionContainer: {
        padding: theme.SIZES.BASE,
        borderTopWidth: 1,
        borderTopColor: theme.COLORS.MUTED
    }
});