import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { Alert, Animated, Button, PanResponder, Share, StyleSheet, Text, View } from 'react-native';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import React, { useRef, useState } from 'react';

import Pdf from 'react-native-pdf';

// Se precisar de polyfills atob/btoa (em alguns ambientes Expo), descomente:
/*
import { decode as atob, encode as btoa } from 'base-64';
if (typeof global.atob === 'undefined') {
  global.atob = atob;
}
if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}
*/

interface AssinaturaProps {
  route?: {
    params?: {
      userName?: string;
    };
  };
  // Se estiver usando React Navigation 6+, pode tipar adequadamente
  // Mas aqui basta saber que route.params?.userName é opcional
}

export default function Assinatura({ route }: AssinaturaProps) {
  // Pega userName dos parâmetros (ou define "Usuário" como fallback)
  const userName = route?.params?.userName ?? 'Usuário';

  // PDF original e PDF assinado
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [signedPdfUri, setSignedPdfUri] = useState<string | null>(null);

  const [key, setKey] = useState(0);

  // Dimensões do PDF (via pdf-lib) e do container (via onLayout)
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // PanResponder – não usaremos extractOffset()
  const pan = useRef(new Animated.ValueXY({ x: 50, y: 50 })).current;

  // Configuração do PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Define manualmente o valor, sem offsets acumulados
        // Assim pan.x, pan.y refletem em tempo real a posição do arraste
        pan.setValue({
          x: 50 + gestureState.dx, // offset inicial 50, se quiser
          y: 50 + gestureState.dy,
        });
      },
      onPanResponderRelease: () => {
        // Não chamamos extractOffset
      },
    }),
  ).current;

  /**
   * Selecionar PDF
   */
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.type === 'cancel') return;

      if (result.assets?.[0]?.uri) {
        setSelectedPdf(result.assets[0].uri);
        setSignedPdfUri(null);
        setKey(prev => prev + 1);

        // Ler dimensões do PDF via pdf-lib
        await loadPdfDimensions(result.assets[0].uri);

        // Reseta posição do "Assinar Aqui"
        pan.setValue({ x: 50, y: 50 });
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao selecionar arquivo');
      console.error(err);
    }
  }

  /**
   * Ler dimensões da 1ª página do PDF usando pdf-lib
   */
  async function loadPdfDimensions(pdfUri: string) {
    try {
      const pdfBase64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const firstPage = pdfDoc.getPages()[0];
      const { width, height } = firstPage.getSize();
      console.log('Dimensões da página PDF:', width, height);

      setPdfDimensions({ width, height });
    } catch (error) {
      console.error('Erro ao ler dimensões PDF:', error);
    }
  }

  /**
   * Gera novo PDF com a assinatura
   */
  async function signPdf(pdfUri: string, xPos: number, yPos: number, text: string) {
    try {
      const pdfBase64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const firstPage = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Desenha um retângulo grande para teste
      firstPage.drawRectangle({
        x: xPos - 50,
        y: yPos - 20,
        width: 200,
        height: 50,
        borderColor: rgb(1, 0, 0), // borda vermelha
        borderWidth: 2,
        color: rgb(1, 1, 0), // fundo amarelo
      });

      // Texto em azul
      firstPage.drawText(text, {
        x: xPos,
        y: yPos,
        size: 18,
        font,
        color: rgb(0, 0, 1),
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedPdfBase64 = btoa(String.fromCharCode(...new Uint8Array(modifiedPdfBytes)));

      const newPdfUri = FileSystem.documentDirectory + `pdf-assinado-${Date.now()}.pdf`;
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
   * Botão "Posicionar Assinatura"
   *  - Lê pan.x._value, pan.y._value
   *  - Converte em coords PDF
   *  - Gera PDF assinado
   */
  async function handlePositionSignature() {
    if (!selectedPdf) return;

    if (pdfDimensions.width === 0 || pdfDimensions.height === 0) {
      Alert.alert('Aviso', 'Dimensões do PDF não carregadas');
      return;
    }
    if (displaySize.width === 0 || displaySize.height === 0) {
      Alert.alert('Aviso', 'Contêiner do PDF não medido (width/height = 0)');
      return;
    }

    // Pega coords na tela
    const xScreen = pan.x._value;
    const yScreen = pan.y._value;

    console.log('Coordenadas finais na tela:', { xScreen, yScreen });

    // Frações
    const fracX = xScreen / displaySize.width;
    const fracY = yScreen / displaySize.height;

    // Inverter Y para PDF
    const pdfX = pdfDimensions.width * fracX;
    const pdfY = pdfDimensions.height * (1 - fracY);

    console.log('Assinatura no PDF:', { pdfX, pdfY });

    try {
      // Aqui usamos o userName no lugar do "João Silva"
      const newPdfUri = await signPdf(selectedPdf, pdfX, pdfY, `Assinado por: ${userName}`);
      setSignedPdfUri(newPdfUri);

      Alert.alert('Sucesso', 'PDF assinado! (Veja a prévia abaixo)');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao assinar PDF');
    }
  }

  /**
   * Botão para baixar PDF assinado
   */
  async function handleDownload() {
    if (!signedPdfUri) {
      Alert.alert('Atenção', 'Nenhum PDF assinado disponível para baixar.');
      return;
    }

    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert('Permissão negada', 'Não foi possível salvar o arquivo');
        return;
      }

      const pdfContent = await FileSystem.readAsStringAsync(signedPdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        'Documento_Assinado_' + Date.now(),
        'application/pdf',
      );

      await FileSystem.writeAsStringAsync(newUri, pdfContent, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert('Sucesso!', 'Arquivo salvo em:\n' + newUri);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar arquivo');
      console.error('Erro no download:', error);
    }
  }

  /**
   * Compartilhar
   */
  async function handleShare() {
    if (!signedPdfUri) {
      Alert.alert('Atenção', 'Nenhum PDF assinado disponível para compartilhar.');
      return;
    }
    try {
      await Share.share({
        url: signedPdfUri,
        message: 'Segue meu PDF assinado!',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assinatura Digital</Text>
      <Text style={styles.subtitle}>Assinar como: {userName}</Text>

      <View style={styles.buttonRow}>
        <Button title="Escolher PDF" onPress={pickDocument} />
        <Button
          title="Fechar PDF"
          onPress={() => {
            setSelectedPdf(null);
            setSignedPdfUri(null);
            setPdfDimensions({ width: 0, height: 0 });
            setDisplaySize({ width: 0, height: 0 });
            pan.setValue({ x: 50, y: 50 });
          }}
          disabled={!selectedPdf}
        />
      </View>

      {/* Se temos PDF selecionado e ainda não geramos assinado => mostra PDF original */}
      {selectedPdf && !signedPdfUri && (
        <View
          style={styles.pdfContainer}
          onLayout={e => {
            const { width, height } = e.nativeEvent.layout;
            setDisplaySize({ width, height });
          }}>
          <Pdf
            key={key}
            source={{ uri: selectedPdf }}
            style={styles.pdf}
            pointerEvents="none"
            scale={1.0}
            minScale={1.0}
            maxScale={1.0}
            fitPolicy={2}
            onError={err => console.error('Erro no PDF:', err)}
          />

          {/* Caixa arrastável */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.signatureBox,
              {
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
              },
            ]}>
            <Text style={styles.signatureText}>Assinar Aqui</Text>
          </Animated.View>
        </View>
      )}

      {/* Prévia do PDF assinado */}
      {signedPdfUri && (
        <View style={styles.pdfContainer}>
          <Pdf
            key={key + '-signed'}
            source={{ uri: signedPdfUri }}
            style={styles.pdf}
            pointerEvents="none"
            onError={err => console.error('Erro no PDF assinado:', err)}
          />
        </View>
      )}

      {/* Botoes de ação */}
      {selectedPdf && !signedPdfUri && (
        <View style={styles.actionRow}>
          <Button title="Posicionar Assinatura" onPress={handlePositionSignature} />
        </View>
      )}

      {signedPdfUri && (
        <View style={styles.actionRow}>
          <Button title="Baixar Documento" onPress={handleDownload} color="green" />
          <Button title="Compartilhar" onPress={handleShare} color="orange" />
        </View>
      )}
    </View>
  );
}

/**
 * Estilos
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
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
  signatureBox: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'red',
    zIndex: 999,
  },
  signatureText: {
    color: 'red',
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
    marginTop: 10,
  },
});
