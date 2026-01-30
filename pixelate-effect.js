/**
 * Pixelate Effect Module
 * Shared animation that de-pixelates model-viewer elements after materials load.
 * 
 * Usage:
 *   import { watchAndAnimate } from './pixelate-effect.js';
 *   watchAndAnimate(viewerElement, pixelateEffectElement);
 * 
 * Or for dynamically created viewers (product cards):
 *   import { PixelateManager } from './pixelate-effect.js';
 *   PixelateManager.register(id, viewerElement, pixelateEffectElement);
 */

const SETTINGS = {
  startGranularity: 50,
  endGranularity: 15,
  duration: 3000,
  fadeDelay: 500,
  updateRate: 50
};

const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Run the de-pixelate animation on a viewer, then remove the effect-composer.
 */
function animatePixelate(viewer, pixelateEffect) {
  pixelateEffect.setAttribute('granularity', SETTINGS.startGranularity);
  pixelateEffect.setAttribute('blend-mode', 'default');

  const startTime = performance.now();
  const startGran = SETTINGS.startGranularity;
  const endGran = SETTINGS.endGranularity;

  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / SETTINGS.duration);
    const easedProgress = easeInOut(progress);

    const currentGranularity = Math.round(startGran - (startGran - endGran) * easedProgress);
    pixelateEffect.setAttribute('granularity', currentGranularity);

    if (progress < 1) {
      setTimeout(animate, SETTINGS.updateRate);
    } else {
      // Animation complete — remove effect-composer and tone-mapping
      const effectComposer = viewer.querySelector('effect-composer');
      if (effectComposer) {
        effectComposer.remove();
      }
      viewer.removeAttribute('tone-mapping');
    }
  };

  setTimeout(animate, SETTINGS.fadeDelay);
}

/**
 * Watch a viewer for the 'materials-ready' class, then run the animation.
 * Works for single viewers (index page, detail page).
 */
export function watchAndAnimate(viewer, pixelateEffect) {
  if (!viewer || !pixelateEffect) return;

  // Already ready
  if (viewer.classList.contains('materials-ready')) {
    animatePixelate(viewer, pixelateEffect);
    return;
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (viewer.classList.contains('materials-ready')) {
          animatePixelate(viewer, pixelateEffect);
          observer.disconnect();
          return;
        }
      }
    }
  });

  observer.observe(viewer, { attributes: true, attributeFilter: ['class'] });
}

/**
 * Manager for multiple pixelate instances (product cards on main page).
 */
export const PixelateManager = {
  _instances: new Map(),
  _timeouts: new Map(),

  register(id, viewer, pixelateEffect) {
    this._instances.set(id, { viewer, pixelateEffect });

    watchAndAnimate(viewer, pixelateEffect);
  },

  clear() {
    for (const [id, timeout] of this._timeouts) {
      clearTimeout(timeout);
    }
    this._instances.clear();
    this._timeouts.clear();
  }
};

export { SETTINGS as PIXELATE_SETTINGS };
