/**
 * Config Builder - Per-Type Limits
 * Rendering and event handling for per-file-type size and count limits
 */

import { FILE_TYPE_ICONS } from './Constants.js';

/**
 * Helper icons for slider controls
 */
const SLIDER_ICONS = {
  minus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`
};

/**
 * File type icons for the cards
 */
const TYPE_ICONS = {
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
};

/**
 * Get file type icon SVG
 * @param {string} type - File type (image, video, audio, document, archive)
 * @returns {string} SVG icon HTML
 */
export function getFileTypeIcon(type) {
  return TYPE_ICONS[type] || TYPE_ICONS.document;
}

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Render per-type limits grouped by file type
 * @param {Object} builder - ConfigBuilder instance
 * @param {Object} options - Option definitions for per-type limits
 * @returns {string} HTML string
 */
export function renderPerTypeLimitsByFileType(builder, options) {
  const types = ["image", "video", "audio", "document", "archive"];
  const perFileMaxSizeValues = builder.config.perFileMaxSizePerType || {};
  const perTypeMaxTotalSizeValues = builder.config.perTypeMaxTotalSize || {};
  const perTypeMaxFileCountValues = builder.config.perTypeMaxFileCount || {};

  const maxBytes = builder.getSliderMaxBytes();
  const units = ["bytes", "KB", "MB", "GB"];

  let html = '<div class="fu-config-builder-pertype-by-filetype">';

  for (const type of types) {
    const typeIcon = getFileTypeIcon(type);
    const perFileSizeBytes = perFileMaxSizeValues[type] || 0;
    const totalSizeBytes = perTypeMaxTotalSizeValues[type] || 0;
    const fileCount = perTypeMaxFileCountValues[type] || 0;

    // Calculate display values for sizes
    const perFileDisplay = perFileSizeBytes > 0 ? builder.bytesToBestUnit(perFileSizeBytes) : { value: 0, unit: builder.sliderConfig.unit };
    const totalSizeDisplay = totalSizeBytes > 0 ? builder.bytesToBestUnit(totalSizeBytes) : { value: 0, unit: builder.sliderConfig.unit };
    const perFileMaxValue = builder.bytesToUnit(maxBytes, perFileDisplay.unit);
    const totalSizeMaxValue = builder.bytesToUnit(maxBytes, totalSizeDisplay.unit);
    const stepBytes = builder.getSliderStepBytes();
    const perFileStepValue = Math.max(1, builder.bytesToUnit(stepBytes, perFileDisplay.unit));
    const totalSizeStepValue = Math.max(1, builder.bytesToUnit(stepBytes, totalSizeDisplay.unit));

    const perFileUnitOptions = units.map(u =>
      `<option value="${u}" ${perFileDisplay.unit === u ? "selected" : ""}>${u}</option>`
    ).join("");
    const totalSizeUnitOptions = units.map(u =>
      `<option value="${u}" ${totalSizeDisplay.unit === u ? "selected" : ""}>${u}</option>`
    ).join("");

    html += `
      <div class="fu-config-builder-filetype-card" data-file-type="${type}">
        <div class="fu-config-builder-filetype-card-header">
          ${typeIcon}
          <span class="fu-config-builder-filetype-card-title">${capitalizeFirst(type)}</span>
        </div>
        <div class="fu-config-builder-filetype-card-content">
          <!-- Per File Max Size -->
          <div class="fu-config-builder-filetype-limit-row">
            <label class="fu-config-builder-filetype-limit-label">
              Per File Max
              <code>perFileMaxSizePerType.${type}</code>
            </label>
            <div class="fu-config-builder-type-slider-controls" data-option="perFileMaxSizePerType" data-type-key="${type}" data-unit="${perFileDisplay.unit}">
              <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
                ${SLIDER_ICONS.minus}
              </button>
              <input type="range"
                     class="fu-config-builder-slider-input"
                     data-slider-type="${type}"
                     value="${perFileDisplay.value}"
                     min="0"
                     max="${perFileMaxValue}"
                     step="${perFileStepValue}">
              <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
                ${SLIDER_ICONS.plus}
              </button>
              <input type="number"
                     class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                     data-value-type="${type}"
                     value="${perFileDisplay.value || ""}"
                     min="0"
                     max="${perFileMaxValue}"
                     placeholder="0">
              <select class="fu-config-builder-unit-dropdown fu-config-builder-unit-dropdown-sm" data-unit-type="${type}">
                ${perFileUnitOptions}
              </select>
            </div>
            <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
              <span class="fu-config-builder-slider-label">0 ${perFileDisplay.unit}</span>
              <span class="fu-config-builder-slider-label">${perFileMaxValue} ${perFileDisplay.unit}</span>
            </div>
          </div>
          <!-- Total Size Max -->
          <div class="fu-config-builder-filetype-limit-row">
            <label class="fu-config-builder-filetype-limit-label">
              Total Max Size
              <code>perTypeMaxTotalSize.${type}</code>
            </label>
            <div class="fu-config-builder-type-slider-controls" data-option="perTypeMaxTotalSize" data-type-key="${type}" data-unit="${totalSizeDisplay.unit}">
              <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
                ${SLIDER_ICONS.minus}
              </button>
              <input type="range"
                     class="fu-config-builder-slider-input"
                     data-slider-type="${type}"
                     value="${totalSizeDisplay.value}"
                     min="0"
                     max="${totalSizeMaxValue}"
                     step="${totalSizeStepValue}">
              <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
                ${SLIDER_ICONS.plus}
              </button>
              <input type="number"
                     class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                     data-value-type="${type}"
                     value="${totalSizeDisplay.value || ""}"
                     min="0"
                     max="${totalSizeMaxValue}"
                     placeholder="0">
              <select class="fu-config-builder-unit-dropdown fu-config-builder-unit-dropdown-sm" data-unit-type="${type}">
                ${totalSizeUnitOptions}
              </select>
            </div>
            <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
              <span class="fu-config-builder-slider-label">0 ${totalSizeDisplay.unit}</span>
              <span class="fu-config-builder-slider-label">${totalSizeMaxValue} ${totalSizeDisplay.unit}</span>
            </div>
          </div>
          <!-- Max File Count -->
          <div class="fu-config-builder-filetype-limit-row">
            <label class="fu-config-builder-filetype-limit-label">
              Max Files
              <code>perTypeMaxFileCount.${type}</code>
            </label>
            <div class="fu-config-builder-type-slider-controls fu-config-builder-type-count-controls" data-option="perTypeMaxFileCount" data-type-key="${type}">
              <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
                ${SLIDER_ICONS.minus}
              </button>
              <input type="range"
                     class="fu-config-builder-slider-input"
                     data-slider-type="${type}"
                     value="${fileCount}"
                     min="0"
                     max="100"
                     step="1">
              <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
                ${SLIDER_ICONS.plus}
              </button>
              <input type="number"
                     class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                     data-value-type="${type}"
                     value="${fileCount || ""}"
                     min="0"
                     max="100"
                     placeholder="0">
              <span class="fu-config-builder-count-label">files</span>
            </div>
            <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
              <span class="fu-config-builder-slider-label">0</span>
              <span class="fu-config-builder-slider-label">100 files</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

/**
 * Re-render the perTypeLimits panel content when view mode changes
 * @param {Object} builder - ConfigBuilder instance
 */
export function rerenderPerTypeLimitsPanel(builder) {
  const panel = builder.element.querySelector('[data-category-panel="perTypeLimits"]');
  if (!panel) return;

  const optionsContainer = panel.querySelector('.fu-config-builder-category-options');
  if (!optionsContainer) return;

  const category = builder.optionDefinitions.perTypeLimits;
  optionsContainer.innerHTML = builder.renderPerTypeLimitsContent(category.options);

  // Re-attach events for the new content
  attachPerTypeByFileTypeEvents(builder);

  // Also re-attach the original type slider events for "By Limit Type" view
  if (builder.perTypeLimitsViewMode !== "byFileType") {
    // Re-attach type size slider events
    panel.querySelectorAll('[data-type="typeSizeSlider"]').forEach((container) => {
      attachTypeSizeSliderEvents(builder, container);
    });
    // Re-attach type count slider events
    panel.querySelectorAll('[data-type="typeCountSlider"]').forEach((container) => {
      attachTypeCountSliderEvents(builder, container);
    });
  }
}

/**
 * Attach events for type size sliders within a container
 * @param {Object} builder - ConfigBuilder instance
 * @param {HTMLElement} container - Container element
 */
export function attachTypeSizeSliderEvents(builder, container) {
  const optionKey = container.dataset.option;

  container.querySelectorAll(".fu-config-builder-type-slider-block").forEach((block) => {
    const typeKey = block.dataset.typeKey;
    const slider = block.querySelector(".fu-config-builder-slider-input");
    const valueInput = block.querySelector(".fu-config-builder-slider-value-input");
    const unitDropdown = block.querySelector(".fu-config-builder-unit-dropdown");
    const decreaseBtn = block.querySelector('[data-action="decrease"]');
    const increaseBtn = block.querySelector('[data-action="increase"]');

    if (!slider || !valueInput || !decreaseBtn || !increaseBtn || !unitDropdown) return;

    const getCurrentUnit = () => unitDropdown.value;

    const updateTypeValue = (value, unit) => {
      const maxValue = builder.bytesToUnit(builder.getSliderMaxBytes(), unit);
      value = Math.max(0, Math.min(maxValue, value));

      slider.value = value;
      valueInput.value = value || "";

      if (!builder.config[optionKey]) {
        builder.config[optionKey] = {};
      }

      const displayKey = optionKey + "Display";
      if (!builder.config[displayKey]) {
        builder.config[displayKey] = {};
      }

      if (value > 0) {
        const bytes = builder.unitToBytes(value, unit);
        builder.config[optionKey][typeKey] = bytes;
        builder.config[displayKey][typeKey] = value + " " + unit;
      } else {
        delete builder.config[optionKey][typeKey];
        delete builder.config[displayKey][typeKey];
      }
      builder.onConfigChange();
    };

    unitDropdown.addEventListener("change", () => {
      const newUnit = unitDropdown.value;
      const currentBytes = builder.config[optionKey]?.[typeKey] || 0;
      const newValue = currentBytes > 0 ? builder.bytesToUnit(currentBytes, newUnit) : 0;
      slider.value = newValue;
      valueInput.value = newValue || "";
      block.dataset.unit = newUnit;
    });

    slider.addEventListener("input", () => {
      updateTypeValue(parseInt(slider.value) || 0, getCurrentUnit());
    });

    valueInput.addEventListener("input", () => {
      updateTypeValue(parseInt(valueInput.value) || 0, getCurrentUnit());
    });

    decreaseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const unit = getCurrentUnit();
      const buttonStep = builder.bytesToUnit(builder.sliderConfig.buttonStep * 1024 * 1024, unit);
      const currentValue = parseInt(valueInput.value) || 0;
      updateTypeValue(currentValue - buttonStep, unit);
    });

    increaseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const unit = getCurrentUnit();
      const buttonStep = builder.bytesToUnit(builder.sliderConfig.buttonStep * 1024 * 1024, unit);
      const currentValue = parseInt(valueInput.value) || 0;
      updateTypeValue(currentValue + buttonStep, unit);
    });
  });
}

