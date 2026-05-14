import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  APP_THEME_COLORS,
  AppThemeName,
  getNavigationTheme,
} from "../constants/theme";
import {
  getThemePreference,
  saveThemePreference,
  ThemePreference,
} from "../storage/themeStorage";

type AppThemeContextValue = {
  colors: (typeof APP_THEME_COLORS)[AppThemeName];
  isDark: boolean;
  isReady: boolean;
  navigationTheme: ReturnType<typeof getNavigationTheme>;
  preference: ThemePreference;
  resolvedTheme: AppThemeName;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  toggleThemePreference: () => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);

  const resolvedTheme: AppThemeName =
    preference === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  useEffect(() => {
    let isMounted = true;

    async function loadThemePreference() {
      const storedPreference = await getThemePreference();

      if (!isMounted) return;

      setPreference(storedPreference);
      setColorScheme(storedPreference);
      requestAnimationFrame(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });
    }

    loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, [setColorScheme]);

  useEffect(() => {
    if (isReady) {
      setColorScheme(preference);
    }
  }, [isReady, preference, setColorScheme]);

  const setThemePreference = useCallback(
    async (nextPreference: ThemePreference) => {
      setPreference(nextPreference);
      setColorScheme(nextPreference);
      await saveThemePreference(nextPreference);
    },
    [setColorScheme],
  );

  const toggleThemePreference = useCallback(async () => {
    await setThemePreference(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setThemePreference]);

  const value = useMemo(
    () => ({
      colors: APP_THEME_COLORS[resolvedTheme],
      isDark: resolvedTheme === "dark",
      isReady,
      navigationTheme: getNavigationTheme(resolvedTheme),
      preference,
      resolvedTheme,
      setThemePreference,
      toggleThemePreference,
    }),
    [
      isReady,
      preference,
      resolvedTheme,
      setThemePreference,
      toggleThemePreference,
    ],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }

  return context;
}
