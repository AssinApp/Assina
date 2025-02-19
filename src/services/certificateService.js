import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_SIGNATURE_BASE_URL = "https://fcte.john.pro.br/unb-sign-api";

/**
 * Busca diretamente da API os dados do usuário
 */
const fetchUserFromAPI = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado.");
      return null;
    }

    const response = await fetch(`${API_SIGNATURE_BASE_URL}/api/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("❌ Erro ao buscar usuário na API:", await response.text());
      return null;
    }

    const userData = await response.json();
    console.log(`✅ Usuário encontrado na API: ID=${userData.id}, Nome=${userData.name}`);

    // Atualiza os dados no AsyncStorage para uso futuro
    await AsyncStorage.setItem("user_id", userData.id.toString());
    await AsyncStorage.setItem("user_name", userData.name);

    return { id: userData.id, cn: userData.name };
  } catch (error) {
    console.error("❌ Erro ao obter informações do usuário:", error);
    return null;
  }
};

/**
 * Obtém o ID e Nome do usuário do AsyncStorage, buscando da API se necessário
 */
export const fetchUserInfo = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.warn("❌ Nenhum token encontrado.");
      return null;
    }

    let userId = await AsyncStorage.getItem("user_id");
    let userName = await AsyncStorage.getItem("user_name");

    if (userId && userName) {
      console.log(`✅ [CACHE] Usuário encontrado no AsyncStorage: ID=${userId}, Nome=${userName}`);
      return { id: userId, cn: userName };
    }

    console.log("📌 [INFO] Cache vazio. Buscando usuário na API...");
    return await fetchUserFromAPI(); // Faz a chamada à API se os dados estiverem ausentes
  } catch (error) {
    console.error("❌ Erro ao obter informações do usuário:", error);
    return null;
  }
};

/**
 * Gera um certificado autoassinado, garantindo que ID e Nome do usuário sejam válidos
 */
export const generateCertificate = async (userInfo = null) => {
  try {
    let token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token armazenado.");
      return null;
    }

    // Garante que sempre tenhamos userInfo correto
    if (!userInfo) {
      console.log("📌 [INFO] Buscando informações do usuário antes de gerar o certificado...");
      userInfo = await fetchUserInfo();
      if (!userInfo) {
        console.error("❌ [ERRO] Não foi possível obter ID e Nome do usuário.");
        return null;
      }
    }

    console.log(`📜 Enviando requisição para gerar certificado com ID=${userInfo.id}, Nome=${userInfo.cn}`);

    const requestBody = {
      id: userInfo.id,
      cn: userInfo.cn,
    };

    const response = await axios.post(
      `${API_SIGNATURE_BASE_URL}/api/certificates/generate-self-signed`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Certificado gerado com sucesso:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao gerar certificado:", error.response?.data || error.message);
    return null;
  }
};
