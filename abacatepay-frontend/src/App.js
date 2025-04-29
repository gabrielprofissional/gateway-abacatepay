import React, { useState } from "react";
import "./App.css";

function App() {
  const [userId, setUserId] = useState("1");
  const [valor, setValor] = useState("10");
  const [qrCode, setQrCode] = useState(null);

  const handlePagamento = async () => {
    const valorNumerico = Number(valor);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, valor: valorNumerico }),
      });

      const data = await res.json();
      if (data.brCodeBase64) {
        setQrCode(data.brCodeBase64);
      } else {
        alert("Erro ao gerar pagamento.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro ao se comunicar com o servidor.");
    }
  };

  return (
    <div className="container">
      <h1>Pagamento PIX</h1>
      <div className="form">
        <label>🧑 ID do Usuário</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <label>💰 Valor (R$)</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          min="0.01"
          step="0.01"
        />

        <button onClick={handlePagamento}>Gerar QR Code</button>
      </div>

      {qrCode && (
        <div className="qr-container">
          <h3>📲 Escaneie para pagar</h3>
          <img src={qrCode} alt="QR Code PIX" />
        </div>
      )}
    </div>
  );
}

export default App;
