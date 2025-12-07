/**
 * UIBuilder.js
 *
 * Manages UI structure creation for the FileUploader.
 * Creates dropzone, buttons, and containers.
 *
 * @module UIBuilder
 */

import { getIcon } from "../../shared/icons.js";
import Tooltip from "../../components/tooltip/index.js";

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

  // ============================================================
  // MAIN STRUCTURE CREATION
  // ============================================================

  /**
   * Create the main UI structure
   */
  createStructure() {
    // Create wrapper
    this.uploader.wrapper = document.createElement("div");
    this.uploader.wrapper.className = "file-uploader-wrapper";

    // Create drop zone
    this.uploader.dropZone = document.createElement("div");
    this.uploader.dropZone.className = "file-uploader-dropzone";

    // Create dropzone header (upload prompt)
    this.uploader.dropZoneHeader = document.createElement("div");
    this.uploader.dropZoneHeader.className = "file-uploader-dropzone-content";

    const hasAnyTypeLevelLimits =
      Object.keys(this.uploader.options.perFileMaxSizePerType || {}).length > 0 ||
      Object.keys(this.uploader.options.perTypeMaxTotalSize || {}).length > 0 ||
      Object.keys(this.uploader.options.perTypeMaxFileCount || {}).length > 0;

    const showFallbackLimit = !hasAnyTypeLevelLimits;

    this.uploader.dropZoneHeader.innerHTML = `
      ${getIcon("upload", { class: "file-uploader-icon" })}
      <p class="file-uploader-text">Drag & drop files here or click to browse</p>
      ${showFallbackLimit ? `<p class="file-uploader-subtext">Maximum file size: ${this.uploader.options.perFileMaxSizeDisplay}</p>` : ""}
    `;

    // Create file input
    this.uploader.fileInput = document.createElement("input");
    this.uploader.fileInput.type = "file";
    this.uploader.fileInput.className = "file-uploader-input";
    this.uploader.fileInput.multiple = this.uploader.options.multiple;

    if (this.uploader.options.allowedExtensions.length > 0) {
      this.uploader.fileInput.accept = this.uploader.options.allowedExtensions.map((ext) => "." + ext).join(",");
    }

    // Create preview container
    this.uploader.previewContainer = document.createElement("div");
    this.uploader.previewContainer.className = "file-uploader-preview-container";

    // Create limits display
    if (this.uploader.options.showLimits) {
      this.uploader.limitsContainer = document.createElement("div");
      this.uploader.limitsContainer.className = "file-uploader-limits";
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
    this.uploader.actionContainer.className = "file-uploader-action-container";

    // Create limits toggle button
    if (this.uploader.options.showLimits && this.uploader.options.showLimitsToggle) {
      this.createLimitsToggleButton();
    }

    // Create button container
    if (
      (this.uploader.downloadAllBtn && this.uploader.options.showDownloadAllButton) ||
      (this.uploader.clearAllBtn && this.uploader.options.showClearAllButton)
    ) {
      this.uploader.buttonContainer = document.createElement("div");
      this.uploader.buttonContainer.className = "file-uploader-button-container";
      this.uploader.buttonContainer.style.display = "none";

      if (this.uploader.downloadAllBtn && this.uploader.options.showDownloadAllButton) {
        this.uploader.buttonContainer.appendChild(this.uploader.downloadAllBtn);
      }
      if (this.uploader.clearAllBtn && this.uploader.options.showClearAllButton) {
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
    if (this.uploader.options.showLimits) {
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
    if (this.uploader.options.downloadAllButtonElement) {
      const selector = this.uploader.options.downloadAllButtonElement;
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
    } else if (this.uploader.options.showDownloadAllButton) {
      this.uploader.downloadAllBtn = document.createElement("button");
      this.uploader.downloadAllBtn.type = "button";

      const classes = ["file-uploader-download-all"];
      if (this.uploader.options.downloadAllButtonClasses?.length > 0) {
        classes.push(...this.uploader.options.downloadAllButtonClasses);
      }
      this.uploader.downloadAllBtn.className = classes.join(" ");

      this.uploader.downloadAllBtn.innerHTML = `
        ${getIcon("download")}
        <span>${this.uploader.options.downloadAllButtonText}</span>
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
    if (this.uploader.options.clearAllButtonElement) {
      const selector = this.uploader.options.clearAllButtonElement;
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
    } else if (this.uploader.options.showClearAllButton) {
      this.uploader.clearAllBtn = document.createElement("button");
      this.uploader.clearAllBtn.type = "button";

      const classes = ["file-uploader-clear-all"];
      if (this.uploader.options.clearAllButtonClasses?.length > 0) {
        classes.push(...this.uploader.options.clearAllButtonClasses);
      }
      this.uploader.clearAllBtn.className = classes.join(" ");

      this.uploader.clearAllBtn.innerHTML = `
        ${getIcon("trash")}
        <span>${this.uploader.options.clearAllButtonText}</span>
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
    this.uploader.limitsToggleBtn.className = "file-uploader-limits-toggle-btn";

    const iconWrapper = document.createElement("span");
    iconWrapper.className = "file-uploader-toggle-icon-wrapper";
    iconWrapper.innerHTML = getIcon("chevron_up", { class: "file-uploader-toggle-icon" });
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
    Tooltip.initAll(this.uploader.limitsToggleBtn);
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
      "data-tooltip-text",
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
      Tooltip.initAll(this.uploader.limitsToggleBtn);
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
    this.uploader.selectedActionContainer.className = "file-uploader-selected-action-container";
    this.uploader.selectedActionContainer.style.display = "none";

    const selectionInfo = document.createElement("span");
    selectionInfo.className = "file-uploader-selection-info";
    selectionInfo.textContent = "0 selected";
    this.uploader.selectedActionContainer.appendChild(selectionInfo);

    const downloadSelectedBtn = document.createElement("button");
    downloadSelectedBtn.type = "button";
    downloadSelectedBtn.className = "file-uploader-download-selected";
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
    deleteSelectedBtn.className = "file-uploader-delete-selected";
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
