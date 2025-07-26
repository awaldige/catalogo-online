const apiUrl = "https://catalogo-backend-e14g.onrender.com/api/products";
const token = localStorage.getItem("token");

// ========== ELEMENTOS ==========
const formAddProduct = document.getElementById("add-product-form");
const showAddFormBtn = document.getElementById("show-add-form");
const cancelFormBtn = document.getElementById("cancel-form");
const productFormTitle = document.getElementById("productFormTitle");
const containerProdutos = document.getElementById("products-container");

const categoryFilter = document.getElementById("category-filter");
const searchInput = document.getElementById("search-input");
const minPriceInput = document.getElementById("min-price-input");
const maxPriceInput = document.getElementById("max-price-input");
const minStockInput = document.getElementById("min-stock-input");

const searchButton = document.getElementById("search-button");
const clearSearchButton = document.getElementById("clear-search-button");

let editandoProdutoId = null;

// ========== MOSTRAR FORM ==========
showAddFormBtn.addEventListener("click", () => {
  formAddProduct.reset();
  editandoProdutoId = null;
  productFormTitle.textContent = "Adicionar Novo Produto";
  formAddProduct.classList.add("show");
});

cancelFormBtn.addEventListener("click", () => {
  formAddProduct.classList.remove("show");
  formAddProduct.reset();
  editandoProdutoId = null;
});

// ========== ENVIAR FORMULÁRIO ==========
formAddProduct.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!token) {
    alert("Você precisa estar logado para realizar essa ação.");
    return;
  }

  const produto = {
    nome: document.getElementById("name").value,
    descricao: document.getElementById("description").value,
    preco: parseFloat(document.getElementById("price").value),
    imagem: document.getElementById("imageUrl").value,
    estoque: parseInt(document.getElementById("stock").value),
    categoria: document.getElementById("category").value,
  };

  try {
    const url = editandoProdutoId ? `${apiUrl}/${editandoProdutoId}` : apiUrl;
    const method = editandoProdutoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(produto),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erro ao salvar produto.");
    }

    alert(editandoProdutoId ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
    formAddProduct.classList.remove("show");
    formAddProduct.reset();
    editandoProdutoId = null;
    buscarComFiltros();
  } catch (error) {
    alert("Erro ao salvar produto.");
    console.error(error);
  }
});

// ========== BUSCAR PRODUTOS ==========
async function buscarComFiltros() {
  if (!token) {
    containerProdutos.innerHTML = "<p>Você precisa estar logado para ver os produtos.</p>";
    return;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Erro ao carregar produtos.");
    }

    const produtos = await res.json();
    exibirProdutos(produtos);
  } catch (err) {
    containerProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>";
    console.error(err);
  }
}

// ========== EXIBIR PRODUTOS ==========
function exibirProdutos(produtos) {
  containerProdutos.innerHTML = "";

  if (produtos.length === 0) {
    containerProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  produtos.forEach((produto) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      <p><strong>Preço:</strong> R$ ${produto.preco.toFixed(2)}</p>
      <p><strong>Estoque:</strong> ${produto.estoque}</p>
      <p><strong>Categoria:</strong> ${produto.categoria}</p>
      <button class="button button-edit" data-id="${produto._id}">Editar</button>
    `;

    containerProdutos.appendChild(card);
  });
}

// ========== EDITAR PRODUTO ==========
containerProdutos.addEventListener("click", async (e) => {
  if (e.target.classList.contains("button-edit")) {
    const id = e.target.dataset.id;

    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao buscar produto.");
      }

      const produto = await res.json();
      document.getElementById("name").value = produto.nome;
      document.getElementById("description").value = produto.descricao;
      document.getElementById("price").value = produto.preco;
      document.getElementById("imageUrl").value = produto.imagem;
      document.getElementById("stock").value = produto.estoque;
      document.getElementById("category").value = produto.categoria;

      productFormTitle.textContent = "Editar Produto";
      formAddProduct.classList.add("show");
      editandoProdutoId = produto._id;
    } catch (err) {
      alert("Erro ao buscar produto.");
      console.error(err);
    }
  }
});

// ========== BUSCA E FILTROS ==========
searchButton.addEventListener("click", async () => {
  const termo = searchInput.value.toLowerCase();
  const categoria = categoryFilter.value;
  const precoMin = parseFloat(minPriceInput.value) || 0;
  const precoMax = parseFloat(maxPriceInput.value) || Infinity;
  const estoqueMin = parseInt(minStockInput.value) || 0;

  try {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const filtrado = data.filter((p) => {
      return (
        (categoria === "all" || p.categoria === categoria) &&
        p.nome.toLowerCase().includes(termo) &&
        p.preco >= precoMin &&
        p.preco <= precoMax &&
        p.estoque >= estoqueMin
      );
    });

    exibirProdutos(filtrado);
  } catch (err) {
    alert("Erro na busca.");
    console.error(err);
  }
});

clearSearchButton.addEventListener("click", () => {
  categoryFilter.value = "all";
  searchInput.value = "";
  minPriceInput.value = "";
  maxPriceInput.value = "";
  minStockInput.value = "";
  buscarComFiltros();
});

// ========== INICIALIZA ==========
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("current-year").textContent = new Date().getFullYear();
  buscarComFiltros();
});
