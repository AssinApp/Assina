import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import {
  Alert,
  Animated,
  PanResponder,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChevronLeft,
  FileUp,
  Maximize2,
  PenTool,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import React, { useRef, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdf from 'react-native-pdf';
import { useNavigation } from '@react-navigation/native';

interface AssinaturaProps {
  route?: {
    params?: {
      userName?: string;
    };
  };
}

export default function Assinatura({ route }: AssinaturaProps) {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };
  // Nome do usuário
  const userName = route?.params?.userName ?? 'Usuário';

  // PDF original e PDF assinado
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [signedPdfUri, setSignedPdfUri] = useState<string | null>(null);

  // Forçar re-render do <Pdf /> ao escolher/fechar novo arquivo
  const [key, setKey] = useState(0);

  // Dimensões do PDF e do container onde ele é exibido
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Posição da "caixa de assinatura"
  const pan = useRef(new Animated.ValueXY({ x: 50, y: 50 })).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({
          x: 50 + gestureState.dx,
          y: 50 + gestureState.dy,
        });
      },
      onPanResponderRelease: () => {
        // Aqui não chamamos extractOffset(), pois estamos
        // ajustando manualmente os valores de pan.
      },
    }),
  ).current;

  // Pega o nome do documento em PDF
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);

  // Salvar Assinatura como AsyncStorage
  const saveSignedDocument = async (title: string, user: string) => {
    try {
      const existingDocs = await AsyncStorage.getItem(`signedDocuments_${user}`);
      const documents = existingDocs ? JSON.parse(existingDocs) : [];

      const newDocument = {
        title,
        status: 'signed',
        date: new Date().toLocaleDateString(),
      };

      const updatedDocs = [...documents, newDocument];
      await AsyncStorage.setItem(`signedDocuments_${user}`, JSON.stringify(updatedDocs));
    } catch (error) {
      console.error('Erro ao salvar documento assinado:', error);
    }
  };

  /**
   * Selecionar documento PDF
   */
  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.type === 'cancel') return;

      if (result.assets?.[0]?.uri) {
        const { uri, name } = result.assets[0];
        setSelectedPdf(uri);
        setSignedPdfUri(null);
        setKey(prev => prev + 1);
        setDocumentTitle(name || 'Documento sem título');

        // Ler dimensões do PDF para cálculos futuros
        await loadPdfDimensions(uri);
        // Reseta a posição do “Assinar Aqui”
        pan.setValue({ x: 50, y: 50 });
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao selecionar arquivo');
      console.error(err);
    }
  }

  /**
   * Carrega dimensões (largura/altura) da primeira página do PDF
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
      setPdfDimensions({ width, height });
    } catch (error) {
      console.error('Erro ao ler dimensões PDF:', error);
    }
  }

  /**
   * Botão "Posicionar Assinatura"
   */
  async function handlePositionSignature() {
    if (!selectedPdf) return;

    if (pdfDimensions.width === 0 || pdfDimensions.height === 0) {
      Alert.alert('Aviso', 'Dimensões do PDF não carregadas');
      return;
    }
    if (displaySize.width === 0 || displaySize.height === 0) {
      Alert.alert('Aviso', 'Contêiner do PDF não medido');
      return;
    }

    const xScreen = pan.x._value;
    const yScreen = pan.y._value;

    // Frações em relação ao container
    const fracX = xScreen / displaySize.width;
    const fracY = yScreen / displaySize.height;

    // Converte para coords no PDF (inverte Y)
    const pdfX = pdfDimensions.width * fracX;
    const pdfY = pdfDimensions.height * (1 - fracY);

    try {
      const newPdfUri = await signPdf(selectedPdf, pdfX, pdfY, `Assinado por: ${userName}`);
      setSignedPdfUri(newPdfUri);
      Alert.alert('Sucesso', 'PDF assinado! (Veja a prévia abaixo)');

      if (documentTitle) {
        await saveSignedDocument(documentTitle, userName);
      }

      // Salvar documento assinado no AsyncStorage
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Falha ao assinar PDF');
    }
  }

  /**
   * Gera um novo PDF (usando pdf-lib) com a assinatura
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

      // Apenas um retângulo simples para demarcar a assinatura
      firstPage.drawRectangle({
        x: xPos - 50,
        y: yPos - 20,
        width: 200,
        height: 50,
        borderColor: rgb(1, 0, 0), // borda vermelha
        borderWidth: 2,
        color: rgb(1, 1, 0), // fundo amarelo
      });

      // Texto "Assinado por ..."
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
   * Baixar PDF assinado
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
   * Compartilhar PDF assinado
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

  /**
   * Resetar visual do PDF
   */
  function closePdf() {
    setSelectedPdf(null);
    setSignedPdfUri(null);
    setPdfDimensions({ width: 0, height: 0 });
    setDisplaySize({ width: 0, height: 0 });
    pan.setValue({ x: 50, y: 50 });
  }

  // Indica se já temos PDF selecionado
  const pdfSelected = !!selectedPdf;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Botão "Voltar" de exemplo (pode colocar uma navegação real) */}
          <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
            <ChevronLeft size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assinar Documento</Text>
        </View>
        <View style={styles.headerRight}>
          {pdfSelected && (
            <TouchableOpacity style={styles.closePdfButton} onPress={closePdf}>
              <X size={20} color="#DC2626" />
              <Text style={styles.closePdfText}>Fechar PDF</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Área principal */}
      <View style={styles.mainContent}>
        {/* Se nenhum PDF foi escolhido, mostra a tela de escolha */}
        {!pdfSelected ? (
          <View style={styles.selectContainer}>
            <View style={styles.fileIconContainer}>
              <FileUp size={40} color="#2563EB" />
            </View>
            <Text style={styles.selectTitle}>Selecione um documento PDF</Text>
            <Text style={styles.selectSubtitle}>
              Escolha um arquivo PDF do seu dispositivo para iniciar o processo de assinatura
            </Text>
            <TouchableOpacity style={styles.selectButton} onPress={pickDocument}>
              <FileUp size={20} color="#FFF" />
              <Text style={styles.selectButtonText}>Escolher PDF</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Se já temos PDF selecionado, exibe viewer + toolbar
          <>
            {/* Barra de ferramentas do PDF */}
            <View style={styles.viewerToolbar}>
              <View style={styles.viewerToolbarLeft}>
                {/* Ícones apenas demonstrativos (zoom, etc.) */}
                <TouchableOpacity
                  style={styles.toolbarButton}
                  onPress={() => Alert.alert('Zoom In')}>
                  <ZoomIn size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toolbarButton}
                  onPress={() => Alert.alert('Zoom Out')}>
                  <ZoomOut size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toolbarButton}
                  onPress={() => Alert.alert('Rotacionar')}>
                  <RotateCw size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={() => Alert.alert('Maximizar')}>
                <Maximize2 size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Visualização do PDF */}
            <View style={styles.pdfViewer}>
              {/* Se ainda não foi assinado, mostra PDF com caixa arrastável */}
              {!signedPdfUri && (
                <View
                  style={styles.pdfContainer}
                  onLayout={e => {
                    const { width, height } = e.nativeEvent.layout;
                    setDisplaySize({ width, height });
                  }}>
                  <Pdf
                    key={key}
                    source={{ uri: selectedPdf }}
                    style={{ flex: 1 }}
                    pointerEvents="none"
                    scale={1.0}
                    minScale={1.0}
                    maxScale={1.0}
                    fitPolicy={2}
                    onError={err => console.error('Erro no PDF:', err)}
                  />
                  {/* Caixa arrastável "Assinar Aqui" */}
                  <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                      styles.signatureBox,
                      {
                        transform: [{ translateX: pan.x }, { translateY: pan.y }],
                      },
                    ]}>
                    <Text style={styles.signatureBoxText}>Assinar Aqui</Text>
                  </Animated.View>
                </View>
              )}

              {/* Se já foi assinado, mostra PDF assinado */}
              {signedPdfUri && (
                <View style={styles.pdfContainer}>
                  <Pdf
                    key={key + '-signed'}
                    source={{ uri: signedPdfUri }}
                    style={{ flex: 1 }}
                    pointerEvents="none"
                    onError={err => console.error('Erro no PDF assinado:', err)}
                  />
                </View>
              )}
            </View>

            {/* Ações para assinar ou baixar/compartilhar */}
            {!signedPdfUri && (
              <View style={styles.signatureActions}>
                <TouchableOpacity style={styles.signatureButton} onPress={handlePositionSignature}>
                  <PenTool size={20} color="#FFF" />
                  <Text style={styles.signatureButtonText}>Posicionar Assinatura</Text>
                </TouchableOpacity>
              </View>
            )}

            {signedPdfUri && (
              <View style={styles.signatureActions}>
                <View style={styles.downloadShareActions}>
                  {/* Botão "Baixar Documento" */}
                  <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                    <Text style={styles.downloadButtonText}>Baixar Documento</Text>
                  </TouchableOpacity>
                  {/* Botão "Compartilhar" */}
                  <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>Compartilhar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * Estrutura geral
   */
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },

  /**
   * Cabeçalho (header)
   */
  header: {
    height: 64, // h-16 em Tailwind (~16 * 4 = 64px)
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // px-4
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 8, // space-x-3 (depende do ícone)
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // text-gray-900
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  closePdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2', // red-50
  },
  closePdfText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626', // text-red-600
  },

  /**
   * Conteúdo principal
   */
  mainContent: {
    flex: 1,
    padding: 16, // p-4
    maxWidth: 900, // max-w-5xl (~ 80rem / 2 => adaptado)
    width: '100%',
    alignSelf: 'center', // simulando "mx-auto"
  },

  /**
   * Tela de seleção do PDF
   */
  selectContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 9999, // full
    backgroundColor: '#DBEAFE', // blue-100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  selectTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827', // text-gray-900
    marginBottom: 8,
    textAlign: 'center',
  },
  selectSubtitle: {
    fontSize: 14,
    color: '#6B7280', // text-gray-600
    marginBottom: 16,
    maxWidth: '80%',
    textAlign: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB', // bg-blue-600
  },
  selectButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },

  /**
   * Barra de ferramentas do PDF
   */
  viewerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // border-gray-200
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  viewerToolbarLeft: {
    flexDirection: 'row',
  },
  toolbarButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 4,
    backgroundColor: '#F9FAFB', // hover:bg-gray-100
  },

  /**
   * Área de visualização do PDF
   */
  pdfViewer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  pdfContainer: {
    flex: 1,
    overflow: 'hidden',
  },

  /**
   * Caixa arrastável de assinatura
   */
  signatureBox: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'red',
  },
  signatureBoxText: {
    fontWeight: 'bold',
    color: 'red',
  },

  /**
   * Ações de assinatura (botão "Posicionar assinatura" ou "Baixar"/"Compartilhar")
   */
  signatureActions: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB', // bg-blue-600
  },
  signatureButtonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },

  /**
   * Botões de "Baixar" e "Compartilhar"
   */
  downloadShareActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  downloadButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'green',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  downloadButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'orange',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
