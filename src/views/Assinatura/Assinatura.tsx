import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

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
import { Buffer } from 'buffer'; // Import necessário para conversão
import Pdf from 'react-native-pdf';
import { Platform } from 'react-native';
import { decodeJwtToken } from '../../services/certificateService'; // Importando corretamente
import { generateCertificate } from '../../services/certificateService';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from '@react-navigation/native';

//import { API_BASE_URL } from '@env';
//import { API_SIGNATURE_BASE_URL } from '@env';

interface AssinaturaProps {
  route?: {
    params?: {
      userName?: string;
    };
  };
}

export default function Assinatura({ route }: AssinaturaProps) {
  const API_SIGNATURE_BASE_URL = 'https://fcte.john.pro.br/unb-sign-api';

  const API_BASE_URL = 'https://assinapp.com.br';

  const [scale, setScale] = useState(1.0); // Estado para zoom
  const [rotation, setRotation] = useState(0); // Estado para rotação

  const getUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const userName = await AsyncStorage.getItem('user_name');

      if (!userId || !userName) {
        console.warn('⚠️ ID ou Nome do usuário não encontrados no AsyncStorage.');
        return null;
      }

      console.log(`👤 Usuário encontrado no AsyncStorage: ID=${userId}, Nome=${userName}`);
      return { id: userId, cn: userName };
    } catch (error) {
      console.error('❌ Erro ao obter informações do usuário:', error);
      return null;
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.warn('❌ Nenhum token encontrado.');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error('❌ Erro ao buscar usuário:', await response.text());
        return null;
      }

      const data = await response.json();
      console.log(`✅ Usuário encontrado na API: ID=${data.id}, Nome=${data.name}`);

      return { id: data.id, cn: data.name }; // Retorna ID e nome
    } catch (error) {
      console.error('❌ Erro ao obter informações do usuário:', error);
      return null;
    }
  };

  const [certificate, setCertificate] = useState(null);
  const handleGenerateCertificate = async () => {
    try {
      const userInfo = await fetchUserInfo();
      if (!userInfo) {
        console.error('❌ Não foi possível obter o ID do usuário.');
        return;
      }

      console.log('📜 Gerando certificado para:', userInfo);
      const certData = await generateCertificate(userInfo); // 🔥 Corrigido aqui

      if (certData) {
        console.log('✅ Certificado gerado:', certData);
        setCertificate(certData);
      } else {
        Alert.alert('Erro', 'Falha ao gerar certificado.');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar certificado:', error);
      Alert.alert('Erro', 'Falha ao gerar certificado.');
    }
  };

  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };
  // Nome do usuário
  const userName = route?.params?.userName ?? 'Usuário';

  // PDF original e PDF assinado
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [signedPdfUri, setSignedPdfUri] = useState<string | null>(null);

  // página PDF
  const [currentPage, setCurrentPage] = useState(1); // Estado para a página atual
  const [totalPages, setTotalPages] = useState(1); // Estado para armazenar o total de páginas

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
  const saveSignedDocument = async (title, status) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        console.error('❌ ID do usuário não encontrado.');
        return;
      }

      const existingDocs = await AsyncStorage.getItem(`signedDocuments_${userId}`);
      const documents = existingDocs ? JSON.parse(existingDocs) : [];

      // ✅ Evita adicionar mais de um "pending" antes de assinar
      if (status === 'pending') {
        const alreadyPending = documents.some(
          doc => doc.title === title && doc.status === 'pending',
        );
        if (alreadyPending) {
          console.warn(`⚠️ Documento '${title}' já está como 'pending'. Ignorando duplicação.`);
          return;
        }
      }

      // ✅ Evita adicionar mais de um "signed"
      if (status === 'signed') {
        const alreadySigned = documents.some(doc => doc.title === title && doc.status === 'signed');
        if (alreadySigned) {
          console.warn(`⚠️ Documento '${title}' já está como 'signed'. Ignorando duplicação.`);
          return;
        }
      }

      const newDocument = {
        title,
        status,
        date: new Date().toLocaleDateString(),
      };

      const updatedDocs = [newDocument, ...documents];
      await AsyncStorage.setItem(`signedDocuments_${userId}`, JSON.stringify(updatedDocs));

      console.log('✅ Documento salvo corretamente:', newDocument);
    } catch (error) {
      console.error('❌ Erro ao salvar documento assinado:', error);
    }
  };

  const fetchToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        console.error('❌ Erro ao buscar token:', await response.text());
        return null;
      }

      const data = await response.json();
      const token = data.access_token;

      if (token) {
        console.log('✅ Novo token obtido:', token);
        return token;
      } else {
        console.error('❌ Nenhum token retornado pela API.');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao obter token:', error.message);
      return null;
    }
  };

  async function refreshToken() {
    try {
      let token = await AsyncStorage.getItem('token'); // Pega o token atual

      if (!token) {
        console.error('❌ Nenhum token armazenado para renovar.');
        return null;
      }

      console.log('🔄 Tentando renovar token...');

      const refreshResponse = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/json',
        },
      });

      if (!refreshResponse.ok) {
        console.error('❌ Erro ao renovar token:', await refreshResponse.text());
        return null;
      }

      const refreshData = await refreshResponse.json();

      if (refreshData.access_token) {
        await AsyncStorage.setItem('token', refreshData.access_token);
        console.log('✅ Token renovado com sucesso:', refreshData.access_token);
        return refreshData.access_token;
      } else {
        console.error('❌ Erro: Token não retornado pela API.');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao tentar renovar token:', error);
      return null;
    }
  }

  async function sendPdfToSign(selectedPdf, pdfX, pdfY, pageNumber) {
    if (!selectedPdf) {
      Alert.alert('Erro', 'Selecione um arquivo primeiro!');
      return;
    }

    try {
      console.log('📌 [1/6] Pegando token do usuário...');
      let token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Erro', 'Nenhum token encontrado. Faça login novamente.');
        return;
      }

      // Buscar ID e Nome do usuário
      let userInfo = await fetchUserInfo();
      if (!userInfo) {
        console.error('❌ [ERRO] ID ou Nome do usuário não encontrados.');
        return;
      }

      console.log(`🔑 [2/6] ID do usuário: ${userInfo.id}, Nome: ${userInfo.cn}`);

      // 🔥 **Garantir que o certificado está gerado antes de continuar**
      console.log('📜 [3/6] Gerando certificado antes da assinatura...');
      await handleGenerateCertificate();

      // Criar FormData para envio do PDF com coordenadas dinâmicas
      const formData = new FormData();
      formData.append('file', {
        uri: selectedPdf,
        name: 'document.pdf',
        type: 'application/pdf',
      });
      formData.append('posX', pdfX.toString()); // Enviar as coordenadas de X
      formData.append('posY', pdfY.toString()); // Enviar as coordenadas de Y
      formData.append('pageNumber', pageNumber.toString()); // 🔥 Inclui a página corretamente
      formData.append('pageNumber', '1');
      formData.append('userId', userInfo.id);

      console.log(`📤 [4/6] Enviando PDF para API de assinatura (Página ${pageNumber})...`);

      const response = await fetch(`${API_SIGNATURE_BASE_URL}/api/pdf/signature`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        console.error('❌ [ERRO] Falha ao assinar o PDF:', await response.text());
        Alert.alert('Erro', 'Falha ao assinar documento.');
        return;
      }

      console.log('✅ [5/6] PDF assinado com sucesso!');

      // **Agora só salva se for assinado corretamente**
      await saveSignedDocument(documentTitle, 'signed');

      // Convertendo a resposta binária para base64
      const pdfBlob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);

      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; // Pega apenas a parte base64

        // Criando o caminho para salvar o PDF assinado
        const signedPdfPath = FileSystem.documentDirectory + `pdf_assinado_${Date.now()}.pdf`;

        try {
          await FileSystem.writeAsStringAsync(signedPdfPath, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log('✅ [6/6] PDF assinado salvo:', signedPdfPath);

          // Atualiza o estado para exibir o PDF salvo
          setSignedPdfUri(signedPdfPath);
          Alert.alert('Sucesso', 'PDF assinado e salvo!');

          // **Salvar no AsyncStorage**
          if (documentTitle) {
            await saveSignedDocument(documentTitle, userInfo.cn);
          }
        } catch (saveError) {
          console.error('❌ Erro ao salvar PDF assinado:', saveError);
          Alert.alert('Erro', 'Falha ao salvar o documento assinado.');
        }
      };
    } catch (error) {
      console.error('❌ [ERRO] Exceção ao assinar PDF:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o documento.');
    }
  }

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

    // Converte para coordenadas no PDF (inverte Y)
    const pdfX = pdfDimensions.width * fracX;
    const pdfY = pdfDimensions.height * (1 - fracY);

    console.log(`📍 Coordenadas de assinatura (PDF): X=${pdfX}, Y=${pdfY}, Página=${currentPage}`);

    try {
      const newPdfUri = await signPdf(
        selectedPdf,
        pdfX,
        pdfY,
        `Assinado por: ${userName}`,
        currentPage,
      );
      setSignedPdfUri(newPdfUri);
      Alert.alert('Sucesso', `PDF assinado na página ${currentPage}! (Veja a prévia abaixo)`);

      if (documentTitle) {
        await saveSignedDocument(documentTitle, 'signed'); // Salva no AsyncStorage
      }

      // Agora, envia as coordenadas e a página para a API de assinatura
      await sendPdfToSign(selectedPdf, pdfX, pdfY, currentPage);
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
      console.log(`📌 Iniciando assinatura no PDF: ${pdfUri}`);

      // ⬇️ Ler o PDF diretamente do URI sem conversão para Base64
      const response = await fetch(pdfUri);
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const firstPage = pdfDoc.getPages()[0];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Desenhar um retângulo ao redor da assinatura
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

      // ⬇️ Salvar PDF como bytes
      const modifiedPdfBytes = await pdfDoc.save();

      // ⚠️ **Conversão correta para Base64**
      const base64Pdf = Buffer.from(modifiedPdfBytes).toString('base64');

      // Criar um novo caminho para salvar o PDF assinado
      const newPdfUri = FileSystem.documentDirectory + `pdf-assinado-${Date.now()}.pdf`;

      // Escrever no sistema de arquivos
      await FileSystem.writeAsStringAsync(newPdfUri, base64Pdf, {
        encoding: FileSystem.EncodingType.Base64, // Certificar que está salvando corretamente
      });

      console.log(`✅ PDF assinado salvo em: ${newPdfUri}`);

      return newPdfUri;
    } catch (error) {
      console.error('❌ Erro ao assinar PDF:', error);
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
      if (Platform.OS === 'android') {
        // Solicita permissão para acessar o diretório
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          Alert.alert(
            'Permissão necessária',
            'Você precisa permitir o acesso ao armazenamento para salvar o arquivo.',
          );
          return;
        }

        // Gera um nome único para o arquivo PDF assinado
        const fileName = `pdf_assinado_${Date.now()}.pdf`;

        // Converte o PDF assinado para base64
        const pdfBase64 = await FileSystem.readAsStringAsync(signedPdfUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Cria o arquivo no diretório escolhido pelo usuário
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri, // Diretório escolhido pelo usuário
          fileName,
          'application/pdf',
        );

        // Escreve o PDF no arquivo criado
        await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('Sucesso!', `Arquivo salvo com sucesso!\n\nCaminho: ${fileUri}`);
      } else {
        // Para iOS, salva no diretório padrão
        const fileUri = FileSystem.documentDirectory + `pdf_assinado_${Date.now()}.pdf`;
        await FileSystem.copyAsync({ from: signedPdfUri, to: fileUri });

        Alert.alert('Sucesso!', `Arquivo salvo em:\n${fileUri}`);
      }
    } catch (error) {
      console.error('❌ Erro ao baixar PDF:', error);
      Alert.alert('Erro', 'Falha ao salvar arquivo.');
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
            {signedPdfUri && (
              <View style={styles.viewerToolbar}>
                <View style={styles.viewerToolbarLeft}>
                  {/* Botão Zoom In */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => setScale(prev => Math.min(prev + 0.2, 3.0))} // Zoom até 3x
                  >
                    <ZoomIn size={20} color="#6B7280" />
                  </TouchableOpacity>

                  {/* Botão Zoom Out */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => setScale(prev => Math.max(prev - 0.2, 0.5))} // Zoom mínimo de 0.5x
                  >
                    <ZoomOut size={20} color="#6B7280" />
                  </TouchableOpacity>

                  {/* Botão Rotacionar */}
                  <TouchableOpacity
                    style={styles.toolbarButton}
                    onPress={() => setRotation(prev => (prev + 90) % 360)} // Rotaciona 90° por vez
                  >
                    <RotateCw size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Botão Maximizar */}
                <TouchableOpacity
                  style={styles.toolbarButton}
                  onPress={() => setScale(1.0)} // Reseta zoom ao normal
                >
                  <Maximize2 size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            )}

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
                    onPageChanged={(page, count) => {
                      setCurrentPage(page);
                      setTotalPages(count);
                      console.log(`📄 Página atual: ${page} / ${count}`);
                    }}
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
                    key={key}
                    source={{ uri: selectedPdf }}
                    style={{
                      flex: 1,
                      transform: [{ scale }, { rotate: `${rotation}deg` }], // Aplica zoom e rotação
                    }}
                    onError={error => console.error('Erro no PDF:', error)}
                  />
                </View>
              )}
            </View>

            {/* Ações para assinar ou baixar/compartilhar */}
            {!signedPdfUri && (
              <View style={styles.signatureActions}>
                <TouchableOpacity
                  style={styles.signatureButton}
                  onPress={handlePositionSignature} // Alteração aqui, chama a função que trata a posição
                >
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
                  {/*
                  <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>Compartilhar</Text>
                  </TouchableOpacity>
                  */}
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
