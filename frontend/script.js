
document.addEventListener("DOMContentLoaded", () => {
  // =====================================================
  // 1. CONFIGURAÇÕES
  // =====================================================

  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/api";
  const CART_STORAGE_KEY = "cart";
  const PRODUCTS_PER_PAGE = 9;
  const PIX_DISCOUNT = 0.05;

  const PLACEHOLDER_IMAGE =
    "https://placehold.co/600x600/f4f1eb/8a8175?text=Produto";

  // =====================================================
  // 2. ELEMENTOS DA PÁGINA
  // =====================================================

  const productsContainer = document.getElementById("products-container");
  const paginationControls = document.getElementById("pagination");

  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const categoryFilterSelect = document.getElementById("category-filter");

  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const closeCartBtn = document.getElementById("close-cart");

  const floatingCartBtn = document.getElementById("floating-cart");
  const headerCartBtn = document.getElementById("header-cart-button");

  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalSpan = document.getElementById("cart-total");

  const cartCountBadge = document.getElementById("cart-count-badge");
  const headerCartCount = document.getElementById("header-cart-count");

  const checkoutButton = document.getElementById("checkout-button");

  const paymentModal = document.getElementById("payment-modal");
  const closePaymentBtn = document.getElementById("close-payment");
  const confirmPurchaseBtn = document.getElementById("confirm-purchase");

  const paymentItemsList = document.getElementById("payment-items-list");
  const paymentTotalValue = document.getElementById("payment-total-value");

  const paymentOptions = document.querySelectorAll(
    'input[name="pay-method"]'
  );

  const currentYear = document.getElementById("current-year");

  // =====================================================
  // 3. ESTADO DA APLICAÇÃO
  // =====================================================

  function loadCart() {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_STORAGE_KEY) || "[]"
      );

      if (!Array.isArray(savedCart)) return [];

      return savedCart
        .filter(item =>
          item &&
          typeof item._id === "string" &&
          typeof item.name === "string" &&
          Number.isFinite(Number(item.price)) &&
          Number(item.price) >= 0 &&
          Number.isInteger(Number(item.quantity)) &&
          Number(item.quantity) > 0
        )
        .map(item => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity)
        }));
    } catch {
      return [];
    }
  }

  let cart = loadCart();
  let currentPage = 1;
  let currentSearchTerm = "";
  let currentCategoryFilter = "all";
  let requestController = null;

  // =====================================================
  // 4. FUNÇÕES AUXILIARES
  // =====================================================

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function safeImageUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
      return PLACEHOLDER_IMAGE;
    }

    try {
      const url = new URL(value, window.location.origin);

      if (
        url.protocol === "https:" ||
        url.protocol === "http:"
      ) {
        return url.href;
      }
    } catch {
      // Utiliza a imagem padrão.
    }

    return PLACEHOLDER_IMAGE;
  }

  async function readResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.message ||
        "Não foi possível concluir a operação."
      );
    }

    return data;
  }

  // =====================================================
  // 5. CONTROLE DO CARRINHO
  // =====================================================

  function toggleCart(show) {
    if (!cartSidebar || !cartOverlay) return;

    cartSidebar.classList.toggle("hidden", !show);
    cartOverlay.classList.toggle("hidden", !show);

    document.body.classList.toggle("cart-open", show);
  }

  function saveCart() {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );

      renderCart();
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
      alert("Não foi possível salvar o carrinho neste navegador.");
    }
  }

  function updateCartCounters(count) {
    if (cartCountBadge) {
      cartCountBadge.textContent = count;
    }

    if (headerCartCount) {
      headerCartCount.textContent = count;
    }

    if (floatingCartBtn) {
      floatingCartBtn.setAttribute(
        "aria-label",
        `Abrir carrinho com ${count} itens`
      );
    }
  }

  function getCartSubtotal() {
    return cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  function renderCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.replaceChildren();

    const total = getCartSubtotal();

    const count = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    updateCartCounters(count);

    if (cart.length === 0) {
      const emptyMessage = createElement(
        "p",
        "empty-msg",
        "Seu carrinho está vazio."
      );

      emptyMessage.style.textAlign = "center";
      emptyMessage.style.padding = "24px";

      cartItemsContainer.appendChild(emptyMessage);
    } else {
      cart.forEach(item => {
        const itemElement = createElement("div", "cart-item");

        const image = document.createElement("img");
        image.src = safeImageUrl(item.imageUrl);
        image.alt = item.name;
        image.loading = "lazy";

        const info = createElement("div", "cart-item-info");

        const name = createElement("h4", "", item.name);

        const price = createElement(
          "p",
          "",
          formatCurrency(item.price)
        );

        const controls = createElement("div", "qty-controls");

        const decrease = createElement("button", "", "−");
        decrease.type = "button";
        decrease.dataset.action = "decrease";
        decrease.dataset.id = item._id;
        decrease.setAttribute(
          "aria-label",
          `Diminuir ${item.name}`
        );

        const quantity = createElement(
          "span",
          "",
          String(item.quantity)
        );

        const increase = createElement("button", "", "+");
        increase.type = "button";
        increase.dataset.action = "increase";
        increase.dataset.id = item._id;
        increase.setAttribute(
          "aria-label",
          `Aumentar ${item.name}`
        );

        controls.append(decrease, quantity, increase);
        info.append(name, price, controls);

        const remove = createElement("button", "delete-item");
        remove.type = "button";
        remove.dataset.action = "remove";
        remove.dataset.id = item._id;
        remove.setAttribute(
          "aria-label",
          `Remover ${item.name}`
        );

        const trashIcon = document.createElement("i");
        trashIcon.className = "fa fa-trash";

        remove.appendChild(trashIcon);

        itemElement.append(image, info, remove);
        cartItemsContainer.appendChild(itemElement);
      });
    }

    if (cartTotalSpan) {
      cartTotalSpan.textContent = formatCurrency(total);
    }
  }

  function updateQuantity(id, delta) {
    const item = cart.find(product => product._id === id);

    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
      cart = cart.filter(product => product._id !== id);
    }

    saveCart();
  }

  function removeCartItem(id) {
    cart = cart.filter(item => item._id !== id);
    saveCart();
  }

  if (floatingCartBtn) {
    floatingCartBtn.addEventListener("click", () => {
      toggleCart(true);
    });
  }

  if (headerCartBtn) {
    headerCartBtn.addEventListener("click", () => {
      toggleCart(true);
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      toggleCart(false);
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => {
      toggleCart(false);
    });
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");

      if (!button) return;

      const { action, id } = button.dataset;

      if (action === "increase") {
        updateQuantity(id, 1);
      }

      if (action === "decrease") {
        updateQuantity(id, -1);
      }

      if (action === "remove") {
        removeCartItem(id);
      }
    });
  }

  // =====================================================
  // 6. PAGAMENTO DEMONSTRATIVO
  // =====================================================

  function getSelectedPaymentMethod() {
    const selected = document.querySelector(
      'input[name="pay-method"]:checked'
    );

    return selected ? selected.value : "Pix";
  }

  function calculateFinalTotal() {
    const subtotal = getCartSubtotal();
    const paymentMethod = getSelectedPaymentMethod();

    const discount = paymentMethod === "Pix"
      ? subtotal * PIX_DISCOUNT
      : 0;

    const finalTotal = subtotal - discount;

    if (paymentTotalValue) {
      paymentTotalValue.textContent = formatCurrency(finalTotal);
    }

    return {
      subtotal,
      discount,
      finalTotal,
      paymentMethod
    };
  }

  function openOrderSummary() {
    if (!cart.length) {
      alert("Adicione produtos ao carrinho antes de continuar.");
      return;
    }

    if (!paymentModal || !paymentItemsList) return;

    paymentItemsList.replaceChildren();

    cart.forEach(item => {
      const line = createElement("div", "order-summary-item");

      const description = createElement(
        "span",
        "",
        `${item.quantity}x ${item.name}`
      );

      const subtotal = createElement(
        "span",
        "",
        formatCurrency(item.price * item.quantity)
      );

      line.append(description, subtotal);
      paymentItemsList.appendChild(line);
    });

    calculateFinalTotal();

    paymentModal.classList.remove("hidden");
    toggleCart(false);
  }

  function closeOrderSummary() {
    if (paymentModal) {
      paymentModal.classList.add("hidden");
    }
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", openOrderSummary);
  }

  if (closePaymentBtn) {
    closePaymentBtn.addEventListener("click", closeOrderSummary);
  }

  paymentOptions.forEach(option => {
    option.addEventListener("change", calculateFinalTotal);
  });

  if (confirmPurchaseBtn) {
    confirmPurchaseBtn.addEventListener("click", () => {
      if (!cart.length) {
        closeOrderSummary();
        return;
      }

      const payment = calculateFinalTotal();

      const confirmed = window.confirm(
        "Este é um pedido demonstrativo. Nenhuma compra ou pagamento real será realizado.\n\n" +
        `Forma selecionada: ${payment.paymentMethod}\n` +
        `Total demonstrativo: ${formatCurrency(payment.finalTotal)}\n\n` +
        "Deseja concluir a demonstração?"
      );

      if (!confirmed) return;

      cart = [];
      saveCart();

      closeOrderSummary();
      toggleCart(false);

      alert(
        "Pedido demonstrativo concluído com sucesso! Obrigado por conhecer nosso catálogo."
      );
    });
  }

  // =====================================================
  // 7. CARREGAMENTO DOS PRODUTOS
  // =====================================================

  function showSkeletons() {
    if (!productsContainer) return;

    productsContainer.replaceChildren();

    for (let i = 0; i < PRODUCTS_PER_PAGE; i++) {
      const skeleton = createElement(
        "div",
        "product-card skeleton-card"
      );

      const image = createElement("div", "skeleton-image");
      const content = createElement(
        "div",
        "product-card-content"
      );

      const line1 = createElement("div", "skeleton-text");
      const line2 = createElement("div", "skeleton-text");

      content.append(line1, line2);
      skeleton.append(image, content);

      productsContainer.appendChild(skeleton);
    }
  }

  function renderProduct(product) {
    const card = createElement("article", "product-card");

    const imageContainer = createElement(
      "div",
      "product-image-container"
    );

    const image = document.createElement("img");
    image.src = safeImageUrl(product.imageUrl);
    image.alt = product.name || "Produto";
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("error", () => {
      image.src = PLACEHOLDER_IMAGE;
    }, { once: true });

    image.addEventListener("load", () => {
      image.classList.add("loaded");
    });

    imageContainer.appendChild(image);

    const content = createElement(
      "div",
      "product-card-content"
    );

    const name = createElement(
      "h3",
      "",
      product.name || "Produto"
    );

    const price = createElement(
      "p",
      "price",
      formatCurrency(product.price)
    );

    const addButton = createElement(
      "button",
      "button button-primary"
    );

    addButton.type = "button";
    addButton.classList.add("add-to-cart-button");
    addButton.dataset.id = product._id;

    const icon = document.createElement("i");
    icon.className = "fa fa-cart-plus";

    const label = document.createTextNode(" Adicionar");

    addButton.append(icon, label);

    content.append(name, price, addButton);
    card.append(imageContainer, content);

    return card;
  }

  async function fetchProducts() {
    if (!productsContainer || !paginationControls) return;

    if (requestController) {
      requestController.abort();
    }

    requestController = new AbortController();

    showSkeletons();

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(PRODUCTS_PER_PAGE)
    });

    if (currentSearchTerm) {
      params.set("search", currentSearchTerm);
    }

    if (currentCategoryFilter !== "all") {
      params.set("category", currentCategoryFilter);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/products?${params.toString()}`,
        { signal: requestController.signal }
      );

      const data = await readResponse(response);

      productsContainer.replaceChildren();

      if (
        !Array.isArray(data.products) ||
        data.products.length === 0
      ) {
        const message = createElement(
          "p",
          "info-message",
          "Nenhum produto encontrado."
        );

        productsContainer.appendChild(message);
        renderPagination(0);
        return;
      }

      data.products.forEach(product => {
        productsContainer.appendChild(
          renderProduct(product)
        );
      });

      const totalPages = Math.ceil(
        Number(data.totalCount || 0) / PRODUCTS_PER_PAGE
      );

      renderPagination(totalPages);
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Erro ao carregar catálogo:", error);

      productsContainer.replaceChildren();

      const message = createElement(
        "p",
        "error-message",
        "Não foi possível carregar os produtos. Tente novamente."
      );

      productsContainer.appendChild(message);
      renderPagination(0);
    }
  }

  // =====================================================
  // 8. PAGINAÇÃO
  // =====================================================

  function renderPagination(totalPages) {
    if (!paginationControls) return;

    paginationControls.replaceChildren();

    if (totalPages <= 1) return;

    const maxButtons = window.innerWidth < 600 ? 5 : 8;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxButtons / 2)
    );

    let endPage = Math.min(
      totalPages,
      startPage + maxButtons - 1
    );

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(
        1,
        endPage - maxButtons + 1
      );
    }

    if (currentPage > 1) {
      createPageButton(
        "‹",
        currentPage - 1,
        "Página anterior"
      );
    }

    for (let page = startPage; page <= endPage; page++) {
      createPageButton(
        String(page),
        page,
        `Página ${page}`
      );
    }

    if (currentPage < totalPages) {
      createPageButton(
        "›",
        currentPage + 1,
        "Próxima página"
      );
    }
  }

  function createPageButton(label, pageNumber, ariaLabel) {
    const button = createElement(
      "button",
      "pagination-button",
      label
    );

    button.type = "button";
    button.setAttribute("aria-label", ariaLabel);

    if (pageNumber === currentPage) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      currentPage = pageNumber;

      fetchProducts();

      document.getElementById("product-list")?.scrollIntoView({
        behavior: "smooth"
      });
    });

    paginationControls.appendChild(button);
  }

  // =====================================================
  // 9. ADICIONAR PRODUTOS AO CARRINHO
  // =====================================================

  if (productsContainer) {
    productsContainer.addEventListener("click", async event => {
      const button = event.target.closest(
        ".add-to-cart-button"
      );

      if (!button) return;

      const productId = button.dataset.id;

      if (!productId) return;

      const originalText = button.textContent;

      button.disabled = true;
      button.textContent = "Adicionando...";

      try {
        const response = await fetch(
          `${API_BASE_URL}/products/${encodeURIComponent(productId)}`
        );

        const product = await readResponse(response);

        if (
          !product ||
          typeof product._id !== "string" ||
          typeof product.name !== "string" ||
          !Number.isFinite(Number(product.price)) ||
          Number(product.price) < 0
        ) {
          throw new Error("Dados do produto inválidos.");
        }

        const existingItem = cart.find(
          item => item._id === product._id
        );

        if (existingItem) {
          existingItem.quantity++;
        } else {
          cart.push({
            _id: product._id,
            name: product.name,
            price: Number(product.price),
            imageUrl: safeImageUrl(product.imageUrl),
            quantity: 1
          });
        }

        saveCart();
        toggleCart(true);
      } catch (error) {
        console.error("Erro ao adicionar produto:", error);

        alert(
          "Não foi possível adicionar este produto ao carrinho."
        );
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  }

  // =====================================================
  // 10. BUSCA E FILTROS
  // =====================================================

  function applyFilters() {
    currentSearchTerm = searchInput
      ? searchInput.value.trim()
      : "";

    currentCategoryFilter = categoryFilterSelect
      ? categoryFilterSelect.value
      : "all";

    currentPage = 1;

    fetchProducts();
  }

  if (searchButton) {
    searchButton.addEventListener("click", applyFilters);
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyFilters();
      }
    });
  }

  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener(
      "change",
      applyFilters
    );
  }

  // =====================================================
  // 11. CATEGORIAS DA PÁGINA
  // =====================================================

  document.querySelectorAll("[data-category]").forEach(element => {
    element.addEventListener("click", event => {
      event.preventDefault();

      const category = element.dataset.category;

      if (!category) return;

      if (categoryFilterSelect) {
        const optionExists = Array.from(
          categoryFilterSelect.options
        ).some(option => option.value === category);

        if (optionExists) {
          categoryFilterSelect.value = category;
        }
      }

      currentCategoryFilter = category;
      currentPage = 1;

      fetchProducts();

      document.getElementById("product-list")?.scrollIntoView({
        behavior: "smooth"
      });
    });
  });

  // =====================================================
  // 12. INICIALIZAÇÃO
  // =====================================================

  renderCart();
  fetchProducts();

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }
});
