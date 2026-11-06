# 🛍️ Catálogo Online — AW TECHNOLOGY

Catálogo digital de produtos desenvolvido como projeto Full Stack pela **AW TECHNOLOGY**, com foco em experiência do usuário, organização de produtos e gerenciamento administrativo.

A aplicação reúne uma vitrine de produtos, filtros de busca, carrinho demonstrativo e painel administrativo para gerenciamento do catálogo.

🔗 **Demonstração online:** https://catalogo-online-seven.vercel.app/

---

## 📸 Demonstração
<img width="1361" height="768" alt="home -catalogo" src="https://github.com/user-attachments/assets/318b91e3-7447-41cc-8371-b6f9fcd14feb" />

<img width="1362" height="768" alt="produtos" src="https://github.com/user-attachments/assets/53faeb0f-1790-464b-87d1-8c2d3c7b036a" />

<img width="1364" height="752" alt="login" src="https://github.com/user-attachments/assets/e98dbbde-5246-4996-9a31-081f0b5535e7" />

<img width="1366" height="764" alt="dashboard-catalogo" src="https://github.com/user-attachments/assets/800ddea6-30fa-4e05-9f0b-94426280dd55" />


---

## ✨ Funcionalidades

### Catálogo
- Exibição dinâmica de produtos.
- Pesquisa por nome.
- Filtros por categoria.
- Filtro por faixa de preço.
- Filtro por estoque mínimo.
- Paginação de produtos.
- Exibição de imagens dos produtos.

### Carrinho demonstrativo
- Adição e remoção de produtos.
- Alteração de quantidades.
- Cálculo do subtotal.
- Persistência dos itens com LocalStorage.

### Painel administrativo
- Acesso por autenticação.
- Gerenciamento de produtos.
- Cadastro, edição e exclusão de produtos.
- Gerenciamento de imagens.
- Upload de imagens integrado ao Cloudinary.

### Backend e API
- API REST desenvolvida com Express.
- Integração com MongoDB Atlas.
- Modelagem de dados com Mongoose.
- Rotas para gerenciamento de produtos e usuários.
- Upload e armazenamento de imagens na nuvem.

---

## 🛠️ Tecnologias utilizadas

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Multer
- Cloudinary

**Hospedagem e serviços**
- Vercel — frontend
- Render — backend
- MongoDB Atlas — banco de dados
- Cloudinary — armazenamento de imagens

---

## 📁 Estrutura do projeto

```text
catalogo-online/
│
├── frontend/
│   ├── adm/
│   │   ├── index.html
│   │   ├── painel.html
│   │   ├── admin.css
│   │   └── admin.js
│   │
│   ├── assets/
│   │   └── img/
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── script.js
│   │
│   └── index.html
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ⚙️ Como executar localmente

### 1. Pré-requisitos

- Node.js
- npm
- Conta no MongoDB Atlas
- Conta no Cloudinary
- Visual Studio Code (recomendado)

### 2. Clonar o repositório

```bash
git clone https://github.com/awaldige/catalogo-online.git
```

```bash
cd catalogo-online
```

### 3. Configurar o backend

```bash
cd backend
npm install
```

Crie um arquivo chamado `.env` dentro da pasta `backend`:

```env
PORT=3000
MONGODB_URI=sua_string_de_conexao_mongodb

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
```

Substitua os valores de exemplo pelas credenciais dos respectivos serviços.

**Importante:** nunca compartilhe ou envie o arquivo `.env` para o GitHub. As credenciais devem permanecer protegidas.

### 4. Iniciar o backend

Para iniciar em modo de desenvolvimento:

```bash
npm run dev
```

Ou iniciar normalmente:

```bash
npm start
```

### 5. Abrir o frontend

Abra a pasta `frontend` no Visual Studio Code e execute o arquivo `index.html` com a extensão Live Server.

---

## 🌐 Links do projeto

- **Aplicação:** https://catalogo-online-seven.vercel.app/
- **Backend:** https://catalogo-backend-e14g.onrender.com
- **Status da API:** https://catalogo-backend-e14g.onrender.com/api/status
- **Repositório:** https://github.com/awaldige/catalogo-online

*Observação: em hospedagens gratuitas, o primeiro acesso ao backend após um período de inatividade pode apresentar um tempo maior de resposta.*

---

## 🔐 Segurança

- Credenciais e variáveis de ambiente mantidas fora do repositório.
- Autenticação administrativa.
- Senhas protegidas com bcryptjs.
- Tokens JWT para autenticação.
- Upload de imagens por serviço externo.

---

## 📌 Sobre o projeto

O Catálogo Online é um projeto demonstrativo desenvolvido pela **AW TECHNOLOGY** para apresentar possibilidades de criação de soluções digitais para negócios.

A aplicação demonstra a integração entre frontend, backend, banco de dados e serviços externos, com recursos de catálogo, carrinho e administração.

O carrinho possui finalidade demonstrativa e não representa uma operação comercial com processamento real de pagamentos.

---

## 👨‍💻 Desenvolvedor

**André Waldige**  
**AW TECHNOLOGY — Desenvolvimento de Software**

GitHub: https://github.com/awaldige

