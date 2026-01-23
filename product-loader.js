/**
 * Product Loader - Dynamically loads products from products.json
 * Makes it easy to add/edit products without touching HTML
 */

// Pixelate effect settings
const PIXELATE_SETTINGS = {
  startGranularity: 50,
  endGranularity: 15,
  duration: 3000,
  fadeDelay: 500,
  updateRate: 50
};

// Ease in-out function (cubic)
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Pixelate effect manager
const PixelateEffect = {
  instances: [],
  animationIntervals: {},

  startAnimation(id) {
    const instance = this.instances.find(i => i.id === id);
    if (!instance) return;

    const { pixelateEffect } = instance;
    instance.active = true;

    // Set initial granularity
    pixelateEffect.setAttribute('granularity', PIXELATE_SETTINGS.startGranularity);
    pixelateEffect.setAttribute('blend-mode', 'default');

    const startTime = performance.now();
    const startGran = PIXELATE_SETTINGS.startGranularity;
    const endGran = PIXELATE_SETTINGS.endGranularity;

    const animate = () => {
      if (!instance.active) return;

      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / PIXELATE_SETTINGS.duration);
      const easedProgress = easeInOut(progress);

      const currentGranularity = Math.round(startGran - (startGran - endGran) * easedProgress);
      pixelateEffect.setAttribute('granularity', currentGranularity);

      if (progress < 1) {
        this.animationIntervals[id] = setTimeout(animate, PIXELATE_SETTINGS.updateRate);
      } else {
        // Animation complete - remove effect-composer and tone-mapping to restore original colors
        const effectComposer = instance.viewer.querySelector('effect-composer');
        if (effectComposer) {
          effectComposer.remove();
        }
        instance.viewer.removeAttribute('tone-mapping');
        instance.active = false;
        console.log(`[EFFECT] Model ${id} animation complete, effect-composer removed`);
      }
    };

    // Start with delay
    setTimeout(animate, PIXELATE_SETTINGS.fadeDelay);
  },

  stopAnimation(id) {
    if (this.animationIntervals[id]) {
      clearTimeout(this.animationIntervals[id]);
      delete this.animationIntervals[id];
    }
    const instance = this.instances.find(i => i.id === id);
    if (instance) {
      instance.active = false;
    }
  }
};

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
        // Store instance
        PixelateEffect.instances.push({
          id: index,
          viewer,
          pixelateEffect,
          active: false
        });

        // Watch for materials-ready class (added by model-loader.js after materials applied)
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              if (viewer.classList.contains('materials-ready')) {
                // Materials are applied - start pixelate animation
                console.log(`[EFFECT] Model ${index} materials ready, starting animation`);
                PixelateEffect.startAnimation(index);
                observer.disconnect();
              }
            }
          });
        });

        observer.observe(viewer, { attributes: true, attributeFilter: ['class'] });

        // Fallback: if materials-ready is already set
        if (viewer.classList.contains('materials-ready')) {
          PixelateEffect.startAnimation(index);
          observer.disconnect();
        }
      }
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

    // Add buy button
    const buyButtonContainer = document.querySelector('.buy-button-container');
    if (buyButtonContainer) {
      if (product.checkoutUrl) {
        buyButtonContainer.innerHTML = `
          <a href="${product.checkoutUrl}" class="buy-button" target="_blank">
            Buy Plan — $${product.price}
          </a>
        `;
      } else {
        buyButtonContainer.innerHTML = `
          <span class="buy-button buy-button-disabled">
            Coming Soon — $${product.price}
          </span>
        `;
      }
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

// Load products when page is ready (only on index pages with a grid)
const isDetailPage = document.body.classList.contains('project-detail-page');

if (!isDetailPage) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
  } else {
    loadProducts();
  }
}
