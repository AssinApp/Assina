import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';

import Button from '@/components/Button';
import { StackProps } from '@/navigator/stack';
import { colors } from '@/theme';

// Simule um estado global de login (pode ser substituído por Context API ou AsyncStorage)
const isLoggedIn = false; // Defina como true para simular um usuário logado

export default function Home({ navigation }: StackProps) {
  useEffect(() => {
    // Verifica se o usuário está logado
    if (isLoggedIn) {
      // Redireciona para HomeLogada
      navigation.replace('HomeLogged');
    }
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Bem-vindo ao AssinApp</Text>
      <Text style={styles.subtitle}>
        Assine documentos de forma segura e prática com autenticação de dois fatores.
      </Text>

      {/* Botão de Login */}
      <Button
        title="Login"
        titleStyle={styles.buttonTitle}
        style={styles.button}
        onPress={() => navigation.navigate('LoginStack', { from: 'HomeStack' })}
      />

      {/* Botão de Cadastro */}
      <Button
        title="Cadastre-se"
        titleStyle={styles.buttonTitle}
        style={[styles.button, { marginTop: 16 }]}
        onPress={() => navigation.navigate('CadastroStack', { from: 'HomeStack' })}
      />

      {/* Botão de 2FA OTP */}
      <Button
        title="Verificar OTP"
        titleStyle={styles.buttonTitle}
        style={[styles.button, { marginTop: 16 }]}
        onPress={() => navigation.navigate('GerarCodigoStack', { from: 'HomeStack' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrayPurple,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: colors.darkPurple,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: colors.darkPurple,
  },
  buttonTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.lightPurple,
    height: 44,
    width: '70%',
  },
});
