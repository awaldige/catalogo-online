document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURAÇÕES INICIAIS ---
  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";
  const SEU_TELEFONE = "5511985878638"; 

  // --- 2. SELETORES DE ELEMENTOS ---
  // Admin
  const btnShowAdminPanel = document.getElementById("btnShowAdminPanel");
  const btnHideAdminPanel = document.getElementById("btnHideAdminPanel");
  const addProductSection = document.getElementById("add-product-section");
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

  // Catálogo e Filtros
  const productsContainer = document.getElementById("products-container");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const clearSearchButton = document.getElementById("clear-search-button");
  const categoryFilterSelect = document.getElementById("category-filter");
  const minPriceInput = document.getElementById("min-price-input");
  const maxPriceInput = document.getElementById("max-price-input");
  const minStockInput = document.getElementById("min-stock-input");
  const paginationControls = document.getElementById("pagination");

  // Carrinho
  const shoppingCartSection = document.getElementById("shopping-cart-section");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const cartItemCountSpan = document.getElementById("cart-item-count");
  const cartTotalSpan = document.getElementById("cart-total");
  const clearCartButton = document.getElementById("clear-cart-button");
  const checkoutButton = document.getElementById("checkout-button");

  // --- 3. ESTADO DA APLICAÇÃO ---
  let cart = [];
  const productsPerPage = 9;
  let currentPage = 1;
  let currentSearchTerm = "";
  let currentCategoryFilter = "all";
  let currentMinPrice = "";
  let currentMaxPrice = "";
  let currentMinStock = "";

  // --- 4. LÓGICA DO CARRINHO ---

  function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) cart = JSON.parse(storedCart);
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
          <img src="${item.imageUrl || 'https://via.placeholder.com/80'}" alt="${item.name}">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p>R$ ${item.price.toFixed(2).replace(".", ",")}</p>
            <div class="quantity-controls">
              <button class="button-small quantity-minus" data-id="${item._id}">-</button>
              <span>${item.quantity}</span>
              <button class="button-small quantity-plus" data-id="${item._id}" data-stock="${item.stock}">+</button>
            </div>
          </div>
          <button class="button-small button-danger remove-from-cart" data-id="${item._id}">
            <i class="fa fa-trash"></i>
          </button>
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
    
    if(clearCartButton) clearCartButton.disabled = cart.length === 0;
    if(checkoutButton) checkoutButton.disabled = cart.length === 0;
  }

  // Ações de clique no carrinho
  cartItemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.classList.contains("quantity-plus")) {
        const item = cart.find(i => i._id === id);
        if (item.quantity < item.stock) {
            item.quantity++;
            saveCartToLocalStorage();
        } else {
            alert("Limite de estoque atingido.");
        }
    } else if (btn.classList.contains("quantity-minus")) {
        const itemIndex = cart.findIndex(i => i._id === id);
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity--;
        } else {
            cart.splice(itemIndex, 1);
        }
        saveCartToLocalStorage();
    } else if (btn.classList.contains("remove-from-cart")) {
        cart = cart.filter(i => i._id !== id);
        saveCartToLocalStorage();
    }
  });

  // BOTÃO ESVAZIAR
  if (clearCartButton) {
    clearCartButton.onclick = () => {
      if (confirm("Deseja realmente limpar o carrinho?")) {
        cart = [];
        saveCartToLocalStorage();
      }
    };
  }

  // BOTÃO FINALIZAR (WHATSAPP COM DADOS COMPLETO)
  if (checkoutButton) {
    checkoutButton.onclick = (e) => {
      e.preventDefault();
      
      const nomeCliente = document.getElementById("customer-name").value.trim();
      const enderecoCliente = document.getElementById("customer-address").value.trim();
      const pagamento = document.getElementById("payment-method").value;

      if (cart.length === 0) return;
      
      if (!nomeCliente || !enderecoCliente) {
        alert("Por favor, preencha seu nome e endereço para entrega.");
        return;
      }

      let mensagem = `*📦 NOVO PEDIDO - CATÁLOGO ANDRÉ*\n`;
      mensagem += `------------------------------------------\n`;
      mensagem += `👤 *CLIENTE:* ${nomeCliente}\n`;
      mensagem += `📍 *ENTREGA:* ${enderecoCliente}\n`;
      mensagem += `💳 *PAGAMENTO:* ${pagamento}\n`;
      mensagem += `------------------------------------------\n\n`;
      
      cart.forEach(item => {
        const sub = (item.price * item.quantity).toFixed(2).replace(".", ",");
        mensagem += `✅ *${item.name}*\n   Qtd: ${item.quantity} | Subtotal: R$ ${sub}\n\n`;
      });
      
      const totalGeral = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      mensagem += `------------------------------------------\n`;
      mensagem += `💰 *TOTAL DO PEDIDO: R$ ${totalGeral.toFixed(2).replace(".", ",")}*\n`;
      mensagem += `------------------------------------------\n`;
      mensagem += `_Pedido gerado via Catálogo Online._`;

      const encodedMsg = encodeURIComponent(mensagem);
      const urlZap = `https://api.whatsapp.com/send?phone=${SEU_TELEFONE}&text=${encodedMsg}`;

      // Resetar o site após o envio
      cart = [];
      saveCartToLocalStorage();
      document.getElementById("customer-name").value = "";
      document.getElementById("customer-address").value = "";

      // Abrir WhatsApp
      window.open(urlZap, '_blank');
      
      alert("Pedido enviado com sucesso! Finalize o envio no WhatsApp.");
    };
  }

  // --- 5. BUSCA DE PRODUTOS ---

  async function fetchProducts() {
    try {
      productsContainer.innerHTML = '<p class="info-message">Carregando catálogo...</p>';
      let url = `${API_BASE_URL}/products?page=${currentPage}&limit=${productsPerPage}`;
      if (currentSearchTerm) url += `&search=${currentSearchTerm}`;
      if (currentCategoryFilter !== "all") url += `&category=${currentCategoryFilter}`;
      if (currentMinPrice) url += `&minPrice=${currentMinPrice}`;
      if (currentMaxPrice) url += `&maxPrice=${currentMaxPrice}`;
      if (currentMinStock) url += `&minStock=${currentMinStock}`;

      const response = await fetch(url);
      const data = await response.json();
      productsContainer.innerHTML = "";

      if (!data.products || data.products.length === 0) {
        productsContainer.innerHTML = '<p class="info-message">Nenhum produto encontrado.</p>';
      } else {
        data.products.forEach((product) => {
          const productCard = document.createElement("div");
          productCard.classList.add("product-card");
          productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl || 'https://via.placeholder.com/280x200'}" loading="lazy" decoding="async">
            </div>
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="price">R$ ${product.price.toFixed(2).replace(".", ",")}</p>
                <p style="font-size: 12px; color: #777;">Estoque: ${product.stock}</p>
                <div class="product-actions" style="display: none;" id="actions-${product._id}">
                    <button class="button-small button-secondary edit-btn" data-id="${product._id}">Editar</button>
                    <button class="button-small button-danger delete-btn" data-id="${product._id}">Excluir</button>
                </div>
                <button class="button button-primary add-to-cart-button" data-product-id="${product._id}">
                    <i class="fa fa-cart-plus"></i> Adicionar ao Carrinho
                </button>
            </div>
          `;
          productsContainer.appendChild(productCard);
        });
        toggleAdminButtons();
      }
      renderPagination(Math.ceil(data.totalCount / productsPerPage));
    } catch (err) {
      productsContainer.innerHTML = '<p class="error-message">Erro ao carregar catálogo.</p>';
    }
  }

  productsContainer.addEventListener("click", async (e) => {
    const target = e.target.closest(".add-to-cart-button");
    if (target) {
        const id = target.dataset.productId;
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`);
            const product = await res.json();
            if (product.stock <= 0) {
                alert("Produto sem estoque.");
                return;
            }
            const existing = cart.find(i => i._id === id);
            if (existing) {
                if (existing.quantity < product.stock) existing.quantity++;
                else alert("Máximo em estoque atingido.");
            } else {
                cart.push({...product, quantity: 1});
            }
            saveCartToLocalStorage();
        } catch (err) { alert("Erro ao adicionar produto."); }
    }
    if (e.target.classList.contains("edit-btn")) editProduct(e.target.dataset.id);
    if (e.target.classList.contains("delete-btn")) deleteProduct(e.target.dataset.id);
  });

  // --- 6. ADMIN E AUXILIARES ---

  function toggleAdminButtons() {
    const isAdmin = addProductSection.style.display === "block";
    document.querySelectorAll("[id^='actions-']").forEach(div => {
      div.style.display = isAdmin ? "flex" : "none";
    });
  }

  btnShowAdminPanel.onclick = () => {
    addProductSection.style.display = "block";
    btnShowAdminPanel.style.display = "none";
    btnHideAdminPanel.style.display = "inline-block";
    toggleAdminButtons();
  };

  btnHideAdminPanel.onclick = () => {
    addProductSection.style.display = "none";
    btnShowAdminPanel.style.display = "inline-block";
    btnHideAdminPanel.style.display = "none";
    toggleAdminButtons();
  };

  async function editProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const p = await res.json();
    addProductForm.classList.remove("hidden");
    productIdInput.value = p._id;
    nameInput.value = p.name;
    descriptionInput.value = p.description;
    priceInput.value = p.price;
    imageUrlInput.value = p.imageUrl;
    stockInput.value = p.stock;
    categoryInput.value = p.category;
    productFormTitle.textContent = "Editar Produto";
    window.scrollTo({ top: addProductSection.offsetTop, behavior: 'smooth' });
  }

  async function deleteProduct(id) {
    if (confirm("Excluir permanentemente?")) {
        await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
        fetchProducts();
    }
  }

  searchButton.onclick = () => {
    currentSearchTerm = searchInput.value.trim();
    currentCategoryFilter = categoryFilterSelect.value;
    currentPage = 1;
    fetchProducts();
  };

  function renderPagination(totalPages) {
    paginationControls.innerHTML = "";
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.classList.add("pagination-button");
        if (i === currentPage) btn.classList.add("active");
        btn.onclick = () => { currentPage = i; fetchProducts(); window.scrollTo(0,0); };
        paginationControls.appendChild(btn);
    }
  }

  loadCartFromLocalStorage();
  fetchProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
