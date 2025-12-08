/**
 * ConfigBuilder - Entry Point
 *
 * Standalone entry point for ConfigBuilder component.
 * This allows ConfigBuilder to be built as a separate bundle.
 *
 * @module ConfigBuilder
 *
 * @example
 * // Import as ES module
 * import ConfigBuilder from './config-builder';
 *
 * // Or use IIFE global
 * const builder = new ConfigBuilder('#config-builder');
 */

// Main ConfigBuilder component
import ConfigBuilder from "./components/ConfigBuilder.js";

// Export ConfigBuilder as default only (to avoid named/default conflict in IIFE)
export default ConfigBuilder;
