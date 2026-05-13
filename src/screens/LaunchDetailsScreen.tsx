import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getLaunchById } from '../services/launchService';
import { Launch } from '../@types/launch';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchDetails'>;

export default function LaunchDetailsScreen({ route }: Props) {
  const { launchId } = route.params;
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLaunch() {
      try {
        const data = await getLaunchById(launchId);
        setLaunch(data);
      } catch (err) {
        setError('Não foi possível carregar os detalhes do lançamento.');
      } finally {
        setLoading(false);
      }
    }

    fetchLaunch();
  }, [launchId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !launch) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-center text-lg text-red-600">{error ?? 'Lançamento não encontrado.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Detalhes do Lançamento</Text>
      <Text className="text-lg font-semibold">{launch.name}</Text>
      <Text className="text-sm text-gray-600 mb-4">Data local: {new Date(launch.date_local).toLocaleString()}</Text>
      <Text className="text-base text-gray-800 mb-4">{launch.details ?? 'Sem detalhes disponíveis.'}</Text>
      <Text className="text-sm text-gray-600">Status: {launch.upcoming ? 'Agendado' : launch.success ? 'Sucesso' : 'Falha'}</Text>
      <Text className="text-sm text-gray-600">Rocket ID: {launch.rocket}</Text>
    </ScrollView>
  );
}
