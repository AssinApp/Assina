import { API_SIGNATURE_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Decodifica um JWT para extrair informações do payload.
 */
export const decodeJwtToken = (token) => {
    try {
      const base64Url = token.split(".")[1]; // Pegamos apenas o payload
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedData = JSON.parse(atob(base64)); // Converte de Base64 para JSON
  
      console.log("🔍 Payload do token decodificado:", decodedData);
  
      // Verificar qual chave contém o ID do usuário
      const userId =
        decodedData.id || decodedData.user_id || decodedData.uid || decodedData.sub;
      if (!userId) {
        console.error("❌ Erro: ID do usuário não encontrado no token. Payload:", decodedData);
        return null;
      }
  
      // Se não houver nome, tenta inferir a partir do campo 'sub' (supondo que seja um email)
      if (!decodedData.name && decodedData.sub && decodedData.sub.includes("@")) {
        const inferredName = decodedData.sub.split("@")[0];
        decodedData.name = inferredName.charAt(0).toUpperCase() + inferredName.slice(1);
      }
  
      return { ...decodedData, id: userId }; // Retorna com o ID padronizado
    } catch (error) {
      console.error("❌ Erro ao decodificar token JWT:", error);
      return null;
    }
  };


/**
 * Obtém o token do AsyncStorage ou solicita um novo via API.
 */
export const fetchToken = async (username, password) => {
    try {
      const formBody = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  
      const response = await fetch(`${API_SIGNATURE_BASE_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formBody,
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("❌ Erro ao buscar token:", errorMessage);
        return null;
      }
  
      const data = await response.json();
      const token = data.access_token;
  
      if (token) {
        console.log("✅ Novo token obtido:", token);
  
        // Salva o token no AsyncStorage
        await AsyncStorage.setItem("token", token);
  
        // Decodifica o token para obter ID e (se disponível) nome do usuário
        const decoded = decodeJwtToken(token);
        if (decoded && decoded.id) {
          console.log(`🔑 ID do usuário extraído do token: ${decoded.id}`);
          await AsyncStorage.setItem("user_id", decoded.id.toString());
          // Armazena o nome somente se estiver disponível
          if (decoded.name) {
            await AsyncStorage.setItem("user_name", decoded.name);
          }
        }
  
        return token;
      } else {
        console.error("❌ Nenhum token retornado pela API.");
        return null;
      }
    } catch (error) {
      console.error("❌ Erro ao obter token:", error.message);
      return null;
    }
};

/**
 * Obtém o ID e Nome do usuário do AsyncStorage
 */
export const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
  
      if (!token) {
        console.warn("❌ Nenhum token encontrado.");
        return null;
      }
  
      // Verifica se já há informações armazenadas no AsyncStorage
      const userId = await AsyncStorage.getItem("user_id");
      const userName = await AsyncStorage.getItem("user_name");
  
      if (userId && userName) {
        console.log(`✅ [CACHE] Usuário encontrado no AsyncStorage: ID=${userId}, Nome=${userName}`);
        return { id: userId, cn: userName };
      }
  
      console.log("📌 Buscando informações do usuário na API...");
  
      // Atenção: URL corrigida para incluir '/api' conforme os endpoints utilizados
      const response = await fetch(`${API_SIGNATURE_BASE_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
  
      if (!response.ok) {
        console.error("❌ Erro ao buscar usuário na API:", await response.text());
        return null;
      }
  
      const data = await response.json();
      console.log(`✅ Usuário encontrado na API: ID=${data.id}, Nome=${data.name}`);
  
      // Armazena as informações para futuras chamadas
      await AsyncStorage.setItem("user_id", data.id.toString());
      await AsyncStorage.setItem("user_name", data.name);
  
      return { id: data.id, cn: data.name };
    } catch (error) {
      console.error("❌ Erro ao obter informações do usuário:", error);
  
      // **FALLBACK:** Tenta usar os dados armazenados
      const userId = await AsyncStorage.getItem("user_id");
      const userName = await AsyncStorage.getItem("user_name");
  
      if (userId && userName) {
        console.warn("⚠️ [FALLBACK] Usando dados armazenados no AsyncStorage.");
        return { id: userId, cn: userName };
      }
  
      return null;
    }
  };

/**
 * Gera um certificado autoassinado
 */
export const generateCertificate = async (userInfo = null) => {
    try {
        let token = await AsyncStorage.getItem("token");

        if (!token) {
            console.error("❌ Nenhum token armazenado.");
            return null;
        }

        // Se já temos userInfo, evitamos chamar a API novamente
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

