import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getLaunchById } from '../services/launchService';
import { Launch } from '../@types/launch';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchDetails'>;

export default function LaunchDetailsScreen({ route, navigation }: Props) {
  const { launchId } = route.params;
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const fetchLaunch = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLaunch(null);
    setLoading(true);
    setError(null);

    const canUpdate = () =>
      isMountedRef.current && requestId === requestIdRef.current;

    try {
      const data = await getLaunchById(launchId);
      if (!canUpdate()) return;
      setLaunch(data);
    } catch {
      if (!canUpdate()) return;
      setError('Não foi possível carregar os detalhes do lançamento.');
    } finally {
      if (!canUpdate()) return;
      setLoading(false);
    }
  }, [launchId]);

  useEffect(() => {
    fetchLaunch();
  }, [fetchLaunch]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <LoadingState text="Carregando detalhes..." />
      </View>
    );
  }

  if (error || !launch) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <ErrorState
          message={error ?? 'Lançamento não encontrado.'}
          onRetry={fetchLaunch}
          onBack={navigation.goBack}
        />
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
      <Text className="text-sm text-gray-600">ID do foguete: {launch.rocket}</Text>
    </ScrollView>
  );
}
