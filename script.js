const apiUrl = 'https://catalogo-backend-e14g.onrender.com';
let token = localStorage.getItem('authToken') || null;

// DOM Elements
const loginBtn = document.getElementById('btnLogin');
const logoutBtn = document.getElementById('btnLogout');
const loginMsg = document.getElementById('login-message');
const usernameInput = document.getElementById('login-username');
const passwordInput = document.getElementById('login-password');
const addProductSection = document.getElementById('add-product-section');
const productsContainer = document.getElementById('products-container');
const currentYear = document.getElementById('current-year');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotal = document.getElementById('cart-total');
const cartItemCount = document.getElementById('cart-item-count');
const shoppingCartSection = document.getElementById('shopping-cart-section');

// Utilidades
const formatCurrency = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Verifica login e atualiza UI
function updateAuthUI() {
  const isLoggedIn = !!token;
  addProductSection.style.display = isLoggedIn ? 'block' : 'none';
  logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
  loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
  usernameInput.style.display = isLoggedIn ? 'none' : 'inline-block';
  passwordInput.style.display = isLoggedIn ? 'none' : 'inline-block';
  loginMsg.textContent = '';
}

// LOGIN
loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (!username || !password) {
    loginMsg.textContent = 'Preencha todos os campos.';
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Erro no login');

    token = data.token;
    localStorage.setItem('authToken', token);
    updateAuthUI();
    loadProducts(); // recarrega produtos
  } catch (err) {
    loginMsg.textContent = err.message;
  }
});

// LOGOUT
logoutBtn.addEventListener('click', () => {
  token = null;
  localStorage.removeItem('authToken');
  updateAuthUI();
  loadProducts(); // recarrega produtos
});

// CARREGAR PRODUTOS
async function loadProducts() {
  try {
    const res = await fetch(`${apiUrl}/produtos`);
    const produtos = await res.json();
    renderProducts(produtos);
  } catch (err) {
    productsContainer.innerHTML = '<p>Erro ao carregar produtos.</p>';
  }
}

// RENDERIZAR PRODUTOS
function renderProducts(produtos) {
  if (!produtos || produtos.length === 0) {
    productsContainer.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  productsContainer.innerHTML = '';

  produtos.forEach((produto) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${produto.imagem || 'https://via.placeholder.com/200'}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      <p><strong>${formatCurrency(produto.preco)}</strong></p>
      <p>Estoque: ${produto.estoque}</p>
      <button class="button button-success btn-add-cart" data-id="${produto._id}" data-nome="${produto.nome}" data-preco="${produto.preco}">
        Adicionar ao Carrinho
      </button>
    `;
    productsContainer.appendChild(card);
  });
}

// CARRINHO
let cart = [];

function updateCartUI() {
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p id="empty-cart-message">Seu carrinho está vazio.</p>';
    shoppingCartSection.classList.add('hidden');
    return;
  }

  shoppingCartSection.classList.remove('hidden');
  let total = 0;
  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <p>${item.nome} - ${formatCurrency(item.preco)}</p>
      <button class="button button-danger btn-remove-cart" data-index="${i}">Remover</button>
    `;
    cartItemsContainer.appendChild(div);
    total += item.preco;
  });

  cartTotal.textContent = formatCurrency(total);
  cartItemCount.textContent = cart.length;
}

// DELEGAÇÃO: Adicionar ao Carrinho
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-add-cart')) {
    const id = e.target.dataset.id;
    const nome = e.target.dataset.nome;
    const preco = parseFloat(e.target.dataset.preco);
    cart.push({ id, nome, preco });
    updateCartUI();
  }

  if (e.target.classList.contains('btn-remove-cart')) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    updateCartUI();
  }
});

// Limpar Carrinho
document.getElementById('clear-cart-button').addEventListener('click', () => {
  cart = [];
  updateCartUI();
});

// Finalizar Compra
document.getElementById('checkout-button').addEventListener('click', () => {
  alert('Compra finalizada! Obrigado.');
  cart = [];
  updateCartUI();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  currentYear.textContent = new Date().getFullYear();
  updateAuthUI();
  loadProducts();
});
