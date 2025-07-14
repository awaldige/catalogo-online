const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importa o pacote CORS
require('dotenv').config(); // Carrega as variáveis de ambiente do .env
console.log('🔍 URI carregada do .env:', process.env.MONGODB_URI);

// Importa as rotas
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes'); // Novas rotas de autenticação

const app = express();

// Middleware
// Habilita o CORS para permitir requisições do frontend
app.use(cors());
// Habilita o parsing de JSON no corpo das requisições
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI) // <-- MUDOU AQUI: de MONGO_URI para MONGODB_URI
    .then(() => console.log('MongoDB conectado com sucesso! 🎉'))
    .catch(err => console.error('Erro de conexão ao MongoDB: 🔴', err));

// Rotas da API
app.use('/api/products', productRoutes); // Suas rotas de produtos existentes
app.use('/api/auth', authRoutes);       // Novas rotas de autenticação

// Rota de teste (opcional)
app.get('/', (req, res) => {
    res.send('API de E-commerce está rodando... 🛍️');
});

const PORT = process.env.PORT || 3000; // Define a porta, usando 3000 como padrão
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});