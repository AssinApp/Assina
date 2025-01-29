import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { Alert, Animated, Button, PanResponder, StyleSheet, Text, View } from 'react-native';
// Importações do pdf-lib
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import React, { useRef, useState } from 'react';

import Pdf from 'react-native-pdf';

// Se precisar de polyfill para btoa/atob, descomente e ajuste:
/*
import { decode as atob, encode as btoa } from 'base-64';
if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}
*/

export default function App() {
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [signedPdfUri, setSignedPdfUri] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  // Para controlar a posição da "assinatura"
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

  /**
   * Função para abrir o seletor de documento e pegar o URI do PDF escolhido.
   */
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets?.[0]?.uri) {
        setSelectedPdf(result.assets[0].uri);
        setSignedPdfUri(null);
        setKey(prev => prev + 1);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao selecionar arquivo');
    }
  }

  /**
   * Função que efetivamente assina o PDF utilizando pdf-lib.
   */
  async function signPdf(pdfUri: string, xPos: number, yPos: number, signatureText: string) {
    try {
      // 1. Ler o arquivo PDF como base64
      const pdfBase64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Converter base64 em array de bytes
      const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

      // 3. Carregar PDF no pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // 4. Obter a primeira página (ou iterar se quiser assinar várias)
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // 5. Configurar fonte e estilo
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 20;

      // 6. Desenhar o texto da assinatura na página
      firstPage.drawText(signatureText, {
        x: xPos,
        y: yPos,
        size: fontSize,
        font: font,
        color: rgb(1, 0, 0), // vermelho
      });

      // 7. Serializar (salvar) o PDF modificado
      const modifiedPdfBytes = await pdfDoc.save();

      // 8. Converter para base64 para poder salvar no FileSystem do Expo
      const modifiedPdfBase64 = btoa(String.fromCharCode(...new Uint8Array(modifiedPdfBytes)));

      // 9. Criar um path temporário para o PDF assinado
      const newPdfUri = FileSystem.documentDirectory + `pdf-assinado-${Date.now()}.pdf`;

      // 10. Salvar o PDF modificado
      await FileSystem.writeAsStringAsync(newPdfUri, modifiedPdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return newPdfUri;
    } catch (error) {
      console.error('Erro ao assinar PDF:', error);
      throw error;
    }
  }

  /**
   * Handler para clicar no botão de "Posicionar Assinatura".
   * Lê o PDF, insere a assinatura e salva o resultado em outro arquivo.
   */
  const handlePositionSignature = async () => {
    if (!selectedPdf) return;

    try {
      // Chama nossa função signPdf
      const newPdfUri = await signPdf(
        selectedPdf,
        pan.x._value, // coordenada X
        pan.y._value, // coordenada Y
        'Assinado por: João Silva',
      );

      setSignedPdfUri(newPdfUri);
      Alert.alert('Sucesso!', 'Documento assinado gerado');
    } catch (error) {
      Alert.alert('Erro', 'Falha na geração do PDF');
      console.error(error);
    }
  };

  /**
   * Handler para baixar o documento assinado e salvá-lo na pasta escolhida pelo usuário.
   */
  const handleDownload = async () => {
    if (!signedPdfUri) return;

    try {
      // 1. Pedir permissão para acessar pasta
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
        <Button
          title="Fechar PDF"
          onPress={() => {
            setSelectedPdf(null);
            setSignedPdfUri(null);
          }}
          disabled={!selectedPdf}
        />
      </View>

      {selectedPdf ? (
        <View style={styles.pdfContainer}>
          <Pdf
            key={key}
            source={{ uri: selectedPdf }}
            style={styles.pdf}
            onError={error => console.error('Erro no PDF:', error)}
          />

          {/* Caixa para arrastar e posicionar a assinatura */}
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
