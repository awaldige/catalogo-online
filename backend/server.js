const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('🔍 URI carregada do .env:', process.env.MONGODB_URI);

// Importa as rotas (ajustado corretamente)
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado com sucesso! 🎉'))
    .catch(err => console.error('Erro de conexão ao MongoDB: 🔴', err));

// Rotas
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de E-commerce está rodando... 🛍️');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
