import React from "react";
import { TouchableWithoutFeedback, ScrollView, StyleSheet, Dimensions, Image, ImageBackground, View } from "react-native";
import { Block, Text, theme } from "galio-framework";

import { DrawerItem } from '../components/';
import { Images, materialTheme } from "../constants/";

var ColourSettings = null;

const { width } = Dimensions.get('screen');

function Drawer({
  drawerPosition,
  navigation,
  profile,
  focused,
  state,
  user,
  ...rest
}) {
  <Block style={[styles.container, {backgroundColor: props.screenProps.primary_colour}]} forceInset={{ top: 'always', horizontal: 'never' }}>
    <Block flex={0.3}>
      <ImageBackground source={{ uri: props.profile.cover }} style={{width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <View style={styles.overlay} />
      <Block style={styles.header}>
      <TouchableWithoutFeedback>
        <Block style={styles.profile}>
          <Image source={{ uri: props.profile.avatar}} style={styles.avatar} />
        </Block>
      </TouchableWithoutFeedback>
      </Block>
      </ImageBackground>
    </Block>
    <Block flex>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {screens.map((item, index) => {
          return (
            <DrawerItem
              title={item}
              key={index}
              navigation={navigation}
              focused={state.index === index}
            />
          )
        })}
      </ScrollView>
      <Text size={10} style={{textAlign: 'center', marginBottom: 10, color: ColourSettings ? ColourSettings.muted_colour : materialTheme.THEME.MUTED}}>
        A Styler App
      </Text>
    </Block>
  </Block>
};

const profile = {
  avatar: Images.BusinessLogo,
  cover: Images.BusinessCover,
  name: 'Rachel Brown',
  type: 'Seller',
  plan: 'Pro',
  rating: 4.8
};

const Menu = {
  contentComponent: props => <Drawer {...props} profile={profile} />,
  // drawerBackgroundColor: ColourSettings ? ColourSettings.primary_colour : materialTheme.THEME.PRIMARY,
  drawerWidth: width * 0.8,
  contentOptions: {
    //activeTintColor: ColourSettings ? ColourSettings.primary_colour : materialTheme.THEME.PRIMARY,
    //inactiveTintColor: ColourSettings ? ColourSettings.secondary_colour : materialTheme.THEME.SECONDARY,
    activeBackgroundColor: 'transparent',
    itemStyle: {
      width: width * 0.75,
      backgroundColor: 'transparent',
    },
    labelStyle: {
      fontSize: 18,
      marginLeft: 12,
      fontWeight: 'normal',
    },
    itemsContainerStyle: {
      paddingVertical: 16,
      paddingHorizonal: 12,
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 28,
    paddingBottom: theme.SIZES.BASE,
    paddingTop: theme.SIZES.BASE * 2,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  footer: {
    paddingHorizontal: 28,
    justifyContent: 'flex-end'
  },
  profile: {
    marginBottom: theme.SIZES.BASE / 2,
  },
  avatar: {
    height: '75%',
    width: '75%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginRight: 20,
    marginTop: theme.SIZES.BASE,
    marginBottom: theme.SIZES.BASE,
  },
  pro: {
    backgroundColor: materialTheme.COLORS.LABEL,
    paddingHorizontal: 6,
    marginRight: 8,
    borderRadius: 4,
    height: 19,
    width: 38,
  },
  seller: {
    marginRight: 16,
  }
});

export default Menu;
