/* eslint-disable object-curly-newline */
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Video } from 'expo-av';
import PropTypes from 'prop-types';
// galio components
import { Block, Text, Icon, GalioTheme, withGalio } from 'galio-framework';

function GalleryCard({
  avatar,
  borderless, 
  caption, 
  captionColor,
  card, 
  children,
  footerStyle,
  mediaType,
  image,
  imageBlockStyle,
  imageStyle,
  location, 
  locationColor, 
  shadow,
  style, 
  styles,
  title, 
  titleColor,
  theme,
  onImagePress,
  ...props 
}) {
  const [isExpanded, setExpanded] = useState(true);
  const [isExpandable, setExpandable] = useState(false);
  function renderImage() {
    if (!image) return null;
    if(mediaType === "VIDEO") {
      return (
        <Block card style={[styles.imageBlock, imageBlockStyle]}>
          <Video
            isLooping={true}
            source={{ uri: image }}
            useNativeControls
            resizeMode="cover"
            style={[styles.image, imageStyle]}
          />
        </Block>
      );
    } else {
      return (
        <TouchableWithoutFeedback
          onPress={() => onImagePress(props.data)}
        >
          <Block card style={[styles.imageBlock, imageBlockStyle]}>
            <Image source={{ uri: image }} style={[styles.image, imageStyle]} />
          </Block>
        </TouchableWithoutFeedback>
      );
    }
  }

  function renderAvatar() {
    if (!avatar) return null;
    return <Image source={{ uri: avatar }} style={styles.avatar} />;
  }

  function renderLocation() {
    if (!location) return null;
    if (typeof location !== 'string') {
      return location;
    }

    return (
      <Block row right>
        <Icon
          name="map-pin"
          family="feather"
          color={locationColor || theme.COLORS.MUTED}
          size={theme.SIZES.FONT}
        />
        <Text
          muted
          size={theme.SIZES.FONT * 0.875}
          color={locationColor || theme.COLORS.MUTED}
          style={{ marginLeft: theme.SIZES.BASE * 0.25 }}>
          {location}
        </Text>
      </Block>
    );
  }

  const onTextLayout = (e) => {
    if(!isExpandable) {
      setExpanded(false);
      setExpandable(e.nativeEvent.lines.length > 3)
    }
  }

  function renderAuthor() {
    return (
      <Block flex row style={[styles.footer, footerStyle]} space="between">
        {avatar ? <Block flex={0.3}>{renderAvatar()}</Block> : null}
        <Block flex={1.7}>
          <Block style={styles.title}>
            <Text
              numberOfLines={isExpanded ? 0 : 3}
              size={theme.SIZES.FONT * 0.85}
              color={titleColor}
              style={{ fontFamily: 'poppins-regular' }}
              onTextLayout={onTextLayout}
            >
              {title}
            </Text>
          </Block>
          {isExpandable ? (
            <View style={{ marginTop: 4 }}>
              <TouchableWithoutFeedback onPress={() => setExpanded(!isExpanded)}>
                <Text
                  bold
                  color={captionColor}
                  muted
                  style={{ fontFamily: 'poppins-semi-bold' }}
                >
                  Read {isExpanded ? 'less' : 'more'}
                </Text>
              </TouchableWithoutFeedback>
            </View>
          ) : null}
          <Block flex row space="between" style={{ marginTop: 5 }}>
            <Text p muted size={theme.SIZES.FONT * 0.8} color={captionColor} style={{ fontFamily: 'poppins-regular' }}>
                {caption}
            </Text>
            {renderLocation()}
          </Block>
        </Block>
      </Block>
    );
  }

  const styleCard = [borderless && { borderWidth: 0 }, style];

  return (
    <Block {...props} card={card} shadow={shadow} style={styleCard}>
      {renderImage()}
      {renderAuthor()}
      {children}
    </Block>
  );
}

GalleryCard.defaultProps = {
  card: true,
  shadow: true,
  borderless: false,
  styles: {},
  theme: GalioTheme,
  title: '',
  titleColor: '',
  caption: '',
  captionColor: '',
  footerStyle: {},
  avatar: '',
};

GalleryCard.propTypes = {
  card: PropTypes.bool,
  shadow: PropTypes.bool,
  borderless: PropTypes.bool,
  styles: PropTypes.any,
  theme: PropTypes.any,
  title: PropTypes.string,
  titleColor: PropTypes.string,
  caption: PropTypes.string,
  captionColor: PropTypes.string,
  avatar: PropTypes.string,
  footerStyle: PropTypes.object,
};

const styles = theme =>
  StyleSheet.create({
    card: {
      borderWidth: 0,
      backgroundColor: theme.COLORS.WHITE,
      width: theme.SIZES.CARD_WIDTH,
      marginVertical: theme.SIZES.CARD_MARGIN_VERTICAL,
    },
    footer: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: theme.SIZES.CARD_FOOTER_HORIZONTAL,
      paddingVertical: theme.SIZES.CARD_FOOTER_VERTICAL,
      backgroundColor: theme.COLORS.TRANSPARENT,
      zIndex: 1
    },
    avatar: {
      width: theme.SIZES.CARD_AVATAR_WIDTH,
      height: theme.SIZES.CARD_AVATAR_HEIGHT,
      borderRadius: theme.SIZES.CARD_AVATAR_RADIUS,
    },
    title: {
      justifyContent: 'center',
    },
    imageBlock: {
      borderWidth: 0,
      overflow: 'hidden',
    },
    image: {
      width: 'auto',
      height: theme.SIZES.CARD_IMAGE_HEIGHT,
    },
    round: {
      borderRadius: theme.SIZES.CARD_ROUND,
    },
    rounded: {
      borderRadius: theme.SIZES.CARD_ROUNDED,
    },
  });

export default withGalio(GalleryCard, styles);