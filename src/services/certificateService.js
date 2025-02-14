import { API_SIGNATURE_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

/**
 * Obtém o token do AsyncStorage ou solicita um novo via API.
 */
const fetchToken = async (username, password) => {
    try {
        const formBody = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        const response = await fetch(`${API_BASE_URL}/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: formBody, // Enviando no formato correto
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
const fetchUserInfo = async () => {
    try {
        const token = await AsyncStorage.getItem("token"); // Pegando o token do AsyncStorage

        if (!token) {
            console.warn("❌ Nenhum token encontrado.");
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            console.error("❌ Erro ao buscar usuário:", await response.text());
            return null;
        }

        const data = await response.json();
        console.log(`👤 Usuário encontrado: ID=${data.id}, Nome=${data.name}`);

        return { id: data.id, cn: data.name }; // Retorna os dados do usuário
    } catch (error) {
        console.error("❌ Erro ao obter informações do usuário:", error.message);
        return null;
    }
};
/**
 * Gera um certificado autoassinado
 */
export const generateCertificate = async (userName) => {
    try {
        let token = await AsyncStorage.getItem("token"); // 🔥 Pegando token do AsyncStorage

        if (!token) {
            console.error("❌ Nenhum token armazenado. Faça login novamente.");
            return null;
        }

        const requestBody = {
            id: "999",  // 🔹 Qualquer ID fixo
            cn: userName,  // 🔹 Nome que veio da HomeAuth via `route.params.userName`
        };

        console.log("📜 Enviando requisição para gerar certificado...");

        const response = await axios.post(`${API_SIGNATURE_BASE_URL}/api/certificates/generate-self-signed`, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("✅ Certificado gerado com sucesso:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Erro ao gerar certificado:", error.response?.data || error.message);
        return null;
    }
};

