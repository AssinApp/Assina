import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';
import { NavigationContainer } from '@react-navigation/native';

export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>; // 🔥 Define o tipo corretamente

    async function checkAuth() {
      const token = await AsyncStorage.getItem('token');
      console.log('Token recuperado:', token);

      if (token) {
        setIsLoggedIn(true);
        clearTimeout(timeout); // ✅ Cancela o timeout ao encontrar o token
        setLoading(false);
        return;
      }

      setLoading(false);
    }

    checkAuth();

    // 🔥 Define um timeout que será cancelado se o token for encontrado antes
    timeout = setTimeout(() => {
      console.log('Timeout atingido! Forçando transição...');
      setLoading(false);
      setIsLoggedIn(false); // Redireciona para AuthStack se o token não for encontrado
    }, 10000); // 10 segundos

    return () => clearTimeout(timeout); // ✅ Garante que o timeout seja limpo ao desmontar o componente
  }, []);

  if (loading) return null; // Pode ser substituído por uma tela de Splash/Loading

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <DrawerNavigator setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
}
