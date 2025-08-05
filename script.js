const apiUrl = 'https://catalogo-backend-e14g.onrender.com/api/produtos';
const loginUrl = 'https://catalogo-backend-e14g.onrender.com/api/auth/login';
let token = localStorage.getItem('token') || null;
let isAdmin = false;

// Carrega todos os produtos ao iniciar
window.onload = () => {
  loadProducts();
  updateYear();
  updateAuthUI();
};

function updateYear() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
}

// ---------------- AUTENTICAÇÃO ----------------

document.getElementById('btnLogin').addEventListener('click', async () => {
  const email = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      isAdmin = true;
      updateAuthUI();
      alert('Login realizado com sucesso!');
    } else {
      document.getElementById('login-message').textContent = data.message || 'Login falhou';
    }
  } catch (error) {
    document.getElementById('login-message').textContent = 'Erro na conexão com o servidor';
  }
});

document.getElementById('btnLogout').addEventListener('click', () => {
  token = null;
  isAdmin = false;
  localStorage.removeItem('token');
  updateAuthUI();
});

function updateAuthUI() {
  const show = el => el.style.display = '';
  const hide = el => el.style.display = 'none';

  const addSection = document.getElementById('add-product-section');
  const btnLogout = document.getElementById('btnLogout');
  const btnLogin = document.getElementById('btnLogin');
  const loginMessage = document.getElementById('login-message');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');

  if (token) {
    show(addSection);
    show(btnLogout);
    hide(btnLogin);
    hide(usernameInput);
    hide(passwordInput);
    loginMessage.textContent = '';
  } else {
    hide(addSection);
    hide(btnLogout);
    show(btnLogin);
    show(usernameInput);
    show(passwordInput);
  }
}

// ---------------- LISTAGEM ----------------

async function loadProducts() {
  try {
    const response = await fetch(apiUrl);
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

function displayProducts(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <img src="${prod.imageUrl}" alt="${prod.name}" />
      <h3>${prod.name}</h3>
      <p>${prod.description}</p>
      <p><strong>Preço:</strong> R$ ${prod.price.toFixed(2)}</p>
      <p><strong>Estoque:</strong> ${prod.stock}</p>
      <button class="button button-success add-to-cart" data-id="${prod._id}">Adicionar ao Carrinho</button>
    `;

    container.appendChild(card);
  });

  // Evento de adicionar ao carrinho
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      addToCart(id);
    });
  });
}

// ---------------- CARRINHO ----------------

let cart = [];

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  updateCartUI();
}

function updateCartUI() {
  const cartContainer = document.getElementById('cart-items-container');
  const itemCount = document.getElementById('cart-item-count');
  const cartTotal = document.getElementById('cart-total');
  const emptyMessage = document.getElementById('empty-cart-message');

  if (cart.length === 0) {
    cartContainer.innerHTML = '';
    emptyMessage.style.display = 'block';
    itemCount.textContent = '0';
    cartTotal.textContent = 'R$ 0,00';
    return;
  }

  emptyMessage.style.display = 'none';
  let total = 0;
  cartContainer.innerHTML = '';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <p>ID: ${item.id}</p>
      <p>Quantidade: ${item.quantity}</p>
    `;
    cartContainer.appendChild(div);
    total += item.quantity * 50; // Preço fictício. Pode ser ajustado com fetch do produto real.
  });

  itemCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// ---------------- ADMIN: ADICIONAR PRODUTO ----------------

document.getElementById('add-product-form').addEventListener('submit', async e => {
  e.preventDefault();

  const newProduct = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    price: parseFloat(document.getElementById('price').value),
    imageUrl: document.getElementById('imageUrl').value,
    stock: parseInt(document.getElementById('stock').value),
    category: document.getElementById('category').value,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newProduct),
    });

    if (response.ok) {
      alert('Produto adicionado!');
      document.getElementById('add-product-form').reset();
      loadProducts();
    } else {
      const error = await response.json();
      alert('Erro ao adicionar produto: ' + (error.message || 'Desconhecido'));
    }
  } catch (error) {
    alert('Erro ao enviar dados: ' + error.message);
  }
});

// Cancelar formulário
document.getElementById('cancel-form').addEventListener('click', () => {
  document.getElementById('add-product-form').reset();
});

// Mostrar formulário
document.getElementById('show-add-form').addEventListener('click', () => {
  document.getElementById('add-product-form').classList.toggle('hidden');
});
