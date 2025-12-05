/**
 * Modern Tooltip System with Position Awareness
 * Supports text-only and text+shortcut tooltips with automatic edge detection
 */

export default class Tooltip {
  /**
   * Initialize tooltip for a single element
   * @param {HTMLElement} element - Element to attach tooltip to
   */
  static init(element) {
    const text = element.getAttribute("data-tooltip-text");
    const shortcut = element.getAttribute("data-tooltip-shortcut");
    const position = element.getAttribute("data-tooltip-position") || "top";

    if (!text) return;

    // If no shortcut, use simple CSS-based tooltip with fixed position
    if (!shortcut) {
      element.classList.add("has-tooltip");
      element.setAttribute("data-tooltip", text);

      // Always apply the specified position (no auto-detection)
      element.classList.add(`tooltip-${position}`);
      return;
    }

    // Create tooltip wrapper for shortcut support
    // Check if wrapper already exists to prevent duplicates
    if (element.querySelector(".tooltip-wrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "tooltip-wrapper";

    const textSpan = document.createElement("span");
    textSpan.className = "tooltip-text";
    textSpan.textContent = text;

    const shortcutSpan = document.createElement("span");
    shortcutSpan.className = "tooltip-shortcut";
    shortcutSpan.textContent = shortcut;

    wrapper.appendChild(textSpan);
    wrapper.appendChild(shortcutSpan);

    // Ensure element has position context.
    // Note: If element is not in DOM yet, computedStyle might be unreliable,
    // so we trust the CSS usually sets buttons to relative/flex.
    if (document.contains(element)) {
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.position === "static") {
        element.style.position = "relative";
      }
    } else {
      element.style.position = "relative";
    }

    element.appendChild(wrapper);

    // Show/hide handlers with fixed position
    const showHandler = () => {
      // Always use the specified position from data attribute
      wrapper.classList.add(`tooltip-${position}`);
      wrapper.classList.add("show");
    };

    const hideHandler = () => {
      wrapper.classList.remove("show");
      // Remove position classes when hiding
      wrapper.classList.remove(
        "tooltip-top",
        "tooltip-bottom",
        "tooltip-left",
        "tooltip-right"
      );
    };

    element.addEventListener("mouseenter", showHandler);
    element.addEventListener("mouseleave", hideHandler);
    element.addEventListener("focus", showHandler); // Accessibility
    element.addEventListener("blur", hideHandler); // Accessibility

    // Store handlers for cleanup
    element._tooltipHandlers = { showHandler, hideHandler };
  }

  /**
   * Initialize all tooltips in a container
   * @param {HTMLElement|Document} container - Container to search for tooltips
   */
  static initAll(container = document) {
    const elements = container.querySelectorAll("[data-tooltip-text]");
    elements.forEach((element) => Tooltip.init(element));

    // Also handle simple tooltips
    const simpleTooltips = container.querySelectorAll(
      ".has-tooltip[data-tooltip]:not([data-tooltip-text])"
    );
    simpleTooltips.forEach((element) => {
      const position = element.getAttribute("data-tooltip-position");
      if (
        position === "auto" ||
        position === "auto-vertical" ||
        !position
      ) {
        element.addEventListener("mouseenter", () => {
          this._adjustPositionForEdges(element, position === "auto-vertical");
        });
      }
    });
  }

  /**
   * Remove tooltip from an element
   * @param {HTMLElement} element - Element to remove tooltip from
   */
  static remove(element) {
    const wrapper = element.querySelector(".tooltip-wrapper");
    if (wrapper) {
      wrapper.remove();
    }

    // Remove event handlers
    if (element._tooltipHandlers) {
      element.removeEventListener(
        "mouseenter",
        element._tooltipHandlers.showHandler
      );
      element.removeEventListener(
        "mouseleave",
        element._tooltipHandlers.hideHandler
      );
      element.removeEventListener(
        "focus",
        element._tooltipHandlers.showHandler
      );
      element.removeEventListener("blur", element._tooltipHandlers.hideHandler);
      delete element._tooltipHandlers;
    }

    element.classList.remove("has-tooltip");
    element.removeAttribute("data-tooltip");
  }

  /**
   * Adjust tooltip position based on viewport edges (for CSS-based tooltips)
   * @param {HTMLElement} element - Element to adjust
   * @param {boolean} preferVertical - Whether to prefer left/right over top/bottom
   * @private
   */
  static _adjustPositionForEdges(element, preferVertical = false) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Remove existing position classes
    element.classList.remove(
      "tooltip-top",
      "tooltip-bottom",
      "tooltip-left",
      "tooltip-right"
    );

    const tooltipText = element.getAttribute("data-tooltip");
    if (!tooltipText) return;

    // Create temporary element to measure tooltip size
    const tempTooltip = document.createElement("div");
    tempTooltip.style.cssText = `
      position: fixed; visibility: hidden; white-space: nowrap;
      padding: 5px 10px; font-size: 0.813rem; font-weight: 500;
    `;
    tempTooltip.textContent = tooltipText;
    document.body.appendChild(tempTooltip);
    const tooltipWidth = tempTooltip.offsetWidth;
    const tooltipHeight = tempTooltip.offsetHeight;
    document.body.removeChild(tempTooltip);

    this._applyCalculatedPosition(
      element,
      rect,
      tooltipWidth,
      tooltipHeight,
      viewportWidth,
      viewportHeight,
      false,
      preferVertical
    );
  }

