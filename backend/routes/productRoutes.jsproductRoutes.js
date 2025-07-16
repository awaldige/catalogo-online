const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Importa o modelo correto

// Buscar todos os produtos com filtros, paginação e busca
router.get('/', async (req, res) => {
    try {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            minStock,
            page = 1,
            limit = 9
        } = req.query;

        const query = {};

        // Busca por nome ou descrição
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filtro por categoria (exceto "all")
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filtro por preço mínimo e máximo
        if (minPrice !== undefined) {
            query.price = { ...query.price, $gte: parseFloat(minPrice) };
        }
        if (maxPrice !== undefined) {
            query.price = { ...query.price, $lte: parseFloat(maxPrice) };
        }

        // Filtro por estoque mínimo
        if (minStock !== undefined) {
            query.stock = { $gte: parseInt(minStock, 10) };
        }

        // Contar total de produtos que satisfazem os filtros
        const totalProducts = await Product.countDocuments(query);

        // Calcular total de páginas
        const totalPages = Math.ceil(totalProducts / limit);

        // Buscar produtos paginados
        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Retornar resposta com produtos e dados da paginação
        res.status(200).json({
            products,
            totalPages,
            currentPage: parseInt(page),
            totalProducts
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
});

// Adicionar novo produto
router.post('/', async (req, res) => {
    const { name, description, price, imageUrl, stock, category } = req.body;
    try {
        const product = new Product({
            name,
            description,
            price,
            imageUrl,
            stock,
            category
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: 'Erro ao adicionar produto', error: err.message });
    }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

        product.name = req.body.name || product.name;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.imageUrl = req.body.imageUrl || product.imageUrl;
        product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
        product.category = req.body.category || product.category;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: 'Erro ao atualizar produto', error: err.message });
    }
});

// Excluir produto
router.delete('/:id', async (req, res) => {
    try {
        const result = await Product.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Produto não encontrado para exclusão' });
        }
        res.json({ message: 'Produto excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao excluir produto', error: err.message });
    }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar produto', error: err.message });
    }
});

module.exports = router;

