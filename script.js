// script.js
const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";
const productsContainer = document.getElementById("products-container");
const paginationContainer = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const minPriceInput = document.getElementById("min-price-input");
const maxPriceInput = document.getElementById("max-price-input");
const minStockInput = document.getElementById("min-stock-input");
const searchButton = document.getElementById("search-button");
const clearSearchButton = document.getElementById("clear-search-button");

let currentPage = 1;
const PRODUCTS_PER_PAGE = 9;

async function getProducts(page = 1) {
  currentPage = page;
  let url = `${API_BASE_URL}/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`;

  // Adiciona filtros
  const search = searchInput.value.trim();
  const category = categoryFilter.value;
  const minPrice = minPriceInput.value;
  const maxPrice = maxPriceInput.value;
  const minStock = minStockInput.value;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category && category !== "all") params.append("category", category);
  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);
  if (minStock) params.append("minStock", minStock);

  if ([...params].length > 0) {
    url += `&${params.toString()}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data.products)) {
      productsContainer.innerHTML = "<p>Nenhum produto encontrado.</p>";
      paginationContainer.innerHTML = "";
      return;
    }

    renderProducts(data.products);
    renderPagination(data.totalPages, data.currentPage);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    productsContainer.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

function renderProducts(products) {
  productsContainer.innerHTML = "";
  if (products.length === 0) {
    productsContainer.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>R$ ${product.price.toFixed(2)}</strong></p>
      <p>Estoque: ${product.stock}</p>
      <p>Categoria: ${product.category}</p>
    `;
    productsContainer.appendChild(card);
  });
}

function renderPagination(totalPages, currentPage) {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  for (let page = 1; page <= totalPages; page++) {
    const btn = document.createElement("button");
    btn.textContent = page;
    btn.className = "page-btn";
    if (page === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => getProducts(page));
    paginationContainer.appendChild(btn);
  }
}

searchButton.addEventListener("click", () => getProducts(1));
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "all";
  minPriceInput.value = "";
  maxPriceInput.value = "";
  minStockInput.value = "";
  getProducts(1);
});

document.addEventListener("DOMContentLoaded", () => {
  getProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
