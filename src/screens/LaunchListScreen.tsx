import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useLaunchStore } from '../store/launchStore';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LaunchCard } from '../components/LaunchCard';
import { LoadingState } from '../components/LoadingState';
import { SearchBar } from '../components/SearchBar';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchList'>;

export default function LaunchListScreen({ navigation }: Props) {
  const {
    launches,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    search,
    loadInitialLaunches,
    loadMoreLaunches,
    refreshLaunches,
    retryLaunches,
    setSearch,
  } = useLaunchStore();

  useEffect(() => {
    loadInitialLaunches();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
  };

  const handleLaunchPress = useCallback(
    (id: string) => {
      navigation.navigate('LaunchDetails', { launchId: id });
    },
    [navigation]
  );

  const renderItem = ({ item }: { item: typeof launches[0] }) => (
    <LaunchCard lancamento={item} onPress={handleLaunchPress} />
  );

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="small" color="#2563eb" />
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
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreLaunches}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshLaunches} />
        }
      />
    </View>
  );
}
