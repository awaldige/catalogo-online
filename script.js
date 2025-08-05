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
      });

      btnHideAdminPanel.addEventListener("click", () => {
        addProductSection.style.display = "none";
        btnShowAdminPanel.style.display = "inline-block";
        btnHideAdminPanel.style.display = "none";
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
          cart.splice(itemIndex, 1);
          alert(`"${item.name}" removido do carrinho.`);
        }
        saveCartToLocalStorage();
      }

      function removeItemFromCart(productId) {
        cart = cart.filter((item) => item._id !== productId);
        saveCartToLocalStorage();
        alert("Produto removido do carrinho.");
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
              alert(
                `Quantidade de "${productToAdd.name}" atualizada para ${existingItem.quantity} no carrinho!`
              );
            } else {
              alert(`Não há estoque suficiente para adicionar mais de "${productToAdd.name}".`);
              return;
            }
          } else {
            cart.push({ ...productToAdd, quantity: 1 });
            alert(`"${productToAdd.name}" adicionado ao carrinho!`);
          }
          saveCartToLocalStorage();
        } catch (error) {
          console.error("Erro ao adicionar produto ao carrinho:", error);
          alert("Não foi possível adicionar o produto ao carrinho. Tente novamente.");
        }
      }

      // --- Funções dos produtos e filtros ---
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

          const products = Array.isArray(data) ? data : data.products;
          const totalPages = data.totalPages || 1;

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
                        <img src="${
                          product.imageUrl || "https://via.placeholder.com/280x200?text=Produto+Sem+Imagem"
                        }" alt="${product.name}">
                        <div class="product-card-content">
                            <h3>${product.name}</h3>
                            <p>${product.description || "Nenhuma descrição disponível."}</p>
                            <p class="price">R$ ${
                              product.price ? product.price.toFixed(2).replace(".", ",") : "0,00"
                            }</p>
                            <p>Estoque: ${
                              product.stock !== undefined ? product.stock : "N/A"
                            }</p>
                            <p>Categoria: ${product.category || "Não especificada"}</p>
                            <div class="product-actions" style="display: none;" id="actions-${
                              product._id
                            }">
                                <button class="button button-secondary" onclick="editProduct('${
                                  product._id
                                }')">Editar</button>
                                <button class="button button-danger" onclick="deleteProduct('${
                                  product._id
                                }')">Excluir</button>
                            </div>
                            <button class="button button-primary add-to-cart-button" data-product-id="${
                              product._id
                            }">Adicionar ao Carrinho</button>
                        </div>
                    `;
              productsContainer.appendChild(productCard);
            });

            // Mostrar botões editar/excluir para admin
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

        const prevButton = document.createElement("button");
        prevButton.classList.add("pagination-button");
        prevButton.textContent = "Anterior";
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
          currentPage--;
          fetchProducts();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        paginationControls.appendChild(prevButton);

        const maxButtonsToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
        if (endPage - startPage + 1 < maxButtonsToShow) {
          startPage = Math.max(1, endPage - maxButtonsToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          const pageButton = document.createElement("button");
          pageButton.classList.add("pagination-button");
          pageButton.textContent = i;
          if (i === currentPage) {
            pageButton.classList.add("active");
          }
          pageButton.addEventListener("click", () => {
            currentPage = i;
            fetchProducts();
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
          paginationControls.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.classList.add("pagination-button");
        nextButton.textContent = "Próximo";
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
          currentPage++;
          fetchProducts();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        paginationControls.appendChild(nextButton);
      }

      // Mostrar/Ocultar botões editar/excluir conforme modo admin
      function toggleAdminButtons() {
        const isAdmin = addProductSection.style.display === "block";
        const allActionDivs = document.querySelectorAll("[id^='actions-']");
        allActionDivs.forEach((div) => {
          div.style.display = isAdmin ? "flex" : "none";
        });
      }

      // Mostrar formulário adicionar/editar produto
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
          categoryInput.value = "";
        }
      }

      function hideForm() {
        addProductForm.style.display = "none";
        showAddFormButton.style.display = "inline-block";
        addProductForm.reset();
        productIdInput.value = "";
      }

      showAddFormButton.addEventListener("click", () => showForm());
      cancelFormButton.addEventListener("click", hideForm);

      addProductForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const id = productIdInput.value;
        const method = id ? "PUT" : "POST";
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
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          });

          if (response.ok) {
            alert(`Produto ${id ? "atualizado" : "adicionado"} com sucesso!`);
            hideForm();

            currentPage = 1;
            currentSearchTerm = "";
            currentCategoryFilter = "all";
            currentMinPrice = "";
            currentMaxPrice = "";
            currentMinStock = "";
            searchInput.value = "";
            categoryFilterSelect.value = "all";
            minPriceInput.value = "";
            maxPriceInput.value = "";
            minStockInput.value = "";
            fetchProducts();
          } else {
            const errorData = await response.json();
            alert(`Erro ao ${id ? "atualizar" : "adicionar"} produto: ${errorData.message}`);
          }
        } catch (error) {
          console.error(`Erro ao ${id ? "atualizar" : "adicionar"} produto:`, error);
          alert("Erro de conexão. Verifique se o servidor está ativo.");
        }
      });

      window.editProduct = async (id) => {
        try {
          const response = await fetch(`${API_BASE_URL}/products/${id}`);
          if (!response.ok)
            throw new Error(`Erro ao buscar produto para edição: status ${response.status}`);

          const product = await response.json();
          showForm(product);
        } catch (error) {
          console.error("Erro ao buscar produto para edição:", error);
          alert("Não foi possível carregar os dados do produto para edição.");
        }
      };

      window.deleteProduct = async (id) => {
        if (!confirm("Tem certeza que deseja excluir este produto do catálogo?")) return;

        try {
          const response = await fetch(`${API_BASE_URL}/products/${id}`, { method: "DELETE" });
          if (response.ok) {
            alert("Produto excluído com sucesso!");

            currentPage = 1;
            currentSearchTerm = "";
            currentCategoryFilter = "all";
            currentMinPrice = "";
            currentMaxPrice = "";
            currentMinStock = "";
            searchInput.value = "";
            categoryFilterSelect.value = "all";
            minPriceInput.value = "";
            maxPriceInput.value = "";
            minStockInput.value = "";
            fetchProducts();
          } else {
            const errorData = await response.json();
            alert(`Erro ao excluir produto: ${errorData.message}`);
          }
        } catch (error) {
          console.error("Erro ao excluir produto:", error);
          alert("Erro de conexão ao excluir produto. Tente novamente.");
        }
      };

      // Filtros e busca
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

      searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          applyAllFiltersAndFetch();
        }
      });

      categoryFilterSelect.addEventListener("change", applyAllFiltersAndFetch);
      minPriceInput.addEventListener("input", applyAllFiltersAndFetch);
      maxPriceInput.addEventListener("input", applyAllFiltersAndFetch);
      minStockInput.addEventListener("input", applyAllFiltersAndFetch);

      // Delegação eventos botão adicionar ao carrinho
      productsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart-button")) {
          const productId = event.target.dataset.productId;
          if (productId) addProductToCart(productId);
        }
      });

      // Delegação eventos carrinho
      cartItemsContainer.addEventListener("click", (event) => {
        const productId = event.target.dataset.id;
        if (!productId) return;

        if (event.target.classList.contains("quantity-plus")) {
          updateQuantity(productId, +1);
        } else if (event.target.classList.contains("quantity-minus")) {
          updateQuantity(productId, -1);
        } else if (event.target.classList.contains("remove-from-cart")) {
          removeItemFromCart(productId);
        }
      });

      clearCartButton.addEventListener("click", () => {
        if (cart.length === 0) return;
        if (confirm("Deseja realmente esvaziar o carrinho?")) {
          cart = [];
          saveCartToLocalStorage();
          alert("Carrinho esvaziado.");
        }
      });

      checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
          alert("Seu carrinho está vazio.");
          return;
        }
        alert("Compra finalizada com sucesso! (Esta é uma simulação)");
        cart = [];
        saveCartToLocalStorage();
      });

      // Inicialização
      loadCartFromLocalStorage();
      fetchProducts();

      // Atualizar ano no rodapé
      document.getElementById("current-year").textContent = new Date().getFullYear();
    });