/**
 * Attach events for type count sliders within a container
 * @param {Object} builder - ConfigBuilder instance
 * @param {HTMLElement} container - Container element
 */
export function attachTypeCountSliderEvents(builder, container) {
  const optionKey = container.dataset.option;

  container.querySelectorAll(".fu-config-builder-type-slider-block").forEach((block) => {
    const typeKey = block.dataset.typeKey;
    const slider = block.querySelector(".fu-config-builder-slider-input");
    const valueInput = block.querySelector(".fu-config-builder-slider-value-input");
    const decreaseBtn = block.querySelector('[data-action="decrease"]');
    const increaseBtn = block.querySelector('[data-action="increase"]');

    if (!slider || !valueInput || !decreaseBtn || !increaseBtn) return;

    const updateTypeValue = (value) => {
      value = Math.max(0, Math.min(100, value));

      slider.value = value;
      valueInput.value = value || "";

      if (!builder.config[optionKey]) {
        builder.config[optionKey] = {};
      }

      if (value > 0) {
        builder.config[optionKey][typeKey] = value;
      } else {
        delete builder.config[optionKey][typeKey];
      }
      builder.onConfigChange();
    };

    slider.addEventListener("input", () => {
      updateTypeValue(parseInt(slider.value) || 0);
    });

    valueInput.addEventListener("input", () => {
      updateTypeValue(parseInt(valueInput.value) || 0);
    });

    decreaseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      updateTypeValue((parseInt(valueInput.value) || 0) - 1);
    });

    increaseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      updateTypeValue((parseInt(valueInput.value) || 0) + 1);
    });
  });
}

