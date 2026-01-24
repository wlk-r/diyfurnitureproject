/**
 * Noise Background Generator
 * Adds a subtle noise texture to the page background
 * Runs synchronously to prevent flash
 */

(function() {
    const NOISE_CONFIG = {
        tileSize: 512,
        pixelScale: 0.25,
        intensity: 1,
        opacity: 0.05
    };

    function generateNoiseTile() {
        const size = NOISE_CONFIG.tileSize;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();

            data[i] = Math.floor(r * NOISE_CONFIG.intensity * 255);
            data[i + 1] = Math.floor(g * NOISE_CONFIG.intensity * 255);
            data[i + 2] = Math.floor(b * NOISE_CONFIG.intensity * 255);
            data[i + 3] = Math.floor(NOISE_CONFIG.opacity * 255);
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
    }

    function applyNoiseBackground() {
        const dataUrl = generateNoiseTile();
        const bgSize = NOISE_CONFIG.tileSize * NOISE_CONFIG.pixelScale;

        // Apply to <html> element (exists immediately, no need to wait)
        // Background color is set via CSS, this just adds the noise texture overlay
        const html = document.documentElement;
        html.style.backgroundImage = `url(${dataUrl})`;
        html.style.backgroundSize = `${bgSize}px ${bgSize}px`;
        html.style.backgroundRepeat = 'repeat';
        html.style.imageRendering = 'pixelated';
    }

    // Run immediately - <html> element always exists
    applyNoiseBackground();
})();
