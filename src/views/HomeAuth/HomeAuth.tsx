import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function HomeAuth() {
  const [userName, setUserName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setUserName(data.name);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        onPress: async () => {
          await AsyncStorage.removeItem('token'); // Remove o token
          navigation.navigate('LoginStack', { from: 'HomeStack' }); // Redireciona para a tela de login
        },
      },
    ]);
  };

  const navigateToAssinatura = () => {
    navigation.navigate('AssinaturaStack', { userName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {userName}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>

      {/* Botão flutuante para redirecionar */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAssinatura}>
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

  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff', // Cor do texto no botão
    fontWeight: 'bold',
  },
});
