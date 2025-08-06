const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";

const productsContainer = document.getElementById("products-container");
const paginationControls = document.getElementById("pagination-controls");
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filter-category");
const filterMinPrice = document.getElementById("filter-min-price");
const filterMaxPrice = document.getElementById("filter-max-price");
const filterMinStock = document.getElementById("filter-min-stock");

let currentPage = 1;
const productsPerPage = 9;
let currentSearchTerm = "";
let currentCategoryFilter = "all";
let currentMinPrice = "";
let currentMaxPrice = "";
let currentMinStock = "";

async function fetchProducts() {
  try {
    let url = `${API_BASE_URL}/products`;
    const params = new URLSearchParams();

    params.append("page", currentPage);
    params.append("limit", productsPerPage);

    if (currentSearchTerm) params.append("search", currentSearchTerm);
    if (currentCategoryFilter !== "all") params.append("category", currentCategoryFilter);
    if (currentMinPrice) params.append("minPrice", currentMinPrice);
    if (currentMaxPrice) params.append("maxPrice", currentMaxPrice);
    if (currentMinStock) params.append("minStock", currentMinStock);

    url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    const data = await response.json();

    const products = data.products || [];
    const totalCount = data.totalCount || 0;
    const totalPages = Math.ceil(totalCount / productsPerPage);

    productsContainer.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      if (
        currentSearchTerm ||
        currentCategoryFilter !== "all" ||
        currentMinPrice ||
        currentMaxPrice ||
        currentMinStock
      ) {
        productsContainer.innerHTML =
          '<p class="info-message">Nenhum produto encontrado com os filtros aplicados.</p>';
      } else {
        productsContainer.innerHTML =
          "<p class='info-message'>Nenhum produto cadastrado ainda. Adicione um!</p>";
      }
    } else {
      products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
          <img src="${product.imageUrl || "https://via.placeholder.com/280x200?text=Produto+Sem+Imagem"}" alt="${product.name}">
          <div class="product-card-content">
              <h3>${product.name}</h3>
              <p>${product.description || "Nenhuma descrição disponível."}</p>
              <p class="price">R$ ${product.price ? product.price.toFixed(2).replace(".", ",") : "0,00"}</p>
              <p>Estoque: ${product.stock !== undefined ? product.stock : "N/A"}</p>
              <p>Categoria: ${product.category || "Não especificada"}</p>
              <div class="product-actions" style="display: none;" id="actions-${product._id}">
                  <button class="button button-secondary" onclick="editProduct('${product._id}')">Editar</button>
                  <button class="button button-danger" onclick="deleteProduct('${product._id}')">Excluir</button>
              </div>
              <button class="button button-primary add-to-cart-button" data-product-id="${product._id}">Adicionar ao Carrinho</button>
          </div>
        `;
        productsContainer.appendChild(productCard);
      });

      toggleAdminButtons();
    }

    renderPaginationControls(totalPages);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    productsContainer.innerHTML =
      '<p class="error-message">Erro ao carregar produtos. Verifique se o servidor está rodando.</p>';
    paginationControls.innerHTML = "";
  }
}

function renderPaginationControls(totalPages) {
  paginationControls.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.classList.add("pagination-button");
    if (i === currentPage) button.classList.add("active");
    button.addEventListener("click", () => {
      currentPage = i;
      fetchProducts();
    });
    paginationControls.appendChild(button);
  }
}

// Filtros
searchInput.addEventListener("input", () => {
  currentSearchTerm = searchInput.value.trim();
  currentPage = 1;
  fetchProducts();
});

filterCategory.addEventListener("change", () => {
  currentCategoryFilter = filterCategory.value;
  currentPage = 1;
  fetchProducts();
});

filterMinPrice.addEventListener("input", () => {
  currentMinPrice = filterMinPrice.value.trim();
  currentPage = 1;
  fetchProducts();
});

filterMaxPrice.addEventListener("input", () => {
  currentMaxPrice = filterMaxPrice.value.trim();
  currentPage = 1;
  fetchProducts();
});

filterMinStock.addEventListener("input", () => {
  currentMinStock = filterMinStock.value.trim();
  currentPage = 1;
  fetchProducts();
});

function toggleAdminButtons() {
  const token = localStorage.getItem("token");
  const adminButtons = document.querySelectorAll(".product-actions");
  adminButtons.forEach((div) => {
    div.style.display = token ? "block" : "none";
  });
}

// Inicialização
fetchProducts();
