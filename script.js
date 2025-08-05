const apiBase = 'https://catalogo-backend-e14g.onrender.com';
const produtosEndpoint = `${apiBase}/produtos`;
const loginForm = document.getElementById('login-form');
const produtosContainer = document.getElementById('produtos-container');
const logoutBtn = document.getElementById('logout-btn');
const formSection = document.getElementById('form-section');

// Verifica se usuário está logado
function isAdmin() {
  return !!localStorage.getItem('token');
}

// Mostrar/ocultar elementos com base na autenticação
function ajustarInterface() {
  if (isAdmin()) {
    formSection?.classList.remove('hidden');
    logoutBtn?.classList.remove('hidden');
    loginForm?.classList.add('hidden');
  } else {
    formSection?.classList.add('hidden');
    logoutBtn?.classList.add('hidden');
    loginForm?.classList.remove('hidden');
  }
}

// Carregar produtos da API
async function carregarProdutos() {
  try {
    const res = await fetch(produtosEndpoint);
    if (!res.ok) throw new Error('Erro ao carregar produtos');

    const produtos = await res.json();
    exibirProdutos(produtos);
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
  }
}

// Exibir produtos no HTML
function exibirProdutos(produtos) {
  produtosContainer.innerHTML = '';

  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      <p><strong>R$ ${produto.preco.toFixed(2)}</strong></p>
      <button class="button add-carrinho" data-id="${produto._id}">Adicionar ao Carrinho</button>
      ${isAdmin() ? `
        <button class="button editar-produto" data-id="${produto._id}">Editar</button>
        <button class="button excluir-produto" data-id="${produto._id}">Excluir</button>
      ` : ''}
    `;
    produtosContainer.appendChild(card);
  });
}

// Login admin
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Login inválido');
        return;
      }

      localStorage.setItem('token', data.token);
      ajustarInterface();
      carregarProdutos();
    } catch (err) {
      alert('Erro ao fazer login');
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    ajustarInterface();
    carregarProdutos();
  });
}

// Delegação de eventos (editar, excluir, adicionar ao carrinho)
document.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;

  // Adicionar ao carrinho
  if (e.target.classList.contains('add-carrinho')) {
    alert(`Produto ${id} adicionado ao carrinho!`);
  }

  // Editar produto
  if (e.target.classList.contains('editar-produto')) {
    const novoNome = prompt('Novo nome do produto:');
    if (!novoNome) return;

    try {
      await fetch(`${produtosEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nome: novoNome })
      });
      carregarProdutos();
    } catch (err) {
      alert('Erro ao editar produto.');
    }
  }

  // Excluir produto
  if (e.target.classList.contains('excluir-produto')) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await fetch(`${produtosEndpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      carregarProdutos();
    } catch (err) {
      alert('Erro ao excluir produto.');
    }
  }
});

// Inicializar página
ajustarInterface();
carregarProdutos();
