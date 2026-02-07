/**
 * Product Loader - Dynamically loads products from products.json
 * Makes it easy to add/edit products without touching HTML
 */

import { PixelateManager, PIXELATE_SETTINGS } from './pixelate-effect.js';

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
    products.forEach((product, index) => {
      const article = createProductCard(product, index);
      grid.appendChild(article);

      // Set up pixelate effect for this card
      const viewer = article.querySelector('model-viewer');
      const pixelateEffect = article.querySelector(`#pixelate-${index}`);

      if (viewer && pixelateEffect) {
        PixelateManager.register(index, viewer, pixelateEffect);
      }
    });

    console.log(`Loaded ${products.length} products`);

    // Trigger model loading after products are created
    if (typeof window.loadProtectedModels === 'function') {
      window.loadProtectedModels();
    }

  } catch (error) {
    console.error('Error loading products:', error);
  }
}

/**
 * Create a product card element
 */
function createProductCard(product, index) {
  const article = document.createElement('article');
  article.className = 'model-card';

  article.innerHTML = `
    <div class="model-viewer-container">
      <model-viewer
        id="model-viewer-${index}"
        data-model="${product.model}"
        alt="${product.name}"
        loading="eager"
        camera-controls
        disable-zoom
        disable-pan
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        tone-mapping="aces"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto">
        <effect-composer render-mode="quality">
          <pixelate-effect
            id="pixelate-${index}"
            blend-mode="default"
            granularity="${PIXELATE_SETTINGS.startGranularity}">
          </pixelate-effect>
          <color-grade-effect
            blend-mode="default"
            brightness="0"
            contrast="0"
            saturation="-.1">
          </color-grade-effect>
        </effect-composer>
      </model-viewer>
    </div>
    <div class="model-info">
      <div class="model-info-left">
        <a href="project.html?id=${product.id}" class="model-name">${product.name}</a>
        <div class="model-specs">
          <span class="model-materials">${product.medium}</span>
          <span class="model-dimensions">${product.dimensions}</span>
        </div>
      </div>
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

    // Update page title and meta tags for SEO
    const seoTitle = `${product.name} - DIY Furniture Plan | Build Guide`;
    const seoDescription = product.fullDescription ? product.fullDescription[0].substring(0, 155) + '...' : `Build your own ${product.name} with our detailed DIY furniture plan. Includes 3D model, cut list, and assembly instructions.`;

    document.title = seoTitle;

    // Update meta description
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) metaDesc.setAttribute('content', seoDescription);

    // Update Open Graph tags
    const ogTitle = document.getElementById('og-title');
    const ogDesc = document.getElementById('og-description');
    const ogUrl = document.getElementById('og-url');
    if (ogTitle) ogTitle.setAttribute('content', seoTitle);
    if (ogDesc) ogDesc.setAttribute('content', seoDescription);
    if (ogUrl) ogUrl.setAttribute('content', `https://diyfurnitureproject.com/project.html?id=${productId}`);

    // Update Twitter tags
    const twitterTitle = document.getElementById('twitter-title');
    const twitterDesc = document.getElementById('twitter-description');
    if (twitterTitle) twitterTitle.setAttribute('content', seoTitle);
    if (twitterDesc) twitterDesc.setAttribute('content', seoDescription);

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

    // Add download button
    const downloadButtonContainer = document.querySelector('.download-button-container');
    if (downloadButtonContainer) {
      downloadButtonContainer.innerHTML = `
        <span class="download-button download-button-disabled">
          Download PDF — Coming Soon
        </span>
      `;
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

// Expose loadProductDetail globally for inline scripts (project.html)
window.loadProductDetail = loadProductDetail;

// Load products when page is ready (only on index pages with a grid)
const isDetailPage = document.body.classList.contains('project-detail-page');

if (!isDetailPage) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
  } else {
    loadProducts();
  }
}
