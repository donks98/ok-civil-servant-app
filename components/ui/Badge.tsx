import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

type BadgeVariant = 'success' | 'warning' | 'primary' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const colors = useThemeColors();

  const badgeColors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    primary: { bg: colors.infoLight, text: colors.primary },
    info: { bg: colors.infoLight, text: colors.info },
    neutral: { bg: colors.lightGray, text: colors.midGray },
  };

  const { bg, text } = badgeColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.xs - 1,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.3,
  },
});
