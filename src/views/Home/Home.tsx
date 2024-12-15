import { StatusBar, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import React from 'react';
import { StackProps } from '@/navigator/stack';
import { colors } from '@/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrayPurple,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: colors.darkPurple,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: colors.darkGray,
  },
  buttonTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.lightPurple,
    height: 44,
    width: '50%',
  },
});

export default function Home({ navigation }: StackProps) {
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
        onPress={() => navigation.navigate('LoginStack', { from: 'Home' })}
      />

      {/* Botão de Cadastro */}
      <Button
        title="Cadastre-se"
        titleStyle={styles.buttonTitle}
        style={[styles.button, { marginTop: 16 }]}
        onPress={() => navigation.navigate('CadastroStack', { from: 'Home' })}
      />
    </View>
  );
}
