/**
 * UIBuilder.js
 *
 * Manages UI structure creation for the FileUploader.
 * Creates dropzone, buttons, and containers.
 *
 * @module UIBuilder
 */

import { getIcon } from "../../shared/icons.js";
import TooltipManager from "../../utils/TooltipManager.js";

// ============================================================
// UI BUILDER CLASS
// ============================================================

export class UIBuilder {
  /**
   * Create a UIBuilder instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
  }

  /**
   * Get the CSS class for rectangular button size
   * @returns {string} Size class or empty string for default (md)
   */
  getButtonSizeClass() {
    const size = this.uploader.options.buttons.buttonSize;
    if (size && size !== "md") {
      return `btn-${size}`;
    }
    return "";
  }

  // ============================================================
  // MAIN STRUCTURE CREATION
  // ============================================================

  /**
   * Create the main UI structure
   */
  createStructure() {
    // Create wrapper
    this.uploader.wrapper = document.createElement("div");
    this.uploader.wrapper.className = "media-hub-wrapper";

    // Set theme data attribute for CSS-based theming
    const theme = this.uploader.options.theme.theme;
    if (theme && theme !== "auto") {
      this.uploader.wrapper.dataset.theme = theme;
    }

    // Set button size data attribute for CSS-based sizing
    const buttonSize = this.uploader.options.buttons.buttonSize;
    if (buttonSize && buttonSize !== "md") {
      this.uploader.wrapper.dataset.buttonSize = buttonSize;
    }

    // Create drop zone
    this.uploader.dropZone = document.createElement("div");
    this.uploader.dropZone.className = "media-hub-dropzone";

    // Create dropzone header (upload prompt)
    this.uploader.dropZoneHeader = document.createElement("div");
    this.uploader.dropZoneHeader.className = "media-hub-dropzone-content";

    this.hasAnyTypeLevelLimits =
      Object.keys(this.uploader.options.perTypeLimits.perFileMaxSizePerType || {}).length > 0 ||
      Object.keys(this.uploader.options.perTypeLimits.perTypeMaxTotalSize || {}).length > 0 ||
      Object.keys(this.uploader.options.perTypeLimits.perTypeMaxFileCount || {}).length > 0;

    const showFallbackLimit = !this.hasAnyTypeLevelLimits;

    this.uploader.dropZoneHeader.innerHTML = `
      ${getIcon("upload", { class: "media-hub-icon" })}
      <p class="media-hub-text">Drag & drop files here or click to browse</p>
      ${showFallbackLimit ? `<p class="media-hub-subtext">Maximum file size: ${this.uploader.options.limits.perFileMaxSizeDisplay}</p>` : ""}
    `;

    // Create file input
    this.uploader.fileInput = document.createElement("input");
    this.uploader.fileInput.type = "file";
    this.uploader.fileInput.className = "media-hub-input";
    this.uploader.fileInput.multiple = this.uploader.options.behavior.multiple;

    if (this.uploader.options.fileTypes.allowedExtensions.length > 0) {
      this.uploader.fileInput.accept = this.uploader.options.fileTypes.allowedExtensions.map((ext) => "." + ext).join(",");
    }

    // Create preview container
    this.uploader.previewContainer = document.createElement("div");
    this.uploader.previewContainer.className = "media-hub-preview-container";

    // Create limits display
    if (this.uploader.options.limitsDisplay.showLimits) {
      this.uploader.limitsContainer = document.createElement("div");
      this.uploader.limitsContainer.className = "media-hub-limits";
      this.uploader.limitsManager.updateDisplay();
    }

    // Setup download all button
    this.setupDownloadAllButton();

    // Setup clear all button
    this.setupClearAllButton();

    // Append elements to dropzone
    this.uploader.dropZone.appendChild(this.uploader.fileInput);
    this.uploader.dropZone.appendChild(this.uploader.dropZoneHeader);
    this.uploader.dropZone.appendChild(this.uploader.previewContainer);

    // Create action container
    this.uploader.actionContainer = document.createElement("div");
    this.uploader.actionContainer.className = "media-hub-action-container";

    // Create limits toggle button (only if there are type-level limits to show)
    if (this.uploader.options.limitsDisplay.showLimits && this.uploader.options.limitsDisplay.showLimitsToggle && this.hasAnyTypeLevelLimits) {
      this.createLimitsToggleButton();
    }

    // Create button container
    if (
      (this.uploader.downloadAllBtn && this.uploader.options.buttons.showDownloadAllButton) ||
      (this.uploader.clearAllBtn && this.uploader.options.buttons.showClearAllButton)
    ) {
      this.uploader.buttonContainer = document.createElement("div");
      this.uploader.buttonContainer.className = "media-hub-button-container";
      this.uploader.buttonContainer.style.display = "none";

      if (this.uploader.downloadAllBtn && this.uploader.options.buttons.showDownloadAllButton) {
        this.uploader.buttonContainer.appendChild(this.uploader.downloadAllBtn);
      }
      if (this.uploader.clearAllBtn && this.uploader.options.buttons.showClearAllButton) {
        this.uploader.buttonContainer.appendChild(this.uploader.clearAllBtn);
      }

      this.uploader.actionContainer.appendChild(this.uploader.buttonContainer);
    }

    // Create selected files action container
    this.createSelectedActionContainer();

    // Create capture buttons
    this.uploader.captureManager.createCaptureButtons();

    // Append action container to dropzone
    if (this.uploader.actionContainer.children.length > 0) {
      this.uploader.dropZone.appendChild(this.uploader.actionContainer);
    }

    // Append dropzone and limits to wrapper
    this.uploader.wrapper.appendChild(this.uploader.dropZone);
    if (this.uploader.options.limitsDisplay.showLimits) {
      if (!this.uploader.limitsVisible) {
        this.uploader.limitsContainer.style.display = "none";
      }
      this.uploader.wrapper.appendChild(this.uploader.limitsContainer);
    }
    this.uploader.element.appendChild(this.uploader.wrapper);
  }

