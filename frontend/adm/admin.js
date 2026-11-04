
'use strict';

const API_BASE_URL = 'https://catalogo-backend-e14g.onrender.com/api';

const TOKEN_KEY = 'token';
const ITEMS_PER_PAGE = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
];

const token = localStorage.getItem(TOKEN_KEY);

if (!token) {
  window.location.replace('/adm/');
}

const elements = {
  sidebar: document.getElementById('sidebar'),
  menuToggle: document.getElementById('menuToggle'),
  logoutButton: document.getElementById('logoutButton'),
  pageTitle: document.getElementById('pageTitle'),

  totalProducts: document.getElementById('totalProducts'),
  inStockProducts: document.getElementById('inStockProducts'),
  outOfStockProducts: document.getElementById('outOfStockProducts'),
  recentProducts: document.getElementById('recentProducts'),

  productSearch: document.getElementById('productSearch'),
  productCount: document.getElementById('productCount'),
  productsTable: document.getElementById('productsTable'),
  pagination: document.getElementById('pagination'),

  productForm: document.getElementById('productForm'),
  productId: document.getElementById('productId'),
  productName: document.getElementById('productName'),
  productCategory: document.getElementById('productCategory'),
  productPrice: document.getElementById('productPrice'),
  productStock: document.getElementById('productStock'),
  productImage: document.getElementById('productImage'),
  imagePreviewContainer: document.getElementById('imagePreviewContainer'),
  imagePreview: document.getElementById('imagePreview'),
  productDescription: document.getElementById('productDescription'),

  formTitle: document.getElementById('formTitle'),
  saveProductButton: document.getElementById('saveProductButton'),
  cancelFormButton: document.getElementById('cancelFormButton'),
  formMessage: document.getElementById('formMessage'),

  newProductButton: document.getElementById('newProductButton'),
  addProductButton: document.getElementById('addProductButton'),
  toast: document.getElementById('toast')
};

let products = [];
let filteredProducts = [];
let currentPage = 1;
let toastTimeout;

let currentImageUrl = '';
let previewObjectUrl = null;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);
}

function safeImageUrl(value) {
  try {
    const url = new URL(value);

    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : '';
  } catch {
    return '';
  }
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function showToast(message, type = 'success') {
  elements.toast.textContent = message;

  elements.toast.className =
    `toast show ${type === 'error' ? 'error' : ''}`;

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    elements.toast.className = 'toast';
  }, 3500);
}

function showFormMessage(message, type = 'error') {
  elements.formMessage.textContent = message;
  elements.formMessage.className = `form-message ${type}`;
}

function clearImagePreview() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }

  elements.imagePreview.removeAttribute('src');
  elements.imagePreviewContainer.hidden = true;
}

function showImagePreview(imageUrl) {
  if (!imageUrl) {
    clearImagePreview();
    return;
  }

  clearImagePreview();

  elements.imagePreview.src = imageUrl;
  elements.imagePreviewContainer.hidden = false;
}

function setImagePreviewFromFile(file) {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }

  previewObjectUrl = URL.createObjectURL(file);

  elements.imagePreview.src = previewObjectUrl;
  elements.imagePreviewContainer.hidden = false;
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace('/adm/');

    throw new Error('Sessão expirada. Entre novamente.');
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      'Não foi possível concluir a operação.'
    );
  }

  return data;
}

async function uploadImage(file) {
  const formData = new FormData();

  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.replace('/adm/');

    throw new Error('Sessão expirada. Entre novamente.');
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      'Não foi possível enviar a imagem.'
    );
  }

  const imageUrl = safeImageUrl(data.imageUrl);

  if (!imageUrl) {
    throw new Error(
      'O serviço de imagens não retornou um endereço válido.'
    );
  }

  return imageUrl;
}

