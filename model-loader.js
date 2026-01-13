/**
 * Model Loader - Fetches signed URLs for 3D models
 * Protects models from direct download
 */

// Configuration - UPDATE THIS AFTER DEPLOYING WORKER
const WORKER_URL = 'https://diyfurniture-worker.YOUR_SUBDOMAIN.workers.dev';

/**
 * Get signed URL for a model
 */
async function getSignedModelUrl(modelName) {
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

// Load models when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProtectedModels);
} else {
  loadProtectedModels();
}
