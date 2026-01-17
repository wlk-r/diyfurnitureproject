/**
 * Model Loader - Fetches signed URLs for 3D models
 * Protects models from direct download
 * Supports material slot system for dynamic texture application
 */

// Configuration - UPDATE THIS AFTER DEPLOYING WORKER
const WORKER_URL = 'https://diyfurniture-worker.wnosworthy.workers.dev';

// Material sources - public folder for browser caching
// Using loose glTF so texture images cache separately
const MATERIALS_PATH = './materials';
const MATERIAL_SOURCES = {
  'plywood': 'plywood-00/plywood-00.gltf'
};
const DEFAULT_MATERIAL = 'plywood';

// Check if running in local development mode
const IS_LOCAL = window.location.hostname === 'localhost' ||
                 window.location.hostname === '127.0.0.1' ||
                 window.location.protocol === 'file:';

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
    const response = await fetch(`./models/${modelName}`, { method: 'HEAD' });
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
 * Extract materials from the source material viewer
 */
function extractSourceMaterials() {
  if (!materialSourceViewer || !materialSourceViewer.model) return;

  const scene = getThreeScene(materialSourceViewer);
  if (!scene) {
    console.warn('[MATERIALS] Could not access Three.js scene');
    return;
  }

  scene.traverse((node) => {
    if (node.isMesh && node.material) {
      const mat = node.material;
      const name = (mat.name || '').toLowerCase();
      if (name && !sourceMaterials[name]) {
        sourceMaterials[name] = mat;
        console.log(`[MATERIALS] Extracted: ${name}`);
      }
    }
  });

  materialSourceReady = Object.keys(sourceMaterials).length > 0;
  console.log(`[MATERIALS] Source ready with ${Object.keys(sourceMaterials).length} materials:`, Object.keys(sourceMaterials));
}

/**
 * Apply source materials to a target model-viewer
 */
function applyMaterialsToViewer(viewer) {
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
    console.log(`[MATERIALS] Applied to model: ${applied.join(', ')}`);
  }

  return applied;
}

/**
 * Create hidden material source viewer and load materials
 */
async function initMaterialSource() {
  // Create container for material source
  // IMPORTANT: model-viewer must be visible (rendered) to properly load the model
  // Using opacity:0 and pointer-events:none keeps it invisible to users while
  // allowing the WebGL context to initialize properly
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;bottom:0;right:0;width:100px;height:100px;opacity:0;pointer-events:none;z-index:-1;';
  container.innerHTML = `
    <model-viewer
      id="material-source-viewer"
      style="width:100px;height:100px;">
    </model-viewer>
  `;
  document.body.appendChild(container);

  materialSourceViewer = container.querySelector('model-viewer');

  // Material source uses static public path (not signed URL) for browser caching
  // glTF with external textures allows each image to cache separately
  const materialPath = MATERIAL_SOURCES[DEFAULT_MATERIAL];
  const sourceUrl = `${MATERIALS_PATH}/${materialPath}`;
  console.log('[MATERIALS] Loading source from:', sourceUrl);

  return new Promise((resolve) => {
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      console.warn('[MATERIALS] Material source load timed out');
      resolve(false);
    }, 10000);

    materialSourceViewer.addEventListener('load', () => {
      clearTimeout(timeout);
      extractSourceMaterials();
      resolve(true);
    });

    materialSourceViewer.addEventListener('error', (e) => {
      clearTimeout(timeout);
      console.warn('[MATERIALS] Failed to load material source:', e);
      resolve(false);
    });

    materialSourceViewer.setAttribute('src', sourceUrl);
  });
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
 * Load a single model with materials
 */
async function loadSingleModel(viewer, useDelay = false) {
  const modelName = viewer.getAttribute('data-model');
  if (!modelName) return;
  if (viewer.id === 'material-source-viewer') return;

  try {
    updateSpinnerProgress(viewer, 10);

    // Get signed URL
    const signedUrl = await getSignedModelUrl(modelName);
    updateSpinnerProgress(viewer, 30);

    // Create a promise that resolves when model is loaded (with timeout)
    const loadPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn(`[MATERIALS] Model load timed out: ${modelName}`);
        resolve([]);
      }, 15000);

      viewer.addEventListener('load', () => {
        clearTimeout(timeout);
        console.log(`[MATERIALS] Model loaded: ${modelName}`);
        // Apply materials if any match
        const applied = applyMaterialsToViewer(viewer);
        resolve(applied);
      }, { once: true });

      viewer.addEventListener('error', (e) => {
        clearTimeout(timeout);
        console.error(`[MATERIALS] Model load error: ${modelName}`, e);
        reject(e);
      }, { once: true });
    });

    // Set src to start loading
    viewer.setAttribute('src', signedUrl);
    updateSpinnerProgress(viewer, 50);

    // Wait for load and material application to complete
    const appliedMaterials = await loadPromise;
    updateSpinnerProgress(viewer, 80);
    console.log(`[MATERIALS] Applied to ${modelName}:`, appliedMaterials);

    // Only use delay if materials were applied (or if explicitly requested)
    const hasMaterials = appliedMaterials && Array.isArray(appliedMaterials) && appliedMaterials.length > 0;
    if (hasMaterials || useDelay) {
      console.log(`[MATERIALS] Using delay for ${modelName} (hasMaterials: ${hasMaterials}, useDelay: ${useDelay})`);
      updateSpinnerProgress(viewer, 90);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    updateSpinnerProgress(viewer, 100);

    // Reveal the model
    viewer.classList.add('materials-ready');

    // Fade out spinner if present
    const spinner = viewer.parentElement?.querySelector('.model-loading-spinner');
    if (spinner) {
      spinner.classList.add('fade-out');
      setTimeout(() => spinner.remove(), 300);
    }

    console.log(`Loaded model: ${modelName}`);

  } catch (error) {
    console.error(`Error loading model ${modelName}:`, error);
    viewer.classList.add('materials-ready');
    const spinner = viewer.parentElement?.querySelector('.model-loading-spinner');
    if (spinner) spinner.remove();
  }
}

/**
 * Load all models with signed URLs
 */
async function loadProtectedModels() {
  const modelViewers = document.querySelectorAll('model-viewer[data-model]');
  const isDetailPage = document.body.classList.contains('project-detail-page');

  if (isDetailPage) {
    // Detail page: load material source first, then model with delay
    console.log('[MATERIALS] Initializing material source...');
    updateLoadingProgress(10);
    await initMaterialSource();
    updateLoadingProgress(30);
    console.log('[MATERIALS] Source ready, loading target model...');

    for (const viewer of modelViewers) {
      if (viewer.id === 'material-source-viewer') continue;

      updateLoadingProgress(50);
      await loadSingleModel(viewer, true);
      updateLoadingProgress(100);

      // Fade out full-page overlay
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 400);
      }
    }
  } else {
    // Main page: load models quickly without material system
    const loadPromises = modelViewers.length > 0 ? [] : [];

    for (const viewer of modelViewers) {
      loadPromises.push(loadModelSimple(viewer));
    }

    await Promise.all(loadPromises);
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
