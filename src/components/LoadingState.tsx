import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import {
  DARK_LOADING_INDICATOR_COLOR,
  LOADING_INDICATOR_COLOR,
} from "../constants/theme";

export type LoadingStateProps = {
  text?: string;
};

export function LoadingState({ text }: LoadingStateProps) {
  const { colorScheme } = useColorScheme();
  const indicatorColor =
    colorScheme === "dark"
      ? DARK_LOADING_INDICATOR_COLOR
      : LOADING_INDICATOR_COLOR;

  return (
    <View className="items-center justify-center py-12">
      <ActivityIndicator size="large" color={indicatorColor} />
      {text ? (
        <Text className="mt-3 text-center text-sm font-medium text-app-muted dark:text-app-muted-dark">
          {text}
        </Text>
      ) : null}
    </View>
  );
}
