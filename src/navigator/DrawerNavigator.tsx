import Assinatura from '@/views/Assinatura';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDrawerContent from './drawer/CustomDrawerContent'; // Mantendo o estilo
import Historico from '@/views/Historico';
import HomeAuth from '@/views/HomeAuth';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ setIsLoggedIn }) {
  async function handleLogout() {
    await AsyncStorage.removeItem('token');
    setIsLoggedIn(false);
  }

  return (
    <Drawer.Navigator
      initialRouteName="HomeAuth"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="HomeAuth" options={{ title: 'Página Inicial' }}>
        {props => <HomeAuth {...props} handleLogout={handleLogout} />}
      </Drawer.Screen>

      <Drawer.Screen name="Assinatura" component={Assinatura} options={{ title: 'Assinatura' }} />
      <Drawer.Screen name="Historico" component={Historico} options={{ title: 'Histórico' }} />
    </Drawer.Navigator>
  );
}
