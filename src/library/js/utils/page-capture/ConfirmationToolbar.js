/**
 * ConfirmationToolbar - Manages the confirmation mode toolbar UI
 * @module ConfirmationToolbar
 */

/**
 * Create confirmation toolbar with Accept, Recapture, Cancel buttons
 * @param {Object} callbacks - Button click callbacks
 * @param {Function} callbacks.onAccept - Called when Accept is clicked
 * @param {Function} callbacks.onRecapture - Called when Recapture is clicked
 * @param {Function} callbacks.onCancel - Called when Cancel is clicked
 * @returns {Object} - { element: HTMLElement, cleanup: Function }
 */
export function createConfirmationToolbar(callbacks) {
  const toolbar = document.createElement('div');
  toolbar.className = 'file-uploader-page-capture-confirmation-toolbar';
  toolbar.innerHTML = `
    <button class="file-uploader-page-capture-btn file-uploader-page-capture-btn-accept" data-action="accept">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      Accept
    </button>
    <button class="file-uploader-page-capture-btn file-uploader-page-capture-btn-recapture" data-action="recapture">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
      Recapture
    </button>
    <button class="file-uploader-page-capture-btn file-uploader-page-capture-btn-cancel" data-action="cancel">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      Cancel
    </button>
  `;

  const handleClick = (e) => {
    const button = e.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    if (action === 'accept' && callbacks.onAccept) {
      callbacks.onAccept();
    } else if (action === 'recapture' && callbacks.onRecapture) {
      callbacks.onRecapture();
    } else if (action === 'cancel' && callbacks.onCancel) {
      callbacks.onCancel();
    }
  };

  toolbar.addEventListener('click', handleClick);
  document.body.appendChild(toolbar);

  const cleanup = () => {
    toolbar.removeEventListener('click', handleClick);
    toolbar.remove();
  };

  return { element: toolbar, cleanup };
}

/**
 * Update confirmation toolbar position based on selection
 * @param {HTMLElement} toolbar - The toolbar element
 * @param {Object} selection - Selection parameters
 * @param {number} selection.left - Left position (document coords)
 * @param {number} selection.top - Top position (document coords)
 * @param {number} selection.width - Width
 * @param {number} selection.height - Height
 */
export function updateToolbarPosition(toolbar, selection) {
  if (!toolbar || !selection) return;

  const { left, top, width, height } = selection;
  const viewportLeft = left - window.scrollX;
  const viewportTop = top - window.scrollY;
  const viewportBottom = viewportTop + height;

  // Get toolbar dimensions
  const toolbarRect = toolbar.getBoundingClientRect();
  const toolbarWidth = toolbarRect.width || 280;
  const toolbarHeight = toolbarRect.height || 40;
  const offset = 12;

  // Position toolbar centered below selection
  let toolbarX = viewportLeft + (width / 2) - (toolbarWidth / 2);
  let toolbarY = viewportBottom + offset;

  // If not enough space below, position above
  if (toolbarY + toolbarHeight > window.innerHeight - 10) {
    toolbarY = viewportTop - toolbarHeight - offset;
  }

  // Keep within horizontal viewport bounds
  toolbarX = Math.max(10, Math.min(toolbarX, window.innerWidth - toolbarWidth - 10));

  // Keep within vertical viewport bounds
  toolbarY = Math.max(10, Math.min(toolbarY, window.innerHeight - toolbarHeight - 10));

  toolbar.style.left = toolbarX + 'px';
  toolbar.style.top = toolbarY + 'px';
}

export default {
  createConfirmationToolbar,
  updateToolbarPosition
};
