import { HomeStackNavigator, ProfileStackNavigator } from '../stack/Stack';
import { TabBarStatus, TabParamList } from './Tab.typeDefs';

import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { colors } from '@/theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator<TabParamList>();

const hiddenRoutes = ['LoginStack', 'CadastroStack', 'HomeStack'];

const renderTabBarIcon = (tabName: keyof TabParamList) => (tabStatus: TabBarStatus) => {
  switch (tabName) {
    case 'HomeTab':
      return <AntDesign name="home" size={24} color={tabStatus.color} />;
    case 'ProfileTab':
      return <AntDesign name="profile" size={24} color={tabStatus.color} />;
  }
};

function shouldHideTabBar(route: any) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  return hiddenRoutes.includes(routeName);
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: renderTabBarIcon(route.name),
        headerShown: false,
        tabBarInactiveTintColor: colors.gray,
        tabBarInactiveBackgroundColor: colors.white,
        tabBarActiveTintColor: colors.lightPurple,
        tabBarActiveBackgroundColor: colors.white,
        tabBarStyle: {
          display: shouldHideTabBar(route) ? 'none' : 'flex',
        },
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault(); // Previne o comportamento padrão
            navigation.navigate('HomeTab', { screen: 'HomeAuth' }); // Sempre navega para HomeAuth
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
