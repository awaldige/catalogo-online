const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com';

let currentPage = 1;
const limit = 10; // itens por página

async function fetchProdutos(queryParams = '') {
    // adiciona paginação nos params
    if (queryParams) {
        queryParams += `&page=${currentPage}&limit=${limit}`;
    } else {
        queryParams = `?page=${currentPage}&limit=${limit}`;
    }

    const url = `${API_BASE_URL}/api/products${queryParams}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderProdutos(data.products || []);
        renderPagination(data.totalCount || 0);
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
        item.dataset.id = produto._id;
        item.innerHTML = `
            <img src="${produto.imageUrl}" alt="${produto.name}">
            <h3>${produto.name}</h3>
            <p>${produto.description}</p>
            <p><strong>R$ ${produto.price.toFixed(2)}</strong></p>
            <p>Estoque: ${produto.stock ?? 0}</p>
            <button class="btn-buy" data-id="${produto._id}">Comprar</button>
            <button class="btn-edit" data-id="${produto._id}">Editar</button>
            <button class="btn-delete" data-id="${produto._id}">Excluir</button>
        `;
        container.appendChild(item);
    });
}

document.getElementById('products-container').addEventListener('click', (event) => {
    const id = event.target.dataset.id;
    if (event.target.classList.contains('btn-buy')) {
        adicionarAoCarrinho(id);
    } else if (event.target.classList.contains('btn-edit')) {
        abrirFormEdicao(id);
    } else if (event.target.classList.contains('btn-delete')) {
        excluirProduto(id);
    }
});

function adicionarAoCarrinho(idProduto) {
    alert(`Produto ${idProduto} adicionado ao carrinho (função simulada).`);
}

async function abrirFormEdicao(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const produto = await res.json();
        if (!produto) {
            alert('Produto não encontrado.');
            return;
        }
        // Preenche o formulário com dados do produto
        document.getElementById('product-id').value = produto._id;
        document.getElementById('name').value = produto.name;
        document.getElementById('description').value = produto.description;
        document.getElementById('price').value = produto.price;
        document.getElementById('imageUrl').value = produto.imageUrl || '';
        document.getElementById('stock').value = produto.stock || 0;
        document.getElementById('category').value = produto.category || '';
        document.getElementById('productFormTitle').textContent = 'Editar Produto';
        document.getElementById('add-product-section').scrollIntoView({behavior: 'smooth'});
        document.getElementById('add-product-form').style.display = 'block';
    } catch (error) {
        alert('Erro ao carregar produto para edição.');
        console.error(error);
    }
}

async function excluirProduto(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            alert('Produto excluído com sucesso.');
            fetchProdutos(getCurrentFilters());
        } else {
            alert('Falha ao excluir o produto.');
        }
    } catch (error) {
        alert('Erro ao excluir o produto.');
        console.error(error);
    }
}

// Formulário adicionar/editar produto
document.getElementById('show-add-form').addEventListener('click', () => {
    limparFormulario();
    document.getElementById('productFormTitle').textContent = 'Adicionar Produto';
    document.getElementById('add-product-form').style.display = 'block';
    document.getElementById('add-product-section').scrollIntoView({behavior: 'smooth'});
});

document.getElementById('cancel-form').addEventListener('click', () => {
    limparFormulario();
    document.getElementById('add-product-form').style.display = 'none';
});

document.getElementById('add-product-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('product-id').value;
    const produto = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        imageUrl: document.getElementById('imageUrl').value,
        stock: parseInt(document.getElementById('stock').value) || 0,
        category: document.getElementById('category').value,
    };

    try {
        let res;
        if (id) {
            // Editar
            res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        } else {
            // Adicionar
            res = await fetch(`${API_BASE_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        }

        if (res.ok) {
            alert(`Produto ${id ? 'editado' : 'adicionado'} com sucesso!`);
            limparFormulario();
            document.getElementById('add-product-form').style.display = 'none';
            fetchProdutos(getCurrentFilters());
        } else {
            alert('Erro ao salvar produto.');
        }
    } catch (error) {
        alert('Erro ao salvar produto.');
        console.error(error);
    }
});

function limparFormulario() {
    document.getElementById('product-id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('description').value = '';
    document.getElementById('price').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('stock').value = 0;
    document.getElementById('category').value = '';
}

// Busca e filtros
document.getElementById('search-button').addEventListener('click', () => {
    currentPage = 1; // reset página ao buscar
    fetchProdutos(buildQueryString());
});

document.getElementById('clear-search-button').addEventListener('click', () => {
    currentPage = 1;
    document.getElementById('search-input').value = '';
    document.getElementById('min-price-input').value = '';
    document.getElementById('max-price-input').value = '';
    document.getElementById('min-stock-input').value = '';
    document.getElementById('category-filter').value = 'all';
    fetchProdutos();
});

function buildQueryString() {
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

    return query;
}

function getCurrentFilters() {
    return buildQueryString();
}

// Paginação simples
function renderPagination(totalCount) {
    const pagination = document.getElementById('pagination-controls');
    const totalPages = Math.ceil(totalCount / limit);

    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchProdutos(getCurrentFilters());
        }
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Próximo';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchProdutos(getCurrentFilters());
        }
    });

    pagination.appendChild(prevBtn);
    pagination.appendChild(document.createTextNode(` Página ${currentPage} de ${totalPages} `));
    pagination.appendChild(nextBtn);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    fetchProdutos();
});
