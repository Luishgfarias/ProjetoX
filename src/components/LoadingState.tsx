import React, { memo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export type LoadingStateProps = {
  text?: string;
};

function LoadingStateComponent({ text }: LoadingStateProps) {
  return (
    <View className="items-center justify-center py-12">
      <ActivityIndicator size="large" color="#111827" />
      {text ? (
        <Text className="mt-3 text-center text-sm font-medium text-gray-600">
          {text}
        </Text>
      ) : null}
    </View>
  );
}

export const LoadingState = memo(LoadingStateComponent);
