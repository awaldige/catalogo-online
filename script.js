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
  
  // Seletores do Carrinho Lateral
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCartBtn = document.getElementById("close-cart");
  const floatingCartBtn = document.getElementById("floating-cart");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalSpan = document.getElementById("cart-total");
  const cartCountBadge = document.getElementById("cart-count-badge");
  const checkoutButton = document.getElementById("checkout-button");

  // --- 3. ESTADO DA APLICAÇÃO ---
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const productsPerPage = 9; 
  let currentPage = 1;
  let currentSearchTerm = "";
  let currentCategoryFilter = "all";

  // --- 4. CONTROLE DO CARRINHO (SIDEBAR) ---

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
          <img src="${item.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.name}">
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

  // Finalizar Pedido WhatsApp
  checkoutButton.onclick = () => {
    if (cart.length === 0) return alert("Adicione produtos primeiro!");
    
    let msg = `*🛍️ NOVO PEDIDO - CATÁLOGO*\n--------------------------\n`;
    cart.forEach(i => {
      msg += `✅ *${i.name}*\n   ${i.quantity}x R$ ${i.price.toFixed(2)} = R$ ${(i.price * i.quantity).toFixed(2)}\n`;
    });
    msg += `--------------------------\n💰 *TOTAL: ${cartTotalSpan.textContent}*`;
    
    const url = `https://wa.me/${SEU_TELEFONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // --- 5. BUSCA E RENDERIZAÇÃO ---

  async function fetchProducts() {
    try {
      productsContainer.innerHTML = '<div class="info-message">Buscando novidades...</div>';
      
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
            <div class="product-image-container">
              <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" onload="this.style.opacity=1">
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

  // --- 6. EVENTOS E ADMIN ---

  productsContainer.onclick = async (e) => {
    const addBtn = e.target.closest(".add-to-cart-button");
    if (addBtn) {
      const id = addBtn.dataset.id;
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const p = await res.json();
      
      const exist = cart.find(i => i._id === id);
      if (exist) exist.quantity++;
      else cart.push({...p, quantity: 1});
      
      saveCart();
      toggleCart(true); // Abre o carrinho automaticamente ao adicionar
    }
  };

  searchButton.onclick = () => {
    currentSearchTerm = searchInput.value.trim();
    currentCategoryFilter = categoryFilterSelect.value;
    currentPage = 1;
    fetchProducts();
  };

  function renderPagination(total) {
    paginationControls.innerHTML = "";
    if (total <= 1) return;
    for (let i = 1; i <= total; i++) {
      const btn = document.createElement("button");
      btn.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
      btn.innerText = i;
      btn.onclick = () => { currentPage = i; fetchProducts(); window.scrollTo(0,0); };
      paginationControls.appendChild(btn);
    }
  }

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
