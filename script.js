const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com';
let produtos = [];
let token = localStorage.getItem('token') || null;

// Verifica se está logado como admin
function isAdmin() {
  return !!token;
}

// Exibe ou oculta a interface de administração
function atualizarInterfaceAdmin() {
  const adminSection = document.getElementById('admin-section');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');

  if (isAdmin()) {
    adminSection?.classList.remove('hidden');
    btnLogin?.classList.add('hidden');
    btnLogout?.classList.remove('hidden');
  } else {
    adminSection?.classList.add('hidden');
    btnLogin?.classList.remove('hidden');
    btnLogout?.classList.add('hidden');
  }
}

// Carrega os produtos da API
async function carregarProdutos() {
  try {
    const res = await fetch(`${API_BASE_URL}/produtos`);
    if (!res.ok) throw new Error('Erro ao carregar produtos');

    produtos = await res.json();
    exibirProdutos();
  } catch (err) {
    console.error('Erro ao carregar produtos:', err.message);
    document.getElementById('produtos-container').innerHTML = '<p>Erro ao carregar produtos.</p>';
  }
}

// Exibe os produtos no DOM
function exibirProdutos() {
  const container = document.getElementById('produtos-container');
  container.innerHTML = '';

  produtos.forEach((produto) => {
    const card = document.createElement('div');
    card.className = 'produto-card';

    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}" />
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
      ${isAdmin() ? `
        <div class="admin-actions">
          <button class="btn-editar" data-id="${produto._id}">Editar</button>
          <button class="btn-excluir" data-id="${produto._id}">Excluir</button>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

// Logout
function logout() {
  localStorage.removeItem('token');
  token = null;
  atualizarInterfaceAdmin();
  carregarProdutos();
}

// Ações administrativas
async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/produtos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Erro ao excluir produto');

    // Remove o produto da lista local e atualiza a exibição
    produtos = produtos.filter((p) => p._id !== id);
    exibirProdutos();
  } catch (err) {
    alert('Erro ao excluir produto: ' + err.message);
  }
}

// Eventos
document.addEventListener('DOMContentLoaded', () => {
  atualizarInterfaceAdmin();
  carregarProdutos();
});

document.addEventListener('click', (e) => {
  // Botão de login (leva para login.html)
  if (e.target.id === 'btn-login') {
    window.location.href = 'login.html';
  }

  // Botão de logout
  if (e.target.id === 'btn-logout') {
    logout();
  }

  // Botão excluir
  if (e.target.classList.contains('btn-excluir')) {
    const id = e.target.dataset.id;
    excluirProduto(id);
  }

  // Botão editar (você pode implementar essa lógica depois)
  if (e.target.classList.contains('btn-editar')) {
    const id = e.target.dataset.id;
    alert(`Abrir formulário de edição para o produto com ID: ${id}`);
  }
});
