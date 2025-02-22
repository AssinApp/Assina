import { Bell, FileSignature, Home, LogOut, Sparkles, Target, User } from 'lucide-react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import React from 'react';

export default function CustomDrawerContent(props) {
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
          <Text style={styles.name}>João Silva</Text>
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
      </DrawerContentScrollView>

      {/* Estatísticas organizadas verticalmente */}
      <View style={styles.statsContainer}>
        {/* Meta Mensal */}
        <View style={styles.goalContainer}>
          <View style={styles.goalHeader}>
            <Target size={20} color="#2563EB" />
            <Text style={styles.goalTitle}>Meta Mensal</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.goalText}>75/100 assinaturas</Text>
        </View>

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

      {/* Espaço em branco */}
      <View style={{ flex: 1 }} />

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="red" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
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
    padding: 15,
  },
  goalContainer: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1E40AF',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  goalText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 5,
    textAlign: 'center',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
    marginLeft: 10,
  },
});
