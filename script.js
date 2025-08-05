const apiBase = 'https://catalogo-backend-e14g.onrender.com';
const produtosEndpoint = `${apiBase}/produtos`;

// Elementos DOM
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginMessage = document.getElementById('login-message');

const produtosContainer = document.getElementById('products-container');

const addProductSection = document.getElementById('add-product-section');
const addProductForm = document.getElementById('add-product-form');
const showAddFormBtn = document.getElementById('show-add-form');
const cancelFormBtn = document.getElementById('cancel-form');

// Função para verificar login
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// Ajusta interface conforme login
function ajustarInterface() {
  if (isLoggedIn()) {
    btnLogin.style.display = 'none';
    loginUsername.style.display = 'none';
    loginPassword.style.display = 'none';
    loginMessage.textContent = '';

    btnLogout.style.display = 'inline-block';
    addProductSection.style.display = 'block';
  } else {
    btnLogin.style.display = 'inline-block';
    loginUsername.style.display = 'inline-block';
    loginPassword.style.display = 'inline-block';

    btnLogout.style.display = 'none';
    addProductSection.style.display = 'none';
  }
}

// Carregar produtos da API e exibir
async function carregarProdutos() {
  try {
    const res = await fetch(produtosEndpoint);
    if (!res.ok) throw new Error('Erro ao carregar produtos');
    const produtos = await res.json();
    exibirProdutos(produtos);
  } catch (err) {
    console.error(err);
    produtosContainer.innerHTML = '<p>Erro ao carregar produtos.</p>';
  }
}

// Exibe produtos no container, com botões de editar/excluir se admin
function exibirProdutos(produtos) {
  produtosContainer.innerHTML = '';
  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.innerHTML = `
      <img src="${produto.imagem || 'https://via.placeholder.com/150'}" alt="${produto.nome}" />
      <h3>${produto.nome}</h3>
      <p>${produto.descricao || ''}</p>
      <p><strong>R$ ${produto.preco.toFixed(2)}</strong></p>
      <p>Estoque: ${produto.estoque ?? 0}</p>
      <p>Categoria: ${produto.categoria ?? 'N/D'}</p>
      ${isLoggedIn() ? `
        <button class="button editar-produto" data-id="${produto._id}">Editar</button>
        <button class="button excluir-produto" data-id="${produto._id}">Excluir</button>
      ` : ''}
    `;
    produtosContainer.appendChild(card);
  });
}

// Login
btnLogin?.addEventListener('click', async () => {
  const email = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    loginMessage.textContent = 'Preencha usuário e senha.';
    return;
  }

  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.message || 'Login inválido';
      return;
    }

    localStorage.setItem('token', data.token);
    loginUsername.value = '';
    loginPassword.value = '';
    ajustarInterface();
    carregarProdutos();
  } catch {
    loginMessage.textContent = 'Erro ao conectar com o servidor.';
  }
});

// Logout
btnLogout?.addEventListener('click', () => {
  localStorage.removeItem('token');
  ajustarInterface();
  carregarProdutos();
});

// Mostrar formulário de adicionar produto
showAddFormBtn?.addEventListener('click', () => {
  addProductForm.classList.remove('hidden');
  addProductForm.reset();
  document.getElementById('productFormTitle').textContent = 'Adicionar Produto';
  document.getElementById('product-id').value = '';
});

// Cancelar formulário
cancelFormBtn?.addEventListener('click', () => {
  addProductForm.classList.add('hidden');
  addProductForm.reset();
});

// Envio do formulário (Adicionar ou Editar)
addProductForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('product-id').value;
  const nome = document.getElementById('name').value.trim();
  const descricao = document.getElementById('description').value.trim();
  const preco = parseFloat(document.getElementById('price').value);
  const imagem = document.getElementById('imageUrl').value.trim();
  const estoque = parseInt(document.getElementById('stock').value);
  const categoria = document.getElementById('category').value;

  const produtoData = { nome, descricao, preco, imagem, estoque, categoria };

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para adicionar ou editar produtos.');
      return;
    }

    let res;
    if (id) {
      // Editar produto
      res = await fetch(`${produtosEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(produtoData)
      });
    } else {
      // Adicionar produto
      res = await fetch(produtosEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(produtoData)
      });
    }

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.message || 'Erro ao salvar produto.');
      return;
    }

    addProductForm.classList.add('hidden');
    addProductForm.reset();
    carregarProdutos();

  } catch (err) {
    alert('Erro ao conectar com o servidor.');
  }
});

// Delegação de eventos para Editar e Excluir produtos na lista
produtosContainer.addEventListener('click', async (e) => {
  const target = e.target;
  const id = target.dataset.id;

  if (!id) return;

  // Editar produto: carregar dados no formulário
  if (target.classList.contains('editar-produto')) {
    try {
      const res = await fetch(`${produtosEndpoint}/${id}`);
      if (!res.ok) throw new Error('Erro ao buscar produto.');
      const produto = await res.json();

      document.getElementById('product-id').value = produto._id;
      document.getElementById('name').value = produto.nome;
      document.getElementById('description').value = produto.descricao;
      document.getElementById('price').value = produto.preco;
      document.getElementById('imageUrl').value = produto.imagem;
      document.getElementById('stock').value = produto.estoque ?? 0;
      document.getElementById('category').value = produto.categoria || '';

      addProductForm.classList.remove('hidden');
      document.getElementById('productFormTitle').textContent = 'Editar Produto';
    } catch {
      alert('Erro ao carregar dados do produto.');
    }
  }

  // Excluir produto
  if (target.classList.contains('excluir-produto')) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Você precisa estar logado para excluir produtos.');
        return;
      }

      const res = await fetch(`${produtosEndpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'Erro ao excluir produto.');
        return;
      }

      carregarProdutos();

    } catch {
      alert('Erro ao conectar com o servidor.');
    }
  }
});

// Inicializar
ajustarInterface();
carregarProdutos();
