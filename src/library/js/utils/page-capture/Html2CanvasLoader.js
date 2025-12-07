/**
 * Html2CanvasLoader - Dynamic loader for html2canvas library
 * @module Html2CanvasLoader
 */

let html2canvasLoaded = false;
let html2canvasPromise = null;

/**
 * Check if html2canvas is available
 * @returns {boolean}
 */
export function isSupported() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Load html2canvas library dynamically
 * @returns {Promise<Function>} - html2canvas function
 */
export async function loadHtml2Canvas() {
  if (html2canvasLoaded && window.html2canvas) {
    return window.html2canvas;
  }

  if (html2canvasPromise) {
    return html2canvasPromise;
  }

  html2canvasPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.html2canvas) {
      html2canvasLoaded = true;
      resolve(window.html2canvas);
      return;
    }

    // Load from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==';
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';

    script.onload = () => {
      html2canvasLoaded = true;
      resolve(window.html2canvas);
    };

    script.onerror = () => {
      reject(new Error('Failed to load html2canvas library'));
    };

    document.head.appendChild(script);
  });

  return html2canvasPromise;
}

/**
 * Check if html2canvas is already loaded
 * @returns {boolean}
 */
export function isLoaded() {
  return html2canvasLoaded && !!window.html2canvas;
}

export default {
  isSupported,
  loadHtml2Canvas,
  isLoaded
};
