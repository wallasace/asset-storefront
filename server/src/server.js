const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes'); // <--- ADICIONADO

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir imagens da pasta uploads de forma estática (para exibir as thumbnails)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Rota de Teste
app.get('/', (req, res) => {
  return res.json({ message: 'API do Digital Asset Storefront rodando com sucesso!' });
});

// Rotas da Aplicação
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes); // <--- ADICIONADO

app.listen(PORT, () => {
  console.log(`Servidor executando em http://localhost:${PORT}`);
});