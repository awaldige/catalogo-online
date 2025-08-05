const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com/api';
let token = localStorage.getItem('token') || null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
  verificarAutenticacao();
  document.getElementById('search-button').addEventListener('click', buscarProdutos);
  document.getElementById('clear-search-button').addEventListener('click', limparBusca);
  document.getElementById('show-add-form').addEventListener('click', () => toggleForm(true));
  document.getElementById('cancel-form').addEventListener('click', () => toggleForm(false));
  document.getElementById('add-product-form').addEventListener('submit', salvarProduto);
  document.getElementById('clear-cart-button').addEventListener('click', limparCarrinho);
  document.getElementById('checkout-button').addEventListener('click', finalizarCompra);
  document.getElementById('login-form')?.addEventListener('submit', realizarLogin);
  document.getElementById('logout-button')?.addEventListener('click', realizarLogout);

  renderizarCarrinho();
});

// Login do administrador
async function realizarLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      alert('Login realizado com sucesso!');
      verificarAutenticacao();
    } else {
      alert(data.message || 'Erro ao fazer login');
    }
  } catch (err) {
    console.error('Erro no login:', err);
  }
}

function realizarLogout() {
  localStorage.removeItem('token');
  token = null;
  verificarAutenticacao();
}

// Exibe/esconde a seção admin com base no token
function verificarAutenticacao() {
  const secaoAdmin = document.getElementById('add-product-section');
  if (token) {
    secaoAdmin.classList.remove('hidden');
  } else {
    secaoAdmin.classList.add('hidden');
  }
}

// Carregar e exibir os produtos
async function carregarProdutos() {
  try {
    const res = await fetch(`${API_BASE_URL}/produtos`);
    const produtos = await res.json();
    renderizarProdutos(produtos);
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
  }
}

function renderizarProdutos(produtos) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  produtos.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${prod.imageUrl}" alt="${prod.name}">
      <h3>${prod.name}</h3>
      <p>${prod.description}</p>
      <p class="price">R$ ${prod.price.toFixed(2)}</p>
      <p>Estoque: ${prod.stock}</p>
      <p>Categoria: ${prod.category}</p>
      <button class="button button-primary add-to-cart" data-id="${prod._id}">Adicionar ao Carrinho</button>
    `;
    container.appendChild(card);
  });

  // Delegação de evento
  container.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', adicionarAoCarrinho);
  });
}

// Carrinho
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarAoCarrinho(e) {
  const id = e.target.dataset.id;
  const nome = e.target.closest('.product-card').querySelector('h3').textContent;
  const preco = parseFloat(e.target.closest('.product-card').querySelector('.price').textContent.replace('R$', '').replace(',', '.'));

  const item = carrinho.find(p => p.id === id);
  if (item) {
    item.quantidade += 1;
  } else {
    carrinho.push({ id, nome, preco, quantidade: 1 });
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const container = document.getElementById('cart-items-container');
  const count = document.getElementById('cart-item-count');
  const total = document.getElementById('cart-total');

  container.innerHTML = '';
  let totalValor = 0;
  let totalItens = 0;

  if (carrinho.length === 0) {
    container.innerHTML = '<p id="empty-cart-message">Seu carrinho está vazio.</p>';
  } else {
    carrinho.forEach(item => {
      totalItens += item.quantidade;
      totalValor += item.preco * item.quantidade;

      const linha = document.createElement('div');
      linha.innerHTML = `
        <p>${item.nome} x ${item.quantidade} - R$ ${(item.preco * item.quantidade).toFixed(2)}</p>
      `;
      container.appendChild(linha);
    });
  }

  count.textContent = totalItens;
  total.textContent = `R$ ${totalValor.toFixed(2)}`;
}

function limparCarrinho() {
  carrinho = [];
  localStorage.removeItem('carrinho');
  renderizarCarrinho();
}

function finalizarCompra() {
  if (carrinho.length === 0) return alert('Seu carrinho está vazio.');
  alert('Compra finalizada com sucesso!');
  limparCarrinho();
}

// Filtros
function buscarProdutos() {
  const nome = document.getElementById('search-input').value.toLowerCase();
  const categoria = document.getElementById('category-filter').value;
  const minPreco = parseFloat(document.getElementById('min-price-input').value);
  const maxPreco = parseFloat(document.getElementById('max-price-input').value);
  const minEstoque = parseInt(document.getElementById('min-stock-input').value);

  fetch(`${API_BASE_URL}/produtos`)
    .then(res => res.json())
    .then(produtos => {
      const filtrados = produtos.filter(p => {
        const nomeMatch = p.name.toLowerCase().includes(nome);
        const categoriaMatch = categoria === 'all' || p.category === categoria;
        const precoMatch = (!minPreco || p.price >= minPreco) && (!maxPreco || p.price <= maxPreco);
        const estoqueMatch = !minEstoque || p.stock >= minEstoque;
        return nomeMatch && categoriaMatch && precoMatch && estoqueMatch;
      });

      renderizarProdutos(filtrados);
    })
    .catch(err => console.error('Erro na busca:', err));
}

function limparBusca() {
  document.getElementById('search-input').value = '';
  document.getElementById('category-filter').value = 'all';
  document.getElementById('min-price-input').value = '';
  document.getElementById('max-price-input').value = '';
  document.getElementById('min-stock-input').value = '';
  carregarProdutos();
}

// CRUD de Produtos (Admin)
async function salvarProduto(e) {
  e.preventDefault();

  const nome = document.getElementById('name').value.trim();
  const descricao = document.getElementById('description').value.trim();
  const preco = parseFloat(document.getElementById('price').value);
  const imagem = document.getElementById('imageUrl').value.trim();
  const estoque = parseInt(document.getElementById('stock').value);
  const categoria = document.getElementById('category').value;

  const produto = {
    name: nome,
    description: descricao,
    price: preco,
    imageUrl: imagem,
    stock: estoque,
    category: categoria
  };

  try {
    const res = await fetch(`${API_BASE_URL}/produtos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(produto)
    });

    const data = await res.json();

    if (res.ok) {
      alert('Produto adicionado com sucesso!');
      toggleForm(false);
      carregarProdutos();
    } else {
      alert(data.message || 'Erro ao adicionar produto');
    }
  } catch (err) {
    console.error('Erro ao salvar produto:', err);
  }
}

function toggleForm(mostrar) {
  const form = document.getElementById('add-product-form');
  if (mostrar) {
    form.classList.remove('hidden');
  } else {
    form.classList.add('hidden');
    form.reset();
  }
}
