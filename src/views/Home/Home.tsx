import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import React from 'react';
import { StackProps } from '@/navigator/stack';
import { colors } from '@/theme';

export default function Home({ navigation }: StackProps) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/AssinAppLogin.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Assinaturas digitais simplificadas</Text>
      <Text style={styles.subtitle}>
        Assine documentos de forma segura e prática com autenticação de dois fatores.
      </Text>

      <Button
        title="Login"
        titleStyle={styles.buttonTitle}
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      />

      <Button
        title="Cadastre-se"
        titleStyle={styles.buttonTitle}
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Cadastro')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGrayPurple,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: '80%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    fontWeight: 'bold',
    color: colors.darkPurple,
    textAlign: 'center',
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: '#1F41BB',
    height: 50,
    width: '80%',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: colors.darkPurple,
  },
});