/**
 * Attach events for "By File Type" view sliders
 * @param {Object} builder - ConfigBuilder instance
 */
export function attachPerTypeByFileTypeEvents(builder) {
  // Handle slider controls in the "By File Type" view
  builder.element.querySelectorAll('.fu-config-builder-pertype-by-filetype .fu-config-builder-type-slider-controls').forEach((controls) => {
    const optionKey = controls.dataset.option;
    const typeKey = controls.dataset.typeKey;
    const isCountSlider = controls.classList.contains('fu-config-builder-type-count-controls');

    const slider = controls.querySelector(".fu-config-builder-slider-input");
    const valueInput = controls.querySelector(".fu-config-builder-slider-value-input");
    const unitDropdown = controls.querySelector(".fu-config-builder-unit-dropdown");
    const decreaseBtn = controls.querySelector('[data-action="decrease"]');
    const increaseBtn = controls.querySelector('[data-action="increase"]');

    if (!slider || !valueInput || !decreaseBtn || !increaseBtn) return;

    if (isCountSlider) {
      // Count slider logic
      const updateTypeValue = (value) => {
        value = Math.max(0, Math.min(100, value));
        slider.value = value;
        valueInput.value = value || "";

        if (!builder.config[optionKey]) {
          builder.config[optionKey] = {};
        }

        if (value > 0) {
          builder.config[optionKey][typeKey] = value;
        } else {
          delete builder.config[optionKey][typeKey];
        }
        builder.onConfigChange();
      };

      slider.addEventListener("input", () => updateTypeValue(parseInt(slider.value) || 0));
      valueInput.addEventListener("input", () => updateTypeValue(parseInt(valueInput.value) || 0));
      decreaseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateTypeValue((parseInt(valueInput.value) || 0) - 1);
      });
      increaseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateTypeValue((parseInt(valueInput.value) || 0) + 1);
      });
    } else {
      // Size slider logic
      const getCurrentUnit = () => unitDropdown?.value || builder.sliderConfig.unit;

      const updateTypeValue = (value, unit) => {
        const maxValue = builder.bytesToUnit(builder.getSliderMaxBytes(), unit);
        value = Math.max(0, Math.min(maxValue, value));

        slider.value = value;
        valueInput.value = value || "";

        if (!builder.config[optionKey]) {
          builder.config[optionKey] = {};
        }

        const displayKey = optionKey + "Display";
        if (!builder.config[displayKey]) {
          builder.config[displayKey] = {};
        }

        if (value > 0) {
          const bytes = builder.unitToBytes(value, unit);
          builder.config[optionKey][typeKey] = bytes;
          builder.config[displayKey][typeKey] = value + " " + unit;
        } else {
          delete builder.config[optionKey][typeKey];
          delete builder.config[displayKey][typeKey];
        }
        builder.onConfigChange();
      };

      if (unitDropdown) {
        unitDropdown.addEventListener("change", () => {
          const newUnit = unitDropdown.value;
          const currentBytes = builder.config[optionKey]?.[typeKey] || 0;
          const newValue = currentBytes > 0 ? builder.bytesToUnit(currentBytes, newUnit) : 0;
          slider.value = newValue;
          valueInput.value = newValue || "";
          controls.dataset.unit = newUnit;
        });
      }

      slider.addEventListener("input", () => {
        updateTypeValue(parseInt(slider.value) || 0, getCurrentUnit());
      });

      valueInput.addEventListener("input", () => {
        updateTypeValue(parseInt(valueInput.value) || 0, getCurrentUnit());
      });

      decreaseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const unit = getCurrentUnit();
        const buttonStep = builder.bytesToUnit(builder.sliderConfig.buttonStep * 1024 * 1024, unit);
        const currentValue = parseInt(valueInput.value) || 0;
        updateTypeValue(currentValue - buttonStep, unit);
      });

      increaseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const unit = getCurrentUnit();
        const buttonStep = builder.bytesToUnit(builder.sliderConfig.buttonStep * 1024 * 1024, unit);
        const currentValue = parseInt(valueInput.value) || 0;
        updateTypeValue(currentValue + buttonStep, unit);
      });
    }
  });
}
