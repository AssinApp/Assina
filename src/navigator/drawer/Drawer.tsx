import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HistoricoAssinaturas from '../../views/Historico';
import TabNavigator from '../tab/Tab';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

/**
 * Componente que renderiza o conteúdo do Drawer (foto, nome, email, etc.).
 * Recebe as props do Drawer, incluindo navigation.
 */
const drawerContents = props => {
  const navigation = useNavigation();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  // Exemplo: buscar dados do usuário no backend (ou no AsyncStorage).
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUserName(data.name || 'Usuário');
            setUserEmail(data.email || 'email@exemplo.com');
            // Se houver URL da foto, use data.photo; senão use placeholder
            setUserPhoto(data.photo || '');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };
    fetchUser();
  }, []);

  /**
   * Handler de logout (mesmo do HomeAuth)
   */
  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        onPress: async () => {
          await AsyncStorage.removeItem('token'); // Remove o token
          // Redireciona para a tela de login (ajuste a rota conforme seu Stack)
          navigation.navigate('LoginStack', { from: 'Drawer' });
        },
      },
    ]);
  };

  /**
   * Navegar para o histórico
   */
  const handleHistorico = () => {
    // Nome da rota exata que você registrou no Drawer para o histórico
    navigation.navigate('Historico');
  };

  // Foto padrão se userPhoto estiver vazio
  const defaultPhoto = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        {/* Foto arredondada */}
        <Image source={{ uri: userPhoto || defaultPhoto }} style={styles.profileImage} />
        {/* Nome e email */}
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>

      {/* Linha de separação */}
      <View style={styles.separator} />

      {/* Botão "Histórico" */}
      <TouchableOpacity style={styles.drawerButton} onPress={handleHistorico}>
        <Text style={styles.drawerButtonText}>Histórico</Text>
      </TouchableOpacity>

      {/* Botão "Sair" */}
      <TouchableOpacity
        style={[styles.drawerButton, { backgroundColor: '#ff4d4d' }]}
        onPress={handleLogout}>
        <Text style={[styles.drawerButtonText, { color: '#fff' }]}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

/**
 * O DrawerNavigator propriamente dito.
 */
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="MainDrawer"
      screenOptions={{ headerShown: false }}
      drawerContent={drawerContents}>
      <Drawer.Screen
        name="MainDrawer"
        component={TabNavigator}
        options={{ title: 'Tela Principal' }}
      />

      <Drawer.Screen
        name="Historico"
        component={HistoricoAssinaturas}
        options={{ title: 'Histórico de Assinaturas' }}
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;

/**
 * Estilos
 */
const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f5f5f5',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Deixa a imagem redonda
    marginBottom: 10,
    backgroundColor: '#ccc',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
    marginVertical: 10,
  },
  drawerButton: {
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 5,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
  drawerButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
