// navigator/AuthStack.tsx

import Cadastro from '@/views/Cadastro';
import Home from '@/views/Home';
import Login from '@/views/Login';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// se quiser mantê-la no fluxo

const Stack = createNativeStackNavigator();

export default function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />

      <Stack.Screen
        name="Login"
        options={{
          headerShown: true,
          title: 'Login',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#1F41BB', // Cor de fundo do header
          },
          headerTintColor: '#FFFFFF', // Cor do título e dos ícones no header
          headerTitleStyle: {
            fontWeight: 'bold', // Deixa o título em negrito (opcional)
            fontSize: 20, // Ajusta o tamanho da fonte do título
          },
        }}>
        {screenProps => (
          // Repasse navigation, route, etc. para Login,
          // e injete também setIsLoggedIn
          <Login {...screenProps} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Cadastro"
        component={Cadastro}
        options={{
          headerShown: true,
          title: 'Cadastro',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#1F41BB', // Cor de fundo do header
          },
          headerTintColor: '#FFFFFF', // Cor do título e dos ícones no header
          headerTitleStyle: {
            fontWeight: 'bold', // Deixa o título em negrito (opcional)
            fontSize: 20, // Ajusta o tamanho da fonte do título
          },
        }}
      />
    </Stack.Navigator>
  );
}
