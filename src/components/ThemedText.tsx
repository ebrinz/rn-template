import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { typography } from '../theme';

export const ThemedText: React.FC<TextProps & { bold?: boolean }> = ({ style, bold, ...props }) => {
  const theme = useTheme();
  return (
    <Text
      style={[
        styles.text,
        { color: theme.text, fontWeight: bold ? typography.fontWeightBold : typography.fontWeightRegular },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.fontFamilyRegular,
    fontSize: typography.fontSizeRegular,
  },
});
