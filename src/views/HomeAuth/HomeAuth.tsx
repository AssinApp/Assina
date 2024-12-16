import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import React from 'react';
import { StackProps } from '@/navigator/stack';
import { colors } from '@/theme';

export default function HomeAuth({ navigation }: StackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo à Home Autenticada</Text>
      <Text style={styles.subtitle}>
        Você está autenticado. A TabBar e o Drawer agora estão visíveis.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => ToastAndroid.show('HomeAuth ativa!', ToastAndroid.SHORT)}>
        <Text style={styles.buttonText}>Explorar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGrayPurple,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.darkPurple,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.gray,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.lightPurple,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: 'bold',
  },
});
