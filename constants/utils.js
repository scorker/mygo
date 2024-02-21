import { Platform, StatusBar, Dimensions } from 'react-native';
import { modelId } from 'expo-device';
import { theme } from 'galio-framework';

const windowDim = Dimensions.get('window');

export const StatusHeight = StatusBar.currentHeight;
export const HeaderHeight = (theme.SIZES.BASE * 3.5 + (StatusHeight || 0));

const iPhonesWithDynamicIsland = ['iPhone15,2', 'iPhone15,3'];
const isIphoneWithDynamicIsland = iPhonesWithDynamicIsland.includes(modelId);

export const iPhoneX = () =>
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    ((windowDim.height === 780 || windowDim.width === 780)
    || (windowDim.height === 812 || windowDim.width === 812)
    || (windowDim.height === 844 || windowDim.width === 844)
    || (windowDim.height === 896 || windowDim.width === 896)
    || (windowDim.height === 926 || windowDim.width === 926)
    || isIphoneWithDynamicIsland);
export const imageBaseUrl = "https://cdn.whatstyle.com/";
