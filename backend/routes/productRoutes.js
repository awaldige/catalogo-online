
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const MAX_LIMIT = 50;
const MAX_SEARCH_LENGTH = 100;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseNumber(value, field, options = {}) {
  const number = Number(value);

  if (
    value === '' ||
    !Number.isFinite(number) ||
    (options.integer && !Number.isInteger(number)) ||
    (options.min !== undefined && number < options.min)
  ) {
    throw new Error(`Valor inválido para ${field}.`);
  }

  return number;
}

function validateProductData(body, isUpdate = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Dados do produto inválidos.');
  }

  const allowedFields = [
    'name',
    'description',
    'price',
    'imageUrl',
    'stock',
    'category'
  ];

  const data = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    throw new Error('Informe os dados do produto.');
  }

  if (!isUpdate && (!data.name || data.price === undefined)) {
    throw new Error('Nome e preço são obrigatórios.');
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('Nome do produto inválido.');
    }

    data.name = data.name.trim();
  }

  if (data.description !== undefined &&
      typeof data.description !== 'string') {
    throw new Error('Descrição inválida.');
  }

  if (data.category !== undefined &&
      typeof data.category !== 'string') {
    throw new Error('Categoria inválida.');
  }

  if (data.imageUrl !== undefined &&
      typeof data.imageUrl !== 'string') {
    throw new Error('Endereço da imagem inválido.');
  }

  if (data.price !== undefined) {
    data.price = parseNumber(data.price, 'preço', { min: 0 });
  }

  if (data.stock !== undefined) {
    data.stock = parseNumber(data.stock, 'estoque', {
      min: 0,
      integer: true
    });
  }

  return data;
}

function validateProductId(id) {
  return mongoose.isObjectIdOrHexString(id);
}

// GET /api/products
// Consulta pública com filtros e paginação.
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minStock
    } = req.query;

    const page = parseNumber(req.query.page ?? 1, 'página', {
      min: 1,
      integer: true
    });

    const limit = parseNumber(req.query.limit ?? 10, 'limite', {
      min: 1,
      integer: true
    });

    if (limit > MAX_LIMIT) {
      return res.status(400).json({
        error: `O limite máximo por página é ${MAX_LIMIT}.`
      });
    }

    if (search !== undefined &&
        (typeof search !== 'string' ||
         search.length > MAX_SEARCH_LENGTH)) {
      return res.status(400).json({
        error: 'Termo de busca inválido.'
      });
    }

    if (category !== undefined && typeof category !== 'string') {
      return res.status(400).json({
        error: 'Categoria inválida.'
      });
    }

    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        'i'
      );

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = parseNumber(minPrice, 'preço mínimo', {
          min: 0
        });
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = parseNumber(maxPrice, 'preço máximo', {
          min: 0
        });
      }

      if (filter.price.$gte !== undefined &&
          filter.price.$lte !== undefined &&
          filter.price.$gte > filter.price.$lte) {
        return res.status(400).json({
          error: 'O preço mínimo não pode superar o preço máximo.'
        });
      }
    }

    if (minStock !== undefined) {
      filter.stock = {
        $gte: parseNumber(minStock, 'estoque mínimo', { min: 0 })
      };
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter)
    ]);

    return res.json({ products, totalCount });
  } catch (error) {
    return res.status(400).json({
      error: error.message || 'Erro ao buscar produtos.'
    });
  }
});

// GET /api/products/:id
// Consulta pública de um produto.
router.get('/:id', async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        error: 'ID de produto inválido.'
      });
    }

    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        error: 'Produto não encontrado.'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error.message);

    return res.status(500).json({
      error: 'Erro ao buscar produto.'
    });
  }
});

// POST /api/products
// Cadastro exclusivo para administradores.
router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = validateProductData(req.body);

    const product = await Product.create(data);

    return res.status(201).json(product);
  } catch (error) {
    console.error('Erro ao criar produto:', error.message);

    return res.status(400).json({
      error: error.message || 'Erro ao criar produto.'
    });
  }
});

// PUT /api/products/:id
// Atualização exclusiva para administradores.
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        error: 'ID de produto inválido.'
      });
    }

    const data = validateProductData(req.body, true);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        error: 'Produto não encontrado.'
      });
    }

    return res.json(product);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error.message);

    return res.status(400).json({
      error: error.message || 'Erro ao atualizar produto.'
    });
  }
});

// DELETE /api/products/:id
// Exclusão exclusiva para administradores.
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!validateProductId(req.params.id)) {
      return res.status(400).json({
        error: 'ID de produto inválido.'
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Produto não encontrado.'
      });
    }

    return res.json({
      message: 'Produto excluído com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao excluir produto:', error.message);

    return res.status(500).json({
      error: 'Erro ao excluir produto.'
    });
  }
});

module.exports = router;
