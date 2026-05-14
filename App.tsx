import "./global.css";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from "nativewind";
import AppNavigator from './src/navigation/AppNavigator';
import { SPLASH_SCREEN_EXTRA_DELAY_MS } from "./src/constants/theme";
import { getThemePreference } from "./src/storage/themeStorage";

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isThemePreferenceLoaded, setIsThemePreferenceLoaded] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadThemePreference() {
      const preference = await getThemePreference();

      if (!isMounted) return;

      setColorScheme(preference ?? "system");
      requestAnimationFrame(() => {
        if (isMounted) {
          setIsThemePreferenceLoaded(true);
        }
      });
    }

    loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRootLayout = useCallback(() => {
    setTimeout(() => {
      void SplashScreen.hideAsync();
    }, SPLASH_SCREEN_EXTRA_DELAY_MS);
  }, []);

  if (!isThemePreferenceLoaded) {
    return null;
  }

  return (
    <View
      className="flex-1 bg-app-background dark:bg-app-background-dark"
      onLayout={handleRootLayout}
    >
      <AppNavigator />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </View>
  );
}
