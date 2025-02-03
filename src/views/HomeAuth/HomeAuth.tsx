import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StackActions, useNavigation } from '@react-navigation/native';

import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const handleDrawerToggle = () => {
    // Abre o menu lateral (drawer)
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const navigateToAssinatura = () => {
    navigation.navigate('Assinatura', { userName });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');

      // Substitui a tela atual por Login sem permitir voltar
      navigation.dispatch(StackActions.replace('Login'));
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {userName}</Text>

      {/* Botão para abrir Drawer manualmente */}
      <TouchableOpacity style={styles.drawerButton} onPress={handleDrawerToggle}>
        <Text style={styles.drawerButtonText}>Abrir Menu</Text>
      </TouchableOpacity>

      {/* Botão de Logout (TESTE) */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>

      {/* FAB para Assinatura */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAssinatura}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  drawerButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
  },
  drawerButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff4d4d',
    padding: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e90ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});
