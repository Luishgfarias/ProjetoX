import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

export type LoadingStateProps = {
  text?: string;
};

export function LoadingState({ text }: LoadingStateProps) {
  const { colors } = useAppTheme();

  return (
    <View className="items-center justify-center py-12">
      <ActivityIndicator size="large" color={colors.loadingIndicator} />
      {text ? (
        <Text className="mt-3 text-center text-sm font-medium text-app-muted dark:text-app-muted-dark">
          {text}
        </Text>
      ) : null}
    </View>
  );
}
