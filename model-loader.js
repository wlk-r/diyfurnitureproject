/**
 * Model Loader - Fetches signed URLs for 3D models
 * Protects models from direct download
 */

// Configuration - UPDATE THIS AFTER DEPLOYING WORKER
const WORKER_URL = 'https://diyfurniture-worker.wnosworthy.workers.dev';

// Check if running in local development mode
const IS_LOCAL = window.location.hostname === 'localhost' ||
                 window.location.hostname === '127.0.0.1' ||
                 window.location.protocol === 'file:';

/**
 * Check if a local model file exists
 */
async function checkLocalModelExists(modelName) {
  try {
    const response = await fetch(`./models/${modelName}`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get signed URL for a model
 */
async function getSignedModelUrl(modelName) {
  // Always try local first (works in both local and production if file exists)
  const localExists = await checkLocalModelExists(modelName);

  if (localExists) {
    console.log(`[LOCAL] Loading model from models folder: ${modelName}`);
    return `./models/${modelName}`;
  }

  // If not found locally, use production worker
  console.log(`[PRODUCTION] Loading model from worker: ${modelName}`);
  try {
    const response = await fetch(`${WORKER_URL}/api/model-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelName })
    });

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;

  } catch (error) {
    console.error('Error fetching signed URL:', error);
    // Fallback to direct R2 URL if worker fails
    return `https://pub-fe05b24a16c144acaac1543477b4828c.r2.dev/${modelName}`;
  }
}

/**
 * Load all models with signed URLs
 */
async function loadProtectedModels() {
  const modelViewers = document.querySelectorAll('model-viewer[data-model]');

  for (const viewer of modelViewers) {
    const modelName = viewer.getAttribute('data-model');

    if (!modelName) continue;

    try {
      // Show loading state
      viewer.setAttribute('loading', 'eager');

      // Get signed URL
      const signedUrl = await getSignedModelUrl(modelName);

      // Update model-viewer src
      viewer.setAttribute('src', signedUrl);

      console.log(`Loaded model: ${modelName}`);

    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
    }
  }
}

// Export function for use by product-loader
// Note: Only auto-load on project detail pages (not on index with dynamic products)
const isDetailPage = document.body.classList.contains('project-detail-page');

if (isDetailPage) {
  // On detail pages, load models immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProtectedModels);
  } else {
    loadProtectedModels();
  }
}
// On index page, product-loader will call loadProtectedModels() after creating products
