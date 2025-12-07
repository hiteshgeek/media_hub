/**
 * Config Builder - Uploader Manager
 * Manages multiple uploader instances (add, remove, duplicate, select)
 */

import Tooltip from "../tooltip/Tooltip.js";

/**
 * Render uploader tabs for preview selector
 * @param {Object} builder - ConfigBuilder instance
 * @returns {string} HTML for uploader tabs
 */
export function renderUploaderTabs(builder) {
  // Initialize first uploader if none exist
  if (Object.keys(builder.uploaderInstances).length === 0) {
    builder.uploaderCounter = 1;
    builder.activeUploaderId = "uploader-1";
    builder.uploaderInstances["uploader-1"] = {
      name: "Uploader 1",
      config: { ...builder.config },
      preset: builder.currentPreset,
      instance: null,
    };
  }

  let html = "";
  for (const [id, data] of Object.entries(builder.uploaderInstances)) {
    const isActive = id === builder.activeUploaderId;
    html += `
      <div class="fu-config-builder-uploader-tab ${
        isActive ? "active" : ""
      }" data-uploader-id="${id}">
        <span class="fu-config-builder-uploader-tab-name" data-uploader-id="${id}">${
      data.name
    }</span>
        <div class="fu-config-builder-uploader-tab-actions">
          <button class="fu-config-builder-uploader-tab-duplicate" data-uploader-id="${id}" data-tooltip-text="Duplicate uploader" data-tooltip-position="bottom">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          ${
            Object.keys(builder.uploaderInstances).length > 1
              ? `
            <button class="fu-config-builder-uploader-tab-close" data-uploader-id="${id}" data-tooltip-text="Remove uploader" data-tooltip-position="bottom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          `
              : ""
          }
        </div>
      </div>
    `;
  }
  return html;
}

/**
 * Refresh all uploader previews (used after add/remove)
 * @param {Object} builder - ConfigBuilder instance
 */
export function refreshAllPreviews(builder) {
  builder.updatePreview(true);
}

/**
 * Add a new uploader to the preview
 * @param {Object} builder - ConfigBuilder instance
 */
export function addUploader(builder) {
  // Save current config and preset first
  if (
    builder.activeUploaderId &&
    builder.uploaderInstances[builder.activeUploaderId]
  ) {
    builder.uploaderInstances[builder.activeUploaderId].config = { ...builder.config };
    builder.uploaderInstances[builder.activeUploaderId].preset = builder.currentPreset;
  }

  builder.uploaderCounter++;
  const newId = `uploader-${builder.uploaderCounter}`;

  builder.uploaderInstances[newId] = {
    name: `Uploader ${builder.uploaderCounter}`,
    config: { ...builder.getDefaultConfig() },
    preset: "default",
    instance: null,
    containerId: null,
  };

  // Switch to the new uploader
  builder.activeUploaderId = newId;
  builder.config = { ...builder.uploaderInstances[newId].config };
  builder.currentPreset = "default";

  // Update UI
  updateUploaderTabsUI(builder);
  builder.render();
  builder.attachEvents();
  builder.initTooltips();
  refreshAllPreviews(builder); // Refresh all to show the new uploader
  builder.updateCodeOutput();
}

/**
 * Duplicate an existing uploader with its config
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} uploaderId - ID of uploader to duplicate
 */
export function duplicateUploader(builder, uploaderId) {
  if (!builder.uploaderInstances[uploaderId]) return;

  // Save current config and preset first
  if (
    builder.activeUploaderId &&
    builder.uploaderInstances[builder.activeUploaderId]
  ) {
    builder.uploaderInstances[builder.activeUploaderId].config = { ...builder.config };
    builder.uploaderInstances[builder.activeUploaderId].preset = builder.currentPreset;
  }

  // Get the source uploader's config and preset
  const sourceData = builder.uploaderInstances[uploaderId];

  builder.uploaderCounter++;
  const newId = `uploader-${builder.uploaderCounter}`;

  // Deep copy the config to avoid reference issues
  const copiedConfig = JSON.parse(JSON.stringify(sourceData.config));

  builder.uploaderInstances[newId] = {
    name: `${sourceData.name} (Copy)`,
    config: copiedConfig,
    preset: sourceData.preset || null,
    instance: null,
    containerId: null,
  };

  // Switch to the new uploader
  builder.activeUploaderId = newId;
  builder.config = { ...builder.uploaderInstances[newId].config };
  builder.currentPreset = builder.uploaderInstances[newId].preset;

  // Update UI
  updateUploaderTabsUI(builder);
  builder.render();
  builder.attachEvents();
  builder.initTooltips();
  refreshAllPreviews(builder); // Refresh all to show the new uploader
  builder.updateCodeOutput();
}

/**
 * Select an uploader and load its config
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} uploaderId - ID of uploader to select
 */
export function selectUploader(builder, uploaderId) {
  if (!builder.uploaderInstances[uploaderId]) return;
  if (builder.activeUploaderId === uploaderId) return; // Already selected

  // Save current config and preset to the current uploader before switching
  if (
    builder.activeUploaderId &&
    builder.uploaderInstances[builder.activeUploaderId]
  ) {
    builder.uploaderInstances[builder.activeUploaderId].config = { ...builder.config };
    builder.uploaderInstances[builder.activeUploaderId].preset = builder.currentPreset;
  }

  // Switch to new uploader
  builder.activeUploaderId = uploaderId;
  builder.config = { ...builder.uploaderInstances[uploaderId].config };
  builder.currentPreset = builder.uploaderInstances[uploaderId].preset || null;

  // Update the uploader tab list UI
  updateUploaderTabsUI(builder);

  // Re-render options to reflect new config
  builder.render();
  builder.attachEvents();
  builder.initTooltips();
  refreshAllPreviews(builder); // Refresh all to update active states
  builder.updateCodeOutput();
}

/**
 * Remove an uploader from the preview
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} uploaderId - ID of uploader to remove
 */
export function removeUploader(builder, uploaderId) {
  if (Object.keys(builder.uploaderInstances).length <= 1) return;

  // Destroy the instance and disconnect observer
  const data = builder.uploaderInstances[uploaderId];
  if (data) {
    // Disconnect file change observer
    if (data.fileChangeObserver) {
      data.fileChangeObserver.disconnect();
      data.fileChangeObserver = null;
    }
    if (data.instance && typeof data.instance.destroy === "function") {
      data.instance.destroy();
    }
  }

  delete builder.uploaderInstances[uploaderId];

  // If we removed the active uploader, switch to another one
  if (builder.activeUploaderId === uploaderId) {
    const remainingIds = Object.keys(builder.uploaderInstances);
    builder.activeUploaderId = remainingIds[0];
    builder.config = { ...builder.uploaderInstances[builder.activeUploaderId].config };
    builder.currentPreset =
      builder.uploaderInstances[builder.activeUploaderId].preset || null;
  }

  // Update UI
  updateUploaderTabsUI(builder);
  builder.render();
  builder.attachEvents();
  builder.initTooltips();
  refreshAllPreviews(builder);
  builder.updateCodeOutput();
}

/**
 * Check if an uploader name is already in use
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} name - Name to check
 * @param {string|null} excludeUploaderId - Uploader ID to exclude from check
 * @returns {boolean} True if name is duplicate
 */
export function isNameDuplicate(builder, name, excludeUploaderId = null) {
  const normalizedName = name.trim().toLowerCase();
  for (const [id, data] of Object.entries(builder.uploaderInstances)) {
    if (
      id !== excludeUploaderId &&
      data.name.trim().toLowerCase() === normalizedName
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Edit uploader name
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} uploaderId - ID of uploader to edit
 */
export function editUploaderName(builder, uploaderId) {
  const nameEl = builder.element.querySelector(
    `.fu-config-builder-uploader-tab-name[data-uploader-id="${uploaderId}"]`
  );
  if (!nameEl) return;

  const currentName = builder.uploaderInstances[uploaderId].name;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.className = "fu-config-builder-uploader-tab-input";

  // Error message element
  const errorEl = document.createElement("span");
  errorEl.className = "fu-config-builder-name-error";
  errorEl.style.display = "none";
  errorEl.textContent = "Name already exists";

  const validateName = () => {
    const newName = input.value.trim();
    if (newName && isNameDuplicate(builder, newName, uploaderId)) {
      input.classList.add("error");
      errorEl.style.display = "";
      return false;
    } else {
      input.classList.remove("error");
      errorEl.style.display = "none";
      return true;
    }
  };

  const finishEdit = (save = true) => {
    if (save) {
      const newName = input.value.trim();
      if (!newName) {
        // Empty name - keep current
        builder.uploaderInstances[uploaderId].name = currentName;
        nameEl.textContent = currentName;
      } else if (isNameDuplicate(builder, newName, uploaderId)) {
        // Duplicate name - show error and don't close
        input.classList.add("error");
        errorEl.style.display = "";
        input.focus();
        return;
      } else {
        // Valid name
        builder.uploaderInstances[uploaderId].name = newName;
        nameEl.textContent = newName;
        // Update preview header
        updatePreviewHeader(builder, uploaderId, newName);
        // Update code output
        builder.updateCodeOutput();
      }
    }
    nameEl.style.display = "";
    input.remove();
    errorEl.remove();
  };

  input.addEventListener("input", validateName);
  input.addEventListener("blur", () => finishEdit(true));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (validateName()) {
        finishEdit(true);
      }
    } else if (e.key === "Escape") {
      finishEdit(false);
    }
  });

  nameEl.style.display = "none";
  nameEl.parentNode.insertBefore(input, nameEl);
  nameEl.parentNode.insertBefore(errorEl, input.nextSibling);
  input.focus();
  input.select();
}

/**
 * Update preview header with new name
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} uploaderId - ID of uploader
 * @param {string} newName - New name to set
 */
export function updatePreviewHeader(builder, uploaderId, newName) {
  const wrapper = builder.element.querySelector(
    `[data-uploader-wrapper="${uploaderId}"]`
  );
  if (wrapper) {
    const label = wrapper.querySelector(".fu-config-builder-uploader-label");
    if (label) {
      label.textContent = newName;
    }
  }
}

/**
 * Update uploader tabs UI without full re-render
 * @param {Object} builder - ConfigBuilder instance
 */
export function updateUploaderTabsUI(builder) {
  const listEl = builder.element.querySelector("#uploader-list");
  if (listEl) {
    listEl.innerHTML = renderUploaderTabs(builder);

    // Re-attach uploader tab events
    builder.element
      .querySelectorAll(".fu-config-builder-uploader-tab")
      .forEach((tab) => {
        tab.addEventListener("click", (e) => {
          if (
            !e.target.closest(".fu-config-builder-uploader-tab-close") &&
            !e.target.closest(".fu-config-builder-uploader-tab-duplicate")
          ) {
            selectUploader(builder, tab.dataset.uploaderId);
          }
        });
      });

    builder.element
      .querySelectorAll(".fu-config-builder-uploader-tab-close")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeUploader(builder, btn.dataset.uploaderId);
        });
      });

    builder.element
      .querySelectorAll(".fu-config-builder-uploader-tab-duplicate")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          duplicateUploader(builder, btn.dataset.uploaderId);
        });
      });

    builder.element
      .querySelectorAll(".fu-config-builder-uploader-tab-name")
      .forEach((nameEl) => {
        nameEl.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          editUploaderName(builder, nameEl.dataset.uploaderId);
        });
      });

    // Initialize tooltips for new uploader tab elements
    Tooltip.initAll(listEl);
  }
}
