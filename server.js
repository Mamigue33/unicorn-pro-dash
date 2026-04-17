const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Configuração guardada (memória)
let vpnConfig = {
    servers: [],
    status: "offline"
};

// 📌 ROTA PRINCIPAL (SITE)
app.get("/", (req, res) => {
    res.send("AURAVP ONLINE");
});

// 📥 PAINEL ENVIA CONFIGURAÇÕES
app.post("/update", (req, res) => {
    vpnConfig = req.body;
    console.log("Nova config recebida:", vpnConfig);
    res.json({ message: "Configuração atualizada com sucesso" });
});

// 📤 APP VPN BUSCA CONFIGURAÇÕES
app.get("/config", (req, res) => {
    res.json(vpnConfig);
});

// 🔄 STATUS ONLINE
app.get("/status", (req, res) => {
    res.json({ status: vpnConfig.status });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});
