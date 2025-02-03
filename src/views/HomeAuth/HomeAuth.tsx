import { Appbar, Avatar, Badge, FAB } from 'react-native-paper';
import { DrawerActions, StackActions } from '@react-navigation/native';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function HomeAuth({ handleLogout }) {
  const [userName, setUserName] = useState('João Silva');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigation = useNavigation();

  // Exemplo de Documentos Recentes
  const [recentDocuments, setRecentDocuments] = useState([]);

  const loadSignedDocuments = async (user: string) => {
    try {
      const savedDocs = await AsyncStorage.getItem(`signedDocuments_${user}`);
      if (savedDocs) {
        const documents = JSON.parse(savedDocs);
        setRecentDocuments(documents);

        // Contar quantos são assinados e quantos são pendentes
        const signedDocs = documents.filter(doc => doc.status === 'signed').length;
        const pendingDocs = documents.filter(doc => doc.status === 'pending').length;

        setSignedCount(signedDocs);
        setPendingCount(pendingDocs);
      } else {
        setRecentDocuments([]);
        setSignedCount(0);
        setPendingCount(0);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos assinados:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name);
          await loadSignedDocuments(data.name);
        }
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchUser);

    fetchUser();

    return unsubscribe;
  }, [navigation]);

  const navigateToAssinatura = () => {
    navigation.navigate('Assinatura', { userName });
  };

  // Contador de documentos
  const [signedCount, setSignedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de Navegação */}
      <Appbar.Header style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Icon name="edit" size={24} color="#1e90ff" />
          <Text style={styles.logoText}>AssinApp</Text>
        </View>

        {/* Botão de Notificação */}
        {/*     <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell" size={24} color="#555" />
          <Badge style={styles.badge} size={8} />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="log-out" size={24} color="red" />
        </TouchableOpacity>
      </Appbar.Header>

      {/* Mensagem de Boas-Vindas */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Olá, {userName}! 👋</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta ao AssinApp</Text>
      </View>

      {/* Estatísticas Rápidas */}
      <View style={styles.quickStats}>
        <View style={[styles.statCard, { backgroundColor: '#E6F7E6' }]}>
          <Icon name="check-circle" size={30} color="green" />
          <Text style={styles.statText}>{signedCount}</Text>
          <Text style={styles.statLabel}>Assinados</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF7E6' }]}>
          <Icon name="clock" size={30} color="orange" />
          <Text style={styles.statText}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {/* Lista de Documentos Recentes */}
      <View style={styles.documentsSection}>
        <Text style={styles.sectionTitle}>Documentos Recentes</Text>
        <FlatList
          data={recentDocuments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.documentCard}>
              <View>
                <Text style={styles.documentTitle}>{item.title}</Text>
                <Text style={styles.documentDate}>{item.date}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'signed' ? styles.signed : styles.pending,
                ]}>
                <Text style={styles.statusText}>
                  {item.status === 'signed' ? 'Assinado' : 'Pendente'}
                </Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* Floating Action Button */}
      {/* FAB para Assinatura */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAssinatura}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Estilos da Tela
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    justifyContent: 'space-between',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#333' },
  notificationButton: { position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: 'red' },
  logoutButton: { padding: 8 },
  welcomeSection: { padding: 20 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },
  quickStats: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  statCard: {
    width: 150,
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  statText: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  statLabel: { fontSize: 14, color: '#555' },
  documentsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  documentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  documentDate: { fontSize: 12, color: '#777' },
  statusBadge: { padding: 5, borderRadius: 5 },
  signed: { backgroundColor: '#DFF6DD', color: 'green' },
  pending: { backgroundColor: '#FFF3CD', color: 'orange' },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 27,
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
