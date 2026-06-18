export type ThemeColors = {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
};

export type ThemeTypography = {
  fontFamily: string;
  fontSize: number; // base px
};

export type ThemeConfig = {
  colors: ThemeColors;
  typography: ThemeTypography;
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  colors: {
    primary: '#dd3327',
    primaryForeground: '#ffffff',
    secondary: '#111111',
    secondaryForeground: '#fafafa',
    background: '#ffffff',
    foreground: '#111111',
    accent: '#ffd2cf',
    accentForeground: '#222222',
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: 16,
  },
};
