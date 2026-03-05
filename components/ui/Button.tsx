import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientRed, ThemeColors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, fullWidth = true,
}: ButtonProps) {
  const colors = useThemeColors();
  const sizeStyle = sizes[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[{ width: fullWidth ? '100%' : undefined, opacity: isDisabled ? 0.6 : 1 }, style]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[...GradientRed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyle.container]}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={[styles.primaryText, sizeStyle.text, textStyle]}>{label}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyle.container,
        getVariantStyle(variant, colors),
        { width: fullWidth ? '100%' : undefined, opacity: isDisabled ? 0.6 : 1 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF'} size="small" />
        : <Text style={[sizeStyle.text, getVariantTextStyle(variant, colors), textStyle]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, flexDirection: 'row' },
  primaryText: { color: '#FFFFFF', fontWeight: FontWeight.bold, letterSpacing: 0.3 },
});

function getVariantStyle(variant: Exclude<Variant, 'primary'>, c: ThemeColors): ViewStyle {
  switch (variant) {
    case 'secondary': return { backgroundColor: c.lightGray };
    case 'outline': return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.primary };
    case 'ghost': return { backgroundColor: 'transparent' };
    case 'danger': return { backgroundColor: '#E53935' };
  }
}

function getVariantTextStyle(variant: Exclude<Variant, 'primary'>, c: ThemeColors): TextStyle {
  switch (variant) {
    case 'secondary': return { color: c.dark, fontWeight: FontWeight.semiBold };
    case 'outline': return { color: c.primary, fontWeight: FontWeight.semiBold };
    case 'ghost': return { color: c.primary, fontWeight: FontWeight.semiBold };
    case 'danger': return { color: '#FFFFFF', fontWeight: FontWeight.bold };
  }
}

const sizes: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md }, text: { fontSize: FontSize.sm } },
  md: { container: { paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg }, text: { fontSize: FontSize.md } },
  lg: { container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl }, text: { fontSize: FontSize.lg } },
};
