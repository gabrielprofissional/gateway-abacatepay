const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com banco de dados
async function connectDb() {
  return await mysql.createConnection(process.env.DATABASE_URL);
}

// Criar pagamento Pix
app.post("/criar-pagamento", async (req, res) => {
  try {
    const { userId, valor } = req.body;

    if (!userId || !valor) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const amountInCents = Number(valor) * 100;

    const response = await axios.post(
      "https://api.abacatepay.com/v1/pixQrCode/create",
      {
        amount: amountInCents,
        expiresIn: 600,
        description: "Pagamento PIX com AbacatePay",
        customer: {
          name: "Usuário Octabet",
          cellphone: "(11) 99999-9999",
          email: "usuario@octabet.com",
          taxId: "123.456.789-00",
        },
      },
      {
        headers: {
          Authorization: "Bearer abc_dev_MSsj6Q345Rkby4DUQXWKrYhb",
          "Content-Type": "application/json",
        },
      }
    );

    const { brCode, brCodeBase64 } = response.data.data;

    return res.json({
      brCode,
      brCodeBase64, // já está no formato correto
    });
  } catch (error) {
    console.error(
      "Erro ao criar pagamento:",
      error?.response?.data || error.message
    );
    return res.status(500).json({ error: "Erro interno ao gerar o pagamento" });
  }
});

// Webhook de confirmação (modo DEV)
app.post("/webhook", async (req, res) => {
  try {
    const { status, userId, valor } = req.body;

    if (!status || !userId || !valor) {
      return res.status(400).json({ error: "Dados incompletos no webhook" });
    }

    if (status === "PAID") {
      const db = await connectDb();
      await db.query(
        "UPDATE wallets SET balance = balance + ? WHERE user_id = ?",
        [valor, userId]
      );
      console.log(`Saldo atualizado para o usuário ${userId} com R$ ${valor}`);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(500).send("Erro no webhook");
  }
});

// Start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
