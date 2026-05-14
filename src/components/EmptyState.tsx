import React from "react";
import { Text, View } from "react-native";
import { EMPTY_LAUNCH_MESSAGES } from "../constants/emptyState";

export type EmptyStateProps = {
  search?: string;
};

function getRandomEmptyLaunchMessage() {
  const randomIndex = Math.floor(Math.random() * EMPTY_LAUNCH_MESSAGES.length);
  return EMPTY_LAUNCH_MESSAGES[randomIndex];
}

export function EmptyState({ search = "" }: EmptyStateProps) {
  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;

  return (
    <View className="items-center justify-center px-6 py-12">
      <Text className="text-center text-lg font-semibold text-app-text dark:text-app-text-dark">
        {hasSearch
          ? "Nenhum lançamento encontrado"
          : "Ainda não há lançamentos por aqui"}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-app-muted dark:text-app-muted-dark">
        {hasSearch ? (
          <>
            Terra chamando{" "}
            <Text className="font-semibold text-app-text dark:text-app-text-dark">
              {trimmedSearch}
            </Text>
            ... nenhuma missão respondeu.
          </>
        ) : (
          getRandomEmptyLaunchMessage()
        )}
      </Text>
    </View>
  );
}
