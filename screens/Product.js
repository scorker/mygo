import React from 'react';
import { StyleSheet, Image, ScrollView, Dimensions , TouchableWithoutFeedback, RefreshControl, ImageBackground } from 'react-native';
import { Block, Text, theme, Icon } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';
import { imageBaseUrl } from '../constants/utils';

import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import * as serviceActions from '../actions/index';
import { materialTheme } from '../constants';

const { height, width } = Dimensions.get('screen');

class Product extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false
        }
    }

    componentDidMount() {
        this.props.actions.loadProducts();
    }

    render() {
        const { navigation } = this.props;
        const imageStyles = [styles.image, styles.horizontalImage];
        return (
            <Block flex center style={{backgroundColor: this.props.settings.product_background}}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.staffScroll}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={() => this.props.actions.loadProducts()}/>}>
                    <Block flex>
                    {this.props.products && this.props.products.length > 0 ? this.props.products.map((productObj,) => {
                        return(
                            <Block row card flex style={[styles.product, styles.shadow, { backgroundColor: this.props.settings.product_card_background }]}>
                                <TouchableWithoutFeedback onPress={() => navigation.navigate('ProductProfile', { product: productObj })}>
                                <Block flex style={[styles.imageContainer, styles.shadow]}>
                                    <Block style={[imageStyles, { borderRadius: 8 }]}>
                                        <ImageBackground source={{uri: productObj.product_img ? imageBaseUrl + productObj.product_img : imageBaseUrl + 'productImg/product_default.jpg'}} style={{width: '100%', height: '100%'}} imageStyle={{borderRadius: 8 }}></ImageBackground>
                                    </Block>
                                </Block>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={() => navigation.navigate('ProductProfile', { product: productObj })}>
                                <Block flex space="between" style={styles.productDescription}>
                                    <Text size={16} style={[styles.productTitle, { fontFamily: 'poppins-medium' }]} color={this.props.settings.product_card_name}>{productObj.product_name}</Text>
                                    <Block row space="between">
                                        <Text
                                            size={15}
                                            color={this.props.settings.product_card_price}
                                            muted={productObj.product_in_stock !== 1}
                                            style={{ fontFamily: 'poppins-regular' }}
                                        >
                                            {this.props.business_settings.currency_symbol}{productObj.product_price ? Number(productObj.product_price / 100).toFixed(2) : null}
                                        </Text>
                                        <Text
                                            size={15}
                                            color={productObj.product_in_stock === 1 ? this.props.settings.product_card_in_stock : this.props.settings.product_card_out_of_stock}
                                            style={{ fontFamily: 'poppins-regular' }}
                                        >
                                            {productObj.product_in_stock === 1 ? 'In stock' : 'Out of stock'}
                                        </Text>
                                    </Block>
                                </Block>
                                </TouchableWithoutFeedback>
                            </Block>
                        );
                    }) : 
                        <Block center flex style={{ position: 'absolute', marginTop: '50%' }}>
                            <Text size={16}>No products to display</Text>
                        </Block>
                    }
                    </Block>
                </ScrollView>
            </Block>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        products: state.products,
        business_settings: state.details,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(serviceActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(Product));

const styles = StyleSheet.create({
    staffScroll: {
        paddingHorizontal: theme.SIZES.BASE,
        width: width,
        marginTop: theme.SIZES.BASE,
        paddingBottom: theme.SIZES.BASE
    },
    product: {
        backgroundColor: theme.COLORS.WHITE,
        marginVertical: theme.SIZES.BASE,
        borderWidth: 0,
        minHeight: 114,
    },
    productTitle: {
        flex: 1,
        flexWrap: 'wrap',
        paddingBottom: 6,
    },
    productDescription: {
        padding: theme.SIZES.BASE / 2,
    },
    imageContainer: {
        elevation: 1,
    },
    image: {
        borderRadius: 3,
        marginHorizontal: theme.SIZES.BASE / 2,
        marginTop: -22,
    },
    horizontalImage: {
        height: 125,
        width: 'auto',
        resizeMode: 'contain'
    },
    fullImage: {
        height: 215,
        width: width - theme.SIZES.BASE * 3,
    },
    shadow: {
        shadowColor: theme.COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
        elevation: 2,
    },
});