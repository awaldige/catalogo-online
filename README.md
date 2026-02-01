# 🛍️ Catálogo Online — Simulação de Loja Virtual

Projeto **full stack** de catálogo de produtos com carrinho de compras, filtros avançados e painel administrativo. Desenvolvido como projeto de portfólio por **André Waldige**, demonstrando integração entre frontend e backend com API e banco de dados.

---

## ✨ Funcionalidades

- ✅ Listagem de produtos com **paginação**
- 🔍 Filtros por:
  - Nome
  - Categoria
  - Preço mínimo e máximo
  - Estoque mínimo
- 🛒 Carrinho de compras com:
  - Controle de quantidade
  - Persistência via LocalStorage
- 📦 Cadastro e edição de produtos (modo administrador)
- 🖼️ Produtos com imagens via URL
- ☁️ Backend em **Node.js + Express**
- 🗄️ Banco de dados **MongoDB Atlas**
- 🌐 Frontend responsivo em **HTML, CSS e JavaScript puro**
- ⚙️ API RESTful integrada ao backend

---

## 🖼️ Demonstração
![IMG_1289](https://github.com/user-attachments/assets/32c343ca-9803-4bcc-9e80-ca9720a39f26)
![IMG_1290](https://github.com/user-attachments/assets/4b6df3ad-318c-4918-9c01-4311ec7cd463)
![IMG_1291](https://github.com/user-attachments/assets/a7b8bff2-0ef2-4c3c-90cd-b0efa315222e)
![IMG_1292](https://github.com/user-attachments/assets/1deccb19-541c-4fb3-9a38-4080f1bed993)
![IMG_1293](https://github.com/user-attachments/assets/953b826b-1e4f-4650-be31-cd517e6faf34)
![IMG_1294](https://github.com/user-attachments/assets/42c879bb-f251-4360-9c2d-3591348f50a7)
![IMG_1295](https://github.com/user-attachments/assets/dac7810c-fe0b-4816-b2c2-8517d2d5fe83)
![IMG_1296](https://github.com/user-attachments/assets/75fb7b4f-0ec3-40c0-b0e6-18a4969f5b8f)

---

## 📂 Estrutura do Projeto

catalogo-online/
│
├── frontend/
│ ├── index.html
│ ├── style.css
│ └── script.js
│
├── backend/
│ ├── server.js
│ ├── models/
│ └── routes/
│
└── README.md


---

## 🚀 Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Backend
- Node.js
- Express

### Banco de Dados
- MongoDB Atlas

### Hospedagem
- Vercel (Frontend)
- Render (Backend)

---

## ⚙️ Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/awaldige/catalogo-online.git
cd catalogo-online
2. Instalar dependências do backend
cd backend
npm install
3. Criar arquivo .env
Crie um arquivo .env na pasta backend:

PORT=3000
MONGODB_URI=sua_string_de_conexao_mongodb
4. Iniciar backend
node server.js
5. Abrir frontend
Abra o arquivo:

frontend/index.html
em um navegador.

📦 Deploy
🔗 Frontend (Vercel): https://catalogo-online-seven.vercel.app/
🔗 Backend (Render): https://catalogo-backend-e14g.onrender.com)

🔮 Melhorias Futuras
Autenticação de usuários

Sistema de pedidos

Integração com pagamentos

Painel administrativo avançado

Upload de imagens

Dashboard de vendas

👨‍💻 Autor
André Waldige
Desenvolvedor Web
🔗 GitHub: https://github.com/awaldige

⭐ Projeto criado para fins de estudo e portfólio.

