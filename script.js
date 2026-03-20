document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURAÇÕES INICIAIS ---
  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";
  const SEU_TELEFONE = "5511985878638"; 

  // --- 2. SELETORES ---
  const btnShowAdminPanel = document.getElementById("btnShowAdminPanel");
  const btnHideAdminPanel = document.getElementById("btnHideAdminPanel");
  const addProductSection = document.getElementById("add-product-section");
  const productsContainer = document.getElementById("products-container");
  const paginationControls = document.getElementById("pagination");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const categoryFilterSelect = document.getElementById("category-filter");
  
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCartBtn = document.getElementById("close-cart");
  const floatingCartBtn = document.getElementById("floating-cart");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalSpan = document.getElementById("cart-total");
  const cartCountBadge = document.getElementById("cart-count-badge");
  const checkoutButton = document.getElementById("checkout-button");

  const paymentModal = document.getElementById("payment-modal");
  const closePaymentBtn = document.getElementById("close-payment");
  const confirmPurchaseBtn = document.getElementById("confirm-purchase");
  const paymentItemsList = document.getElementById("payment-items-list");
  const paymentTotalValue = document.getElementById("payment-total-value");
  const paymentOptions = document.getElementsByName("pay-method");

  // --- 3. ESTADO DA APLICAÇÃO ---
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const productsPerPage = 9; 
  let currentPage = 1;
  let currentSearchTerm = "";
  let currentCategoryFilter = "all";

  // --- 4. CONTROLE DO CARRINHO ---

  function toggleCart(show) {
    if (show) {
      cartSidebar.classList.remove("hidden");
      cartOverlay.classList.remove("hidden");
    } else {
      cartSidebar.classList.add("hidden");
      cartOverlay.classList.add("hidden");
    }
  }

  floatingCartBtn.onclick = () => toggleCart(true);
  closeCartBtn.onclick = () => toggleCart(false);
  cartOverlay.onclick = () => toggleCart(false);

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  window.updateQty = (id, delta) => {
    const item = cart.find(p => p._id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(p => p._id !== id);
      }
      saveCart();
    }
  };

  window.removeItem = (id) => {
    cart = cart.filter(p => p._id !== id);
    saveCart();
  };

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-msg">Seu carrinho está vazio.</p>';
    } else {
      cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;
        
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${item.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.name}" loading="lazy">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="cart-item-price">R$ ${item.price.toFixed(2).replace(".", ",")}</p>
            <div class="qty-controls">
              <button onclick="updateQty('${item._id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button onclick="updateQty('${item._id}', 1)">+</button>
            </div>
          </div>
          <button class="delete-item" onclick="removeItem('${item._id}')">
            <i class="fa fa-trash"></i>
          </button>
        `;
        cartItemsContainer.appendChild(div);
      });
    }

    cartTotalSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    cartCountBadge.textContent = count;
  }

  // --- 5. LÓGICA DE PAGAMENTO ---

  function calculateFinalTotal() {
    let total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const selectedMethod = document.querySelector('input[name="pay-method"]:checked').value;

    if (selectedMethod === "Pix") {
      total = total * 0.95;
    }

    paymentTotalValue.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    return total;
  }

  paymentOptions.forEach(opt => {
    opt.addEventListener("change", calculateFinalTotal);
  });

  checkoutButton.onclick = () => {
    if (cart.length === 0) return alert("Adicione produtos primeiro!");
    
    paymentItemsList.innerHTML = cart.map(i => `
      <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:5px;">
        <span>${i.quantity}x ${i.name}</span>
        <span>R$ ${(i.price * i.quantity).toFixed(2).replace(".", ",")}</span>
      </div>
    `).join('');
    
    calculateFinalTotal();
    paymentModal.classList.remove("hidden");
    toggleCart(false);
  };

  closePaymentBtn.onclick = () => paymentModal.classList.add("hidden");

  confirmPurchaseBtn.onclick = () => {
    const method = document.querySelector('input[name="pay-method"]:checked').value;
    const finalPrice = paymentTotalValue.textContent;

    let msg = `*🛍️ NOVO PEDIDO - ANDRÉ WALDIGE*\n`;
    msg += `--------------------------------\n`;
    cart.forEach(i => {
      msg += `✅ *${i.name}* (${i.quantity}x)\n`;
    });
    msg += `--------------------------------\n`;
    msg += `💳 *Forma de Pagamento:* ${method}\n`;
    msg += `💰 *VALOR TOTAL: ${finalPrice}*\n`;
    msg += `--------------------------------\n`;
    msg += `_Olá, gostaria de prosseguir com este pedido!_`;

    const url = `https://wa.me/${SEU_TELEFONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // --- 6. BUSCA E RENDERIZAÇÃO OTIMIZADA ---

  function showSkeletons() {
    productsContainer.innerHTML = "";
    for (let i = 0; i < productsPerPage; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "product-card skeleton-card";
      skeleton.innerHTML = `
        <div class="skeleton-image" style="width:100%; aspect-ratio:1/1; background:#eee;"></div>
        <div class="product-card-content">
          <div class="skeleton-text" style="height:20px; width:80%; background:#eee; margin-bottom:10px;"></div>
          <div class="skeleton-text" style="height:15px; width:40%; background:#eee;"></div>
        </div>
      `;
      productsContainer.appendChild(skeleton);
    }
  }

  async function fetchProducts() {
    try {
      showSkeletons();
      
      let url = `${API_BASE_URL}/products?page=${currentPage}&limit=${productsPerPage}`;
      if (currentSearchTerm) url += `&search=${currentSearchTerm}`;
      if (currentCategoryFilter !== "all") url += `&category=${currentCategoryFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      productsContainer.innerHTML = "";

      if (!data.products || data.products.length === 0) {
        productsContainer.innerHTML = '<p class="info-message">Nenhum produto encontrado.</p>';
      } else {
        data.products.forEach(p => {
          const card = document.createElement("div");
          card.className = "product-card";
          card.innerHTML = `
            <div class="product-image-container" style="aspect-ratio: 1/1; background: #f5f5f5; overflow: hidden; position: relative;">
              <img src="${p.imageUrl}" 
                   alt="${p.name}" 
                   loading="lazy" 
                   decoding="async"
                   style="width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s;"
                   onload="this.style.opacity=1">
            </div>
            <div class="product-card-content">
              <h3>${p.name}</h3>
              <p class="price">R$ ${p.price.toFixed(2).replace(".", ",")}</p>
              <div class="product-actions hidden">
                 <button class="btn-edit" data-id="${p._id}"><i class="fa fa-edit"></i></button>
                 <button class="btn-delete" data-id="${p._id}"><i class="fa fa-trash"></i></button>
              </div>
              <button class="button button-primary add-to-cart-button" data-id="${p._id}">
                <i class="fa fa-cart-plus"></i> Adicionar
              </button>
            </div>
          `;
          productsContainer.appendChild(card);
        });
        renderAdminActions();
      }
      renderPagination(Math.ceil(data.totalCount / productsPerPage));
    } catch (err) {
      productsContainer.innerHTML = '<p class="error-message">Erro ao carregar catálogo.</p>';
    }
  }

  // --- 7. PAGINAÇÃO RESPONSIVA ---

  function renderPagination(total) {
    paginationControls.innerHTML = "";
    if (total <= 1) return;

    // Configuração para não poluir o mobile com muitos números
    const maxButtons = window.innerWidth < 600 ? 5 : 8;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(total, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Botão Voltar (Opcional, mas ajuda muito no mobile)
    if (currentPage > 1) {
        createPageButton("<", currentPage - 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        createPageButton(i, i);
    }

    // Botão Próximo
    if (currentPage < total) {
        createPageButton(">", currentPage + 1);
    }
  }

  function createPageButton(text, pageNum) {
    const btn = document.createElement("button");
    btn.className = `pagination-button ${pageNum === currentPage ? 'active' : ''}`;
    btn.innerText = text;
    btn.onclick = () => { 
      currentPage = pageNum; 
      fetchProducts(); 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };
    paginationControls.appendChild(btn);
  }

  // --- 8. EVENTOS DE INTERAÇÃO ---

  productsContainer.onclick = async (e) => {
    const addBtn = e.target.closest(".add-to-cart-button");
    if (addBtn) {
      const id = addBtn.dataset.id;
      addBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const p = await res.json();
      
      const exist = cart.find(i => i._id === id);
      if (exist) exist.quantity++;
      else cart.push({...p, quantity: 1});
      
      saveCart();
      addBtn.innerHTML = '<i class="fa fa-cart-plus"></i> Adicionar';
      toggleCart(true); 
    }
  };

  searchButton.onclick = () => {
    currentSearchTerm = searchInput.value.trim();
    currentCategoryFilter = categoryFilterSelect.value;
    currentPage = 1;
    fetchProducts();
  };

  function renderAdminActions() {
    const isAdmin = !addProductSection.classList.contains("hidden");
    document.querySelectorAll(".product-actions").forEach(el => {
      el.classList.toggle("hidden", !isAdmin);
    });
  }

  btnShowAdminPanel.onclick = () => {
    addProductSection.classList.remove("hidden");
    btnShowAdminPanel.classList.add("hidden");
    btnHideAdminPanel.classList.remove("hidden");
    renderAdminActions();
  };

  btnHideAdminPanel.onclick = () => {
    addProductSection.classList.add("hidden");
    btnShowAdminPanel.classList.remove("hidden");
    btnHideAdminPanel.classList.add("hidden");
    renderAdminActions();
  };

  // --- INICIALIZAÇÃO ---
  renderCart();
  fetchProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
