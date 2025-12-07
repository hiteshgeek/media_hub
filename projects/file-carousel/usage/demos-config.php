<?php
/**
 * FileCarousel Demos Configuration
 * Central configuration for all demo pages
 */

// Demo categories and pages
$demos = [
    'Getting Started' => [
        [
            'id' => 'basic',
            'title' => 'Basic Usage',
            'file' => 'demo-basic.php',
            'description' => 'Initialize FileCarousel with sample files',
            'icon' => 'play'
        ],
        [
            'id' => 'preloading',
            'title' => 'Preloading Options',
            'file' => 'demo-preloading.php',
            'description' => 'Configure auto-preload and selective loading',
            'icon' => 'download'
        ],
    ],
    'File Types' => [
        [
            'id' => 'file-types',
            'title' => 'File Type Support',
            'file' => 'demo-file-types.php',
            'description' => 'View images, videos, PDFs, Excel, CSV, text',
            'icon' => 'file'
        ],
        [
            'id' => 'integration',
            'title' => 'FileUploader Integration',
            'file' => 'demo-integration.php',
            'description' => 'Use with the FileUploader component',
            'icon' => 'link'
        ],
    ],
];

/**
 * Get current demo ID from filename
 */
function getCurrentDemoId() {
    $currentFile = basename($_SERVER['SCRIPT_NAME']);
    global $demos;

    foreach ($demos as $category => $items) {
        foreach ($items as $demo) {
            if ($demo['file'] === $currentFile) {
                return $demo['id'];
            }
        }
    }
    return null;
}

/**
 * Get demo info by ID
 */
function getDemoById($id) {
    global $demos;

    foreach ($demos as $category => $items) {
        foreach ($items as $demo) {
            if ($demo['id'] === $id) {
                return $demo;
            }
        }
    }
    return null;
}
