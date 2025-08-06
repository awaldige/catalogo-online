const API_URL = 'https://catalogo-backend-e14g.onrender.com';
const PRODUCTS_PER_PAGE = 9;

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let isAdmin = false;
let token = null;

// Utilitários
const formatPrice = price => `R$ ${price.toFixed(2).replace('.', ',')}`;

function showSection(sectionId) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

function updateYear() {
  document.getElementById('current-year').textContent = new Date().getFullYear();
}

function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const selectedCategory = document.getElementById('category-filter').value;
  const minPrice = parseFloat(document.getElementById('min-price-input').value) || 0;
  const maxPrice = parseFloat(document.getElementById('max-price-input').value) || Infinity;
  const minStock = parseInt(document.getElementById('min-stock-input').value) || 0;

  filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    const matchesStock = product.stock >= minStock;
    return matchesCategory && matchesSearch && matchesPrice && matchesStock;
  });

  currentPage = 1;
  renderProducts();
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.add('pagination-btn');
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      renderProducts();
      renderPagination();
    });
    pagination.appendChild(btn);
  }
}

function renderProducts() {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, end);

  if (pageProducts.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  pageProducts.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-card';

    productDiv.innerHTML = `
      <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description || ''}</p>
      <p class="price">${formatPrice(product.price)}</p>
      <p class="stock">Estoque: ${product.stock}</p>
      ${isAdmin ? `
        <div class="admin-actions">
          <button class="edit-button" data-id="${product._id}">Editar</button>
          <button class="delete-button" data-id="${product._id}">Excluir</button>
        </div>
      ` : `
        <button class="add-to-cart-button" data-id="${product._id}">Adicionar ao Carrinho</button>
      `}
    `;
    container.appendChild(productDiv);
  });
}

// Eventos
document.getElementById('search-button').addEventListener('click', applyFilters);
document.getElementById('clear-search-button').addEventListener('click', () => {
  document.getElementById('search-input').value = '';
  document.getElementById('category-filter').value = 'all';
  document.getElementById('min-price-input').value = '';
  document.getElementById('max-price-input').value = '';
  document.getElementById('min-stock-input').value = '';
  applyFilters();
});

document.getElementById('btnShowAdminPanel').addEventListener('click', () => {
  isAdmin = true;
  document.getElementById('btnShowAdminPanel').style.display = 'none';
  document.getElementById('btnHideAdminPanel').style.display = 'inline-block';
  document.getElementById('add-product-section').style.display = 'block';
  renderProducts();
});

document.getElementById('btnHideAdminPanel').addEventListener('click', () => {
  isAdmin = false;
  document.getElementById('btnShowAdminPanel').style.display = 'inline-block';
  document.getElementById('btnHideAdminPanel').style.display = 'none';
  document.getElementById('add-product-section').style.display = 'none';
  renderProducts();
});

// Inicialização
async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/produtos`);
    const data = await response.json();
    allProducts = data.reverse(); // produtos mais recentes primeiro
    filteredProducts = [...allProducts];
    renderProducts();
    renderPagination();
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateYear();
  fetchProducts();
});
