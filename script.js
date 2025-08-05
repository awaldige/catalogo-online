const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com';

let carrinho = [];
let currentPage = 1;
let totalPages = 1;
const limit = 9;
let editandoProdutoId = null;

function salvarCarrinho() { localStorage.setItem('carrinho', JSON.stringify(carrinho)); }
function carregarCarrinho() {
  const dados = localStorage.getItem('carrinho');
  if (dados) carrinho = JSON.parse(dados);
}

function estaLogado() {
  return !!localStorage.getItem('token');
}

function mostrarOcultarAdmin() {
  const btnAdd = document.getElementById('show-add-form');
  const botoesEditar = document.querySelectorAll('.button-secondary');
  if (estaLogado()) {
    btnAdd.style.display = 'inline-block';
    botoesEditar.forEach(btn => btn.style.display = 'inline-block');
  } else {
    btnAdd.style.display = 'none';
    botoesEditar.forEach(btn => btn.style.display = 'none');
  }
}

async function fetchProdutos(queryParams = '') {
  const url = `${API_BASE_URL}/api/products${queryParams}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.status}`);
    const data = await response.json();
    currentPage = parseInt(new URLSearchParams(queryParams).get('page')) || 1;
    totalPages = Math.ceil((data.totalCount || data.products.length) / limit);
    renderProdutos(data.products || []);
    renderPaginacao();
  } catch (err) {
    console.error(err);
    document.getElementById('products-container').innerHTML =
      '<p class="error-message">Erro ao carregar produtos.</p>';
    document.getElementById('pagination').innerHTML = '';
  }
}

