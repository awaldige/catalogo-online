const apiUrl = "https://catalogo-backend-e14g.onrender.com/api/products"; // Ajuste aqui se necessário

// Pega o token salvo no localStorage
const token = localStorage.getItem("token");

// ================== Elementos ====================
const addForm = document.getElementById("add-product-form");
const showAddBtn = document.getElementById("show-add-form");
const cancelBtn = document.getElementById("cancel-form");
const productsContainer = document.getElementById("products-container");
const productFormTitle = document.getElementById("productFormTitle");

const categoryFilter = document.getElementById("category-filter");
const searchInput = document.getElementById("search-input");
const minPriceInput = document.getElementById("min-price-input");
const maxPriceInput = document.getElementById("max-price-input");
const minStockInput = document.getElementById("min-stock-input");

const searchButton = document.getElementById("search-button");
const clearSearchButton = document.getElementById("clear-search-button");

// ================== Mostrar / Esconder Form ====================
showAddBtn.addEventListener("click", () => {
  resetForm();
  productFormTitle.textContent = "Adicionar Novo Produto";
  addForm.classList.add("show");
});

cancelBtn.addEventListener("click", () => {
  addForm.classList.remove("show");
  resetForm();
});

// ================== Preencher formulário para edição ====================
function fillForm(product) {
  document.getElementById("product-id").value = product._id || product.id;
  document.getElementById("name").value = product.nome || product.name;
  document.getElementById("description").value = product.descricao || product.description;
  document.getElementById("price").value = product.preco || product.price;
  document.getElementById("imageUrl").value = product.imagem || product.imageUrl;
  document.getElementById("stock").value = product.estoque || product.stock || 0;
  document.getElementById("category").value = product.categoria || product.category;

  productFormTitle.textContent = "Editar Produto";
  addForm.classList.add("show");
}

// ================== Enviar produto (adicionar ou editar) ====================
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("product-id").value;
  const product = {
    nome: document.getElementById("name").value,
    descricao: document.getElementById("description").value,
    preco: parseFloat(document.getElementById("price").value),
    imagem: document.getElementById("imageUrl").value,
    estoque: parseInt(document.getElementById("stock").value),
    categoria: document.getElementById("category").value,
  };

  if (!token) {
    alert("Você precisa estar logado para realizar essa ação.");
    return;
  }

  try {
    const url = id ? `${apiUrl}/${id}` : apiUrl;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erro ao salvar o produto.");
    }

    alert(id ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
    loadProducts();
    resetForm();
    addForm.classList.remove("show");
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
});

// ================== Buscar e exibir produtos ====================
async function loadProducts() {
  if (!token) {
    productsContainer.innerHTML = "<p>Você precisa estar logado para ver os produtos.</p>";
    return;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erro ao carregar produtos.");
    }

    const data = await res.json();
    displayProducts(data);
  } catch (err) {
    productsContainer.innerHTML = "<p>Erro ao carregar produtos.</p>";
    console.error(err);
  }
}

// ================== Exibir os produtos na tela ====================
function displayProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <img src="${product.imagem || product.imageUrl}" alt="${product.nome || product.name}">
      <h3>${product.nome || product.name}</h3>
      <p>${product.descricao || product.description}</p>
      <p><strong>Preço:</strong> R$ ${(product.preco || product.price).toFixed(2)}</p>
      <p><strong>Estoque:</strong> ${product.estoque || product.stock || 0}</p>
      <p><strong>Categoria:</strong> ${product.categoria || product.category}</p>
      <button class="button button-edit" data-id="${product._id || product.id}">Editar</button>
    `;

    productsContainer.appendChild(card);
  });
}

// ================== Resetar formulário ====================
function resetForm() {
  addForm.reset();
  document.getElementById("product-id").value = "";
}

// ================== Filtro de busca ====================
searchButton.addEventListener("click", async () => {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const minPrice = parseFloat(minPriceInput.value) || 0;
  const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
  const minStock = parseInt(minStockInput.value) || 0;

  if (!token) {
    alert("Você precisa estar logado para buscar produtos.");
    return;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erro ao carregar produtos.");
    }

    const data = await res.json();

    const filtered = data.filter(p => {
      const matchesCategory = category === "all" || (p.categoria || p.category) === category;
      const matchesName = (p.nome || p.name).toLowerCase().includes(searchTerm);
      const matchesPrice = (p.preco || p.price) >= minPrice && (p.preco || p.price) <= maxPrice;
      const matchesStock = (p.estoque || p.stock) >= minStock;

      return matchesCategory && matchesName && matchesPrice && matchesStock;
    });

    displayProducts(filtered);
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
});

clearSearchButton.addEventListener("click", () => {
  categoryFilter.value = "all";
  searchInput.value = "";
  minPriceInput.value = "";
  maxPriceInput.value = "";
  minStockInput.value = "";
  loadProducts();
});

// ================== Delegação de evento para botão editar ====================
productsContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("button-edit")) {
    const id = e.target.dataset.id;

    if (!token) {
      alert("Você precisa estar logado para editar produtos.");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao buscar dados do produto.");
      }

      const product = await res.json();
      fillForm(product);
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  }
});

// ================== Inicialização ====================
document.getElementById("current-year").textContent = new Date().getFullYear();
loadProducts();
