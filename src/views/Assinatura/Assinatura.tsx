import * as DocumentPicker from 'expo-document-picker';

import { Button, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';

import Pdf from 'react-native-pdf';

export default function App() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Chave única para recriar o componente

  // Função para selecionar o documento
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Apenas PDFs
        copyToCacheDirectory: true,
      });

      console.log('Resultado do DocumentPicker:', result);

      // Verifica se há `assets` e acessa corretamente o primeiro item
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('URI do PDF:', file.uri);
        console.log('Nome do arquivo:', file.name);
        console.log('Tamanho do arquivo:', file.size, 'bytes');
        setSelectedPdf(file.uri); // Atualiza o estado com o URI do PDF
        setKey(prevKey => prevKey + 1); // Atualiza a chave para recriar o componente
      } else if (result.type === 'success' && result.uri) {
        // Tratamento para o caso de `result.uri` existir
        console.log('URI do PDF (alternativo):', result.uri);
        setSelectedPdf(result.uri);
        setKey(prevKey => prevKey + 1);
      } else {
        console.log('Seleção cancelada ou formato inesperado');
      }
    } catch (err) {
      console.error('Erro ao selecionar o arquivo:', err);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Seleção de PDF</Text>

      {/* Botões para selecionar e fechar PDF */}
      <View style={styles.buttonRow}>
        <Button title="Escolher PDF" onPress={pickDocument} />
        <Button
          title="Fechar PDF"
          onPress={() => setSelectedPdf(null)}
          disabled={!selectedPdf} // Desabilita se nenhum PDF foi selecionado
        />
      </View>

      {/* Exibição do PDF */}
      {selectedPdf ? (
        <Pdf
          key={key} // Força a recriação do componente
          source={{ uri: selectedPdf }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Número de páginas: ${numberOfPages}`);
            console.log(`Caminho do arquivo: ${filePath}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Página atual: ${page} de ${numberOfPages}`);
          }}
          onError={error => {
            console.error('Erro ao carregar PDF:', error);
          }}
          onPressLink={uri => {
            console.log('Link clicado:', uri);
          }}
          style={styles.pdf}
        />
      ) : (
        <Text style={styles.placeholderText}>Nenhum PDF selecionado</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 14,
    marginBottom: 14,
  },
  placeholderText: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: 800, // Ajuste a altura conforme necessário
  },
});