function showSection(sectionName) {
  const sections = {
    dashboard: {
      element: document.getElementById('dashboardSection'),
      title: 'Dashboard'
    },

    products: {
      element: document.getElementById('productsSection'),
      title: 'Produtos'
    },

    form: {
      element: document.getElementById('productFormSection'),
      title: elements.productId.value
        ? 'Editar produto'
        : 'Novo produto'
    }
  };

  const selected = sections[sectionName];

  if (!selected) return;

  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });

  selected.element.classList.add('active');

  elements.pageTitle.textContent = selected.title;

  document.querySelectorAll('.nav-item').forEach(button => {
    const isActive = button.dataset.section === sectionName;

    button.classList.toggle('active', isActive);

    if (isActive) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  elements.sidebar.classList.remove('open');
  elements.menuToggle.setAttribute('aria-expanded', 'false');
}

function updateDashboard() {
  const total = products.length;

  const inStock = products.filter(
    product => Number(product.stock) > 0
  ).length;

  const outOfStock = total - inStock;

  elements.totalProducts.textContent = total;
  elements.inStockProducts.textContent = inStock;
  elements.outOfStockProducts.textContent = outOfStock;

  const recent = products.slice(0, 5);

  if (!recent.length) {
    elements.recentProducts.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          Nenhum produto cadastrado.
        </td>
      </tr>
    `;

    return;
  }

  elements.recentProducts.innerHTML = recent.map(product => `
    <tr>
      <td>${escapeHTML(product.name)}</td>
      <td>${escapeHTML(product.category || 'Sem categoria')}</td>
      <td>${formatPrice(product.price)}</td>
      <td>
        <span class="stock-badge ${
          Number(product.stock) > 0 ? '' : 'empty'
        }">
          ${Number(product.stock) > 0 ? 'Disponível' : 'Sem estoque'}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderProducts() {
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE;

  const pageProducts = filteredProducts.slice(
    start,
    start + ITEMS_PER_PAGE
  );

  elements.productCount.textContent =
    `${filteredProducts.length} produto(s) encontrado(s)`;

  if (!pageProducts.length) {
    elements.productsTable.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          Nenhum produto encontrado.
        </td>
      </tr>
    `;
  } else {
    elements.productsTable.innerHTML = pageProducts.map(product => {
      const imageUrl = safeImageUrl(product.imageUrl);

      const image = imageUrl
        ? `
          <img
            class="product-thumb"
            src="${escapeHTML(imageUrl)}"
            alt=""
            loading="lazy"
          >
        `
        : '<div class="product-thumb"></div>';

      return `
        <tr>
          <td>
            <div class="product-cell">
              ${image}
              <span class="product-name">
                ${escapeHTML(product.name)}
              </span>
            </div>
          </td>

          <td>${escapeHTML(product.category || 'Sem categoria')}</td>

          <td>${formatPrice(product.price)}</td>

          <td>
            <span class="stock-badge ${
              Number(product.stock) > 0 ? '' : 'empty'
            }">
              ${
                Number(product.stock) > 0
                  ? `${Number(product.stock)} unidade(s)`
                  : 'Sem estoque'
              }
            </span>
          </td>

          <td>
            <div class="action-buttons">
              <button
                type="button"
                class="action-button"
                data-action="edit"
                data-id="${escapeHTML(product._id)}"
              >
                Editar
              </button>

              <button
                type="button"
                class="action-button delete"
                data-action="delete"
                data-id="${escapeHTML(product._id)}"
              >
                Excluir
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    elements.pagination.innerHTML = '';
    return;
  }

  let buttons = `
    <button
      type="button"
      data-page="${currentPage - 1}"
      ${currentPage === 1 ? 'disabled' : ''}
      aria-label="Página anterior"
    >
      Anterior
    </button>
  `;

  for (let page = 1; page <= totalPages; page++) {
    buttons += `
      <button
        type="button"
        data-page="${page}"
        class="${page === currentPage ? 'active' : ''}"
        ${page === currentPage ? 'aria-current="page"' : ''}
      >
        ${page}
      </button>
    `;
  }

  buttons += `
    <button
      type="button"
      data-page="${currentPage + 1}"
      ${currentPage === totalPages ? 'disabled' : ''}
      aria-label="Próxima página"
    >
      Próxima
    </button>
  `;

  elements.pagination.innerHTML = buttons;
}

function filterProducts() {
  const term = elements.productSearch.value.trim().toLowerCase();

  filteredProducts = products.filter(product => {
    const name = String(product.name || '').toLowerCase();
    const category = String(product.category || '').toLowerCase();

    return name.includes(term) || category.includes(term);
  });

  currentPage = 1;

  renderProducts();
}

async function loadProducts() {
  elements.productsTable.innerHTML = `
    <tr>
      <td colspan="5" class="empty-state">
        Carregando produtos...
      </td>
    </tr>
  `;

  try {
    const data = await apiRequest('/products?limit=50&page=1');

    products = Array.isArray(data.products)
      ? data.products
      : [];

    filteredProducts = [...products];

    updateDashboard();
    filterProducts();
  } catch (error) {
    elements.productsTable.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          ${escapeHTML(error.message)}
        </td>
      </tr>
    `;

    elements.recentProducts.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          Não foi possível carregar os produtos.
        </td>
      </tr>
    `;

    showToast(error.message, 'error');
  }
}

function resetProductForm() {
  clearImagePreview();

  currentImageUrl = '';

  elements.productForm.reset();

  elements.productId.value = '';

  elements.formTitle.textContent = 'Novo produto';

  elements.saveProductButton.textContent = 'Salvar produto';
  elements.saveProductButton.disabled = false;

  elements.cancelFormButton.textContent = 'Cancelar';

  elements.formMessage.textContent = '';
  elements.formMessage.className = 'form-message';
}

function openNewProductForm() {
  resetProductForm();
  showSection('form');
}

function openEditProductForm(productId) {
  const product = products.find(
    item => item._id === productId
  );

  if (!product) {
    showToast('Produto não encontrado.', 'error');
    return;
  }

  resetProductForm();

  elements.productId.value = product._id;
  elements.productName.value = product.name || '';
  elements.productCategory.value = product.category || '';
  elements.productPrice.value = product.price ?? '';
  elements.productStock.value = product.stock ?? 0;
  elements.productDescription.value = product.description || '';

  currentImageUrl = safeImageUrl(product.imageUrl);

  if (currentImageUrl) {
    showImagePreview(currentImageUrl);
  }

  elements.formTitle.textContent = 'Editar produto';

  elements.saveProductButton.textContent = 'Atualizar produto';

  showSection('form');
}

function validateSelectedImage(file) {
  if (!file) return true;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    showFormMessage(
      'Formato inválido. Utilize JPG, PNG, WEBP, GIF ou AVIF.'
    );

    return false;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    showFormMessage(
      'A imagem ultrapassa o limite de 5 MB.'
    );

    return false;
  }

  return true;
}

