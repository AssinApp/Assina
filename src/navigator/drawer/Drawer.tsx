import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerActions, StackActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HistoricoAssinaturas from '@/views/Historico';
import HomeAuth from '@/views/HomeAuth';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

/**
 * Componente que renderiza o conteúdo do Drawer (foto, nome, email, etc.).
 */
const drawerContents = props => {
  const navigation = useNavigation();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

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
   * Handler de logout:
   * - Remove token
   * - Redireciona para "Home" do stack principal
   */
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');

      // Aguarde um pequeno tempo antes de resetar
      setTimeout(() => {
        navigation.dispatch(
          StackActions.replace('Login'), // Substitui a tela atual por Login
        );
      }, 100);
    } catch (err) {
      console.log(err);
    }
  };
  /**
   * Navegar para o histórico (rota do Drawer)
   */
  const handleHistorico = () => {
    navigation.navigate('Historico');
  };

  // Foto padrão se userPhoto estiver vazio
  const defaultPhoto = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Image source={{ uri: userPhoto || defaultPhoto }} style={styles.profileImage} />
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>

      <View style={styles.separator} />

      <TouchableOpacity style={styles.drawerButton} onPress={handleHistorico}>
        <Text style={styles.drawerButtonText}>Histórico</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.drawerButton, { backgroundColor: '#ff4d4d' }]}
        onPress={handleLogout}>
        <Text style={[styles.drawerButtonText, { color: '#fff' }]}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

/**
 * DrawerNavigator
 */
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="HomeAuth"
      drawerContent={drawerContents}
      screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="HomeAuth" component={HomeAuth} options={{ title: 'Página inicial' }} />
      <Drawer.Screen
        name="Historico"
        component={HistoricoAssinaturas}
        options={{ title: 'Histórico de Assinaturas' }}
      />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f5f5f5',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
