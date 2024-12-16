import { StackHeaderLeft, StackHeaderTitle } from './components';
import { StackParamList, StackProps } from './Stack.typeDefs';

import Assinatura from '@/views/Assinatura';
import Cadastro from '@/views/Cadastro';
import Details from '@/views/GerarCodigo';
import { DrawerActions } from '@react-navigation/native';
import Home from '@/views/Home';
import HomeAuth from '@/views/HomeAuth';
import Login from '@/views/Login';
import Profile from '@/views/Profile';
import React from 'react';
import { colors } from '@/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<StackParamList>();

const navigationProps = {
  headerTintColor: colors.white,
  headerStyle: { backgroundColor: colors.darkPurple },
  headerTitleStyle: { fontSize: 18 },
};

export function HomeStackNavigator({ navigation, route }: StackProps) {
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer()); // Adicione a função aqui

  const initialRoute = route?.params?.isLoggedIn ? 'HomeAuth' : 'HomeStack';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={navigationProps}>
      <Stack.Screen
        name="HomeStack"
        component={Home}
        options={{
          title: 'Home',
          headerTitleAlign: 'center',
        }}
      />

      <Stack.Screen
        name="HomeAuth"
        component={HomeAuth}
        options={{
          title: 'Home Autenticada',
          headerTitleAlign: 'center',
          headerLeft: () => <StackHeaderLeft onPress={toggleDrawer} />, // Botão do Drawer
        }}
      />

      <Stack.Screen
        name="GerarCodigoStack"
        component={Details}
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

      <Stack.Screen name="CadastroStack" component={Cadastro} options={{ title: 'Cadastro' }} />

      <Stack.Screen name="LoginStack" component={Login} options={{ title: 'Login' }} />
    </Stack.Navigator>
  );
}

export function ProfileStackNavigator({ navigation }: StackProps) {
  const toggleDrawer = () => navigation.dispatch(DrawerActions.toggleDrawer());
  return (
    <Stack.Navigator screenOptions={navigationProps}>
      <Stack.Screen
        name="ProfileStack"
        component={Profile}
        options={{
          title: 'Profile',
          headerTitle: () => <StackHeaderTitle />,
          headerLeft: () => <StackHeaderLeft onPress={toggleDrawer} />,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="GerarCodigoStack"
        component={Details}
        options={{
          title: 'Details',
          headerTitle: () => <StackHeaderTitle />,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}
