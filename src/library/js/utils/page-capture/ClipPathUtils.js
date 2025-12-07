/**
 * ClipPathUtils - Utilities for generating CSS clip-path values
 * @module ClipPathUtils
 */

/**
 * Generate clip-path polygon points to create an ellipse cutout
 * This creates a polygon that covers the entire viewport EXCEPT the ellipse area
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} rx - Radius X
 * @param {number} ry - Radius Y
 * @param {number} segments - Number of segments for ellipse approximation
 * @returns {string} - CSS clip-path value
 */
export function generateEllipseClipPath(cx, cy, rx, ry, segments = 64) {
  // Generate ellipse points - we need to trace the ellipse to create a hole
  // The trick is to go: outer rectangle → entry point → around ellipse (clockwise) → exit point → continue outer rectangle

  const ellipsePoints = [];
  // Start from right side of ellipse (0 degrees) and go clockwise
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    ellipsePoints.push(`${x}px ${y}px`);
  }

  // Create clip-path with a hole for the ellipse
  // We trace the outer viewport, then cut in to trace the ellipse (creating a hole)
  // Using evenodd fill rule by tracing the ellipse in opposite direction

  // Entry point: right side of ellipse (cx + rx, cy)
  const entryX = cx + rx;
  const entryY = cy;

  return `polygon(
    evenodd,
    0 0,
    100% 0,
    100% 100%,
    0 100%,
    0 0,
    ${entryX}px ${entryY}px,
    ${ellipsePoints.join(', ')}
  )`;
}

/**
 * Generate rectangle clip-path with a cutout hole
 * @param {number} left - Left position
 * @param {number} top - Top position
 * @param {number} width - Width
 * @param {number} height - Height
 * @returns {string} - CSS clip-path value
 */
export function generateRectangleClipPath(left, top, width, height) {
  const right = left + width;
  const bottom = top + height;

  return `polygon(
    0% 0%, 0% 100%, ${left}px 100%, ${left}px ${top}px,
    ${right}px ${top}px, ${right}px ${bottom}px,
    ${left}px ${bottom}px, ${left}px 100%, 100% 100%, 100% 0%
  )`;
}

/**
 * Update clip-path based on selection parameters
 * @param {HTMLElement} overlayElement - The overlay element to apply clip-path
 * @param {Object} selection - Selection parameters
 * @param {number} selection.left - Left position (document coords)
 * @param {number} selection.top - Top position (document coords)
 * @param {number} selection.width - Width
 * @param {number} selection.height - Height
 * @param {boolean} selection.isOval - Whether selection is oval
 */
export function updateClipPath(overlayElement, selection) {
  if (!overlayElement || !selection) return;

  const { left, top, width, height, isOval } = selection;
  const viewportLeft = left - window.scrollX;
  const viewportTop = top - window.scrollY;

  if (isOval) {
    const centerX = viewportLeft + width / 2;
    const centerY = viewportTop + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;
    overlayElement.style.clipPath = generateEllipseClipPath(centerX, centerY, radiusX, radiusY, 48);
  } else {
    overlayElement.style.clipPath = generateRectangleClipPath(viewportLeft, viewportTop, width, height);
  }
}

export default {
  generateEllipseClipPath,
  generateRectangleClipPath,
  updateClipPath
};
