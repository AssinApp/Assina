import { Bell, FileSignature, Home, LogOut, Sparkles, Target, User } from 'lucide-react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomDrawerContent(props) {
  const [userName, setUserName] = useState('Usuário');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('user_name');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar o nome do usuário:', error);
      }
    };

    fetchUserName();
  }, []);

  async function handleLogout() {
    props.setIsLoggedIn(false);
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Cabeçalho do Drawer */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => props.navigation.closeDrawer()}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <User size={32} color="#2563EB" />
          </View>
          <Text style={styles.name}>Olá</Text>
        </View>
      </View>

      {/* Itens do Drawer */}
      <DrawerContentScrollView {...props}>
        <DrawerItem
          label="Página Inicial"
          onPress={() => props.navigation.navigate('HomeAuth')}
          icon={() => <Home size={20} color="#2563EB" />}
        />
        <DrawerItem
          label="Assinar"
          onPress={() => props.navigation.navigate('Assinatura')}
          icon={() => <FileSignature size={20} color="#2563EB" />}
        />

        {/* Divider abaixo de "Assinar" */}
        <View style={styles.divider} />

        {/* Estatísticas - MOVIDO PARA LOGO ABAIXO DO DIVIDER */}
        <View style={styles.statsContainer}>
          {/* Economia de Papel */}
          <View style={[styles.statItem, { backgroundColor: '#D1FAE5' }]}>
            <Sparkles size={20} color="#047857" />
            <Text style={styles.statText}>Economia de Papel</Text>
          </View>

          {/* Tempo Economizado */}
          <View style={[styles.statItem, { backgroundColor: '#DBEAFE' }]}>
            <Bell size={20} color="#1E40AF" />
            <Text style={styles.statText}>Tempo Economizado</Text>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Espaço em branco */}
      <View style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 150,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingTop: 10, // Adiciona um pequeno espaçamento após o divider
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 10,
  },
  statText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
