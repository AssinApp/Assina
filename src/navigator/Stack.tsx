import React, { useEffect, useState } from 'react';

import Assinatura from '@/views/Assinatura'; // Nova tela de assinatura
import AsyncStorage from '@react-native-async-storage/async-storage';
import Cadastro from '@/views/Cadastro';
import Historico from '@/views/Historico'; // Nova tela de histórico
import Home from '@/views/Home';
import HomeAuth from '@/views/HomeAuth'; // Tela pós-login
import Login from '@/views/Login';
import { colors } from '@/theme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se o usuário já está logado
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null; // Evita piscar uma tela antes da verificação

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTintColor: colors.white,
        headerStyle: { backgroundColor: colors.darkPurple },
        headerTitleStyle: { fontSize: 18 },
      }}>
      {/* Página inicial */}
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />

      {/* Login */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: true,
          title: 'Login',
          headerTitleAlign: 'center',
        }}
      />

      {/* Cadastro */}
      <Stack.Screen
        name="Cadastro"
        component={Cadastro}
        options={{
          headerShown: true,
          title: 'Cadastro',
          headerTitleAlign: 'center',
        }}
      />

      {/* Página principal depois do login */}
      <Stack.Screen
        name="HomeAuth"
        component={HomeAuth}
        options={{
          headerShown: true,
        }}
      />

      {/* Assinatura */}
      <Stack.Screen
        name="Assinatura"
        component={Assinatura}
        options={{
          headerShown: true,
          title: 'Assinatura',
          headerTitleAlign: 'center',
        }}
      />

      {/* Histórico */}
      <Stack.Screen
        name="Historico"
        component={Historico}
        options={{
          headerShown: true,
          title: 'Histórico',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}
