import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ThemeColors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

export function useThemeColors(): ThemeColors {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();

  const isDark =
    colorScheme === 'dark' ||
    (colorScheme === 'auto' && systemScheme === 'dark');

  return isDark ? DarkColors : LightColors;
}