async function saveProduct(event) {
  event.preventDefault();

  const name = elements.productName.value.trim();
  const category = elements.productCategory.value.trim();
  const price = Number(elements.productPrice.value);
  const stock = Number(elements.productStock.value);
  const description = elements.productDescription.value.trim();

  const selectedFile = elements.productImage.files[0];

  if (!name || name.length > 150) {
    showFormMessage('Informe um nome válido para o produto.');
    elements.productName.focus();
    return;
  }

  if (
    elements.productPrice.value.trim() === '' ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    showFormMessage('Informe um preço válido.');
    elements.productPrice.focus();
    return;
  }

  if (
    elements.productStock.value.trim() === '' ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    showFormMessage('Informe uma quantidade de estoque válida.');
    elements.productStock.focus();
    return;
  }

  if (description.length > 2000) {
    showFormMessage('A descrição ultrapassa o limite permitido.');
    return;
  }

  if (!validateSelectedImage(selectedFile)) {
    return;
  }

  const productId = elements.productId.value;
  const isEditing = Boolean(productId);

  elements.saveProductButton.disabled = true;
  elements.saveProductButton.textContent = selectedFile
    ? 'Enviando imagem...'
    : 'Salvando...';

  try {
    let imageUrl = currentImageUrl;

    if (selectedFile) {
      imageUrl = await uploadImage(selectedFile);

      elements.saveProductButton.textContent = 'Salvando produto...';
    }

    const productData = {
      name,
      category,
      price,
      stock,
      imageUrl,
      description
    };

    await apiRequest(
      isEditing
        ? `/products/${encodeURIComponent(productId)}`
        : '/products',
      {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(productData)
      }
    );

    resetProductForm();

    await loadProducts();

    showSection('products');

    showToast(
      isEditing
        ? 'Produto atualizado com sucesso.'
        : 'Produto cadastrado com sucesso.'
    );
  } catch (error) {
    showFormMessage(error.message);

    elements.saveProductButton.disabled = false;

    elements.saveProductButton.textContent = isEditing
      ? 'Atualizar produto'
      : 'Salvar produto';
  }
}

