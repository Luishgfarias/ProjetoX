import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ViewToken,
  ListRenderItem,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useLaunchStore } from '../store/launchStore';
import { LaunchCard as LaunchCardType } from '../@types/launch';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LaunchCard } from '../components/LaunchCard';
import { LoadingState } from '../components/LoadingState';
import { SearchBar } from '../components/SearchBar';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchList'>;

const PAGE_SIZE = 10;
const NEXT_PAGE_TRIGGER_OFFSET = 4;
const INITIAL_NUM_TO_RENDER = 8;
const MAX_TO_RENDER_PER_BATCH = 6;
const WINDOW_SIZE = 7;

export default function LaunchListScreen({ navigation }: Props) {
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
        if (typeof item.index !== 'number') return maxIndex;
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
      const nextPageTriggerIndex = page * PAGE_SIZE - NEXT_PAGE_TRIGGER_OFFSET;

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
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
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
      navigation.navigate('LaunchDetails', { launchId: id });
    },
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<LaunchCardType>>(
    ({ item }) => <LaunchCard lancamento={item} onPress={handleLaunchPress} />,
    [handleLaunchPress],
  );

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      );
    }

    if (!hasNextPage && launches.length > 0) {
      return (
        <View className="items-center px-6 py-6">
          <Text className="text-center text-sm font-medium text-gray-500">
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
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Listagem de Lançamentos</Text>
      <SearchBar
        placeholder="Buscar por nome da missão..."
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={launches}
        keyExtractor={item => item.id}
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
          />
        }
      />
    </View>
  );
}
