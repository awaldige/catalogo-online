document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURAÇÕES INICIAIS ---
  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";
  const SEU_TELEFONE = "5511985878638"; 

  // --- 2. SELETORES DE ELEMENTOS ---
  // Admin
  const btnShowAdminPanel = document.getElementById("btnShowAdminPanel");
  const btnHideAdminPanel = document.getElementById("btnHideAdminPanel");
  const addProductSection = document.getElementById("add-product-section");
  const addProductForm = document.getElementById("add-product-form");
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
  const categoryFilterSelect = document.getElementById("category-filter");
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
          <img src="${item.imageUrl || 'https://via.placeholder.com/80'}" alt="${item.name}" loading="lazy">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p>R$ ${item.price.toFixed(2).replace(".", ",")}</p>
            <div class="quantity-controls">
              <button class="button-small quantity-minus" data-id="${item._id}">-</button>
              <span>${item.quantity}</span>
              <button class="button-small quantity-plus" data-id="${item._id}">+</button>
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
  }

  cartItemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    const item = cart.find(i => i._id === id);

    if (btn.classList.contains("quantity-plus")) {
      if (item.quantity < item.stock) {
        item.quantity++;
        saveCartToLocalStorage();
      } else { alert("Limite de estoque atingido."); }
    } else if (btn.classList.contains("quantity-minus")) {
      if (item.quantity > 1) item.quantity--;
      else cart = cart.filter(i => i._id !== id);
      saveCartToLocalStorage();
    } else if (btn.classList.contains("remove-from-cart")) {
      cart = cart.filter(i => i._id !== id);
      saveCartToLocalStorage();
    }
  });

  if (clearCartButton) {
    clearCartButton.onclick = () => {
      if (confirm("Esvaziar carrinho?")) { cart = []; saveCartToLocalStorage(); }
    };
  }

  if (checkoutButton) {
    checkoutButton.onclick = (e) => {
      e.preventDefault();
      const nome = document.getElementById("customer-name").value.trim();
      const endereco = document.getElementById("customer-address").value.trim();
      const pagamento = document.getElementById("payment-method").value;

      if (!nome || !endereco) return alert("Preencha nome e endereço!");

      let msg = `*📦 NOVO PEDIDO*\n👤 *CLIENTE:* ${nome}\n📍 *ENTREGA:* ${endereco}\n💳 *PAGAMENTO:* ${pagamento}\n\n`;
      cart.forEach(i => msg += `✅ *${i.name}* (${i.quantity}x) - R$ ${(i.price * i.quantity).toFixed(2)}\n`);
      msg += `\n💰 *TOTAL: ${cartTotalSpan.textContent}*`;

      window.open(`https://api.whatsapp.com/send?phone=${SEU_TELEFONE}&text=${encodeURIComponent(msg)}`, '_blank');
      cart = []; saveCartToLocalStorage();
    };
  }

  // --- 5. BUSCA E RENDERIZAÇÃO DE PRODUTOS (ALTA PERFORMANCE) ---

  async function fetchProducts() {
    try {
      productsContainer.innerHTML = '<div class="info-message">Buscando produtos...</div>';
      
      let url = `${API_BASE_URL}/products?page=${currentPage}&limit=${productsPerPage}`;
      if (currentSearchTerm) url += `&search=${currentSearchTerm}`;
      if (currentCategoryFilter !== "all") url += `&category=${currentCategoryFilter}`;

      const response = await fetch(url);
      const data = await response.json();
      productsContainer.innerHTML = "";

      if (!data.products || data.products.length === 0) {
        productsContainer.innerHTML = '<p class="info-message">Nenhum produto encontrado.</p>';
      } else {
        data.products.forEach((product) => {
          const productCard = document.createElement("div");
          productCard.classList.add("product-card");
          
          // Implementação de Aspect-Ratio e Performance Visual
          productCard.innerHTML = `
            <div class="product-image-container" style="background: #f0f0f0; aspect-ratio: 1/1; position: relative; overflow: hidden;">
                <img src="${product.imageUrl || 'https://via.placeholder.com/280'}" 
                     loading="lazy" 
                     decoding="async"
                     alt="${product.name}"
                     style="width:100%; height:100%; object-fit:cover; opacity: 0; transition: opacity 0.4s;"
                     onload="this.style.opacity='1'"
                     onerror="this.src='https://via.placeholder.com/280?text=Sem+Imagem'">
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
                    <i class="fa fa-cart-plus"></i> Adicionar
                </button>
            </div>
          `;
          productsContainer.appendChild(productCard);
        });
        toggleAdminButtons();
      }
      renderPagination(Math.ceil(data.totalCount / productsPerPage));
    } catch (err) {
      productsContainer.innerHTML = '<p class="error-message">Erro ao conectar com o servidor.</p>';
    }
  }

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

  productsContainer.addEventListener("click", async (e) => {
    const addBtn = e.target.closest(".add-to-cart-button");
    if (addBtn) {
      const id = addBtn.dataset.productId;
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const p = await res.json();
      if (p.stock <= 0) return alert("Sem estoque!");
      const exist = cart.find(i => i._id === id);
      if (exist) exist.quantity < p.stock ? exist.quantity++ : alert("Limite atingido");
      else cart.push({...p, quantity: 1});
      saveCartToLocalStorage();
    }
    if (e.target.classList.contains("edit-btn")) editProduct(e.target.dataset.id);
    if (e.target.classList.contains("delete-btn")) deleteProduct(e.target.dataset.id);
  });

  async function editProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const p = await res.json();
    addProductForm.classList.remove("hidden");
    productIdInput.value = p._id;
    nameInput.value = p.name;
    priceInput.value = p.price;
    imageUrlInput.value = p.imageUrl;
    productFormTitle.textContent = "Editar Produto";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteProduct(id) {
    if (confirm("Excluir?")) {
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
      btn.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
      btn.onclick = () => { currentPage = i; fetchProducts(); window.scrollTo(0,0); };
      paginationControls.appendChild(btn);
    }
  }

  loadCartFromLocalStorage();
  fetchProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
