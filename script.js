document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";

  // Elementos admin toggle
  const btnShowAdminPanel = document.getElementById("btnShowAdminPanel");
  const btnHideAdminPanel = document.getElementById("btnHideAdminPanel");
  const addProductSection = document.getElementById("add-product-section");

  btnShowAdminPanel.addEventListener("click", () => {
    addProductSection.style.display = "block";
    btnShowAdminPanel.style.display = "none";
    btnHideAdminPanel.style.display = "inline-block";
    toggleAdminButtons(); 
  });

  btnHideAdminPanel.addEventListener("click", () => {
    addProductSection.style.display = "none";
    btnShowAdminPanel.style.display = "inline-block";
    btnHideAdminPanel.style.display = "none";
    toggleAdminButtons();
  });

  // Controle produtos e filtros
  const productsContainer = document.getElementById("products-container");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const clearSearchButton = document.getElementById("clear-search-button");
  const categoryFilterSelect = document.getElementById("category-filter");
  const minPriceInput = document.getElementById("min-price-input");
  const maxPriceInput = document.getElementById("max-price-input");
  const minStockInput = document.getElementById("min-stock-input");
  const paginationControls = document.getElementById("pagination");
  const productsPerPage = 9;
  let currentPage = 1;

  // Formulário admin
  const showAddFormButton = document.getElementById("show-add-form");
  const addProductForm = document.getElementById("add-product-form");
  const cancelFormButton = document.getElementById("cancel-form");
  const productIdInput = document.getElementById("product-id");
  const nameInput = document.getElementById("name");
  const descriptionInput = document.getElementById("description");
  const priceInput = document.getElementById("price");
  const imageUrlInput = document.getElementById("imageUrl");
  const stockInput = document.getElementById("stock");
  const categoryInput = document.getElementById("category");
  const productFormTitle = document.getElementById("productFormTitle");

  // Carrinho
  const shoppingCartSection = document.getElementById("shopping-cart-section");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const cartItemCountSpan = document.getElementById("cart-item-count");
  const cartTotalSpan = document.getElementById("cart-total");
  const clearCartButton = document.getElementById("clear-cart-button");
  const checkoutButton = document.getElementById("checkout-button");

  let cart = [];

  // Estado filtros
  let currentSearchTerm = "";
  let currentCategoryFilter = "all";
  let currentMinPrice = "";
  let currentMaxPrice = "";
  let currentMinStock = "";

  // --- Funções do carrinho ---
  function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      cart = JSON.parse(storedCart);
    }
    renderCart();
  }

  function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
      emptyCartMessage.style.display = "block";
      shoppingCartSection.classList.add("hidden");
    } else {
      emptyCartMessage.style.display = "none";
      shoppingCartSection.classList.remove("hidden");

      cart.forEach((item) => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("cart-item");
        cartItemDiv.innerHTML = `
                <img src="${item.imageUrl || "https://via.placeholder.com/80x80?text=Produto"}" alt="${item.name}" loading="lazy">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Preço unitário: R$ ${item.price ? item.price.toFixed(2).replace(".", ",") : "0,00"}</p>
                    <div class="quantity-controls">
                        <button class="button-small quantity-minus" data-id="${item._id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="button-small quantity-plus" data-id="${item._id}" data-stock="${item.stock}">+</button>
                    </div>
                    <p>Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</p>
                </div>
                <button class="button-small button-danger remove-from-cart" data-id="${item._id}">Remover</button>
            `;
        cartItemsContainer.appendChild(cartItemDiv);
      });
    }
    updateCartSummary();
  }

  function updateCartSummary() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartItemCountSpan.textContent = totalItems;
    cartTotalSpan.textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;
    clearCartButton.disabled = cart.length === 0;
    checkoutButton.disabled = cart.length === 0;
  }

  function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex((item) => item._id === productId);
    if (itemIndex === -1) return;
    const item = cart[itemIndex];
    const newQuantity = item.quantity + change;
    if (change > 0 && newQuantity > item.stock) {
      alert(`Estoque insuficiente: ${item.stock} disponível.`);
      return;
    }
    if (newQuantity > 0) item.quantity = newQuantity;
    else cart.splice(itemIndex, 1);
    saveCartToLocalStorage();
  }

  function removeItemFromCart(productId) {
    cart = cart.filter((item) => item._id !== productId);
    saveCartToLocalStorage();
  }

  async function addProductToCart(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      const productToAdd = await response.json();
      if (productToAdd.stock <= 0) {
        alert(`"${productToAdd.name}" está fora de estoque.`);
        return;
      }
      const existingItem = cart.find((item) => item._id === productId);
      if (existingItem) {
        if (existingItem.quantity < productToAdd.stock) {
          existingItem.quantity++;
          alert(`Quantidade atualizada!`);
        } else {
          alert(`Estoque máximo atingido.`);
          return;
        }
      } else {
        cart.push({ ...productToAdd, quantity: 1 });
        alert(`Adicionado ao carrinho!`);
      }
      saveCartToLocalStorage();
    } catch (error) {
      console.error("Erro no carrinho:", error);
    }
  }

  // --- Funções dos produtos e filtros ---
  async function fetchProducts() {
    try {
      // Feedback visual de carregamento
      productsContainer.innerHTML = '<p class="info-message">Carregando catálogo...</p>';
      
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
      const products = data.products;
      const totalCount = data.totalCount;
      const totalPages = Math.ceil(totalCount / productsPerPage);

      productsContainer.innerHTML = "";

      if (!Array.isArray(products) || products.length === 0) {
        productsContainer.innerHTML = '<p class="info-message">Nenhum produto encontrado.</p>';
      } else {
        products.forEach((product) => {
          const productCard = document.createElement("div");
          productCard.classList.add("product-card");
          
          // OTIMIZAÇÃO DE IMAGEM: Lazy Loading + Decoding Async + Error Handler
          productCard.innerHTML = `
                    <div class="product-image-container">
                      <img src="${product.imageUrl || "https://via.placeholder.com/280x200?text=Sem+Imagem"}" 
                           alt="${product.name}" 
                           loading="lazy"
                           decoding="async"
                           onerror="this.onerror=null;this.src='https://via.placeholder.com/280x200?text=Erro+Imagem';">
                    </div>
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <p>${product.description || "Nenhuma descrição disponível."}</p>
                        <p class="price">R$ ${product.price ? product.price.toFixed(2).replace(".", ",") : "0,00"}</p>
                        <p>Estoque: ${product.stock !== undefined ? product.stock : "N/A"}</p>
                        <p>Categoria: ${product.category || "Geral"}</p>
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
      productsContainer.innerHTML = '<p class="error-message">Erro ao conectar com o servidor. Tente atualizar a página.</p>';
    }
  }

  function renderPaginationControls(totalPages) {
    paginationControls.innerHTML = "";
    if (totalPages <= 1) return;

    const createBtn = (text, targetPage, disabled = false, active = false) => {
      const btn = document.createElement("button");
      btn.classList.add("pagination-button");
      if (active) btn.classList.add("active");
      btn.textContent = text;
      btn.disabled = disabled;
      btn.addEventListener("click", () => {
        currentPage = targetPage;
        fetchProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return btn;
    };

    paginationControls.appendChild(createBtn("Anterior", currentPage - 1, currentPage === 1));

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        paginationControls.appendChild(createBtn(i, i, false, i === currentPage));
      }
    }

    paginationControls.appendChild(createBtn("Próximo", currentPage + 1, currentPage === totalPages));
  }

  function toggleAdminButtons() {
    const isAdmin = addProductSection.style.display === "block";
    document.querySelectorAll("[id^='actions-']").forEach(div => {
      div.style.display = isAdmin ? "flex" : "none";
    });
  }

  function showForm(product = null) {
    addProductForm.style.display = "flex";
    showAddFormButton.style.display = "none";
    addProductForm.reset();
    if (product) {
      productIdInput.value = product._id;
      nameInput.value = product.name;
      descriptionInput.value = product.description;
      priceInput.value = product.price;
      imageUrlInput.value = product.imageUrl;
      stockInput.value = product.stock;
      categoryInput.value = product.category || "";
      productFormTitle.textContent = "Editar Produto";
    } else {
      productIdInput.value = "";
      productFormTitle.textContent = "Adicionar Novo Produto";
    }
  }

  function hideForm() {
    addProductForm.style.display = "none";
    showAddFormButton.style.display = "inline-block";
    productIdInput.value = "";
  }

  showAddFormButton.addEventListener("click", () => showForm());
  cancelFormButton.addEventListener("click", hideForm);

  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = productIdInput.value;
    const url = id ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
    const productData = {
      name: nameInput.value,
      description: descriptionInput.value,
      price: parseFloat(priceInput.value),
      imageUrl: imageUrlInput.value,
      stock: parseInt(stockInput.value, 10),
      category: categoryInput.value,
    };

    try {
      const response = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        alert("Sucesso!");
        hideForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  });

  window.editProduct = async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const product = await res.json();
    showForm(product);
  };

  window.deleteProduct = async (id) => {
    if (confirm("Excluir produto?")) {
      await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  function applyAllFiltersAndFetch() {
    currentPage = 1;
    currentSearchTerm = searchInput.value.trim();
    currentCategoryFilter = categoryFilterSelect.value;
    currentMinPrice = minPriceInput.value;
    currentMaxPrice = maxPriceInput.value;
    currentMinStock = minStockInput.value;
    fetchProducts();
  }

  searchButton.addEventListener("click", applyAllFiltersAndFetch);
  clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilterSelect.value = "all";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    minStockInput.value = "";
    applyAllFiltersAndFetch();
  });

  // Event Delegation para Carrinho
  productsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-button")) {
      addProductToCart(e.target.dataset.productId);
    }
  });

  cartItemsContainer.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains("quantity-plus")) updateQuantity(id, 1);
    else if (e.target.classList.contains("quantity-minus")) updateQuantity(id, -1);
    else if (e.target.classList.contains("remove-from-cart")) removeItemFromCart(id);
  });

  // Inicialização
  loadCartFromLocalStorage();
  fetchProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
