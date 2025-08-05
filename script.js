const apiUrl = 'https://catalogo-backend-e14g.onrender.com';

let token = localStorage.getItem('token') || null;

// ==================== LOGIN ====================
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
          const data = await res.json();
          alert(data.message || 'Erro ao fazer login.');
          return;
        }

        const data = await res.json();
        token = data.token;
        localStorage.setItem('token', token);
        alert('Login realizado com sucesso!');
        location.reload(); // recarrega a página como admin
      } catch (err) {
        console.error(err);
        alert('Erro de conexão com o servidor.');
      }
    });
  }

  loadProducts();
});

// ==================== PRODUTOS ====================
async function loadProducts() {
  try {
    const res = await fetch(`${apiUrl}/produtos`);
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    const produtos = await res.json();
    renderProducts(produtos);
  } catch (err) {
    console.error(err);
    document.getElementById('products-container').innerHTML = `<p>Erro ao carregar produtos.</p>`;
  }
}

function renderProducts(produtos) {
  const container = document.getElementById('products-container');
  if (!container) return;

  container.innerHTML = '';

  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${produto.imageUrl}" alt="${produto.name}" />
      <h3>${produto.name}</h3>
      <p>${produto.description}</p>
      <p><strong>R$ ${produto.price.toFixed(2)}</strong></p>
      <p>Estoque: ${produto.stock}</p>
      <button class="add-to-cart" data-id="${produto._id}">Adicionar ao carrinho</button>
    `;
    container.appendChild(card);
  });

  // Eventos de adicionar ao carrinho
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-id');
      addToCart(productId);
    });
  });
}

// ==================== CARRINHO ====================
const cart = [];

function addToCart(productId) {
  cart.push(productId);
  alert('Produto adicionado ao carrinho.');
  // Atualizar visual do carrinho se necessário
}

// ==================== UTIL ====================
function logout() {
  localStorage.removeItem('token');
  token = null;
  location.reload();
}
