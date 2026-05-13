import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  onBack?: () => void;
};

export function ErrorState({ message, onRetry, onBack }: ErrorStateProps) {
  return (
    <View className="items-center justify-center py-12">
      <Text className="mb-4 text-center text-lg font-medium text-stone-700">
        {message}
      </Text>
      <View className="flex-row items-center gap-3">
        {onBack ? (
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            className="rounded-full border border-gray-300 bg-white px-3 py-2.5 active:bg-gray-100"
            onPress={onBack}
          >
            <Text className="text-center font-semibold text-gray-800">
              Voltar
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Tentar novamente"
          accessibilityRole="button"
          className="rounded-full bg-gray-900 px-4 py-2.5 active:bg-gray-700"
          onPress={onRetry}
        >
          <Text className="text-center font-semibold text-white">
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