  // ============================================================
  // BUTTON SETUP
  // ============================================================

  /**
   * Setup download all button (internal or external)
   */
  setupDownloadAllButton() {
    if (this.uploader.options.buttons.downloadAllButtonElement) {
      const selector = this.uploader.options.buttons.downloadAllButtonElement;
      this.uploader.downloadAllBtn = typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

      if (!this.uploader.downloadAllBtn) {
        console.error(`FileUploader: Download button element not found: ${selector}`);
        return;
      }

      this.uploader.downloadAllBtn.style.display = "none";
      this.uploader.downloadAllBtn.disabled = true;
      this.uploader.downloadAllBtn.addEventListener("click", () => this.uploader.uploadManager.downloadAll());
    } else if (this.uploader.options.buttons.showDownloadAllButton) {
      this.uploader.downloadAllBtn = document.createElement("button");
      this.uploader.downloadAllBtn.type = "button";

      const classes = ["media-hub-download-all"];
      const sizeClass = this.getButtonSizeClass();
      if (sizeClass) classes.push(sizeClass);
      if (this.uploader.options.buttons.downloadAllButtonClasses?.length > 0) {
        classes.push(...this.uploader.options.buttons.downloadAllButtonClasses);
      }
      this.uploader.downloadAllBtn.className = classes.join(" ");

      this.uploader.downloadAllBtn.innerHTML = `
        ${getIcon("download")}
        <span>${this.uploader.options.buttons.downloadAllButtonText}</span>
      `;
      this.uploader.downloadAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploader.uploadManager.downloadAll();
      });
    }
  }

  /**
   * Setup clear all button (internal or external)
   */
  setupClearAllButton() {
    if (this.uploader.options.buttons.clearAllButtonElement) {
      const selector = this.uploader.options.buttons.clearAllButtonElement;
      this.uploader.clearAllBtn = typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

      if (!this.uploader.clearAllBtn) {
        console.error(`FileUploader: Clear button element not found: ${selector}`);
        return;
      }

      this.uploader.clearAllBtn.style.display = "none";
      this.uploader.clearAllBtn.disabled = true;
      this.uploader.clearAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploader.uploadManager.clearAll();
      });
    } else if (this.uploader.options.buttons.showClearAllButton) {
      this.uploader.clearAllBtn = document.createElement("button");
      this.uploader.clearAllBtn.type = "button";

      const classes = ["media-hub-clear-all"];
      const sizeClass = this.getButtonSizeClass();
      if (sizeClass) classes.push(sizeClass);
      if (this.uploader.options.buttons.clearAllButtonClasses?.length > 0) {
        classes.push(...this.uploader.options.buttons.clearAllButtonClasses);
      }
      this.uploader.clearAllBtn.className = classes.join(" ");

      this.uploader.clearAllBtn.innerHTML = `
        ${getIcon("trash")}
        <span>${this.uploader.options.buttons.clearAllButtonText}</span>
      `;
      this.uploader.clearAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploader.uploadManager.clearAll();
      });
    }
  }

  // ============================================================
  // LIMITS TOGGLE
  // ============================================================

  /**
   * Create limits toggle button
   */
  createLimitsToggleButton() {
    this.uploader.limitsToggleBtn = document.createElement("button");
    this.uploader.limitsToggleBtn.type = "button";
    const sizeClass = this.getButtonSizeClass();
    this.uploader.limitsToggleBtn.className = `media-hub-limits-toggle-btn${sizeClass ? ` ${sizeClass}` : ""}`;

    const iconWrapper = document.createElement("span");
    iconWrapper.className = "media-hub-toggle-icon-wrapper";
    iconWrapper.innerHTML = getIcon("chevron_up", { class: "media-hub-toggle-icon" });
    this.uploader.limitsToggleBtn.appendChild(iconWrapper);

    this.uploader.limitsToggleBtnText = document.createElement("span");
    this.uploader.limitsToggleBtnText.textContent = "Size Limits";
    this.uploader.limitsToggleBtn.appendChild(this.uploader.limitsToggleBtnText);

    this.updateLimitsToggleButton();

    this.uploader.limitsToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleLimitsVisibility();
    });

    this.uploader.actionContainer.appendChild(this.uploader.limitsToggleBtn);
    TooltipManager.init(this.uploader.limitsToggleBtn);
  }

  /**
   * Update limits toggle button state
   */
  updateLimitsToggleButton() {
    if (!this.uploader.limitsToggleBtn) return;

    if (this.uploader.limitsVisible) {
      this.uploader.limitsToggleBtn.classList.add("is-expanded");
    } else {
      this.uploader.limitsToggleBtn.classList.remove("is-expanded");
    }

    this.uploader.limitsToggleBtn.setAttribute(
      "data-tooltip",
      this.uploader.limitsVisible ? "Hide upload limits" : "Show upload limits"
    );
    this.uploader.limitsToggleBtn.setAttribute("data-tooltip-position", "top");
  }

  /**
   * Toggle limits visibility
   */
  toggleLimitsVisibility() {
    this.uploader.limitsVisible = !this.uploader.limitsVisible;

    if (this.uploader.limitsContainer) {
      this.uploader.limitsContainer.style.display = this.uploader.limitsVisible ? "" : "none";
    }

    this.updateLimitsToggleButton();

    if (this.uploader.limitsToggleBtn) {
      TooltipManager.init(this.uploader.limitsToggleBtn);
    }
  }

  // ============================================================
  // SELECTED ACTION CONTAINER
  // ============================================================

  /**
   * Create selected files action container
   */
  createSelectedActionContainer() {
    this.uploader.selectedActionContainer = document.createElement("div");
    this.uploader.selectedActionContainer.className = "media-hub-selected-action-container";
    this.uploader.selectedActionContainer.style.display = "none";

    const selectionInfo = document.createElement("span");
    selectionInfo.className = "media-hub-selection-info";
    selectionInfo.textContent = "0 selected";
    this.uploader.selectedActionContainer.appendChild(selectionInfo);

    const downloadSelectedBtn = document.createElement("button");
    downloadSelectedBtn.type = "button";
    downloadSelectedBtn.className = "media-hub-download-selected";
    downloadSelectedBtn.innerHTML = `
      ${getIcon("download")}
      <span>Download</span>
    `;
    downloadSelectedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.uploader.selectionManager.downloadSelected();
    });
    this.uploader.selectedActionContainer.appendChild(downloadSelectedBtn);

    const deleteSelectedBtn = document.createElement("button");
    deleteSelectedBtn.type = "button";
    deleteSelectedBtn.className = "media-hub-delete-selected";
    deleteSelectedBtn.innerHTML = `
      ${getIcon("trash")}
      <span>Delete</span>
    `;
    deleteSelectedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.uploader.selectionManager.deleteSelected();
    });
    this.uploader.selectedActionContainer.appendChild(deleteSelectedBtn);

    this.uploader.actionContainer.appendChild(this.uploader.selectedActionContainer);
  }
}
