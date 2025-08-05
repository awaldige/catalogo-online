document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "https://catalogo-backend-e14g.onrender.com/";

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
                <img src="${item.imageUrl || "https://via.placeholder.com/80x80?text=Produto"}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Preço unitário: R$ ${
                      item.price ? item.price.toFixed(2).replace(".", ",") : "0,00"
                    }</p>
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
      alert(
        `Não há estoque suficiente para adicionar mais de "${item.name}". Estoque disponível: ${item.stock}.`
      );
      return;
    }

    if (newQuantity > 0) {
      item.quantity = newQuantity;
    } else {
      cart.splice
