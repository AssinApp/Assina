import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';

import { StackProps } from '@/navigator/stack';
import { colors } from '@/theme';

export default function Cadastro({ navigation }: StackProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCadastro = () => {
    if (!name || !email || !password || !confirmPassword) {
      ToastAndroid.show('Preencha todos os campos!', ToastAndroid.SHORT);
      return;
    }

    if (password !== confirmPassword) {
      ToastAndroid.show('As senhas não coincidem!', ToastAndroid.SHORT);
      return;
    }

    // Simulação de cadastro
    console.log('Cadastro com:', { name, email, password });
    ToastAndroid.show('Conta criada com sucesso!', ToastAndroid.SHORT);
    navigation.navigate('Login', { from: 'HomeStack' }); // Redireciona para Login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
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

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
