
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const MAX_LIMIT = 50;
const MAX_SEARCH_LENGTH = 100;

const ALLOWED_CATEGORIES = [
  'Feminino',
  'Masculino',
  'Infantil',
  'Beleza',
  'Jeans',
  'Calçados',
  'Esportivo',
  'Moda Praia',
  'Moda Íntima'
];

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

// Protege expressões regulares contra caracteres especiais.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Converte e valida valores numéricos.
function parseNumber(value, field, options = {}) {
  const number = Number(value);

  if (
    value === '' ||
    value === null ||
    value === undefined ||
    !Number.isFinite(number) ||
    (options.integer && !Number.isInteger(number)) ||
    (options.min !== undefined && number < options.min)
  ) {
    throw new Error(`Valor inválido para ${field}.`);
  }

  return number;
}

// Valida os dados enviados para cadastro e atualização.
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

  // Nome
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('Nome do produto inválido.');
    }

    data.name = data.name.trim();

    if (data.name.length > 200) {
      throw new Error(
        'O nome do produto deve ter no máximo 200 caracteres.'
      );
    }
  }

  // Descrição
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      throw new Error('Descrição inválida.');
    }

    data.description = data.description.trim();

    if (data.description.length > 5000) {
      throw new Error(
        'A descrição deve ter no máximo 5000 caracteres.'
      );
    }
  }

  // Categoria
  if (data.category !== undefined) {
    if (
      typeof data.category !== 'string' ||
      !ALLOWED_CATEGORIES.includes(data.category)
    ) {
      throw new Error('Categoria inválida.');
    }
  }

  // Imagem
  if (data.imageUrl !== undefined) {
    if (typeof data.imageUrl !== 'string') {
      throw new Error('Endereço da imagem inválido.');
    }

    data.imageUrl = data.imageUrl.trim();

    if (data.imageUrl.length > 2048) {
      throw new Error('O endereço da imagem é muito longo.');
    }
  }

  // Preço
  if (data.price !== undefined) {
    data.price = parseNumber(data.price, 'preço', {
      min: 0
    });
  }

  // Estoque
  if (data.stock !== undefined) {
    data.stock = parseNumber(data.stock, 'estoque', {
      min: 0,
      integer: true
    });
  }

  return data;
}

// Valida identificadores MongoDB.
function validateProductId(id) {
  return mongoose.isObjectIdOrHexString(id);
}

// ======================================================
// GET /api/products
// Consulta pública com filtros e paginação.
// ======================================================

router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minStock
    } = req.query;

    const page = parseNumber(
      req.query.page ?? 1,
      'página',
      {
        min: 1,
        integer: true
      }
    );

    const limit = parseNumber(
      req.query.limit ?? 10,
      'limite',
      {
        min: 1,
        integer: true
      }
    );

    if (limit > MAX_LIMIT) {
      return res.status(400).json({
        error: `O limite máximo por página é ${MAX_LIMIT}.`
      });
    }

    // Validação da busca.
    if (
      search !== undefined &&
      (
        typeof search !== 'string' ||
        search.length > MAX_SEARCH_LENGTH
      )
    ) {
      return res.status(400).json({
        error: 'Termo de busca inválido.'
      });
    }

    // Validação da categoria.
    if (
      category !== undefined &&
      (
        typeof category !== 'string' ||
        (category !== 'all' && !ALLOWED_CATEGORIES.includes(category))
      )
    ) {
      return res.status(400).json({
        error: 'Categoria inválida.'
      });
    }

    const filter = {};

    // Filtro por categoria.
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Filtro por nome ou descrição.
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

    // Filtro por faixa de preço.
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = parseNumber(
          minPrice,
          'preço mínimo',
          { min: 0 }
        );
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = parseNumber(
          maxPrice,
          'preço máximo',
          { min: 0 }
        );
      }

      if (
        filter.price.$gte !== undefined &&
        filter.price.$lte !== undefined &&
        filter.price.$gte > filter.price.$lte
      ) {
        return res.status(400).json({
          error: 'O preço mínimo não pode superar o preço máximo.'
        });
      }
    }

    // Filtro por estoque.
    if (minStock !== undefined) {
      filter.stock = {
        $gte: parseNumber(
          minStock,
          'estoque mínimo',
          { min: 0 }
        )
      };
    }

    const skip = (page - 1) * limit;

    // Consulta dos produtos e contagem total.
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter)
    ]);

    return res.json({
      products,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error.message);

    return res.status(400).json({
      error: error.message || 'Erro ao buscar produtos.'
    });
  }
});

// ======================================================
// GET /api/products/:id
// Consulta pública de um produto.
// ======================================================

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

// ======================================================
// POST /api/products
// Cadastro exclusivo para administradores.
// ======================================================

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

// ======================================================
// PUT /api/products/:id
// Atualização exclusiva para administradores.
// ======================================================

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

// ======================================================
// DELETE /api/products/:id
// Exclusão exclusiva para administradores.
// ======================================================

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

// ======================================================
// EXPORTAÇÃO
// ======================================================

module.exports = router;
