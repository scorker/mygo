import React from 'react';
import * as Font from 'expo-font';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';
import { Icon } from 'galio-framework';

// Register fonts
const IconGalioExtra = createIconSetFromIcoMoon(require('../assets/fonts/galioExtraFont.json'), 'GalioExtra', 'galioExtra.ttf');
const IconStyler = createIconSetFromIcoMoon(require('../assets/fonts/stylerFont.json'), 'Styler', 'styler.ttf');
const IconWhatStyle = createIconSetFromIcoMoon(require('../assets/fonts/whatstyleFont.json'), 'WhatStyle', 'whatstyle.ttf');

export default class IconExtra extends React.Component {
  state = {
    fontLoaded: false,
  }

  async componentDidMount() {
    // Load fonts
    await Font.loadAsync({ GalioExtra: require('../assets/fonts/galioExtra.ttf') });
    await Font.loadAsync({ Styler: require('../assets/fonts/styler.ttf') });
    await Font.loadAsync({ WhatStyle: require('../assets/fonts/whatstyle.ttf') });
    // Font loaded
    this.setState({ fontLoaded: true });
  }

  render() {
    const { name, family, ...rest } = this.props;
    if (name && family && this.state.fontLoaded) {
      if (family === 'GalioExtra') {
        return <IconGalioExtra name={name} family={family} {...rest} />;
      } else if(family === 'Styler') {
        return <IconStyler name={name} family={family} {...rest} />;
      } else if(family === 'WhatStyle') {
        return <IconWhatStyle name={name} family={family} {...rest} />;
      }
      return <Icon name={name} family={family} {...rest} />;
    } else {
      return null;
    }
  }
}