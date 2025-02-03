// navigator/DrawerNavigator.tsx

import Assinatura from '@/views/Assinatura';
import AssinaturaStack from '../views/Assinatura/Assinatura';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native';
import Historico from '@/views/Historico';
import HomeAuth from '@/views/HomeAuth';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ setIsLoggedIn }) {
  async function handleLogout() {
    // Remove token do storage
    await AsyncStorage.removeItem('token');
    // Atualiza estado para falso
    setIsLoggedIn(false);
  }

  return (
    <Drawer.Navigator initialRouteName="HomeAuth">
      <Drawer.Screen
        name="HomeAuth"
        component={HomeAuth}
        options={{
          title: 'Página Inicial',
          headerRight: () => <Button title="Logout" onPress={handleLogout} />,
        }}
      />
      <Drawer.Screen name="Assinatura" component={Assinatura} options={{ title: 'Assinatura' }} />
      <Drawer.Screen name="Historico" component={Historico} options={{ title: 'Histórico' }} />
      <Drawer.Screen
        name="AssinaturaStack"
        component={Assinatura}
        options={{ title: 'Assinatura', headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
