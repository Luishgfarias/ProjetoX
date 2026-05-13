import React, { useEffect } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useLaunchStore } from '../store/launchStore';

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
    setSearch,
  } = useLaunchStore();

  useEffect(() => {
    loadInitialLaunches();
  }, []);

  const filteredLaunches = launches.filter(launch =>
    launch.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof launches[0] }) => (
    <View className="mb-3 rounded-lg border border-gray-200 bg-slate-50 p-4 shadow-sm">
      <Text className="text-lg font-semibold mb-1">{item.name}</Text>
      <Text className="text-sm text-gray-600 mb-3">Data: {new Date(item.date_local).toLocaleDateString()}</Text>
      <Pressable
        className="rounded-md bg-blue-600 px-4 py-3"
        onPress={() => navigation.navigate('LaunchDetails', { launchId: item.id })}
      >
        <Text className="text-center text-white font-semibold">Ver Detalhes</Text>
      </Pressable>
    </View>
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

  if (isLoading && launches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error && launches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-center text-lg text-red-600 mb-4">{error}</Text>
        <Pressable
          className="rounded-md bg-blue-600 px-4 py-2"
          onPress={loadInitialLaunches}
        >
          <Text className="text-center text-white font-semibold">Tentar Novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Listagem de Lançamentos</Text>
      <TextInput
        className="mb-4 rounded-md border border-gray-300 px-3 py-2"
        placeholder="Buscar lançamentos..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredLaunches}
        keyExtractor={item => item.id}
        renderItem={renderItem}
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
