export const LightColors = {
  primary: '#CC0000',
  primaryDark: '#990000',
  primaryLight: '#FF3333',
  white: '#FFFFFF',
  offWhite: '#F5F5F5',
  dark: '#1A1A1A',
  midGray: '#6B6B6B',
  lightGray: '#EEEEEE',
  borderGray: '#DDDDDD',
  success: '#00843D',
  successLight: '#E8F5EE',
  warning: '#FF6B00',
  warningLight: '#FFF3EB',
  info: '#0066CC',
  infoLight: '#E6F0FF',
  black: '#000000',
  cardBg: '#FFFFFF',
  screenBg: '#F4F4F4',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  shadow: 'rgba(0,0,0,0.10)',
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const DarkColors = {
  primary: '#CC0000',
  primaryDark: '#990000',
  primaryLight: '#FF3333',
  white: '#1C1C1E',
  offWhite: '#2C2C2E',
  dark: '#F2F2F7',
  midGray: '#8E8E93',
  lightGray: '#3A3A3C',
  borderGray: '#48484A',
  success: '#30D158',
  successLight: '#0A2918',
  warning: '#FF9F0A',
  warningLight: '#2E1A00',
  info: '#0A84FF',
  infoLight: '#001A38',
  black: '#FFFFFF',
  cardBg: '#1C1C1E',
  screenBg: '#000000',
  tabBar: '#1C1C1E',
  tabBarBorder: '#38383A',
  shadow: 'rgba(0,0,0,0.45)',
  overlay: 'rgba(0,0,0,0.75)',
} as const;

// Legacy alias so existing imports don't break during migration
export const Colors = LightColors;
export const GradientRed = ['#CC0000', '#990000'] as const;
export const GradientRedLight = ['#E83333', '#CC0000'] as const;

export type ThemeColors = { [K in keyof typeof LightColors]: string };
export type ColorScheme = 'light' | 'dark' | 'auto';
