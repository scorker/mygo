import { StyleSheet, Dimensions, ScrollView } from 'react-native';

import { Block, Text, theme, Button } from 'galio-framework';
import HTML from "react-native-render-html";

export default function BusinessTerms(props) {
    const { settings, details, setTermsVisible } = props;
    let termsHtml = null;
    if(!details.booking_terms || details.booking_terms === '') {
        termsHtml = '<div></div>'
    } else {
        termsHtml = details.booking_terms;
    }
    const { width } = Dimensions.get('screen');
    return (
        <Block flex>
            <ScrollView style={{ flex: 1, backgroundColor: settings.book_background }}>
                <Block style={{ marginHorizontal: theme.SIZES.BASE }}>
                    <HTML
                        source={{ html: termsHtml }}
                        contentWidth={width}
                    />
                </Block>
            </ScrollView>
            <Block style={[{ padding: theme.SIZES.BASE / 2, backgroundColor: settings.book_background }, styles.shadow]}>
                <Button
                    color={settings.book_footer_next_button ? settings.book_footer_next_button : '#FFFFFF'}
                    style={{ width: '100%', margin: 0 }}
                    onPress={() => setTermsVisible(false)}
                >
                    <Text
                        color={settings.book_footer_next_button_text}
                        style={{ fontFamily: 'poppins-medium' }}
                    >
                        I Agree
                    </Text>
                </Button>
            </Block>
        
        </Block>
    );
}

const styles = StyleSheet.create({
    shadow: {
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      shadowOpacity: 0.6,
      elevation: 3,
    }
});