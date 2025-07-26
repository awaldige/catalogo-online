const apiUrl = "https://catalogo-backend-e14g.onrender.com/produtos";

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
  document.getElementById("product-id").value = product.id;
  document.getElementById("name").value = product.nome;
  document.getElementById("description").value = product.descricao;
  document.getElementById("price").value = product.preco;
  document.getElementById("imageUrl").value = product.imagem;
  document.getElementById("stock").value = product.estoque || 0;
  document.getElementById("category").value = product.categoria;

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

  try {
    if (id) {
      await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    } else {
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    }

    loadProducts();
    resetForm();
    addForm.classList.remove("show");
  } catch (error) {
    alert("Erro ao salvar o produto.");
    console.error(error);
  }
});

// ================== Buscar e exibir produtos ====================
async function loadProducts() {
  try {
    const res = await fetch(apiUrl);
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
      <img src="${product.imagem}" alt="${product.nome}">
      <h3>${product.nome}</h3>
      <p>${product.descricao}</p>
      <p><strong>Preço:</strong> R$ ${product.preco.toFixed(2)}</p>
      <p><strong>Estoque:</strong> ${product.estoque || 0}</p>
      <p><strong>Categoria:</strong> ${product.categoria}</p>
      <button class="button button-edit" data-id="${product.id}">Editar</button>
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

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    const filtered = data.filter(p => {
      const matchesCategory = category === "all" || p.categoria === category;
      const matchesName = p.nome.toLowerCase().includes(searchTerm);
      const matchesPrice = p.preco >= minPrice && p.preco <= maxPrice;
      const matchesStock = p.estoque >= minStock;

      return matchesCategory && matchesName && matchesPrice && matchesStock;
    });

    displayProducts(filtered);
  } catch (err) {
    console.error(err);
    alert("Erro ao filtrar produtos.");
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

    try {
      const res = await fetch(`${apiUrl}/${id}`);
      const product = await res.json();
      fillForm(product);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar dados do produto.");
    }
  }
});

// ================== Inicialização ====================
document.getElementById("current-year").textContent = new Date().getFullYear();
loadProducts();
