import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ViewToken,
  ListRenderItem,
  BackHandler,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { useLaunchStore } from "../store/launchStore";
import { LaunchCard as LaunchCardType } from "../@types/launch";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LaunchCard } from "../components/LaunchCard";
import { LoadingState } from "../components/LoadingState";
import { SearchBar } from "../components/SearchBar";
import { useAppTheme } from "../theme/ThemeProvider";
import {
  INITIAL_NUM_TO_RENDER,
  LAUNCH_LIST_PAGE_SIZE,
  MAX_TO_RENDER_PER_BATCH,
  NEXT_PAGE_TRIGGER_OFFSET,
  SEARCH_DEBOUNCE_DELAY_MS,
  VIEWABILITY_ITEM_VISIBLE_PERCENT_THRESHOLD,
  WINDOW_SIZE,
} from "../constants/launchList";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchList">;
const EXIT_HINT_TIMEOUT_MS = 2500;

export default function LaunchListScreen({ navigation }: Props) {
  const { colors, isDark, toggleThemePreference } = useAppTheme();
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
  const [searchInput, setSearchInput] = useState(search);
  const [isExitHintVisible, setIsExitHintVisible] = useState(false);
  const shouldExitOnBackPress = useRef(false);
  const exitHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      const clearExitHint = () => {
        shouldExitOnBackPress.current = false;
        setIsExitHintVisible(false);

        if (exitHintTimeoutRef.current) {
          clearTimeout(exitHintTimeoutRef.current);
          exitHintTimeoutRef.current = null;
        }
      };

      const backSubscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (shouldExitOnBackPress.current) {
            clearExitHint();
            BackHandler.exitApp();
            return true;
          }

          shouldExitOnBackPress.current = true;
          setIsExitHintVisible(true);

          exitHintTimeoutRef.current = setTimeout(() => {
            shouldExitOnBackPress.current = false;
            setIsExitHintVisible(false);
            exitHintTimeoutRef.current = null;
          }, EXIT_HINT_TIMEOUT_MS);

          return true;
        },
      );

      return () => {
        backSubscription.remove();
        clearExitHint();
      };
    }, []),
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchInput(text);

      if (text.length === 0 && search !== "") {
        void setSearch("");
      }
    },
    [search, setSearch],
  );

  const handleSubmitSearch = useCallback(
    (text: string) => {
      setSearchInput(text);

      if (text !== search) {
        void setSearch(text);
      }
    },
    [search, setSearch],
  );

  useEffect(() => {
    if (searchInput === search) return;

    const timeoutId = setTimeout(() => {
      void setSearch(searchInput);
    }, SEARCH_DEBOUNCE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, searchInput, setSearch]);

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
    ({ item }) => <LaunchCard lancamento={item} onPress={handleLaunchPress} />,
    [handleLaunchPress],
  );

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color={colors.loadingIndicator} />
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
            tintColor={colors.loadingIndicator}
          />
        }
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
