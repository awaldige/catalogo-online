# 🛍️ Catálogo Online — Simulação de Loja Virtual

Este é um projeto **Full Stack** de um catálogo de produtos completo, contando com carrinho de compras, filtros inteligentes e um painel administrativo funcional. Desenvolvido como projeto de portfólio por **André Waldige**, o projeto demonstra o domínio na integração entre frontend e backend com persistência em banco de dados.

---

## 🖼️ Demonstração

<p align="center">
  <img src="https://github.com/user-attachments/assets/32c343ca-9803-4bcc-9e80-ca9720a39f26" width="48%" />
  <img src="https://github.com/user-attachments/assets/4b6df3ad-318c-4918-9c01-4311ec7cd463" width="48%" />
</p>

> **⚠️ Nota sobre o carregamento:** O backend deste projeto está hospedado no plano gratuito do **Render**. Por isso, o servidor "dorme" após um tempo de inatividade. **O primeiro acesso pode levar de 30 a 60 segundos** para o servidor despertar. Após esse período, as requisições serão instantâneas.

---

## ✨ Funcionalidades

- **✅ Gestão de Produtos:** Listagem dinâmica com sistema de **paginação**.
- **🔍 Filtros Avançados:** Busca refinada por nome, categoria, faixa de preço e estoque mínimo.
- **🛒 Carrinho de Compras:** - Controle de quantidade de itens.
  - Persistência automática via **LocalStorage**.
- **📦 Painel Administrativo:** Área dedicada para cadastro, edição e exclusão de produtos.
- **🖼️ Imagens Dinâmicas:** Suporte para exibição de produtos via URLs de imagem.
- **⚙️ API RESTful:** Comunicação fluida entre o cliente e o servidor.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5 / CSS3** (Design responsivo e moderno)
- **JavaScript (Vanilla)** (Manipulação de DOM e Fetch API)

### Backend
- **Node.js** com **Express**
- **MongoDB Atlas** (Banco de dados NoSQL na nuvem)

### Hospedagem
- **Vercel:** Frontend
- **Render:** Backend (API)

---

## 📂 Estrutura do Projeto

```text
catalogo-online/
├── frontend/        # Interface do usuário e lógica de cliente
├── backend/         # Servidor Node.js, Models e Rotas da API
└── README.md        # Documentação do projeto
⚙️ Como Executar Localmente
Clonar o repositório:

Bash
git clone [https://github.com/awaldige/catalogo-online.git](https://github.com/awaldige/catalogo-online.git)
cd catalogo-online
Configurar o Backend:

Bash
cd backend
npm install
Crie um arquivo .env na pasta backend com as seguintes chaves:
PORT=3000
MONGODB_URI=sua_string_de_conexao_mongodb

Iniciar o Servidor:

Bash
node server.js
Abrir o Frontend:
Basta abrir o arquivo frontend/index.html em seu navegador preferido.

🔗 Links Oficiais do Projeto
Frontend (Live): https://catalogo-online-seven.vercel.app/

Backend (API): https://catalogo-backend-e14g.onrender.com

👨‍💻 Autor
André Waldige — Desenvolvedor Web

🔗 Visite meu perfil no GitHub

⭐ Projeto criado para fins de estudo e portfólio.
