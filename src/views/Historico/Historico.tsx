// HistoricoAssinaturas.tsx

import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdf from 'react-native-pdf';

export default function HistoricoAssinaturas() {
  const [lista, setLista] = useState<any[]>([]);

  useEffect(() => {
    carregarHistorico();
  }, []);

  async function carregarHistorico() {
    try {
      const data = await AsyncStorage.getItem('signedDocuments');
      if (data) {
        setLista(JSON.parse(data));
      }
    } catch (error) {
      console.error('Erro ao ler histórico:', error);
    }
  }

  // Excluir do histórico, se quiser
  async function excluirItem(itemId: string) {
    try {
      const newList = lista.filter(item => item.id !== itemId);
      setLista(newList);
      await AsyncStorage.setItem('signedDocuments', JSON.stringify(newList));
    } catch (error) {
      console.error(error);
    }
  }

  function renderItem({ item }: { item: any }) {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>Assinado por: {item.userName}</Text>
        <Text style={styles.itemText}>Data: {new Date(item.date).toLocaleString()}</Text>

        {/* Exibe um PDF em miniatura ou com Pdf? (Cuidado se a lista for grande) */}
        <View style={{ height: 150 }}>
          <Pdf
            source={{ uri: item.fileUri }}
            style={{ flex: 1 }}
            onError={err => console.error('Erro ao carregar PDF:', err)}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              Alert.alert('Excluir', 'Deseja excluir este arquivo do histórico?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sim', onPress: () => excluirItem(item.id) },
              ])
            }>
            <Text style={{ color: '#fff' }}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Assinaturas</Text>

      <FlatList
        data={lista}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Nenhum PDF assinado no histórico.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#eee',
    marginVertical: 10,
    padding: 8,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 8,
  },
});
