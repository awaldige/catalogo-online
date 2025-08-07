// script.js

const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";
let currentPage = 1;
let totalPages = 1;
let isAdmin = false;

function fetchProducts(page = 1) {
  const category = document.getElementById("category-filter").value;
  const search = document.getElementById("search-input").value.trim();
  const minPrice = document.getElementById("min-price-input").value;
  const maxPrice = document.getElementById("max-price-input").value;
  const minStock = document.getElementById("min-stock-input").value;

  const params = new URLSearchParams({
    page,
    category,
    search,
    minPrice,
    maxPrice,
    minStock,
  });

  fetch(`${API_BASE_URL}/products?${params.toString()}`)
    .then((res) => res.json())
    .then((data) => {
      displayProducts(data.products);
      setupPagination(data.totalPages, data.currentPage);
    })
    .catch((err) => console.error("Erro ao buscar produtos:", err));
}

function displayProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";
  if (products.length === 0) {
    container.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  products.forEach((product) => {
    const productEl = document.createElement("div");
    productEl.className = "product-card";
    productEl.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>Preço: R$ ${product.price.toFixed(2)}</p>
      <p>Estoque: ${product.stock}</p>
      <p>Categoria: ${product.category}</p>
    `;
    container.appendChild(productEl);
  });
}

function setupPagination(total, current) {
  totalPages = total;
  currentPage = current;

  const paginationEl = document.getElementById("pagination");
  paginationEl.innerHTML = "";

  for (let i = 1; i <= total; i++) {
    const btn = document.createElement("button");
    btn.className = `pagination-button ${i === current ? "active" : ""}`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      fetchProducts(i);
    });
    paginationEl.appendChild(btn);
  }
}

function toggleAdminPanel(show) {
  const adminSection = document.getElementById("add-product-section");
  const btnShow = document.getElementById("btnShowAdminPanel");
  const btnHide = document.getElementById("btnHideAdminPanel");

  if (show) {
    isAdmin = true;
    adminSection.style.display = "block";
    btnShow.style.display = "none";
    btnHide.style.display = "inline-block";
  } else {
    isAdmin = false;
    adminSection.style.display = "none";
    btnShow.style.display = "inline-block";
    btnHide.style.display = "none";
  }
}

function setupEventListeners() {
  document.getElementById("search-button").addEventListener("click", () => fetchProducts(1));
  document.getElementById("clear-search-button").addEventListener("click", () => {
    document.getElementById("category-filter").value = "all";
    document.getElementById("search-input").value = "";
    document.getElementById("min-price-input").value = "";
    document.getElementById("max-price-input").value = "";
    document.getElementById("min-stock-input").value = "";
    fetchProducts(1);
  });

  document.getElementById("btnShowAdminPanel").addEventListener("click", () => toggleAdminPanel(true));
  document.getElementById("btnHideAdminPanel").addEventListener("click", () => toggleAdminPanel(false));

  document.getElementById("cancel-form").addEventListener("click", () => {
    document.getElementById("add-product-form").reset();
    document.getElementById("add-product-form").classList.add("hidden");
  });

  document.getElementById("show-add-form").addEventListener("click", () => {
    document.getElementById("add-product-form").classList.remove("hidden");
    document.getElementById("productFormTitle").textContent = "Adicionar Produto";
  });

  document.getElementById("add-product-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Acesso não autorizado");

    const id = document.getElementById("product-id").value;
    const product = {
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      price: parseFloat(document.getElementById("price").value),
      imageUrl: document.getElementById("imageUrl").value,
      stock: parseInt(document.getElementById("stock").value),
      category: document.getElementById("category").value,
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then((res) => res.json())
      .then(() => {
        fetchProducts(currentPage);
        document.getElementById("add-product-form").reset();
        document.getElementById("add-product-form").classList.add("hidden");
      })
      .catch((err) => console.error("Erro ao salvar produto:", err));
  });
}

document.getElementById("current-year").textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  fetchProducts();
});
