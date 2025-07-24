const express = require('express');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/products
// Suporta paginação e filtros: page, limit, category, search, minPrice, maxPrice, minStock
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const filter = {};

    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.minPrice) {
      filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };
    }
    if (req.query.minStock) {
      filter.stock = { $gte: Number(req.query.minStock) };
    }

    const totalCount = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      products,
      currentPage: page,
      totalPages,
      totalCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(prod);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

// POST /api/products  (criação) — protegido
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, imageUrl, stock, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }

    const newProduct = new Product({ name, description, price, imageUrl, stock, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
});

// PUT /api/products/:id (edição) — protegido
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, imageUrl, stock, category } = req.body;

    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: 'Produto não encontrado' });

    prod.name = name ?? prod.name;
    prod.description = description ?? prod.description;
    prod.price = price ?? prod.price;
    prod.imageUrl = imageUrl ?? prod.imageUrl;
    prod.stock = stock ?? prod.stock;
    prod.category = category ?? prod.category;

    await prod.save();
    res.json(prod);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
});

// DELETE /api/products/:id — protegido
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: 'Produto não encontrado' });

    await prod.deleteOne();
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover produto' });
  }
});

module.exports = router;

