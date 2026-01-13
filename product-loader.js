/**
 * Product Loader - Dynamically loads products from products.json
 * Makes it easy to add/edit products without touching HTML
 */

/**
 * Load products and render them on the page
 */
async function loadProducts() {
  try {
    // Fetch products data
    const response = await fetch('./products.json');
    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products;

    // Get the grid container
    const grid = document.querySelector('.models-grid');
    if (!grid) {
      console.error('Models grid container not found');
      return;
    }

    // Clear existing content
    grid.innerHTML = '';

    // Generate HTML for each product
    products.forEach(product => {
      const article = createProductCard(product);
      grid.appendChild(article);
    });

    console.log(`Loaded ${products.length} products`);

    // Trigger model loading after products are created
    if (typeof loadProtectedModels === 'function') {
      loadProtectedModels();
    }

  } catch (error) {
    console.error('Error loading products:', error);
  }
}

/**
 * Create a product card element
 */
function createProductCard(product) {
  const article = document.createElement('article');
  article.className = 'model-card';

  article.innerHTML = `
    <div class="model-viewer-container">
      <model-viewer
        data-model="${product.model}"
        alt="${product.name}"
        camera-controls
        disable-zoom
        disable-pan
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        ar>
      </model-viewer>
    </div>
    <div class="model-info">
      <a href="project${product.id}.html" class="model-name">${product.name}</a>
      <span class="model-price">$${product.price}</span>
    </div>
  `;

  return article;
}

/**
 * Generate detail page content (for use on project pages)
 */
async function loadProductDetail(productId) {
  try {
    const response = await fetch('./products.json');
    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.statusText}`);
    }

    const data = await response.json();
    const product = data.products.find(p => p.id === productId);

    if (!product) {
      console.error(`Product ${productId} not found`);
      return;
    }

    // Update page title
    document.title = `${product.name} — diy furniture project`;

    // Update model viewer
    const viewer = document.querySelector('.fullbleed-viewer model-viewer');
    if (viewer) {
      viewer.setAttribute('data-model', product.model);
      viewer.setAttribute('alt', product.name);
    }

    // Update project info
    const titleElement = document.querySelector('.project-title-large');
    if (titleElement) {
      titleElement.textContent = product.name;
    }

    // Update details
    updateDetailRow('Year:', product.year);
    updateDetailRow('Medium:', product.medium);
    updateDetailRow('Dimensions:', product.dimensions);

    // Update description
    const descContainer = document.querySelector('.project-description-full');
    if (descContainer && product.fullDescription) {
      descContainer.innerHTML = product.fullDescription
        .map(para => `<p>${para}</p>`)
        .join('');
    }

    console.log(`Loaded product detail for: ${product.name}`);

  } catch (error) {
    console.error('Error loading product detail:', error);
  }
}

/**
 * Helper to update a detail row
 */
function updateDetailRow(label, value) {
  const rows = document.querySelectorAll('.detail-row');
  for (const row of rows) {
    const labelElement = row.querySelector('.detail-label');
    if (labelElement && labelElement.textContent === label) {
      const valueElement = row.querySelector('.detail-value');
      if (valueElement) {
        valueElement.textContent = value;
      }
      break;
    }
  }
}

// Load products when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProducts);
} else {
  loadProducts();
}
