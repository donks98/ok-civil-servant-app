import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Radius, Shadow, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  noPadding?: boolean;
}

export function Card({ children, style, padding, noPadding }: CardProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.cardBg },
        noPadding ? {} : { padding: padding ?? Spacing.md },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    ...Shadow.md,
  },
});
