import {
  DarkTheme,
  DefaultTheme,
  Theme as NavigationTheme,
} from "@react-navigation/native";

export type AppThemeName = "light" | "dark";

export const LOADING_INDICATOR_COLOR = "#111827";
export const DARK_LOADING_INDICATOR_COLOR = "#e5e7eb";
export const SEARCH_PLACEHOLDER_COLOR = "#6b7280";
export const DARK_SEARCH_PLACEHOLDER_COLOR = "#94a3b8";
export const SEARCH_CLEAR_ICON_COLOR = "#4b5563";
export const DARK_SEARCH_CLEAR_ICON_COLOR = "#cbd5e1";
export const SEARCH_ICON_COLOR = "#ffffff";
export const DARK_SEARCH_ICON_COLOR = "#111827";
export const THEME_SWITCH_THUMB_LIGHT_COLOR = "#ffffff";
export const THEME_SWITCH_THUMB_DARK_COLOR = "#e5e7eb";
export const THEME_SWITCH_ICON_LIGHT_COLOR = "#ca8a04";
export const THEME_SWITCH_ICON_DARK_COLOR = "#111827";
export const SPLASH_SCREEN_EXTRA_DELAY_MS = 500;

export const APP_THEME_COLORS = {
  light: {
    background: "#f8fafc",
    card: "#ffffff",
    border: "#dbe3ee",
    text: "#0f172a",
    primary: "#2563eb",
    loadingIndicator: LOADING_INDICATOR_COLOR,
    searchPlaceholder: SEARCH_PLACEHOLDER_COLOR,
    searchClearIcon: SEARCH_CLEAR_ICON_COLOR,
    searchIcon: SEARCH_ICON_COLOR,
    themeSwitchThumb: THEME_SWITCH_THUMB_LIGHT_COLOR,
    themeSwitchIcon: THEME_SWITCH_ICON_LIGHT_COLOR,
  },
  dark: {
    background: "#070b12",
    card: "#111827",
    border: "#334155",
    text: "#f8fafc",
    primary: "#93c5fd",
    loadingIndicator: DARK_LOADING_INDICATOR_COLOR,
    searchPlaceholder: DARK_SEARCH_PLACEHOLDER_COLOR,
    searchClearIcon: DARK_SEARCH_CLEAR_ICON_COLOR,
    searchIcon: DARK_SEARCH_ICON_COLOR,
    themeSwitchThumb: THEME_SWITCH_THUMB_DARK_COLOR,
    themeSwitchIcon: THEME_SWITCH_ICON_DARK_COLOR,
  },
} as const;

export const NAVIGATION_LIGHT_THEME = {
  background: "#f8fafc",
  card: "#ffffff",
  border: "#dbe3ee",
  text: "#0f172a",
  primary: "#2563eb",
};

export const NAVIGATION_DARK_THEME = {
  background: "#070b12",
  card: "#111827",
  border: "#334155",
  text: "#f8fafc",
  primary: "#93c5fd",
};

export function getNavigationTheme(theme: AppThemeName): NavigationTheme {
  const isDark = theme === "dark";

  return {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      ...(isDark ? NAVIGATION_DARK_THEME : NAVIGATION_LIGHT_THEME),
    },
  };
}
