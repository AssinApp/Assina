// Login.tsx

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';

import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';

// Tipo mínimo para as props:
type LoginScreenProps = {
  navigation: any; // se quiser tipar com NativeStackScreenProps, pode
  setIsLoggedIn?: (val: boolean) => void;
};

export default function Login({ navigation, setIsLoggedIn }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      ToastAndroid.show('Preencha todos os campos!', ToastAndroid.SHORT);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });
      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (response.ok) {
        await AsyncStorage.setItem('token', data.access_token);

        // Se você estiver usando RootNavigator com isLoggedIn,
        // basta acionar setIsLoggedIn(true) que a tela troca sozinha para o Drawer.
        if (setIsLoggedIn) {
          setIsLoggedIn(true);
        }

        // Se você quiser FORÇAR a navegação dentro do AuthStack (opcional):
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'HomeAuth' }],
        // });
      } else {
        ToastAndroid.show('Credenciais inválidas!', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      ToastAndroid.show('Erro ao conectar ao servidor!', ToastAndroid.SHORT);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={colors.gray}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={colors.gray}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.linkText}>Ainda não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.lightGrayPurple,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.darkPurple,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.black,
  },
  button: {
    backgroundColor: colors.lightPurple,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    color: colors.lightPurple,
  },
});
