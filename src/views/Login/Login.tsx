// Login.tsx

import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';

const API_BASE_URL = 'https://assinapp.com.br';

// Tipo mínimo para as props:
type LoginScreenProps = {
  navigation: any; // se quiser tipar com NativeStackScreenProps, pode
  setIsLoggedIn?: (val: boolean) => void;
};

export default function Login({ navigation, setIsLoggedIn }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function fetchUserData(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('[DEBUG] Payload do usuário:', userData); // Printando o payload no console

        // Armazenando o ID do usuário no AsyncStorage
        await AsyncStorage.setItem('user_id', userData.id.toString()); // Armazenando o ID

        return userData;
      } else {
        console.error('[ERROR] Falha ao obter dados do usuário');
      }
    } catch (error) {
      console.error('[ERROR] Erro ao conectar ao servidor:', error);
    }
  }

  async function handleLogin() {
    if (!email || !password) {
      ToastAndroid.show('Preencha todos os campos!', ToastAndroid.SHORT);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      console.log('Resposta:', response);

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (response.ok) {
        await AsyncStorage.setItem('token', data.access_token);

        // Buscar os dados do usuário e salvar o ID
        await fetchUserData(data.access_token); // Isso agora vai salvar o ID do usuário

        if (setIsLoggedIn) {
          setIsLoggedIn(true);
        }

        // Navegar para a próxima tela
        navigation.navigate('Home'); // Ou a tela de destino após login
      } else {
        ToastAndroid.show('Credenciais inválidas!', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('[ERROR] Erro ao conectar:', error);
      ToastAndroid.show('Erro ao conectar ao servidor!', ToastAndroid.SHORT);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/AssinAppLogin.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Bem vindo de volta!</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={colors.black}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={colors.black}
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
    borderColor: colors.black,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#F1F4FF',
    color: colors.black,
  },
  logoContainer: {
    width: '100%',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#1F41BB',
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
    color: colors.black,
  },
});
