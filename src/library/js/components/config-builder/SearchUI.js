/**
 * Config Builder - Search UI
 * Search event handling, results rendering, and navigation
 */

import { buildSearchIndex, fuzzySearch, highlightMatch } from "./SearchEngine.js";

/**
 * Attach search event handlers
 * @param {Object} builder - ConfigBuilder instance
 */
export function attachSearchEvents(builder) {
  const searchInput = builder.element.querySelector("#option-search");
  const clearBtn = builder.element.querySelector("#search-clear");
  const resultsContainer = builder.element.querySelector("#search-results");

  if (!searchInput) return;

  // Build search index on first focus
  searchInput.addEventListener("focus", () => {
    if (!builder.searchIndex) {
      buildSearchIndexForBuilder(builder);
    }
  });

  // Handle input with debounce
  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    // Show/hide clear button
    if (clearBtn) {
      clearBtn.style.display = query ? "flex" : "none";
    }

    // Debounce search
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (query.length >= 1) {
        const results = fuzzySearchForBuilder(builder, query);
        renderSearchResults(builder, results, query);
      } else {
        hideSearchResults(builder);
      }
    }, 150);
  });

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      hideSearchResults(builder);
      searchInput.focus();
    });
  }

  // Handle keyboard navigation
  searchInput.addEventListener("keydown", (e) => {
    if (!resultsContainer || resultsContainer.style.display === "none") return;

    const items = resultsContainer.querySelectorAll(".fu-config-builder-search-result-item");
    const activeItem = resultsContainer.querySelector(".fu-config-builder-search-result-item.active");
    let activeIndex = Array.from(items).indexOf(activeItem);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (activeIndex < items.length - 1) {
          items[activeIndex]?.classList.remove("active");
          items[activeIndex + 1]?.classList.add("active");
          items[activeIndex + 1]?.scrollIntoView({ block: "nearest" });
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (activeIndex > 0) {
          items[activeIndex]?.classList.remove("active");
          items[activeIndex - 1]?.classList.add("active");
          items[activeIndex - 1]?.scrollIntoView({ block: "nearest" });
        }
        break;
      case "Enter":
        e.preventDefault();
        if (activeItem) {
          activeItem.click();
        }
        break;
      case "Escape":
        hideSearchResults(builder);
        searchInput.blur();
        break;
    }
  });

  // Close results when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".fu-config-builder-search")) {
      hideSearchResults(builder);
    }
  });
}

/**
 * Build search index from option definitions
 * @param {Object} builder - ConfigBuilder instance
 */
export function buildSearchIndexForBuilder(builder) {
  builder.searchIndex = buildSearchIndex(builder.optionDefinitions, builder.styleDefinitions);
}

/**
 * Fuzzy search implementation
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} query - Search query
 * @returns {Array} Matching results sorted by relevance
 */
export function fuzzySearchForBuilder(builder, query) {
  return fuzzySearch(builder.searchIndex, query);
}

/**
 * Render search results dropdown
 * @param {Object} builder - ConfigBuilder instance
 * @param {Array} results - Search results
 * @param {string} query - Original query for highlighting
 */
export function renderSearchResults(builder, results, query) {
  const container = builder.element.querySelector("#search-results");
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="fu-config-builder-search-empty">
        No options found for "${query}"
      </div>
    `;
    container.style.display = "block";
    return;
  }

  const html = results.map((result, index) => {
    const highlightedLabel = highlightMatch(result.label, query);
    // Use category icon if available, otherwise fall back to type-based icon
    const iconHtml = result.icon
      ? builder.getCategoryIcon(result.icon)
      : (result.type === "config"
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"/></svg>`);

    return `
      <div class="fu-config-builder-search-result-item ${index === 0 ? "active" : ""}"
           data-option-key="${result.key}"
           data-category-key="${result.categoryKey}"
           data-type="${result.type}">
        <div class="fu-config-builder-search-result-icon">${iconHtml}</div>
        <div class="fu-config-builder-search-result-content">
          <div class="fu-config-builder-search-result-label">${highlightedLabel}</div>
          <div class="fu-config-builder-search-result-key">${result.key}</div>
          ${result.hint ? `<div class="fu-config-builder-search-result-hint">${result.hint}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
  container.style.display = "block";

  // Add click handlers
  container.querySelectorAll(".fu-config-builder-search-result-item").forEach(item => {
    item.addEventListener("click", () => {
      navigateToOption(
        builder,
        item.dataset.optionKey,
        item.dataset.categoryKey,
        item.dataset.type
      );
    });
  });
}

/**
 * Hide search results dropdown
 * @param {Object} builder - ConfigBuilder instance
 */
export function hideSearchResults(builder) {
  const container = builder.element.querySelector("#search-results");
  if (container) {
    container.style.display = "none";
  }
}

/**
 * Navigate to a specific option
 * @param {Object} builder - ConfigBuilder instance
 * @param {string} optionKey - Option key
 * @param {string} categoryKey - Category key
 * @param {string} type - 'config' or 'style'
 */
export function navigateToOption(builder, optionKey, categoryKey, type) {
  // Hide search results and clear input
  hideSearchResults(builder);
  const searchInput = builder.element.querySelector("#option-search");
  if (searchInput) {
    searchInput.value = "";
    const clearBtn = builder.element.querySelector("#search-clear");
    if (clearBtn) clearBtn.style.display = "none";
  }

  // Switch to correct main tab
  const mainTab = type === "style" ? "styles" : "config";
  const mainTabBtn = builder.element.querySelector(`[data-main-tab="${mainTab}"]`);
  if (mainTabBtn && !mainTabBtn.classList.contains("active")) {
    mainTabBtn.click();
  }

  // Small delay to allow tab switch animation
  setTimeout(() => {
    if (type === "config") {
      // Switch to correct category tab
      const categoryTab = builder.element.querySelector(`[data-category="${categoryKey}"]`);
      if (categoryTab && !categoryTab.classList.contains("active")) {
        categoryTab.click();
      }

      // Find and highlight the option
      setTimeout(() => {
        const optionEl = builder.element.querySelector(`[data-option="${optionKey}"]`);
        if (optionEl) {
          const row = optionEl.closest(".fu-config-builder-option-row");
          if (row) {
            row.scrollIntoView({ behavior: "smooth", block: "center" });
            row.classList.add("fu-config-builder-highlight");
            setTimeout(() => row.classList.remove("fu-config-builder-highlight"), 2000);
          }
        }
      }, 100);
    } else {
      // Style option - switch to correct style section
      const styleTab = builder.element.querySelector(`[data-style-section="${categoryKey}"]`);
      if (styleTab && !styleTab.classList.contains("active")) {
        styleTab.click();
      }

      // Find and highlight the variable
      setTimeout(() => {
        const varItem = builder.element.querySelector(`[data-css-var="${optionKey}"]`);
        if (varItem) {
          varItem.scrollIntoView({ behavior: "smooth", block: "center" });
          varItem.classList.add("fu-config-builder-highlight");
          setTimeout(() => varItem.classList.remove("fu-config-builder-highlight"), 2000);
        }
      }, 100);
    }
  }, 50);
}
