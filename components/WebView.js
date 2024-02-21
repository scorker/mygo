import { WebView as RNWebView } from 'react-native-webview';

export default function WebView(props) {
    const { url } = props;
    return (
        <RNWebView
            source={{ uri: url }}
            userAgent="Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36"
        />
    );
}