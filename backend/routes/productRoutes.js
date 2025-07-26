const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware'); //  Importa middleware

// Listar produtos (público)
router.get('/', async (req, res) => {
  try {
    const produtos = await Product.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// Criar produto (proteção adicionada)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const novoProduto = new Product(req.body);
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar produto', error: err.message });
  }
});

// Atualizar produto (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const produtoAtualizado = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!produtoAtualizado) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(produtoAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar produto', error: err.message });
  }
});

// Excluir produto (protegido)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const produtoRemovido = await Product.findByIdAndDelete(req.params.id);
    if (!produtoRemovido) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao excluir produto', error: err.message });
  }
});

module.exports = router;
