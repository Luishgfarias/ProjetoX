import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
}: SearchBarProps) {
  const handleSearchPress = () => {
    onChangeText(value.trim());
  };

  return (
    <View className="mb-4 flex-row items-center rounded-full border border-gray-300 bg-white px-3 py-2">
      <TextInput
        className="min-w-0 flex-1 text-base text-gray-900"
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={handleSearchPress}
      />
      <Pressable
        accessibilityLabel="Buscar lançamentos"
        accessibilityRole="button"
        className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-900 active:bg-gray-700"
        onPress={handleSearchPress}
      >
        <Text className="text-xl font-bold leading-6 text-white">⌕</Text>
      </Pressable>
    </View>
  );
}
