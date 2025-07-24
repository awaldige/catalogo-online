const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com';

let carrinho = [];
let currentPage = 1;
let totalPages = 1;
const limit = 9; // Itens por página

// Função para buscar produtos com paginação e filtros
async function fetchProdutos(queryParams = '') {
    const url = `${API_BASE_URL}/api/products${queryParams}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // data.products = array de produtos retornados
        // data.currentPage, data.totalPages da paginação no backend

        currentPage = data.currentPage || 1;
        totalPages = data.totalPages || 1;

        renderProdutos(data.products || []);
        renderPaginacao();
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

// Renderiza os botões da paginação
function renderPaginacao() {
    const paginacaoContainer = document.getElementById('pagination');
    paginacaoContainer.innerHTML = '';

    if (totalPages <= 1) return; // Não mostra paginação se só uma página

    // Botão anterior
    const btnPrev = document.createElement('button');
    btnPrev.className = 'pagination-button';
    btnPrev.textContent = 'Anterior';
    btnPrev.disabled = currentPage === 1;
    btnPrev.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            buscarComFiltros(currentPage);
        }
    };
    paginacaoContainer.appendChild(btnPrev);

    // Botões de páginas (1, 2, 3...)
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-button';
        btn.textContent = i;
        if (i === currentPage) {
            btn.classList.add('active');
            btn.disabled = true;
        }
        btn.onclick = () => {
            currentPage = i;
            buscarComFiltros(currentPage);
        };
        paginacaoContainer.appendChild(btn);
    }

    // Botão próximo
    const btnNext = document.createElement('button');
    btnNext.className = 'pagination-button';
    btnNext.textContent = 'Próximo';
    btnNext.disabled = currentPage === totalPages;
    btnNext.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            buscarComFiltros(currentPage);
        }
    };
    paginacaoContainer.appendChild(btnNext);
}

// Função que monta a query com filtros + paginação e chama fetchProdutos
function buscarComFiltros(page = 1) {
    const categoria = document.getElementById('category-filter').value;
    const nome = document.getElementById('search-input').value.trim();
    const precoMin = document.getElementById('min-price-input').value;
    const precoMax = document.getElementById('max-price-input').value;
    const estoqueMin = document.getElementById('min-stock-input').value;

    let query = `?page=${page}&limit=${limit}&`;
    if (categoria !== 'all') query += `category=${categoria}&`;
    if (nome) query += `search=${encodeURIComponent(nome)}&`;
    if (precoMin) query += `minPrice=${precoMin}&`;
    if (precoMax) query += `maxPrice=${precoMax}&`;
    if (estoqueMin) query += `minStock=${estoqueMin}&`;

    fetchProdutos(query);
}

// Adiciona produto ao carrinho
function adicionarAoCarrinho(id, nome, preco, imagem) {
    const produtoExistente = carrinho.find(item => item.id === id);
    if (produtoExistente) {
        produtoExistente.quantidade += 1;
    } else {
        carrinho.push({ id, nome, preco, imagem, quantidade: 1 });
    }
    atualizarCarrinho();
    mostrarCarrinho();
}

// Atualiza o carrinho na tela
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

// Mostra o carrinho
function mostrarCarrinho() {
    const carrinhoSection = document.getElementById('shopping-cart-section');
    carrinhoSection.classList.remove('hidden');
}

// Esconde o carrinho
function esconderCarrinho() {
    const carrinhoSection = document.getElementById('shopping-cart-section');
    carrinhoSection.classList.add('hidden');
}

// Eventos dos botões Limpar e Finalizar compra
document.getElementById('clear-cart-button').addEventListener('click', () => {
    carrinho = [];
    atualizarCarrinho();
    esconderCarrinho();
});

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

// Eventos de busca
document.getElementById('search-button').addEventListener('click', () => {
    currentPage = 1;
    buscarComFiltros(currentPage);
});

document.getElementById('clear-search-button').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('min-price-input').value = '';
    document.getElementById('max-price-input').value = '';
    document.getElementById('min-stock-input').value = '';
    document.getElementById('category-filter').value = 'all';
    currentPage = 1;
    buscarComFiltros(currentPage);
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    esconderCarrinho();
    buscarComFiltros(currentPage);
});
