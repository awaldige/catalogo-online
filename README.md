# 🛍️ Catálogo Online — Full Stack E-commerce Experience

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

Este é um projeto **Full Stack** de um catálogo de produtos completo, focado em performance e usabilidade. Desenvolvido como destaque de portfólio por **André Waldige**, o projeto demonstra domínio na integração entre frontend e backend com persistência de dados em nuvem.

---

## 🖼️ Demonstração

<p align="center">
  <img src="https://github.com/user-attachments/assets/32c343ca-9803-4bcc-9e80-ca9720a39f26" width="48%" style="border-radius: 10px" />
  <img src="https://github.com/user-attachments/assets/4b6df3ad-318c-4918-9c01-4311ec7cd463" width="48%" style="border-radius: 10px" />
</p>

> [!IMPORTANT]
> **Nota sobre o carregamento:** O backend está hospedado no plano gratuito do **Render**. Por isso, o servidor entra em repouso após inatividade. **O primeiro acesso pode levar de 30 a 60 segundos** para o servidor "acordar". Após isso, o uso é instantâneo.

---

## ✨ Funcionalidades Principais

* **✅ Gestão de Produtos:** Listagem dinâmica com sistema de **paginação** eficiente.
* **🔍 Filtros Avançados:** Busca refinada por nome, categoria, faixa de preço e estoque mínimo.
* **🛒 Carrinho de Compras:** * Controle total de quantidade de itens.
    * Persistência automática via **LocalStorage** (não perde os dados ao atualizar).
* **📦 Painel Administrativo:** Área exclusiva para **CRUD** (cadastro, edição e exclusão) de produtos.
* **🖼️ Imagens Dinâmicas:** Gestão de exibição via URLs integradas ao banco de dados.
* **⚙️ API RESTful:** Comunicação assíncrona robusta entre cliente e servidor.

---

## 🚀 Tecnologias Utilizadas

### **Frontend**
* **HTML5 / CSS3** (Design responsivo e mobile-first)
* **JavaScript (Vanilla)** (Manipulação de DOM e Fetch API)

### **Backend**
* **Node.js & Express** (Arquitetura de rotas e middlewares)
* **MongoDB Atlas** (Banco de dados NoSQL na nuvem)

---

## 📂 Estrutura do Projeto

```text
catalogo-online/
├── frontend/         # Interface do usuário e lógica de cliente
├── backend/          # Servidor Node.js, Models e Rotas da API
└── README.md         # Documentação
⚙️ Como Executar Localmente
Clonar o repositório:

Bash
git clone [https://github.com/awaldige/catalogo-online.git](https://github.com/awaldige/catalogo-online.git)
cd catalogo-online
Configurar o Backend:

Bash
cd backend
npm install
# Crie um arquivo .env com PORT=3000 e MONGODB_URI=sua_conexao
node server.js
Abrir o Frontend:
Basta abrir o arquivo frontend/index.html ou usar a extensão Live Server no VS Code.

🔗 Links Oficiais
🚀 Projeto Live: Acesse aqui

📡 API Endpoint: Verificar no Render

👨‍💻 Autor
André Waldige — Desenvolvedor Web

⭐ Projeto criado para fins de estudo e portfólio.
