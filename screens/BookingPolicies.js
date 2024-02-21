import React from 'react';
import { ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Block, theme } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';

import HTML from "react-native-render-html";

class BookingPolicies extends React.Component {
    render() {
        const { width } = Dimensions.get('window');
        let bookingTermsHtml = null;
        if(!this.props.details.booking_terms || this.props.details.booking_terms === '') {
            bookingTermsHtml = '<div></div>';
        } else {
            bookingTermsHtml = this.props.details.booking_terms;
        }
        return (
            <Block flex>
                <ScrollView style={[styles.termsScollView, { backgroundColor: this.props.settings.book_background }]}>
                    <Block style={styles.termsContainer}>
                        <HTML
                            source={{ html: bookingTermsHtml }}
                            contentWidth={width}
                        />
                    </Block>
                </ScrollView>
            </Block>
        );
    }
};

function mapStateToProps(state, ownProps) {
    return {
        details: state.details,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(BookingPolicies));

const styles = StyleSheet.create({
    termsScollView: {
        flex: 1
    },
    termsContainer: {
        marginHorizontal: theme.SIZES.BASE
    }
});