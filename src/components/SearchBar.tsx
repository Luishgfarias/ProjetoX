import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import {
  DARK_SEARCH_CLEAR_ICON_COLOR,
  DARK_SEARCH_ICON_COLOR,
  DARK_SEARCH_PLACEHOLDER_COLOR,
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleSearchPress = () => {
    onChangeText(value.trim());
  };

  const handleClearPress = () => {
    onChangeText("");
  };

  return (
    <View className="mb-4 flex-row items-center rounded-full border border-app-border bg-app-surface px-3 py-2 dark:border-app-border-dark dark:bg-app-surface-dark">
      <TextInput
        className="min-w-0 flex-1 text-base text-app-text dark:text-app-text-dark"
        placeholder={placeholder}
        placeholderTextColor={
          isDark ? DARK_SEARCH_PLACEHOLDER_COLOR : SEARCH_PLACEHOLDER_COLOR
        }
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={handleSearchPress}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Limpar busca"
          accessibilityRole="button"
          className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-app-surface-muted active:bg-slate-200 dark:bg-app-surface-muted-dark dark:active:bg-slate-700"
          onPress={handleClearPress}
        >
          <MaterialIcons
            name="close"
            size={18}
            color={
              isDark ? DARK_SEARCH_CLEAR_ICON_COLOR : SEARCH_CLEAR_ICON_COLOR
            }
          />
        </Pressable>
      ) : null}
      <Pressable
        accessibilityLabel="Buscar lançamentos"
        accessibilityRole="button"
        className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-app-primary active:bg-app-primary-pressed dark:bg-app-primary-dark dark:active:bg-app-primary-pressed-dark"
        onPress={handleSearchPress}
      >
        <MaterialIcons
          name="search"
          size={22}
          color={isDark ? DARK_SEARCH_ICON_COLOR : SEARCH_ICON_COLOR}
        />
      </Pressable>
    </View>
  );
}
