import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LaunchDetails'>;

export default function LaunchDetailsScreen({ route }: Props) {
  const { launchId } = route.params;

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Detalhes do Lançamento</Text>
      <Text className="text-lg">ID do lançamento:</Text>
      <Text className="text-3xl font-semibold text-blue-600 mt-2">{launchId}</Text>
    </View>
  );
}
