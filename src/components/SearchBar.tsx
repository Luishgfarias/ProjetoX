import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  SEARCH_CLEAR_ICON_COLOR,
  SEARCH_ICON_COLOR,
  SEARCH_PLACEHOLDER_COLOR,
} from "../constants/theme";

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar...",
}: SearchBarProps) {
  const handleSearchPress = () => {
    onChangeText(value.trim());
  };

  const handleClearPress = () => {
    onChangeText("");
  };

  return (
    <View className="mb-4 flex-row items-center rounded-full border border-gray-300 bg-white px-3 py-2">
      <TextInput
        className="min-w-0 flex-1 text-base text-gray-900"
        placeholder={placeholder}
        placeholderTextColor={SEARCH_PLACEHOLDER_COLOR}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={handleSearchPress}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Limpar busca"
          accessibilityRole="button"
          className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          onPress={handleClearPress}
        >
          <MaterialIcons
            name="close"
            size={18}
            color={SEARCH_CLEAR_ICON_COLOR}
          />
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel="Buscar lançamentos"
        accessibilityRole="button"
        className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-900 active:bg-gray-700"
        onPress={handleSearchPress}
      >
        <MaterialIcons name="search" size={22} color={SEARCH_ICON_COLOR} />
      </Pressable>
    </View>
  );
}
