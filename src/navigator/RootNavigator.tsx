import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';
import { NavigationContainer } from '@react-navigation/native';

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) return null; // Ou uma tela de splash/loading

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        // Se logado, exibe DrawerNavigator
        <DrawerNavigator setIsLoggedIn={setIsLoggedIn} />
      ) : (
        // Se não logado, exibe o stack de Autenticação
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
}
