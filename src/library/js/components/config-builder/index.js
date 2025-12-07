/**
 * ConfigBuilder Module
 * Re-exports the ConfigBuilder class from the main file
 *
 * This module structure allows for gradual refactoring of the large
 * ConfigBuilder.js file into smaller, focused modules.
 *
 * @module config-builder
 */

// Re-export the main ConfigBuilder class
export { default } from '../ConfigBuilder.js';

// Export definitions and utilities for external use
export { getOptionDefinitions, getOptionDefault, getDefaultConfig } from './OptionDefinitions.js';
export { getStyleDefinitions, getDefaultStyleValues } from './StyleDefinitions.js';
export { getCategoryIcon, getFileTypeIcon, getModalButtonIcon, getCategoryIconSvg } from './Icons.js';
export * from './helpers.js';

// Variable maps for CSS variable to selector mappings
export { getVarToSelectorMap, getVarSourceMap } from './VarMaps.js';

// Theme management utilities
export {
  getThemeVars,
  getEffectiveTheme,
  applyThemeClass,
  applyThemeToContainer,
  loadSavedTheme,
  saveTheme
} from './ThemeManager.js';

// Search engine utilities
export {
  buildSearchIndex,
  fuzzySearch,
  calculateFuzzyScore,
  fuzzyCharMatch,
  highlightMatch
} from './SearchEngine.js';

// Constants and mappings
export {
  OPTION_TO_GROUP,
  GROUP_TITLES,
  GROUP_ORDER,
  PHP_GROUP_TITLES,
  MEDIA_CAPTURE_ICONS,
  MEDIA_CAPTURE_TITLES,
  FILE_TYPE_ICONS,
  MODAL_BUTTON_ICONS,
  PHP_RELEVANT_KEYS,
  PHP_RELEVANT_GROUPS,
  groupChangedConfig
} from './Constants.js';

// Per-type limits rendering and event handling
export {
  getFileTypeIcon,
  capitalizeFirst,
  renderPerTypeLimitsByFileType,
  rerenderPerTypeLimitsPanel,
  attachTypeSizeSliderEvents,
  attachTypeCountSliderEvents,
  attachPerTypeByFileTypeEvents
} from './PerTypeLimits.js';

// Uploader management (add, remove, duplicate, select)
export {
  renderUploaderTabs,
  refreshAllPreviews,
  addUploader,
  duplicateUploader,
  selectUploader,
  removeUploader,
  isNameDuplicate,
  editUploaderName,
  updatePreviewHeader,
  updateUploaderTabsUI
} from './UploaderManager.js';

// Search UI (event handling, results rendering, navigation)
export {
  attachSearchEvents,
  buildSearchIndexForBuilder,
  fuzzySearchForBuilder,
  renderSearchResults,
  hideSearchResults,
  navigateToOption
} from './SearchUI.js';
