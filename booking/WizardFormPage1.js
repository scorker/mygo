import React from 'react';
import { withNavigation } from '@react-navigation/compat';
import { Block, theme } from 'galio-framework';
import { ScrollView } from 'react-native';
import Services from './components/services';

let WizardFormPage1 = props => {

  return (
    <Block flex={0.9}>
      <ScrollView style={{marginBottom: theme.SIZES.BASE}}>
        <Services {...props} />
      </ScrollView>
    </Block>
  );

};

export default withNavigation(WizardFormPage1)