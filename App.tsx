import "./global.css";
import { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { SPLASH_SCREEN_EXTRA_DELAY_MS } from "./src/constants/theme";
import { AppThemeProvider, useAppTheme } from "./src/theme/ThemeProvider";

void SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isDark, isReady } = useAppTheme();

  const handleRootLayout = useCallback(() => {
    setTimeout(() => {
      void SplashScreen.hideAsync();
    }, SPLASH_SCREEN_EXTRA_DELAY_MS);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View
      className="flex-1 bg-app-background dark:bg-app-background-dark"
      onLayout={handleRootLayout}
    >
      <AppNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}
