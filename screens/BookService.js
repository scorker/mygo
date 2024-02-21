import React from 'react';

import WebView from '../components/WebView';
import BusinessTerms from '../components/BusinessTerms';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { withNavigation } from '@react-navigation/compat';

import * as serviceActions from '../actions/index';

class BookService extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            termsVisible: true
        };
    }
    componentDidMount() {
        const { navigation } = this.props;
        const url = navigation.getParam('url');
        if(!url) {
            navigation.goBack();
        }
        const termsEnabled = this.props.details.booking_terms_enabled;
        if(!termsEnabled || termsEnabled === 0) {
            this.setState({ termsVisible: false });
        }
    }

    render() {
        if(this.state.termsVisible) {
            return (
                <BusinessTerms
                    settings={this.props.settings}
                    details={this.props.details}
                    setTermsVisible={(visible) => this.setState({ termsVisible: visible })}
                />
            );
        }
        const bookingUrl = this.props.navigation.getParam('url');
        return (
            <WebView url={bookingUrl} />
        );
    }
};

function mapStateToProps(state, ownProps) {
    return {
        settings: state.settings,
        details: state.details
    }
}
  
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(serviceActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(BookService));