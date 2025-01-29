import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';

import { Alert, Animated, Button, PanResponder, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';

import Pdf from 'react-native-pdf';

export default function App() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [signedPdfUri, setSignedPdfUri] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const pan = useRef(new Animated.ValueXY({ x: 50, y: 50 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
    }),
  ).current;

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets?.[0]?.uri) {
        setSelectedPdf(result.assets[0].uri);
        setKey(prev => prev + 1);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao selecionar arquivo');
    }
  }

  const handlePositionSignature = async () => {
    if (!selectedPdf) return;

    try {
      // 1. Converter PDF para imagens (simulação - na prática use uma API)
      const pdfImages = [
        'https://via.placeholder.com/595x842/FFFFFF/000000?text=P%C3%A1gina+1',
        'https://via.placeholder.com/595x842/FFFFFF/000000?text=P%C3%A1gina+2',
      ];

      // 2. Criar HTML com imagens das páginas
      let html = '<div style="position: relative;">';

      pdfImages.forEach((img, index) => {
        html += `
          <img 
            src="${img}" 
            style="width: 100%; height: auto; page-break-after: always;" 
            alt="Página ${index + 1}"
          >
        `;
      });

      // 3. Adicionar assinatura em todas as páginas
      html += `
        <div style="position: absolute;
                    left: ${pan.x._value}px;
                    top: ${pan.y._value}px;
                    color: red;
                    font-size: 24px;
                    background: white;
                    padding: 5px;
                    z-index: 1000;">
          Assinado por: João Silva
        </div>
      </div>`;

      // 4. Gerar novo PDF
      const { uri } = await Print.printToFileAsync({
        html,
        width: 595,
        height: 842,
        base64: false,
      });

      // 5. Verificar e salvar
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && fileInfo.size > 0) {
        setSignedPdfUri(uri);
        Alert.alert('Sucesso!', 'Documento assinado gerado');
      } else {
        throw new Error('Arquivo inválido');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na geração do PDF');
      console.error(error);
    }
  };
  const handleDownload = async () => {
    if (!signedPdfUri) return;

    try {
      // 1. Pedir permissão
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert('Permissão negada', 'Não foi possível salvar o arquivo');
        return;
      }

      // 2. Ler conteúdo do PDF assinado
      const pdfContent = await FileSystem.readAsStringAsync(signedPdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Criar arquivo no diretório escolhido
      const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        'Documento_Assinado_' + Date.now(),
        'application/pdf',
      );

      // 4. Escrever conteúdo no novo arquivo
      await FileSystem.writeAsStringAsync(newUri, pdfContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert('Sucesso!', 'Arquivo salvo em:\n' + newUri);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar arquivo');
      console.error('Erro no download:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assinatura Digital</Text>

      <View style={styles.buttonRow}>
        <Button title="Escolher PDF" onPress={pickDocument} />
        <Button title="Fechar PDF" onPress={() => setSelectedPdf(null)} disabled={!selectedPdf} />
      </View>

      {selectedPdf ? (
        <View style={styles.pdfContainer}>
          <Pdf
            key={key}
            source={{ uri: selectedPdf }}
            style={styles.pdf}
            onError={error => console.error('Erro no PDF:', error)}
          />

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.signatureBox,
              { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
            ]}>
            <Text style={styles.signatureText}>Assinar Aqui</Text>
          </Animated.View>
        </View>
      ) : (
        <Text style={styles.placeholder}>Selecione um PDF</Text>
      )}

      {selectedPdf && (
        <View style={styles.actionRow}>
          <Button title="Posicionar Assinatura" onPress={handlePositionSignature} />
          {signedPdfUri && (
            <Button title="Baixar Documento" onPress={handleDownload} color="green" />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  pdfContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  pdf: {
    flex: 1,
  },
  placeholder: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  signatureBox: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'red',
  },
  signatureText: {
    color: 'red',
    fontWeight: 'bold',
  },
  actionRow: {
    gap: 10,
    marginTop: 10,
  },
});
