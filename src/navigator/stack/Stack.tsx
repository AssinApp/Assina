import { StackHeaderLeft, StackHeaderTitle } from './components';
import { StackParamList, StackProps } from './Stack.typeDefs';

import Assinatura from '@/views/Assinatura';
import Details from '@/views/GerarCodigo';
import { DrawerActions } from '@react-navigation/native';
import Home from '@/views/Home';
import Profile from '@/views/Profile';
import React from 'react';
import { colors } from '@/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// views

const Stack = createNativeStackNavigator<StackParamList>();

const navigationProps = {
  headerTintColor: colors.white,
  headerStyle: { backgroundColor: colors.darkPurple },
  headerTitleStyle: { fontSize: 18 },
};

export function HomeStackNavigator({ navigation }: StackProps) {
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());
  return (
    <Stack.Navigator screenOptions={navigationProps}>
      <Stack.Screen
        component={Home}
        name="HomeStack"
        options={{
          title: 'Home',
          headerTitle: () => <StackHeaderTitle />,
          headerLeft: () => <StackHeaderLeft onPress={toggleDrawer} />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        component={Details}
        name="GerarCodigoStack"
        options={{
          title: 'Details',
          headerTitle: () => <StackHeaderTitle />,
          headerTitleAlign: 'center',
        }}
      />

      <Stack.Screen
        name="AssinaturaStack"
        component={Assinatura}
        options={{ title: 'Assinatura' }}
      />
    </Stack.Navigator>
  );
}

export function ProfileStackNavigator({ navigation }: StackProps) {
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());
  return (
    <Stack.Navigator screenOptions={navigationProps}>
      <Stack.Screen
        component={Profile}
        name="ProfileStack"
        options={{
          title: 'Profile',
          headerTitle: () => <StackHeaderTitle />,
          headerLeft: () => <StackHeaderLeft onPress={toggleDrawer} />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        component={Details}
        name="GerarCodigoStack"
        options={{
          title: 'Details',
          headerTitle: () => <StackHeaderTitle />,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}
