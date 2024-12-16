import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import React from 'react';
import { useNavigation } from '@react-navigation/native';

export default function HomeAuth() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Conteúdo principal da tela */}
      <Text style={styles.title}>Bem-vindo à Home Autenticada</Text>
      <Text style={styles.subtitle}>
        Você está autenticado. Aproveite as funcionalidades disponíveis.
      </Text>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AssinaturaStack', { from: HomeAuth })} // Redireciona para a tela Assinatura
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Cor de fundo
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333', // Cor do título
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666', // Cor do subtítulo
    marginBottom: 32,
  },
  fab: {
    position: 'absolute',
    right: 20, // Distância do lado direito
    bottom: 20, // Distância da parte inferior
    width: 60, // Largura do botão
    height: 60, // Altura do botão
    borderRadius: 30, // Torna o botão circular
    backgroundColor: '#1e90ff', // Cor do botão
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Sombra para Android
    shadowColor: '#000', // Cor da sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff', // Cor do texto no botão
    fontWeight: 'bold',
  },
});
