import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchList'>;

export default function LaunchListScreen({ navigation }: Props) {
  const sampleLaunchId = '123';

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Listagem de Lançamentos</Text>
      <View className="rounded-lg border border-gray-200 p-4 shadow-sm">
        <Text className="text-lg font-semibold">Lançamento Exemplo</Text>
        <Text className="text-sm text-gray-600 mb-3">ID: {sampleLaunchId}</Text>
        <Pressable
          className="rounded-md bg-blue-600 px-4 py-3"
          onPress={() => navigation.navigate('LaunchDetails', { launchId: sampleLaunchId })}
        >
          <Text className="text-center text-white font-semibold">Ver Detalhes</Text>
        </Pressable>
      </View>
    </View>
  );
}
