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

![Captura de tela 2026-04-02 154934](https://github.com/user-attachments/assets/e4fb6276-ce01-4378-8daa-72c3d49508e4)
![Captura de tela 2026-04-02 155311](https://github.com/user-attachments/assets/d8cf6dc7-50fc-4d59-b96f-52eba1d27ab7)
![Captura de tela 2026-04-02 155231](https://github.com/user-attachments/assets/a54946c5-b35c-40ad-b971-540bb17fce77)
![Captura de tela 2026-04-02 155208](https://github.com/user-attachments/assets/90261590-d117-4ab0-86aa-1dc6bde90ef5)


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
