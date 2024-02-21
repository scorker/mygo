import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Block, Text, theme, Icon } from "galio-framework";

import { withNavigation } from '@react-navigation/compat';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

class AccountManagement extends React.Component {
  
    constructor(props) {
        super(props);
        this.state = {
            emailVerified: false
        };
    }

    render() {
        return (
            <Block flex style={{ backgroundColor: this.props.settings.settings_background }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.settings}
                >
                    <Block style={[styles.rowsContainer, { backgroundColor: this.props.settings.settings_card_background }]}>
                        <Block style={styles.rows}>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Account')}>
                                <Block row middle space="between" style={{paddingTop:7}}>
                                    <Block row>
                                        <Text
                                            size={14}
                                            color={this.props.settings.settings_card_text}
                                            style={{ fontFamily: 'poppins-regular' }}
                                        >
                                            Edit account details
                                        </Text>
                                    </Block>
                                    <Icon
                                        name="angle-right"
                                        family="font-awesome"
                                        style={{ paddingRight: 5 }}
                                    />
                                </Block>
                            </TouchableOpacity>
                        </Block>
                    </Block>
                </ScrollView>
                <Block style={{ position: 'absolute', bottom: 0, padding: theme.SIZES.BASE, width: '100%' }}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('AccountDeletion')}>
                        <Block center style={{ borderRadius: 5, backgroundColor: '#f33527', paddingVertical: theme.SIZES.BASE / 1.5, width: '100%' }}>
                            <Text size={14} color={'#ffffff'} style={{ fontFamily: 'poppins-regular' }}>Delete account</Text>
                        </Block>
                    </TouchableOpacity>
                </Block>
            </Block>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        settings: state.settings,
        business_settings: state.details
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(AccountManagement));

const styles = StyleSheet.create({
  settings: {
    paddingVertical: theme.SIZES.BASE
  },
  title: {
    paddingTop: theme.SIZES.BASE,
    paddingBottom: theme.SIZES.BASE / 2,
    marginHorizontal: theme.SIZES.BASE
  },
  rowsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginHorizontal: theme.SIZES.BASE
  },
  rows: {
    height: theme.SIZES.BASE * 2,
    paddingHorizontal: theme.SIZES.BASE,
    marginVertical: theme.SIZES.BASE / 2,
  }
});