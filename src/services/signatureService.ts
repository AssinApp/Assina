import * as DocumentPicker from 'expo-document-picker';

import { API_SIGNATURE_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Usando a API de assinatura

export const uploadAndSignPDF = async () => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
        console.log("❌ Nenhum token JWT encontrado. Usuário não autenticado.");
        return { success: false, message: "Usuário não autenticado" };
    }

    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });

    if (result.type === "cancel") {
        console.log("⚠️ Seleção de arquivo cancelada pelo usuário.");
        return { success: false, message: "Nenhum arquivo selecionado" };
    }

    console.log(`📄 Arquivo Selecionado: ${result.name}, URI: ${result.uri}`);

    const formData = new FormData();
    formData.append("file", { uri: result.uri, name: result.name, type: "application/pdf" });
    formData.append("posX", "100.0");
    formData.append("posY", "200.0");
    formData.append("pageNumber", "1");

    try {
        console.log("📤 Enviando PDF para API de assinatura...");

        const response = await axios.post(`${API_SIGNATURE_BASE_URL}/api/signature`, formData, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("✅ PDF assinado com sucesso! Resposta da API:", response.data);
        return { success: true, message: "Arquivo assinado com sucesso!", filePath: response.data.filePath };
    } catch (error) {
        console.error("❌ Erro ao assinar PDF:", error.response?.data || error.message);
        return { success: false, message: "Erro ao assinar documento" };
    }
};
