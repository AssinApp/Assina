import React, { useState } from "react";

import { generateCertificate } from "../services/certificateService";

const SignatureButton = ({ token, userId, username, onSign }) => {
    const [loading, setLoading] = useState(false);
    const [certificate, setCertificate] = useState(null);

    const handleGenerateCertificate = async () => {
        setLoading(true);

        try {
            const certData = await generateCertificate(token, userId, username);
            if (certData) {
                setCertificate(certData); // Armazena o certificado para uso posterior
                console.log("Certificado salvo:", certData);
            } else {
                alert("Erro ao gerar certificado.");
            }
        } catch (error) {
            console.error("Erro ao gerar certificado:", error);
        }

        setLoading(false);
    };

    return (
        <div>
            <button onClick={handleGenerateCertificate} disabled={loading}>
                {loading ? "Gerando Certificado..." : "Gerar Certificado"}
            </button>
            {certificate && (
                <button onClick={() => onSign(certificate)}>
                    Assinar Documento
                </button>
            )}
        </div>
    );
};

export default SignatureButton;
