/**
 * Model Loader - Fetches signed URLs for 3D models
 * Protects models from direct download
 * Supports material slot system for dynamic texture application
 */

// Configuration - UPDATE THIS AFTER DEPLOYING WORKER
const WORKER_URL = 'https://diyfurniture-worker.wnosworthy.workers.dev';

// Materials configuration
// For production: R2 public URL (enable public access in Cloudflare Dashboard)
// Format: https://pub-{hash}.r2.dev or custom domain
const MATERIALS_R2_URL = 'https://pub-bfa2d9f625fe46e9ba34b6cc08100b63.r2.dev';
const MATERIALS_LOCAL_PATH = window.SANDBOX_MATERIALS_PATH || './materials';
const MODELS_LOCAL_PATH = window.SANDBOX_MODELS_PATH || './models';

// Material sources - path within materials bucket/folder
const MATERIAL_SOURCES = {
  'plywood': 'plywood-00/plywood-00.gltf',
  'fabric': 'fabric-00/weave-00.gltf'
};
const DEFAULT_MATERIAL = 'plywood';

// Camera control settings (comment out to disable)
const CAMERA_INTERPOLATION_DECAY = 100; // Default is 50, higher = more inertia

// Check if running in local development mode
const IS_LOCAL = window.location.hostname === 'localhost' ||
                 window.location.hostname === '127.0.0.1' ||
                 window.location.protocol === 'file:';

/**
 * Get the base URL for materials based on environment
 */
function getMaterialsBaseUrl() {
  if (IS_LOCAL) {
    console.log('[MATERIALS] Using local materials path');
    return MATERIALS_LOCAL_PATH;
  }
  console.log('[MATERIALS] Using R2 materials URL');
  return MATERIALS_R2_URL;
}

// Store extracted materials globally
let sourceMaterials = {};
let materialSourceReady = false;
let materialSourceViewer = null;

/**
 * Update loading progress bar
 */
function updateLoadingProgress(percent) {
  const fill = document.getElementById('loadingBarFill');
  if (fill) {
    fill.style.width = `${percent}%`;
  }
}

/**
 * Check if a local model file exists
 */
async function checkLocalModelExists(modelName) {
  try {
    const response = await fetch(`${MODELS_LOCAL_PATH}/${modelName}`, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get the Three.js scene from model-viewer (works with v3.x)
 */
function getThreeScene(viewer) {
  const symbols = Object.getOwnPropertySymbols(viewer);
  const sceneSymbol = symbols.find(s => s.description === 'scene');
  return sceneSymbol ? viewer[sceneSymbol] : null;
}


/**
 * Apply source materials to a target model-viewer
 */
async function applyMaterialsToViewer(viewer) {
  if (!materialSourceReady || !viewer.model) {
    console.log('[MATERIALS] Cannot apply - source not ready or no model');
    return [];
  }

  const scene = getThreeScene(viewer);
  if (!scene) {
    console.log('[MATERIALS] Cannot apply - no scene');
    return [];
  }

  let applied = [];

  scene.traverse((node) => {
    if (node.isMesh && node.material) {
      const name = (node.material.name || '').toLowerCase();
      if (sourceMaterials[name]) {
        node.material = sourceMaterials[name].clone();
        node.material.name = name;
        node.material.needsUpdate = true;
        if (!applied.includes(name)) applied.push(name);
      }
    }
  });

  if (applied.length > 0) {
    viewer.requestUpdate();
    console.log(`[MATERIALS] Applied: ${applied.join(', ')}`);
  }

  return applied;
}

/**
 * Load a single material source and extract its materials
 */
async function loadMaterialSource(name, url) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;pointer-events:none;';
  container.innerHTML = `<model-viewer id="material-source-${name}" style="width:1px;height:1px;"></model-viewer>`;
  document.body.appendChild(container);

  const viewer = container.querySelector('model-viewer');
  console.log(`[MATERIALS] Loading ${name} from: ${url}`);
  viewer.setAttribute('src', url);

  // Poll for model ready
  const maxWait = 15000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    if (viewer.model) {
      extractSourceMaterialsFromViewer(viewer, name);
      return true;
    }
    await new Promise(r => setTimeout(r, 50));
  }

  console.warn(`[MATERIALS] Timeout loading ${name}`);
  return false;
}

/**
 * Extract materials from a specific viewer
 */
function extractSourceMaterialsFromViewer(viewer, sourceName) {
  const scene = getThreeScene(viewer);
  if (!scene) {
    console.warn(`[MATERIALS] Could not access Three.js scene for ${sourceName}`);
    return;
  }

  scene.traverse((node) => {
    if (node.isMesh && node.material) {
      const mat = node.material;
      const name = (mat.name || '').toLowerCase();
      if (name && !sourceMaterials[name]) {
        sourceMaterials[name] = mat;
        console.log(`[MATERIALS] Extracted: ${name} (from ${sourceName})`);
      }
    }
  });
}

/**
 * Create material source viewers and load all materials
 * Loads all material sources in parallel for speed
 */
async function initMaterialSource() {
  if (materialSourceReady) {
    return true;
  }

  const baseUrl = getMaterialsBaseUrl();

  // Load all material sources in parallel
  const loadPromises = Object.entries(MATERIAL_SOURCES).map(([name, path]) => {
    const url = `${baseUrl}/${path}`;
    return loadMaterialSource(name, url);
  });

  await Promise.all(loadPromises);

  materialSourceReady = Object.keys(sourceMaterials).length > 0;
  console.log(`[MATERIALS] All sources loaded. Available materials: ${Object.keys(sourceMaterials).join(', ')}`);

  return materialSourceReady;
}

/**
 * Get signed URL for a model
 */
async function getSignedModelUrl(modelName) {
  // Always try local first (works in both local and production if file exists)
  const localExists = await checkLocalModelExists(modelName);

  if (localExists) {
    console.log(`[LOCAL] Loading model from models folder: ${modelName}`);
    return `${MODELS_LOCAL_PATH}/${modelName}`;
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
 * Update circular spinner progress (0-100)
 */
function updateSpinnerProgress(viewer, percent) {
  const spinner = viewer.parentElement?.querySelector('.model-loading-spinner');
  if (spinner) {
    const progressCircle = spinner.querySelector('.spinner-progress');
    if (progressCircle) {
      // Circumference = 2 * π * r = 2 * 3.14159 * 16 ≈ 100.53
      const circumference = 100.53;
      const offset = circumference * (1 - percent / 100);
      progressCircle.style.strokeDashoffset = offset;
    }
  }
}

/**
 * Load a single model and apply materials
 * Simplified for fast loading
 */
async function loadSingleModel(viewer) {
  const modelName = viewer.getAttribute('data-model');
  if (!modelName || viewer.id === 'material-source-viewer') return;

  const signedUrl = await getSignedModelUrl(modelName);
  viewer.setAttribute('src', signedUrl);

  // Poll for model ready, then apply materials
  const maxWait = 10000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    if (viewer.model) {
      await applyMaterialsToViewer(viewer);
      break;
    }
    await new Promise(r => setTimeout(r, 50));
  }

  viewer.classList.add('materials-ready');

  const spinner = viewer.parentElement?.querySelector('.model-loading-spinner');
  if (spinner) {
    spinner.classList.add('fade-out');
    setTimeout(() => spinner.remove(), 300);
  }
}

/**
 * Load all models with signed URLs
 * Simplified for fast loading
 */
async function loadProtectedModels() {
  const modelViewers = document.querySelectorAll('model-viewer[data-model]');
  const isDetailPage = document.body.classList.contains('project-detail-page');

  // Initialize material source first
  console.log('[MATERIALS] Initializing material source...');
  await initMaterialSource();

  if (isDetailPage) {
    // Remove loading overlay
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 400);
    }
  }

  // Load all models
  const viewers = Array.from(modelViewers).filter(v => v.id !== 'material-source-viewer');

  if (isDetailPage) {
    // Detail page: load sequentially
    for (const viewer of viewers) {
      await loadSingleModel(viewer);
    }
  } else {
    // Main page: load in parallel
    await Promise.all(viewers.map(v => loadSingleModel(v)));
  }
}

