/**
 * ShapePreference - Manages shape preference storage
 * @module ShapePreference
 */

// Storage key for remembering shape preference
export const SHAPE_STORAGE_KEY = 'file-uploader-capture-shape';

/**
 * Load shape preference from localStorage
 * @returns {boolean} - true if oval mode, false if rectangle mode
 */
export function loadShapePreference() {
  try {
    const saved = localStorage.getItem(SHAPE_STORAGE_KEY);
    return saved === 'oval';
  } catch (e) {
    return false; // Default to rectangle if localStorage unavailable
  }
}

/**
 * Save shape preference to localStorage
 * @param {boolean} isOval - true for oval, false for rectangle
 */
export function saveShapePreference(isOval) {
  try {
    localStorage.setItem(SHAPE_STORAGE_KEY, isOval ? 'oval' : 'rectangle');
  } catch (e) {
    // Ignore if localStorage unavailable
  }
}

export default {
  SHAPE_STORAGE_KEY,
  loadShapePreference,
  saveShapePreference
};
