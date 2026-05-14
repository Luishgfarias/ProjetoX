import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import LaunchListScreen from '../screens/LaunchListScreen';
import LaunchDetailsScreen from '../screens/LaunchDetailsScreen';
import ArticleWebViewScreen from '../screens/ArticleWebViewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LaunchList">
        <Stack.Screen
          name="LaunchList"
          component={LaunchListScreen}
          options={{ title: 'Lançamentos' }}
        />
        <Stack.Screen
          name="LaunchDetails"
          component={LaunchDetailsScreen}
          options={{ title: 'Detalhes do Lançamento' }}
        />
        <Stack.Screen
          name="ArticleWebView"
          component={ArticleWebViewScreen}
          options={({ route }) => ({
            title: route.params.title ?? 'Artigo',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
