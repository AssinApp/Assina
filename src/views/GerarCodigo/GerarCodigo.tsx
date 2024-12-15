import * as Clipboard from 'expo-clipboard';

import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

// URL base para requisições
const baseURL = ' https://b0ec-179-214-114-118.ngrok-free.app';
console.log('Base URL:', baseURL);

const GerarCodigo = ({ route }: any) => {
  const email = route?.params?.email || 'user@example.com'; // Email padrão
  const [otp, setOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(new Animated.Value(1));

  // Função para buscar o código OTP
  const fetchOtp = async () => {
    try {
      setLoading(true);
      console.log('Fetching OTP from:', `${baseURL}/otp/${email}`);

      // Requisição ao backend com cabeçalhos adicionais
      const response = await axios.get(`${baseURL}/otp/${email}`, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ExpoApp', // Adiciona um cabeçalho User-Agent
        },
      });
      console.log('API Response:', response.data);

      // Atualiza o estado com o OTP retornado
      if (response.data?.otp && response.data?.expires_in) {
        setOtp(response.data.otp);
        resetProgress(response.data.expires_in); // Reseta a barra de progresso
      } else {
        throw new Error('Resposta inválida da API.');
      }
    } catch (error) {
      console.error('Erro ao buscar o código OTP:', error);
      ToastAndroid.show('Erro ao buscar o código OTP! Verifique sua conexão.', ToastAndroid.SHORT);
      setOtp('Erro');
    } finally {
      setLoading(false);
    }
  };

  // Função para testar conectividade com `fetch`
  const testNgrok = async () => {
    try {
      console.log('Testando conexão com fetch...');
      const response = await fetch(`${baseURL}/otp/${email}`);
      const data = await response.json();
      console.log('Response from fetch:', data);
    } catch (error) {
      console.error('Erro no teste de conexão com fetch:', error);
    }
  };

  // Função para resetar a barra de progresso
  const resetProgress = (duration: number) => {
    progress.setValue(1); // Reseta o progresso para 100%
    Animated.timing(progress, {
      toValue: 0,
      duration: duration * 1000, // Duração baseada em expires_in
      useNativeDriver: false,
    }).start();
  };

  // Efeito para buscar o código inicialmente e atualizar a cada 30 segundos
  useEffect(() => {
    fetchOtp(); // Busca o código inicial
    testNgrok(); // Testa a conectividade com `fetch`
    const interval = setInterval(fetchOtp, 30000); // Atualiza o código a cada 30 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [email]);

  // Função para copiar o código para a área de transferência
  const copyToClipboard = () => {
    if (otp) {
      Clipboard.setStringAsync(otp);
      ToastAndroid.show('Código copiado para a área de transferência!', ToastAndroid.SHORT);
    }
  };

  // Calcula a largura da barra de progresso
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Renderização do componente
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Autenticação de Dois Fatores</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4caf50" />
      ) : (
        <View style={styles.codeBox}>
          <Text style={styles.code}>{otp || 'Carregando...'}</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Text style={styles.copyText}>Copiar</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
      <Text style={styles.timer}>Novo código será gerado em 30 segundos</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  copyButton: {
    padding: 5,
  },
  copyText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: 20,
    height: 10,
    width: '80%',
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  timer: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default GerarCodigo;
