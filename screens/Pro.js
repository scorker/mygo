import React from 'react';
import { ImageBackground, StyleSheet, Dimensions, Platform } from 'react-native';
import { Block, Text, theme } from 'galio-framework';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
const { height, width } = Dimensions.get('screen');
import { Images, materialTheme } from '../constants/';

export default class Pro extends React.Component {
  render() {
    return (
      <Block flex style={styles.container}>
        <Block flex>
          <ImageBackground
            source={{ uri: Images.Pro }}
            style={{ height: height / 1.8, width, zIndex: 1 }}
          >
          <LinearGradient
            style={styles.gradient}
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']} />
          </ImageBackground>
          <Block space="between" style={styles.padded}>
            <Block>
              <Icon name="WhatStyle" family="IcoMoon" size={80} style={{textAlign: 'center'}} color={'#ffffff'} />
              <Text h3 style={{color: '#ffffff', textAlign: 'center', fontWeight: '300', marginBottom: 40, marginTop: 10}}>App Unavailable</Text>
              <Text size={16} color='rgba(255,255,255,0.6)' style={{textAlign: 'center'}}>
                This app is currently unavailable. Please contact the business directly.
              </Text>
            </Block>
          </Block>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.BLACK,
    marginTop: 0,
  },
  padded: {
    paddingHorizontal: theme.SIZES.BASE * 2,
    zIndex: 3,
    position: 'absolute',
    bottom: Platform.OS === 'android' ? theme.SIZES.BASE * 2 : theme.SIZES.BASE * 3,
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 3,
    shadowRadius: 0,
    shadowOpacity: 0,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 8,
    marginLeft: 12,
    borderRadius: 2,
    height: 22
  },
  gradient: {
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 66,
  },
});
