document.addEventListener("DOMContentLoaded", () => {
  // --- 1. CONFIGURAÇÕES INICIAIS ---
  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";
  const SEU_TELEFONE = "5511985878638"; 

  // --- 2. SELETORES ---
  const btnShowAdminPanel = document.getElementById("btnShowAdminPanel");
  const btnHideAdminPanel = document.getElementById("btnHideAdminPanel");
  const addProductSection = document.getElementById("add-product-section");
  const addProductForm = document.getElementById("add-product-form");
  const productsContainer = document.getElementById("products-container");
  const paginationControls = document.getElementById("pagination");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const categoryFilterSelect = document.getElementById("category-filter");

  // --- 3. ESTADO DA APLICAÇÃO ---
  let cart = [];
  const productsPerPage = 3; // ATUALIZADO PARA 3
  let currentPage = 1;
  let currentSearchTerm = "";
  let currentCategoryFilter = "all";

  // --- 4. LÓGICA DO ADMIN (CORRIGIDA) ---
  
  function toggleAdminMode(show) {
    if (show) {
      addProductSection.classList.remove("hidden");
      btnShowAdminPanel.classList.add("hidden");
      btnHideAdminPanel.classList.remove("hidden");
    } else {
      addProductSection.classList.add("hidden");
      btnShowAdminPanel.classList.remove("hidden");
      btnHideAdminPanel.classList.add("hidden");
    }
    renderAdminActions(); // Atualiza botões de editar/excluir nos cards
  }

  btnShowAdminPanel.onclick = () => toggleAdminMode(true);
  btnHideAdminPanel.onclick = () => toggleAdminMode(false);

  function renderAdminActions() {
    const isAdmin = !addProductSection.classList.contains("hidden");
    document.querySelectorAll(".product-actions").forEach(div => {
      if (isAdmin) div.classList.remove("hidden");
      else div.classList.add("hidden");
    });
  }

  // --- 5. BUSCA E RENDERIZAÇÃO (IMAGENS MENORES) ---

  async function fetchProducts() {
    try {
      productsContainer.innerHTML = '<div class="info-message">Carregando vitrine...</div>';
      
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
          
          productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.imageUrl || 'https://via.placeholder.com/200?text=Sem+Imagem'}" 
                     loading="lazy" 
                     alt="${product.name}"
                     onload="this.style.opacity='1'">
            </div>
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p class="price">R$ ${product.price.toFixed(2).replace(".", ",")}</p>
                <div class="product-actions hidden" id="actions-${product._id}">
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
        renderAdminActions();
      }
      renderPagination(Math.ceil(data.totalCount / productsPerPage));
    } catch (err) {
      productsContainer.innerHTML = '<p class="error-message">Erro ao conectar com o servidor.</p>';
    }
  }

  // --- 6. PAGINAÇÃO (ESTILO MELHORADO) ---

  function renderPagination(totalPages) {
    paginationControls.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
      btn.onclick = () => { 
        currentPage = i; 
        fetchProducts(); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      };
      paginationControls.appendChild(btn);
    }
  }

  // --- 7. CARRINHO (SIMPLIFICADO) ---

  function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    const shoppingCartSection = document.getElementById("shopping-cart-section");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartItemCountSpan = document.getElementById("cart-item-count");
    const cartTotalSpan = document.getElementById("cart-total");

    cartItemsContainer.innerHTML = "";
    
    if (cart.length === 0) {
      shoppingCartSection.classList.add("hidden");
    } else {
      shoppingCartSection.classList.remove("hidden");
      cart.forEach((item) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
            <img src="${item.imageUrl}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
            <div style="flex-grow:1">
              <p style="font-weight:bold; font-size:14px;">${item.name}</p>
              <p style="font-size:12px;">${item.quantity}x R$ ${item.price.toFixed(2)}</p>
            </div>
          </div>
        `;
        cartItemsContainer.appendChild(div);
      });
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if(cartItemCountSpan) cartItemCountSpan.textContent = totalItems;
    if(cartTotalSpan) cartTotalSpan.textContent = `R$ ${totalPrice.toFixed(2).replace(".", ",")}`;
  }

  // --- 8. EVENTOS DE CLIQUE ---

  productsContainer.addEventListener("click", async (e) => {
    const addBtn = e.target.closest(".add-to-cart-button");
    if (addBtn) {
      const id = addBtn.dataset.productId;
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      const p = await res.json();
      const exist = cart.find(i => i._id === id);
      if (exist) exist.quantity++;
      else cart.push({...p, quantity: 1});
      saveCartToLocalStorage();
      alert("Adicionado ao carrinho!");
    }
  });

  searchButton.onclick = () => {
    currentSearchTerm = searchInput.value.trim();
    currentCategoryFilter = categoryFilterSelect.value;
    currentPage = 1;
    fetchProducts();
  };

  // Inicialização
  const storedCart = localStorage.getItem("cart");
  if (storedCart) cart = JSON.parse(storedCart);
  renderCart();
  fetchProducts();
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
