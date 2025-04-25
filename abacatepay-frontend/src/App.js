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
      console.log("brCodeBase64:", data.brCodeBase64); // <-- adiciona isso aqui
      if (data.brCodeBase64) {
        setQrCode(data.brCodeBase64);
        // alert("Pagamento gerado com sucesso!");
      } else {
        alert("Erro ao gerar pagamento.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Erro ao se comunicar com o servidor.");
    }
  };

  return (
    <div className="App">
      <h1>Pagamento com PIX</h1>
      <div>
        <label>Id do Usuário:</label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>
      <div>
        <label>Valor (R$):</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          min="0.01"
          step="0.01"
        />
      </div>
      <button onClick={handlePagamento}>Pagar com PIX</button>

      {qrCode && (
        <div>
          <h3>Escaneie o QR Code:</h3>
          <img src={qrCode} alt="QR Code PIX" />
        </div>
      )}
    </div>
  );
}
export default App;