function renderProdutos(produtos) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  if (!produtos || produtos.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }
  produtos.forEach(produto => {
    const item = document.createElement('div');
    item.className = 'product-card';
    const safeName = produto.name.replace(/'/g, "\\'");
    const produtoJson = JSON.stringify(produto).replace(/'/g, "\\'");
    item.innerHTML = `
      <img src="${produto.imageUrl || 'https://via.placeholder.com/280x200?text=Sem+Imagem'}" alt="${produto.name}">
      <h3>${produto.name}</h3>
      <p>${produto.description || ''}</p>
      <p><strong>R$ ${produto.price.toFixed(2)}</strong></p>
      <p>Estoque: ${produto.stock ?? 0}</p>
      <button onclick="adicionarAoCarrinho('${produto._id}','${safeName}',${produto.price},'${produto.imageUrl||''}')">Adicionar ao Carrinho</button>
      <button class="button button-secondary" onclick='iniciarEdicaoProduto(${produtoJson})'>Editar</button>
    `;
    container.appendChild(item);
  });
  mostrarOcultarAdmin();
}

function renderPaginacao() {
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  if (totalPages <= 1) return;
  const navBtn = num => {
    const b = document.createElement('button');
    b.className = 'pagination-button'; b.textContent = num;
    if (num === currentPage) { b.disabled = true; b.classList.add('active'); }
    b.onclick = () => { currentPage = num; buscarComFiltros(num); };
    return b;
  };
  pag.appendChild(navBtn('Anterior', null));
  for (let i = 1; i <= totalPages; i++) pag.appendChild(navBtn(i));
  pag.appendChild(navBtn('Próximo', null));
}

function buscarComFiltros(page = 1) {
  const cat = document.getElementById('category-filter').value;
  const nome = document.getElementById('search-input').value.trim();
  const minP = document.getElementById('min-price-input').value;
  const maxP = document.getElementById('max-price-input').value;
  const minS = document.getElementById('min-stock-input').value;
  let q = `?page=${page}&limit=${limit}&`;
  if (cat !== 'all') q += `category=${encodeURIComponent(cat)}&`;
  if (nome) q += `search=${encodeURIComponent(nome)}&`;
  if (minP) q += `minPrice=${minP}&`;
  if (maxP) q += `maxPrice=${maxP}&`;
  if (minS) q += `minStock=${minS}&`;
  fetchProdutos(q);
}

function adicionarAoCarrinho(id, nome, preco, imagem) {
  const item = carrinho.find(i => i.id === id);
  if (item) item.quantidade++;
  else carrinho.push({ id, nome, preco, imagem, quantidade:1 });
  salvarCarrinho(); atualizarCarrinho(); mostrarCarrinho();
}

function atualizarCarrinho() {
  // igual...
}

function removerDoCarrinho(id) { /* igual... */ }
function mostrarCarrinho() { /* igual... */ }
function esconderCarrinho() { /* igual... */ }

document.getElementById('clear-cart-button').onclick = () => {
  carrinho = []; salvarCarrinho(); atualizarCarrinho(); esconderCarrinho();
};
document.getElementById('checkout-button').onclick = () => {
  if (carrinho.length === 0) return alert('Carrinho vazio');
  alert('Compra finalizada');
  carrinho = []; salvarCarrinho(); atualizarCarrinho(); esconderCarrinho();
};
document.getElementById('search-button').onclick = () => { buscarComFiltros(1); };
document.getElementById('clear-search-button').onclick = () => {
  ['search-input','min-price-input','max-price-input','min-stock-input'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('category-filter').value = 'all';
  buscarComFiltros(1);
};

document.getElementById('show-add-form').onclick = () => {
  editandoProdutoId = null;
  formAddProduct.style.display = 'flex';
  titleForm.textContent = 'Adicionar Produto';
};

document.getElementById('cancel-form').onclick = () => {
  formAddProduct.style.display = 'none'; resetarFormulario();
};

// FORM submit: usar headers com token
formAddProduct.onsubmit = async e => {
  e.preventDefault();
  const produto = {
    name: name.value.trim(),
    description: description.value.trim(),
    price: parseFloat(price.value),
    imageUrl: imageUrl.value.trim(),
    stock: parseInt(stock.value)||0,
    category: category.value
  };
  if (!produto.name||!produto.category) return alert('Preencha Nome e Categoria');
  const token = localStorage.getItem('token');
  if (!token) return alert('Você precisa estar logado');
  const headers = {
    'Content-Type':'application/json',
    'Authorization':`Bearer ${token}`
  };
  const url = editandoProdutoId
    ? `${API_BASE_URL}/api/products/${editandoProdutoId}`
    : `${API_BASE_URL}/api/products`;
  const method = editandoProdutoId ? 'PUT' : 'POST';
  const res = await fetch(url, { method, headers, body: JSON.stringify(produto) });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    return alert(err.message || 'Erro');
  }
  alert(editandoProdutoId?'Atualizado':'Adicionado');
  formAddProduct.style.display='none'; resetarFormulario(); buscarComFiltros(currentPage);
};

document.getElementById('btnLogin').onclick = async () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username||!password) return loginMessage.textContent='Preencha email e senha.';
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email: username, password })
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) return loginMessage.textContent = data.message||'Erro login';
  localStorage.setItem('token', data.token);
  loginMessage.textContent=''; loginUsername.value=''; loginPassword.value='';
  atualizarInterfaceLogin();
  buscarComFiltros(currentPage);
  alert('Login efetuado!');
};

document.getElementById('btnLogout').onclick = () => {
  localStorage.removeItem('token');
  atualizarInterfaceLogin();
  alert('Logout realizado');
};

function atualizarInterfaceLogin() {
  const logged = estaLogado();
  [loginUsername, loginPassword, btnLogin].forEach(el => el.style.display = logged?'none':'inline-block');
  btnLogout.style.display = logged?'inline-block':'none';
  mostrarOcultarAdmin();
}

window.addEventListener('DOMContentLoaded', () => {
  carregarCarrinho();
  if (carrinho.length===0) esconderCarrinho();
  mostrarOcultarAdmin();
  atualizarInterfaceLogin();
  buscarComFiltros(currentPage);
});
