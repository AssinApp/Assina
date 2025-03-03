import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';

import { StackProps } from '@/navigator/stack';
import { colors } from '@/theme';

const API_BASE_URL = 'https://assinapp.com.br';

export default function Cadastro({ navigation }: StackProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCadastro = async () => {
    if (!name || !email || !password || !confirmPassword) {
      ToastAndroid.show('Preencha todos os campos!', ToastAndroid.SHORT);
      return;
    }
    if (password !== confirmPassword) {
      ToastAndroid.show('As senhas não coincidem!', ToastAndroid.SHORT);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }), // Inclui o campo 'name'
      });
      if (response.ok) {
        ToastAndroid.show('Conta criada com sucesso!', ToastAndroid.SHORT);
        navigation.navigate('Login', { from: 'CadastroStack' });
      } else {
        ToastAndroid.show('Erro ao criar conta!', ToastAndroid.SHORT);
      }
    } catch {
      ToastAndroid.show('Erro ao conectar ao servidor!', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua conta!</Text>
      <Text style={styles.subText}>Crie uma conta para assinar seus documentos</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor={colors.gray}
        value={name}
        onChangeText={setName}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Confirme a senha"
        placeholderTextColor={colors.gray}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login', { from: 'HomeStack' })}>
        <Text style={styles.linkText}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    marginBottom: 30,
    textAlign: 'center',
    color: '#422FE0',
  },
  subText: {
    fontSize: 20,
    fontWeight: 'light',
    marginBottom: 50,
    textAlign: 'center', // Centraliza o texto
    alignSelf: 'center', // Centraliza no container
    color: colors.darkPurple,
    maxWidth: 500, // Define uma largura máxima para forçar a quebra de linha
    lineHeight: 22, // Ajusta a altura entre as linhas para melhor visualização
  },
  input: {
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 8,
    padding: 12,
    marginBottom: 25,
    fontSize: 16,
    backgroundColor: '#F1F4FF',
    color: colors.black,
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
    fontSize: 15,
    textAlign: 'center',
    color: colors.black,
  },
});
