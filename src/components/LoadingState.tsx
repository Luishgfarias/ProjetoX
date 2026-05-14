import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LOADING_INDICATOR_COLOR } from "../constants/theme";

export type LoadingStateProps = {
  text?: string;
};

export function LoadingState({ text }: LoadingStateProps) {
  return (
    <View className="items-center justify-center py-12">
      <ActivityIndicator size="large" color={LOADING_INDICATOR_COLOR} />
      {text ? (
        <Text className="mt-3 text-center text-sm font-medium text-gray-600">
          {text}
        </Text>
      ) : null}
    </View>
  );
}
