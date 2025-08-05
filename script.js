const apiBase = 'https://catalogo-backend-e14g.onrender.com/api';
const produtosEndpoint = `${apiBase}/produtos`;

const authSection = document.getElementById('auth-section');
const loginMessage = document.getElementById('login-message');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const produtosContainer = document.getElementById('products-container');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const searchButton = document.getElementById('search-button');
const clearSearchButton = document.getElementById('clear-search-button');

const addProductSection = document.getElementById('add-product-section');
const addProductForm = document.getElementById('add-product-form');
const showAddFormBtn = document.getElementById('show-add-form');
const cancelFormBtn = document.getElementById('cancel-form');

let produtos = [];
let currentPage = 1;
const itemsPerPage = 6;

function isAdmin() {
  return !!localStorage.getItem('token');
}

function ajustarInterface() {
  if (isAdmin()) {
    authSection.style.display = 'none';
    btnLogout.style.display = 'inline-block';
    addProductSection.style.display = 'block';
    carregarProdutos();
  } else {
    authSection.style.display = 'block';
    btnLogout.style.display = 'none';
    addProductSection.style.display = 'none';
    produtosContainer.innerHTML = '<p>Faça login para ver os produtos.</p>';
  }
}

// Função para carregar produtos do backend e armazenar localmente
async function carregarProdutos() {
  try {
    const res = await fetch(produtosEndpoint);
    if (!res.ok) throw new Error('Erro ao carregar produtos');

    produtos = await res.json();
    currentPage = 1;
    mostrarProdutosComFiltro();
  } catch (err) {
    produtosContainer.innerHTML = `<p style="color:red;">Erro ao carregar produtos: ${err.message}</p>`;
  }
}

// Mostrar produtos com filtros e paginação
function mostrarProdutosComFiltro() {
  let filtroCategoria = categoryFilter.value;
  let filtroBusca = searchInput.value.trim().toLowerCase();

  let filtrados = produtos.filter(produto => {
    const nomeDesc = (produto.nome + ' ' + produto.descricao).toLowerCase();
    let categoriaOk = filtroCategoria === 'all' || produto.categoria === filtroCategoria;
    let buscaOk = nomeDesc.includes(filtroBusca);
    return categoriaOk && buscaOk;
  });

  // Paginação
  const totalPages = Math.ceil(filtrados.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;

  const inicio = (currentPage - 1) * itemsPerPage;
  const fim = inicio + itemsPerPage;
  const paginados = filtrados.slice(inicio, fim);

  exibirProdutos(paginados);
  montarPaginacao(totalPages);
}

function exibirProdutos(lista) {
  produtosContainer.innerHTML = '';
  if (lista.length === 0) {
    produtosContainer.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }
  lista.forEach(produto => {
    const div = document.createElement('div');
    div.className = 'produto-card';
    div.innerHTML = `
      <img src="${produto.imagem || 'https://via.placeholder.com/150'}" alt="${produto.nome}"/>
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      <p><strong>R$ ${produto.preco.toFixed(2)}</strong></p>
      ${isAdmin() ? `
        <button class="button editar-produto" data-id="${produto._id}">Editar</button>
        <button class="button excluir-produto" data-id="${produto._id}">Excluir</button>
      ` : ''}
    `;
    produtosContainer.appendChild(div);
  });
}

function montarPaginacao(totalPages) {
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = (i === currentPage) ? 'button button-primary' : 'button button-secondary';
    btn.addEventListener('click', () => {
      currentPage = i;
      mostrarProdutosComFiltro();
    });
    paginationDiv.appendChild(btn);
  }
}

// Eventos de busca
searchButton.addEventListener('click', () => {
  currentPage = 1;
  mostrarProdutosComFiltro();
});

clearSearchButton.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = 'all';
  currentPage = 1;
  mostrarProdutosComFiltro();
});

// Login
btnLogin.addEventListener('click', async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    loginMessage.textContent = 'Preencha usuário e senha.';
    return;
  }

  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      loginMessage.textContent = data.message || 'Usuário ou senha inválidos';
      return;
    }

    localStorage.setItem('token', data.token);
    loginMessage.textContent = '';
    ajustarInterface();
  } catch {
    loginMessage.textContent = 'Erro ao conectar com o servidor.';
  }
});

// Logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('token');
  ajustarInterface();
});

// Mostrar formulário adicionar produto
showAddFormBtn.addEventListener('click', () => {
  limparFormulario();
  addProductForm.classList.remove('hidden');
  showAddFormBtn.style.display = 'none';
});

// Cancelar formulário
cancelFormBtn.addEventListener('click', () => {
  addProductForm.classList.add('hidden');
  showAddFormBtn.style.display = 'inline-block';
});

// Submeter formulário adicionar/editar produto
addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('product-id').value;
  const nome = document.getElementById('name').value.trim();
  const descricao = document.getElementById('description').value.trim();
  const preco = parseFloat(document.getElementById('price').value);
  const imagem = document.getElementById('imageUrl').value.trim();
  const estoque = parseInt(document.getElementById('stock').value);
  const categoria = document.getElementById('category').value;

  if (!nome || !preco || !categoria) {
    alert('Preencha nome, preço e categoria');
    return;
  }

  const produtoData = { nome, descricao, preco, imagem, estoque, categoria };

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Não autenticado');

    let res;
    if (id) {
      // Editar
      res = await fetch(`${produtosEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(produtoData)
      });
    } else {
      // Criar
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
      const err = await res.json();
      alert(err.message || 'Erro ao salvar produto');
      return;
    }

    alert('Produto salvo com sucesso!');
    addProductForm.classList.add('hidden');
    showAddFormBtn.style.display = 'inline-block';
    carregarProdutos();

  } catch (err) {
    alert('Erro: ' + err.message);
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

// Delegação de eventos para editar e excluir produtos
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('editar-produto')) {
    const id = e.target.dataset.id;
    const produto = produtos.find(p => p._id === id);
    if (!produto) return alert('Produto não encontrado');

    document.getElementById('product-id').value = produto._id;
    document.getElementById('name').value = produto.nome;
    document.getElementById('description').value = produto.descricao;
    document.getElementById('price').value = produto.preco;
    document.getElementById('imageUrl').value = produto.imagem || '';
    document.getElementById('stock').value = produto.estoque || 0;
    document.getElementById('category').value = produto.categoria;

    addProductForm.classList.remove('hidden');
    showAddFormBtn.style.display = 'none';

  } else if (e.target.classList.contains('excluir-produto')) {
    const id = e.target.dataset.id;
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Não autenticado');

      const res = await fetch(`${produtosEndpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Erro ao excluir produto');
        return;
      }

      alert('Produto excluído com sucesso!');
      carregarProdutos();

    } catch (err) {
      alert('Erro: ' + err.message);
    }
  }
});

// Atualiza ano no rodapé
document.getElementById('current-year').textContent = new Date().getFullYear();

// Inicializa interface
ajustarInterface();
