import Assinatura from '@/views/Assinatura';
import CustomDrawerContent from './drawer/CustomDrawerContent';
import Historico from '@/views/Historico';
import HomeAuth from '@/views/HomeAuth';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ setIsLoggedIn }) {
  return (
    <Drawer.Navigator
      initialRouteName="HomeAuth"
      drawerContent={props => <CustomDrawerContent {...props} setIsLoggedIn={setIsLoggedIn} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Drawer.Screen name="HomeAuth" component={HomeAuth} options={{ title: 'Página Inicial' }} />
      <Drawer.Screen name="Assinatura" component={Assinatura} options={{ title: 'Assinatura' }} />
      {/* Ocultar a tela "Histórico" do Drawer, mas permitir acesso via navegação manual */}
    </Drawer.Navigator>
  );
}