/**
 * Simple model loading for main page (no material system)
 */
async function loadModelSimple(viewer) {
  const modelName = viewer.getAttribute('data-model');
  if (!modelName) return;

  try {
    updateSpinnerProgress(viewer, 20);
    const signedUrl = await getSignedModelUrl(modelName);
    updateSpinnerProgress(viewer, 40);

    const loadPromise = new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(), 10000);

      viewer.addEventListener('load', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });

      viewer.addEventListener('error', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
    });

    viewer.setAttribute('src', signedUrl);
    updateSpinnerProgress(viewer, 60);

    await loadPromise;
    updateSpinnerProgress(viewer, 100);

    viewer.classList.add('materials-ready');

    const spinner = viewer.parentElement?.querySelector('.model-loading-spinner');
    if (spinner) {
      spinner.classList.add('fade-out');
      setTimeout(() => spinner.remove(), 300);
    }

  } catch (error) {
    console.error(`Error loading ${modelName}:`, error);
    viewer.classList.add('materials-ready');
    const spinner = viewer.parentElement?.querySelector('.model-loading-spinner');
    if (spinner) spinner.remove();
  }
}

// Export function for use by product-loader
// Note: Only auto-load on project detail pages (not on index with dynamic products)
const isModelDetailPage = document.body.classList.contains('project-detail-page');

if (isModelDetailPage) {
  // On detail pages, load models immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProtectedModels);
  } else {
    loadProtectedModels();
  }
}
// On index page, product-loader will call loadProtectedModels() after creating products

/**
 * Apply camera settings to all model-viewers
 * To revert: comment out the CAMERA_INTERPOLATION_DECAY line at the top of this file
 */
function applyCameraSettings() {
  if (typeof CAMERA_INTERPOLATION_DECAY !== 'undefined') {
    document.querySelectorAll('model-viewer').forEach(viewer => {
      viewer.setAttribute('interpolation-decay', CAMERA_INTERPOLATION_DECAY);
    });
    console.log('[CAMERA] Applied interpolation-decay:', CAMERA_INTERPOLATION_DECAY);
  }
}

// Apply camera settings when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyCameraSettings);
} else {
  applyCameraSettings();
}

// Re-apply after products load (for dynamically created model-viewers)
const originalLoadProtectedModels = typeof loadProtectedModels !== 'undefined' ? loadProtectedModels : null;
if (originalLoadProtectedModels) {
  window.loadProtectedModels = async function() {
    await originalLoadProtectedModels();
    applyCameraSettings();
  };
}
