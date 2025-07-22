require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado com sucesso! 🎉'))
  .catch(err => {
    console.error('Erro de conexão ao MongoDB:', err);
    process.exit(1);
  });

app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('API de Catálogo rodando...');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});
