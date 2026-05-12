import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-2xl font-bold text-center mb-4">Bem-vindo ao ProjetoX</Text>
        <View className="bg-blue-500 p-4 rounded-lg">
          <Text className="text-white text-lg">Este é um teste do NativeWind!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}