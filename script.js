const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com';

let carrinho = [];
let currentPage = 1;
let totalPages = 1;
const limit = 9; // Itens por página

// Para controle do formulário admin
let editandoProdutoId = null;

// Persistência do carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function carregarCarrinho() {
    const dados = localStorage.getItem('carrinho');
    if (dados) {
        carrinho = JSON.parse(dados);
    }
}

// Função para buscar produtos com paginação e filtros
async function fetchProdutos(queryParams = '') {
    const url = `${API_BASE_URL}/api/products${queryParams}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
        const data = await response.json();

        // Define página atual com base na query
        currentPage = parseInt((new URLSearchParams(queryParams)).get('page')) || 1;

        // Calcula total de páginas com base no totalCount retornado pelo backend
        const totalCount = data.totalCount || (data.products ? data.products.length : 0);
        totalPages = Math.ceil(totalCount / limit);

        renderProdutos(data.products || []);
        renderPaginacao();
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        const container = document.getElementById('products-container');
        container.innerHTML = '<p class="error-message">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        document.getElementById('pagination').innerHTML = '';
    }
}

// Renderiza os produtos na página (com botão Editar)
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

        // Escape para texto no onclick
        const safeName = escapeHtml(produto.name);

        // Usando JSON.stringify para passar objeto ao botão editar (escapando aspas simples)
        const produtoJson = JSON.stringify(produto).replace(/'/g, "\\'");

        item.innerHTML = `
            <img src="${produto.imageUrl || 'https://via.placeholder.com/280x200?text=Sem+Imagem'}" alt="${produto.name}">
            <h3>${produto.name}</h3>
            <p>${produto.description || 'Sem descrição disponível.'}</p>
            <p><strong>R$ ${produto.price.toFixed(2)}</strong></p>
            <p>Estoque: ${produto.stock ?? 0}</p>
            <button onclick="adicionarAoCarrinho('${produto._id}', '${safeName}', ${produto.price}, '${produto.imageUrl || ''}')">Adicionar ao Carrinho</button>
            <button class="button button-secondary" style="margin-top: 5px;" onclick='iniciarEdicaoProduto(${produtoJson})'>Editar</button>
        `;
        container.appendChild(item);
    });
}

// Escape simples para prevenir problemas em onclick inline
function escapeHtml(text) {
    return text.replace(/'/g, "\\'");
}

// Renderiza os botões da paginação
function renderPaginacao() {
    const paginacaoContainer = document.getElementById('pagination');
    paginacaoContainer.innerHTML = '';

    if (totalPages <= 1) return;

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

// Monta a query de filtros + paginação e chama fetchProdutos
function buscarComFiltros(page = 1) {
    const categoria = document.getElementById('category-filter').value;
    const nome = document.getElementById('search-input').value.trim();
    const precoMin = document.getElementById('min-price-input').value;
    const precoMax = document.getElementById('max-price-input').value;
    const estoqueMin = document.getElementById('min-stock-input').value;

    let query = `?page=${page}&limit=${limit}&`;
    if (categoria !== 'all') query += `category=${encodeURIComponent(categoria)}&`;
    if (nome) query += `search=${encodeURIComponent(nome)}&`;
    if (precoMin) query += `minPrice=${encodeURIComponent(precoMin)}&`;
    if (precoMax) query += `maxPrice=${encodeURIComponent(precoMax)}&`;
    if (estoqueMin) query += `minStock=${encodeURIComponent(estoqueMin)}&`;

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
    salvarCarrinho();
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
            <img src="${item.imagem || 'https://via.placeholder.com/50x50?text=Sem+Imagem'}" alt="${item.nome}" width="50" />
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

// Remove item do carrinho
function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
    atualizarCarrinho();
    if (carrinho.length === 0) esconderCarrinho();
}

// Mostra o carrinho
function mostrarCarrinho() {
    document.getElementById('shopping-cart-section').classList.remove('hidden');
}

// Esconde o carrinho
function esconderCarrinho() {
    document.getElementById('shopping-cart-section').classList.add('hidden');
}

// Eventos dos botões Limpar e Finalizar
document.getElementById('clear-cart-button').addEventListener('click', () => {
    carrinho = [];
    salvarCarrinho();
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
    salvarCarrinho();
    atualizarCarrinho();
    esconderCarrinho();
});

// Busca e filtro
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

// --- FORMULÁRIO ADMIN ---
// Elementos do formulário admin
const btnShowAddForm = document.getElementById('show-add-form');
const formAddProduct = document.getElementById('add-product-form');
const btnCancelForm = document.getElementById('cancel-form');
const titleForm = document.getElementById('productFormTitle');

// Mostrar formulário para adicionar produto
btnShowAddForm.addEventListener('click', () => {
    resetarFormulario();
    editandoProdutoId = null;
    titleForm.textContent = 'Adicionar Produto';
    formAddProduct.style.display = 'flex';
    window.scrollTo({ top: formAddProduct.offsetTop, behavior: 'smooth' });
});

// Cancelar formulário
btnCancelForm.addEventListener('click', () => {
    resetarFormulario();
    formAddProduct.style.display = 'none';
    editandoProdutoId = null;
});

// Submissão do formulário para criar/editar produto
formAddProduct.addEventListener('submit', async (e) => {
    e.preventDefault();

    const produto = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        price: parseFloat(document.getElementById('price').value),
        imageUrl: document.getElementById('imageUrl').value.trim(),
        stock: parseInt(document.getElementById('stock').value) || 0,
        category: document.getElementById('category').value,
    };

    if (!produto.name || !produto.category) {
        alert('Por favor, preencha os campos obrigatórios: Nome e Categoria.');
        return;
    }

    try {
        let response;
        if (editandoProdutoId) {
            response = await fetch(`${API_BASE_URL}/api/products/${editandoProdutoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto),
            });
        } else {
            response = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto),
            });
        }

        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));
            throw new Error(erro.message || 'Erro na requisição.');
        }

        alert(editandoProdutoId ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
        resetarFormulario();
        formAddProduct.style.display = 'none';
        editandoProdutoId = null;
        buscarComFiltros(currentPage);
    } catch (err) {
        alert(`Erro: ${err.message}`);
        console.error(err);
    }
});

// Resetar formulário admin
function resetarFormulario() {
    formAddProduct.reset();
    document.getElementById('product-id').value = '';
}

// Preencher formulário para edição
function iniciarEdicaoProduto(produto) {
    editandoProdutoId = produto._id;

    titleForm.textContent = 'Editar Produto';
    document.getElementById('name').value = produto.name || '';
    document.getElementById('description').value = produto.description || '';
    document.getElementById('price').value = produto.price || 0;
    document.getElementById('imageUrl').value = produto.imageUrl || '';
    document.getElementById('stock').value = produto.stock || 0;
    document.getElementById('category').value = produto.category || '';

    formAddProduct.style.display = 'flex';
    window.scrollTo({ top: formAddProduct.offsetTop, behavior: 'smooth' });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    carregarCarrinho();
    if (carrinho.length === 0) esconderCarrinho();
    else mostrarCarrinho();
    buscarComFiltros(currentPage);
    
    // Esconder formulário admin no carregamento
    formAddProduct.style.display = 'none';
});
