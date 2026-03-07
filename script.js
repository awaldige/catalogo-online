document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";

  // --- CONFIGURAÇÃO WHATSAPP ---
  const SEU_TELEFONE = "5511999999999"; // Substitua pelo seu número (DDI + DDD + Numero)

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
      shoppingCartSection.classList.add("hidden"); // Esconde se vazio
    } else {
      emptyCartMessage.style.display = "none";
      shoppingCartSection.classList.remove("hidden"); // Mostra se tiver itens

      cart.forEach((item) => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("cart-item");
        cartItemDiv.innerHTML = `
                <img src="${item.imageUrl || "https://via.placeholder.com/80x80?text=Produto"}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>R$ ${item.price ? item.price.toFixed(2).replace(".", ",") : "0,00"}</p>
                    <div class="quantity-controls">
                        <button class="button-small quantity-minus" data-id="${item._id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="button-small quantity-plus" data-id="${item._id}" data-stock="${item.stock}">+</button>
                    </div>
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
    
    if(cartItemCountSpan) cartItemCountSpan.textContent = totalItems;
    if(cartTotalSpan) cartTotalSpan.textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;
    
    // Habilita ou desabilita botões
    if(clearCartButton) clearCartButton.disabled = cart.length === 0;
    if(checkoutButton) checkoutButton.disabled = cart.length === 0;
  }

  function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex((item) => item._id === productId);
    if (itemIndex === -1) return;
    const item = cart[itemIndex];
    const newQuantity = item.quantity + change;
    if (change > 0 && newQuantity > item.stock) {
      alert(`Estoque insuficiente!`);
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

  // --- BOTÕES DE AÇÃO DO CARRINHO (ESVAZIAR E FINALIZAR) ---
  
  // Esvaziar
  if (clearCartButton) {
    clearCartButton.onclick = () => {
      if (confirm("Deseja limpar todo o carrinho?")) {
        cart = [];
        saveCartToLocalStorage();
      }
    };
  }

  // Finalizar (WhatsApp)
  if (checkoutButton) {
    checkoutButton.onclick = () => {
      if (cart.length === 0) return;

      let mensagem = `*Novo Pedido - Catálogo André Waldige*\n\n`;
      cart.forEach(item => {
        mensagem += `• ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      });
      
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      mensagem += `\n*Total: R$ ${total.toFixed(2).replace(".", ",")}*`;

      const encodedMsg = encodeURIComponent(mensagem);
      window.open(`https://wa.me/${SEU_TELEFONE}?text=${encodedMsg}`, '_blank');
      
      // Opcional: Limpar carrinho após enviar
      // cart = []; saveCartToLocalStorage();
    };
  }

  // --- Funções de API e Busca ---
  async function fetchProducts() {
    try {
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
      const data = await response.json();
      
      productsContainer.innerHTML = "";

      if (data.products.length === 0) {
        productsContainer.innerHTML = '<p class="info-message">Nada encontrado.</p>';
      } else {
        data.products.forEach((product) => {
          const productCard = document.createElement("div");
          productCard.classList.add("product-card");
          productCard.innerHTML = `
                    <div class="product-image-container">
                      <img src="${product.imageUrl || "https://via.placeholder.com/280x200"}" loading="lazy">
                    </div>
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <p class="price">R$ ${product.price.toFixed(2).replace(".", ",")}</p>
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
      renderPaginationControls(Math.ceil(data.totalCount / productsPerPage));
    } catch (e) { console.error(e); }
  }

  // Eventos Gerais
  productsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("add-to-cart-button")) {
      const id = e.target.dataset.productId;
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const p = await res.json();
      const existing = cart.find(i => i._id === id);
      if (existing) existing.quantity++;
      else cart.push({...p, quantity: 1});
      saveCartToLocalStorage();
    }
  });

  cartItemsContainer.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (e.target.classList.contains("quantity-plus")) updateQuantity(id, 1);
    if (e.target.classList.contains("quantity-minus")) updateQuantity(id, -1);
    if (e.target.classList.contains("remove-from-cart")) removeItemFromCart(id);
  });

  searchButton.onclick = () => {
    currentSearchTerm = searchInput.value;
    currentCategoryFilter = categoryFilterSelect.value;
    currentPage = 1;
    fetchProducts();
  };

  // Funções Admin Auxiliares
  window.editProduct = async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const p = await res.json();
    addProductSection.style.display = "block";
    addProductForm.classList.remove("hidden");
    productIdInput.value = p._id;
    nameInput.value = p.name;
    priceInput.value = p.price;
    fetchProducts();
  };

  function toggleAdminButtons() {
    const isAdmin = addProductSection.style.display === "block";
    document.querySelectorAll("[id^='actions-']").forEach(div => div.style.display = isAdmin ? "flex" : "none");
  }

  loadCartFromLocalStorage();
  fetchProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
