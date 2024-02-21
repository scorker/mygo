import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Block } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import { HeaderHeight, imageBaseUrl } from "../constants/utils";
import ImageView from "react-native-image-viewing";
import { connect } from "react-redux";

class SlideShowScreen extends React.Component {
  render() {
    const { navigation } = this.props;
    const images = navigation.getParam('images').map((f) => { return { uri: f }});
    return (
      <Block flex style={[styles.gallery, {backgroundColor: this.props.settings.service_profile_background}]}>
        {/*<ImageViewer imageUrls={images} index={navigation.getParam('index')} />*/}
        <ImageView
          images={images}
          index={navigation.getParam('index')}
          visible={true}
          onRequestClose={() => navigation.goBack()}
          animationType={'fade'}
        />
      </Block>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    settings: state.settings
  }
}

export default connect(mapStateToProps, null)(withNavigation(SlideShowScreen));

const styles = StyleSheet.create({
  gallery: {
    marginTop: Platform.OS === 'android' ? -HeaderHeight : 0
  }
})