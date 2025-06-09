import { TextStyle } from 'react-native';

export const typography: {
  fontFamilyRegular: string;
  fontFamilyBold: string;
  fontSizeSmall: number;
  fontSizeRegular: number;
  fontSizeLarge: number;
  fontWeightRegular: TextStyle['fontWeight'];
  fontWeightBold: TextStyle['fontWeight'];
} = {
  fontFamilyRegular: 'System',
  fontFamilyBold: 'System',
  fontSizeSmall: 12,
  fontSizeRegular: 16,
  fontSizeLarge: 20,
  fontWeightRegular: '400',
  fontWeightBold: '700',
};
