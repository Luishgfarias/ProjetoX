import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import { RootStackParamList } from "./types";
import LaunchListScreen from "../screens/LaunchListScreen";
import LaunchDetailsScreen from "../screens/LaunchDetailsScreen";
import ArticleWebViewScreen from "../screens/ArticleWebViewScreen";
import {
  NAVIGATION_DARK_THEME,
  NAVIGATION_LIGHT_THEME,
} from "../constants/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      ...(isDark ? NAVIGATION_DARK_THEME : NAVIGATION_LIGHT_THEME),
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="LaunchList"
        screenOptions={{
          contentStyle: {
            backgroundColor: navigationTheme.colors.background,
          },
          headerStyle: {
            backgroundColor: navigationTheme.colors.card,
          },
          headerTintColor: navigationTheme.colors.text,
        }}
      >
        <Stack.Screen
          name="LaunchList"
          component={LaunchListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LaunchDetails"
          component={LaunchDetailsScreen}
          options={{ title: "Detalhes da missão" }}
        />
        <Stack.Screen
          name="ArticleWebView"
          component={ArticleWebViewScreen}
          options={({ route }) => ({
            title: route.params.title ?? "Artigo",
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
