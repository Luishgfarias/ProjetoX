import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getLaunches } from '../services/launchService';
import { Launch } from '../@types/launch';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchList'>;

export default function LaunchListScreen({ navigation }: Props) {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLaunches() {
      try {
        const data = await getLaunches();
        setLaunches(data);
      } catch (err) {
        setError('Não foi possível carregar os lançamentos.');
      } finally {
        setLoading(false);
      }
    }

    fetchLaunches();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-center text-lg text-red-600">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Listagem de Lançamentos</Text>
      <FlatList
        data={launches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
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
        )}
      />
    </View>
  );
}
