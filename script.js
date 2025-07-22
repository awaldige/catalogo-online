const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com';

let carrinho = [];

// Função para buscar produtos
async function fetchProdutos(queryParams = '') {
    const url = `${API_BASE_URL}/api/products${queryParams}`;
    try {
        const response = await fetch(url);
        const produtos = await response.json();
        renderProdutos(produtos.products || []);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

// Renderiza os produtos na página
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
            <button onclick="adicionarAoCarrinho('${produto._id}', '${produto.name}', ${produto.price}, '${produto.imageUrl}')">Adicionar ao Carrinho</button>
        `;
        container.appendChild(item);
    });
}

// Adiciona produto ao carrinho
function adicionarAoCarrinho(id, nome, preco, imagem) {
    // Verifica se produto já está no carrinho
    const produtoExistente = carrinho.find(item => item.id === id);
    if (produtoExistente) {
        produtoExistente.quantidade += 1;
    } else {
        carrinho.push({ id, nome, preco, imagem, quantidade: 1 });
    }
    atualizarCarrinho();
    mostrarCarrinho();
}

// Atualiza o conteúdo do carrinho na tela
function atualizarCarrinho() {
    const container = document.getElementById('cart-items-container');
    const countSpan = document.getElementById('cart-item-count');
    const totalSpan = document.getElementById('cart-total');

    container.innerHTML = '';

    if (carrinho.length === 0) {
        container.innerHTML = '<p id="empty-cart-message">Seu carrinho está vazio.</p>';
        countSpan.textContent = '0';
        totalSpan.textContent = 'R$ 0,00';
        return;
    }

    let total = 0;
    let totalItens = 0;

    carrinho.forEach(item => {
        total += item.preco * item.quantidade;
        totalItens += item.quantidade;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" width="50" />
            <span>${item.nome}</span>
            <span>Qtd: ${item.quantidade}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
            <button onclick="removerDoCarrinho('${item.id}')">Remover</button>
        `;
        container.appendChild(div);
    });

    countSpan.textContent = totalItens;
    totalSpan.textContent = `R$ ${total.toFixed(2)}`;
}

// Remove produto do carrinho
function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    atualizarCarrinho();
    if (carrinho.length === 0) esconderCarrinho();
}

// Mostra a seção do carrinho
function mostrarCarrinho() {
    const carrinhoSection = document.getElementById('shopping-cart-section');
    carrinhoSection.classList.remove('hidden');
}

// Esconde a seção do carrinho
function esconderCarrinho() {
    const carrinhoSection = document.getElementById('shopping-cart-section');
    carrinhoSection.classList.add('hidden');
}

// Botão para limpar o carrinho
document.getElementById('clear-cart-button').addEventListener('click', () => {
    carrinho = [];
    atualizarCarrinho();
    esconderCarrinho();
});

// Botão para finalizar compra (aqui só um alert)
document.getElementById('checkout-button').addEventListener('click', () => {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    alert('Compra finalizada com sucesso! (funcionalidade simulada)');
    carrinho = [];
    atualizarCarrinho();
    esconderCarrinho();
});

// Eventos para busca e limpar busca (mantendo o que já tinha)
document.getElementById('search-button').addEventListener('click', () => {
    const categoria = document.getElementById('category-filter').value;
    const nome = document.getElementById('search-input').value.trim();
    const precoMin = document.getElementById('min-price-input').value;
    const precoMax = document.getElementById('max-price-input').value;
    const estoqueMin = document.getElementById('min-stock-input').value;

    let query = '?';
    if (categoria !== 'all') query += `category=${categoria}&`;
    if (nome) query += `search=${encodeURIComponent(nome)}&`;
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

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    fetchProdutos();
    esconderCarrinho();
});
