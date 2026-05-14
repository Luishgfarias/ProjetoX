import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import LaunchListScreen from "../screens/LaunchListScreen";
import LaunchDetailsScreen from "../screens/LaunchDetailsScreen";
import ArticleWebViewScreen from "../screens/ArticleWebViewScreen";
import { useAppTheme } from "../theme/ThemeProvider";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { navigationTheme } = useAppTheme();

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
