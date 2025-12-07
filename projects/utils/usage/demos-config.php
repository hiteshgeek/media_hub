<?php
/**
 * Utils Demos Configuration
 * Central configuration for utility demo pages
 */

// Demo categories and pages
$demos = [
    'Tooltip System' => [
        [
            'id' => 'tooltip-overview',
            'title' => 'Overview & Examples',
            'file' => 'demo-tooltip.php',
            'description' => 'Modern tooltip with themes, shortcuts, and fixed positioning',
            'icon' => 'tooltip'
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
