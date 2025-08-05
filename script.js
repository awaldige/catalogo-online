document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginSection = document.getElementById("login-section");
  const appSection = document.getElementById("app-section");
  const logoutButton = document.getElementById("logout-button");
  const token = localStorage.getItem("token");

  // Exibir app se estiver autenticado
  if (token) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
  }

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("https://catalogo-backend-e14g.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }) // <- CORREÇÃO AQUI
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        loginSection.classList.add("hidden");
        appSection.classList.remove("hidden");
        loginForm.reset();
      } else {
        alert(data.message || "Erro ao fazer login.");
      }
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      alert("Erro de conexão.");
    }
  });

  // Logout
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  });

  // Aqui continuam os outros scripts do catálogo (produtos, filtros, carrinho, etc)
  // Exemplo:
  carregarProdutos();

  async function carregarProdutos() {
    try {
      const response = await fetch("https://catalogo-backend-e14g.onrender.com/api/produtos");
      const produtos = await response.json();
      exibirProdutos(produtos);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  }

  function exibirProdutos(produtos) {
    const container = document.getElementById("products-container");
    container.innerHTML = "";

    if (produtos.length === 0) {
      container.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
    }

    produtos.forEach((produto) => {
      const card = document.createElement("div");
      card.classList.add("product-card");

      card.innerHTML = `
        <img src="${produto.imageUrl}" alt="${produto.name}" />
        <h3>${produto.name}</h3>
        <p>${produto.description}</p>
        <p class="price">R$ ${produto.price.toFixed(2)}</p>
        <p class="stock">Estoque: ${produto.stock}</p>
      `;

      container.appendChild(card);
    });
  }

});
