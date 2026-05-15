import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ListRenderItem,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RootStackParamList } from "../navigation/types";
import { LaunchCard as LaunchCardType } from "../@types/launch";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LaunchCard } from "../components/LaunchCard";
import { LoadingState } from "../components/LoadingState";
import { SearchBar } from "../components/SearchBar";
import { useDoubleBackExit } from "../hooks/useDoubleBackExit";
import { useSearchLaunches } from "../hooks/useSearchLaunches";
import { useAppTheme } from "../theme/ThemeProvider";
import {
  INITIAL_NUM_TO_RENDER,
  MAX_TO_RENDER_PER_BATCH,
  WINDOW_SIZE,
} from "../constants/launchList";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchList">;

type InlineListErrorProps = {
  message: string;
  onRetry: () => void;
};

function InlineListError({ message, onRetry }: InlineListErrorProps) {
  return (
    <View className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900 dark:bg-rose-950/50">
      <Text className="text-sm font-medium text-app-danger dark:text-app-danger-dark">
        {message}
      </Text>
      <Pressable
        accessibilityLabel="Tentar novamente"
        accessibilityRole="button"
        className="mt-3 self-start rounded-full bg-app-primary px-4 py-2 active:bg-app-primary-pressed dark:bg-app-primary-dark dark:active:bg-app-primary-pressed-dark"
        onPress={onRetry}
      >
        <Text className="text-sm font-semibold text-white dark:text-gray-950">
          Tentar novamente
        </Text>
      </Pressable>
    </View>
  );
}

export default function LaunchListScreen({ navigation }: Props) {
  const { colors, isDark, toggleThemePreference } = useAppTheme();
  const { isExitHintVisible } = useDoubleBackExit();
  const {
    launches,
    hasNextPage,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    search,
    searchInput,
    refreshLaunches,
    retryLaunches,
    retryListError,
    handleSearch,
    handleSubmitSearch,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useSearchLaunches();

  const handleLaunchPress = useCallback(
    (id: string) => {
      navigation.navigate("LaunchDetails", { id });
    },
    [navigation],
  );

  const handleThemeChange = useCallback(() => {
    void toggleThemePreference();
  }, [toggleThemePreference]);

  const renderItem = useCallback<ListRenderItem<LaunchCardType>>(
    ({ item }) => <LaunchCard launch={item} onPress={handleLaunchPress} />,
    [handleLaunchPress],
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View className="items-center px-6 py-5">
          <ActivityIndicator size="small" color={colors.loadingIndicator} />
          <Text className="mt-2 text-center text-xs font-medium text-app-subtle dark:text-app-subtle-dark">
            Carregando mais missões...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && launches.length > 0) {
      return (
        <View className="items-center px-6 py-6">
          <Text className="text-center text-sm font-medium text-app-subtle dark:text-app-subtle-dark">
            Fim da rota, comandante. Sem mais missões por enquanto.
          </Text>
        </View>
      );
    }

    return null;
  }, [colors.loadingIndicator, hasNextPage, isLoadingMore, launches.length]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <LoadingState text="Carregando lançamentos..." />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={retryLaunches} />;
    }

    return <EmptyState search={search} />;
  }, [error, isLoading, retryLaunches, search]);

  const hasVisibleListError = Boolean(error && launches.length > 0);
  const listContentContainerStyle = useMemo(
    () =>
      launches.length === 0 ? styles.emptyListContent : styles.listContent,
    [launches.length],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={refreshLaunches}
        tintColor={colors.loadingIndicator}
        colors={[colors.loadingIndicator]}
        progressBackgroundColor={colors.card}
      />
    ),
    [colors.card, colors.loadingIndicator, isRefreshing, refreshLaunches],
  );

  return (
    <SafeAreaView className="flex-1 bg-app-background p-4 dark:bg-app-background-dark">
      <View className="mb-4 flex-row items-center justify-between gap-4">
        <Text
          accessibilityRole="header"
          className="min-w-0 flex-1 text-2xl font-bold text-app-text dark:text-app-text-dark"
        >
          Missões espaciais
        </Text>
        <Pressable
          accessibilityLabel={
            isDark ? "Ativar tema claro" : "Ativar tema escuro"
          }
          accessibilityRole="switch"
          accessibilityState={{ checked: isDark }}
          className="h-9 w-16 justify-center rounded-full bg-slate-300 px-1.5 active:opacity-80 dark:bg-slate-700"
          onPress={handleThemeChange}
        >
          <View
            className={`h-7 w-7 items-center justify-center rounded-full ${
              isDark ? "self-end" : "self-start"
            }`}
            style={{
              backgroundColor: colors.themeSwitchThumb,
            }}
          >
            <MaterialIcons
              name={isDark ? "dark-mode" : "light-mode"}
              size={18}
              color={colors.themeSwitchIcon}
            />
          </View>
        </Pressable>
      </View>
      <SearchBar
        placeholder="Buscar por nome da missão..."
        value={searchInput}
        onChangeText={handleSearch}
        onSubmitSearch={handleSubmitSearch}
      />
      {hasVisibleListError && error ? (
        <InlineListError message={error} onRetry={retryListError} />
      ) : null}
      <FlatList
        data={launches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={listContentContainerStyle}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        windowSize={WINDOW_SIZE}
        removeClippedSubviews
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={refreshControl}
      />
      {isExitHintVisible ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center px-6"
        >
          <View className="rounded-2xl bg-slate-900 px-5 py-3 shadow-lg dark:bg-slate-100">
            <Text className="text-center text-sm font-semibold text-white dark:text-slate-950">
              Se quiser realmente sair, volte mais uma vez.
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
});
