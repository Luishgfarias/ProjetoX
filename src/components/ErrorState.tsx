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
      <Text className="mb-4 text-center text-lg font-medium text-app-muted dark:text-app-muted-dark">
        {message}
      </Text>
      <View className="flex-row items-center gap-3">
        {onBack ? (
          <Pressable
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            className="rounded-full border border-app-border bg-app-surface px-3 py-2.5 active:bg-app-surface-muted dark:border-app-border-dark dark:bg-app-surface-dark dark:active:bg-app-surface-muted-dark"
            onPress={onBack}
          >
            <Text className="text-center font-semibold text-app-text dark:text-app-text-dark">
              Voltar
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Tentar novamente"
          accessibilityRole="button"
          className="rounded-full bg-app-primary px-4 py-2.5 active:bg-app-primary-pressed dark:bg-app-primary-dark dark:active:bg-app-primary-pressed-dark"
          onPress={onRetry}
        >
          <Text className="text-center font-semibold text-white dark:text-gray-950">
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