async function deleteProduct(productId) {
  const product = products.find(
    item => item._id === productId
  );

  if (!product) return;

  const confirmed = window.confirm(
    `Deseja realmente excluir o produto "${product.name}"? Esta ação não poderá ser desfeita.`
  );

  if (!confirmed) return;

  try {
    await apiRequest(
      `/products/${encodeURIComponent(productId)}`,
      {
        method: 'DELETE'
      }
    );

    await loadProducts();

    showToast('Produto excluído com sucesso.');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

/* NAVEGAÇÃO */

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    showSection(button.dataset.section);
  });
});

/* MENU RESPONSIVO */

elements.menuToggle.addEventListener('click', () => {
  const isOpen = elements.sidebar.classList.toggle('open');

  elements.menuToggle.setAttribute(
    'aria-expanded',
    String(isOpen)
  );
});

/* LOGOUT */

elements.logoutButton.addEventListener('click', () => {
  localStorage.removeItem(TOKEN_KEY);

  window.location.replace('/adm/');
});

/* FORMULÁRIOS */

elements.newProductButton.addEventListener(
  'click',
  openNewProductForm
);

elements.addProductButton.addEventListener(
  'click',
  openNewProductForm
);

elements.cancelFormButton.addEventListener('click', () => {
  resetProductForm();
  showSection('products');
});

/* SELEÇÃO E PRÉ-VISUALIZAÇÃO DA IMAGEM */

elements.productImage.addEventListener('change', () => {
  const file = elements.productImage.files[0];

  if (!file) {
    showImagePreview(currentImageUrl);
    return;
  }

  if (!validateSelectedImage(file)) {
    elements.productImage.value = '';
    showImagePreview(currentImageUrl);
    return;
  }

  showFormMessage('', 'success');

  setImagePreviewFromFile(file);
});

/* ENVIO DO FORMULÁRIO */

elements.productForm.addEventListener(
  'submit',
  saveProduct
);

/* PESQUISA */

elements.productSearch.addEventListener(
  'input',
  filterProducts
);

/* AÇÕES DA TABELA */

elements.productsTable.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');

  if (!button) return;

  const { action, id } = button.dataset;

  if (action === 'edit') {
    openEditProductForm(id);
  }

  if (action === 'delete') {
    deleteProduct(id);
  }
});

/* PAGINAÇÃO */

elements.pagination.addEventListener('click', event => {
  const button = event.target.closest('button[data-page]');

  if (!button || button.disabled) return;

  currentPage = Number(button.dataset.page);

  renderProducts();
});

/* LIBERAÇÃO DE RECURSOS */

window.addEventListener('beforeunload', () => {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }
});

/* INICIALIZAÇÃO */

loadProducts();
