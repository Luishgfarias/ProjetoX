import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ViewToken,
  ListRenderItem,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { useLaunchStore } from "../store/launchStore";
import { LaunchCard as LaunchCardType } from "../@types/launch";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LaunchCard } from "../components/LaunchCard";
import { LoadingState } from "../components/LoadingState";
import { SearchBar } from "../components/SearchBar";
import { saveThemePreference } from "../storage/themeStorage";
import {
  INITIAL_NUM_TO_RENDER,
  LAUNCH_LIST_PAGE_SIZE,
  MAX_TO_RENDER_PER_BATCH,
  NEXT_PAGE_TRIGGER_OFFSET,
  VIEWABILITY_ITEM_VISIBLE_PERCENT_THRESHOLD,
  WINDOW_SIZE,
} from "../constants/launchList";
import {
  DARK_LOADING_INDICATOR_COLOR,
  LOADING_INDICATOR_COLOR,
  THEME_SWITCH_ICON_DARK_COLOR,
  THEME_SWITCH_ICON_LIGHT_COLOR,
  THEME_SWITCH_THUMB_DARK_COLOR,
  THEME_SWITCH_THUMB_LIGHT_COLOR,
} from "../constants/theme";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchList">;

export default function LaunchListScreen({ navigation }: Props) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkTheme = colorScheme === "dark";
  const indicatorColor = isDarkTheme
    ? DARK_LOADING_INDICATOR_COLOR
    : LOADING_INDICATOR_COLOR;
  const {
    launches,
    hasNextPage,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    search,
    loadInitialLaunches,
    refreshLaunches,
    retryLaunches,
    setSearch,
  } = useLaunchStore();

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const maxVisibleIndex = viewableItems.reduce((maxIndex, item) => {
        if (typeof item.index !== "number") return maxIndex;
        return Math.max(maxIndex, item.index);
      }, -1);
      if (maxVisibleIndex < 0) return;

      const {
        page,
        hasNextPage,
        isLoading,
        isLoadingMore,
        isRefreshing,
        error,
        launches,
        loadMoreLaunches,
      } = useLaunchStore.getState();
      const nextPageTriggerIndex =
        page * LAUNCH_LIST_PAGE_SIZE - NEXT_PAGE_TRIGGER_OFFSET;

      if (
        maxVisibleIndex >= nextPageTriggerIndex &&
        launches.length > 0 &&
        hasNextPage &&
        !isLoading &&
        !isLoadingMore &&
        !isRefreshing &&
        !error
      ) {
        loadMoreLaunches();
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: VIEWABILITY_ITEM_VISIBLE_PERCENT_THRESHOLD,
  }).current;

  useEffect(() => {
    loadInitialLaunches();
  }, [loadInitialLaunches]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearch(text);
    },
    [setSearch],
  );

  const handleLaunchPress = useCallback(
    (id: string) => {
      navigation.navigate("LaunchDetails", { id });
    },
    [navigation],
  );

  const handleThemeChange = useCallback(
    (enabled: boolean) => {
      const preference = enabled ? "dark" : "light";
      setColorScheme(preference);
      void saveThemePreference(preference);
    },
    [setColorScheme],
  );

  const renderItem = useCallback<ListRenderItem<LaunchCardType>>(
    ({ item }) => <LaunchCard lancamento={item} onPress={handleLaunchPress} />,
    [handleLaunchPress],
  );

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color={indicatorColor} />
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
  };

  const renderEmpty = () => {
    if (isLoading) {
      return <LoadingState text="Carregando lançamentos..." />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={retryLaunches} />;
    }

    return <EmptyState search={search} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-app-background p-4 dark:bg-app-background-dark">
      <View className="mb-4 flex-row items-center justify-between gap-4">
        <Text
          accessibilityRole="header"
          className="min-w-0 flex-1 text-2xl font-bold text-app-text dark:text-app-text-dark"
        >
          Missões espaciais
        </Text>
        <View className="flex-row items-center">
          <Pressable
            accessibilityLabel={
              isDarkTheme ? "Ativar tema claro" : "Ativar tema escuro"
            }
            accessibilityRole="switch"
            accessibilityState={{ checked: isDarkTheme }}
            className="h-9 w-16 justify-center rounded-full bg-slate-300 px-1.5 active:opacity-80 dark:bg-slate-700"
            onPress={() => handleThemeChange(!isDarkTheme)}
          >
            <View
              className={`h-7 w-7 items-center justify-center rounded-full ${
                isDarkTheme ? "self-end" : "self-start"
              }`}
              style={{
                backgroundColor: isDarkTheme
                  ? THEME_SWITCH_THUMB_DARK_COLOR
                  : THEME_SWITCH_THUMB_LIGHT_COLOR,
              }}
            >
              <MaterialIcons
                name={isDarkTheme ? "dark-mode" : "light-mode"}
                size={18}
                color={
                  isDarkTheme
                    ? THEME_SWITCH_ICON_DARK_COLOR
                    : THEME_SWITCH_ICON_LIGHT_COLOR
                }
              />
            </View>
          </Pressable>
        </View>
      </View>
      <SearchBar
        placeholder="Buscar por nome da missão..."
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={launches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        windowSize={WINDOW_SIZE}
        removeClippedSubviews
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshLaunches}
            tintColor={indicatorColor}
          />
        }
      />
    </SafeAreaView>
  );
}
