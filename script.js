const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";

let currentPage = 1;
const PRODUCTS_PER_PAGE = 9;

async function fetchProducts(page = 1) {
  const category = document.getElementById("category-filter")?.value || "";
  const search = document.getElementById("search-input")?.value || "";
  const minPrice = document.getElementById("min-price")?.value || "";
  const maxPrice = document.getElementById("max-price")?.value || "";
  const minStock = document.getElementById("min-stock")?.value || "";

  const query = new URLSearchParams({
    category,
    search,
    minPrice,
    maxPrice,
    minStock,
    page,
    limit: PRODUCTS_PER_PAGE
  });

  try {
    const response = await fetch(`${API_BASE_URL}/products?${query}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao buscar produtos");
    }

    renderProducts(data.products);
    renderPagination(data.totalCount, page);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }
}

function renderProducts(products) {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image || "https://via.placeholder.com/150"}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description || ""}</p>
      <p>R$ ${product.price.toFixed(2)}</p>
      <button onclick="addToCart('${product._id}')">Adicionar ao carrinho</button>
    `;
    container.appendChild(card);
  });
}

function renderPagination(totalCount, currentPage) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      fetchProducts(i);
    });
    paginationContainer.appendChild(btn);
  }
}

function addToCart(productId) {
  console.log(`Produto ${productId} adicionado ao carrinho!`);
}

document.addEventListener("DOMContentLoaded", () => {
  // Carregar produtos iniciais
  fetchProducts(currentPage);

  // Disparar busca somente ao clicar no botão
  const searchBtn = document.getElementById("search-button");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      currentPage = 1;
      fetchProducts(currentPage);
    });
  }
});