  /**
   * Adjust tooltip wrapper position based on viewport edges (for JS-based tooltips)
   * @param {HTMLElement} element - Element to adjust
   * @param {HTMLElement} wrapper - Tooltip wrapper element
   * @param {boolean} preferVertical - Whether to prefer left/right over top/bottom
   * @private
   */
  static _adjustWrapperPositionForEdges(element, wrapper, preferVertical = false) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    wrapper.classList.remove(
      "tooltip-top",
      "tooltip-bottom",
      "tooltip-left",
      "tooltip-right"
    );

    // Get wrapper dimensions
    const originalDisplay = wrapper.style.display;
    const originalVisibility = wrapper.style.visibility;

    wrapper.style.display = "flex";
    wrapper.style.visibility = "hidden"; // Hide while measuring
    const wrapperRect = wrapper.getBoundingClientRect();

    wrapper.style.display = originalDisplay;
    wrapper.style.visibility = originalVisibility;

    this._applyCalculatedPosition(
      wrapper,
      rect,
      wrapperRect.width,
      wrapperRect.height,
      viewportWidth,
      viewportHeight,
      true,
      preferVertical
    );
  }

  /**
   * Helper to calculate and apply class
   * @param {HTMLElement} target - Target element to apply class to
   * @param {DOMRect} elementRect - Element bounding rect
   * @param {number} tooltipWidth - Tooltip width
   * @param {number} tooltipHeight - Tooltip height
   * @param {number} vpWidth - Viewport width
   * @param {number} vpHeight - Viewport height
   * @param {boolean} isWrapper - Whether target is a wrapper element
   * @param {boolean} preferVertical - Whether to prefer left/right over top/bottom
   * @private
   */
  static _applyCalculatedPosition(
    target,
    elementRect,
    tooltipWidth,
    tooltipHeight,
    vpWidth,
    vpHeight,
    isWrapper,
    preferVertical = false
  ) {
    const spaceTop = elementRect.top;
    const spaceBottom = vpHeight - elementRect.bottom;
    const spaceLeft = elementRect.left;
    const spaceRight = vpWidth - elementRect.right;
    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;

    const minVSpace = tooltipHeight + 15;
    const minHSpace = tooltipWidth + 15;

    const halfW = tooltipWidth / 2;
    const halfH = tooltipHeight / 2;
    const overflowLeft = elementCenterX - halfW < 10;
    const overflowRight = elementCenterX + halfW > vpWidth - 10;
    const overflowTop = elementCenterY - halfH < 10;
    const overflowBottom = elementCenterY + halfH > vpHeight - 10;

    // For vertical toolbars, prioritize left/right positioning
    if (preferVertical) {
      // Priority: right > left > top > bottom
      if (spaceRight >= minHSpace && !overflowTop && !overflowBottom) {
        target.classList.add("tooltip-right");
      } else if (spaceLeft >= minHSpace && !overflowTop && !overflowBottom) {
        target.classList.add("tooltip-left");
      } else if (spaceTop >= minVSpace && !overflowLeft && !overflowRight) {
        target.classList.add("tooltip-top");
      } else if (spaceBottom >= minVSpace && !overflowLeft && !overflowRight) {
        target.classList.add("tooltip-bottom");
      } else {
        // Fallback to side with most space
        const max = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
        if (max === spaceRight) target.classList.add("tooltip-right");
        else if (max === spaceLeft) target.classList.add("tooltip-left");
        else if (max === spaceTop) target.classList.add("tooltip-top");
        else target.classList.add("tooltip-bottom");
      }
    } else {
      // For horizontal toolbars, prioritize top/bottom positioning
      // Priority: top > bottom > left > right
      if (spaceTop >= minVSpace && !overflowLeft && !overflowRight) {
        target.classList.add("tooltip-top");
      } else if (spaceBottom >= minVSpace && !overflowLeft && !overflowRight) {
        target.classList.add("tooltip-bottom");
      } else if (spaceLeft >= minHSpace) {
        target.classList.add("tooltip-left");
      } else if (spaceRight >= minHSpace) {
        target.classList.add("tooltip-right");
      } else {
        // Fallback
        const max = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
        if (max === spaceTop) target.classList.add("tooltip-top");
        else if (max === spaceBottom) target.classList.add("tooltip-bottom");
        else if (max === spaceLeft) target.classList.add("tooltip-left");
        else target.classList.add("tooltip-right");
      }
    }
  }

  static updateText(element, newText) {
    if (element.hasAttribute("data-tooltip")) {
      element.setAttribute("data-tooltip", newText);
    }
    if (element.hasAttribute("data-tooltip-text")) {
      element.setAttribute("data-tooltip-text", newText);
      const wrapper = element.querySelector(".tooltip-wrapper");
      if (wrapper) {
        const textSpan = wrapper.querySelector(".tooltip-text");
        if (textSpan) textSpan.textContent = newText;
      }
    }
  }

  static updateShortcut(element, newShortcut) {
    if (element.hasAttribute("data-tooltip-shortcut")) {
      element.setAttribute("data-tooltip-shortcut", newShortcut);
      const wrapper = element.querySelector(".tooltip-wrapper");
      if (wrapper) {
        const span = wrapper.querySelector(".tooltip-shortcut");
        if (span) span.textContent = newShortcut;
      }
    }
  }
}
