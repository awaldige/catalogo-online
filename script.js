const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com';

async function fetchProdutos(queryParams = '') {
    const url = `${API_BASE_URL}/api/products${queryParams}`;
    try {
        const response = await fetch(url);
        const produtos = await response.json();
        renderProdutos(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

function renderProdutos(produtos) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    if (produtos.length === 0) {
        container.innerHTML = '<p>Nenhum produto encontrado.</p>';
        return;
    }
    produtos.forEach(produto => {
        const item = document.createElement('div');
        item.className = 'product-card';
        item.innerHTML = `
            <img src="${produto.imageUrl}" alt="${produto.name}">
            <h3>${produto.name}</h3>
            <p>${produto.description}</p>
            <p><strong>R$ ${produto.price.toFixed(2)}</strong></p>
            <p>Estoque: ${produto.stock ?? 0}</p>
            <button onclick="adicionarAoCarrinho('${produto._id}')">Comprar</button>
        `;
        container.appendChild(item);
    });
}

document.getElementById('search-button').addEventListener('click', () => {
    const categoria = document.getElementById('category-filter').value;
    const nome = document.getElementById('search-input').value.trim();
    const precoMin = document.getElementById('min-price-input').value;
    const precoMax = document.getElementById('max-price-input').value;
    const estoqueMin = document.getElementById('min-stock-input').value;

    let query = '?';
    if (categoria !== 'all') query += `category=${categoria}&`;
    if (nome) query += `name=${nome}&`;
    if (precoMin) query += `minPrice=${precoMin}&`;
    if (precoMax) query += `maxPrice=${precoMax}&`;
    if (estoqueMin) query += `minStock=${estoqueMin}&`;

    fetchProdutos(query);
});

document.getElementById('clear-search-button').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('min-price-input').value = '';
    document.getElementById('max-price-input').value = '';
    document.getElementById('min-stock-input').value = '';
    document.getElementById('category-filter').value = 'all';
    fetchProdutos();
});

function adicionarAoCarrinho(idProduto) {
    alert(`Produto ${idProduto} adicionado ao carrinho (função simulada).`);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    fetchProdutos();
});
