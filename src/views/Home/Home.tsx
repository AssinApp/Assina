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
      <Text style={styles.title}>Assinatura Digital</Text>
      <Button
        title="Autenticação 2 fatores"
        titleStyle={styles.buttonTitle}
        style={styles.button}
        onPress={() => navigation.navigate('DetailsStack', { from: 'Home' })}
      />

      {/* Botão para Assinatura */}
      <Button
        title="Assine"
        titleStyle={styles.buttonTitle}
        style={[styles.button, { marginTop: 16 }]}
        onPress={() => navigation.navigate('AssinaturaStack', { from: 'Home' })}
      />
    </View>
  );
}
