<?php
/**
 * MediaCapture Demos Configuration
 * Central configuration for all demo pages
 */

// Demo categories and pages
$demos = [
    'Screenshots' => [
        [
            'id' => 'screenshots',
            'title' => 'Screenshot Capture',
            'file' => 'demo-screenshots.php',
            'description' => 'Full screen, region, and page capture',
            'icon' => 'camera'
        ],
    ],
    'Recording' => [
        [
            'id' => 'video-recording',
            'title' => 'Video Recording',
            'file' => 'demo-video-recording.php',
            'description' => 'Screen recording with audio support',
            'icon' => 'video'
        ],
        [
            'id' => 'audio-recording',
            'title' => 'Audio Recording',
            'file' => 'demo-audio-recording.php',
            'description' => 'Microphone recording to WAV',
            'icon' => 'mic'
        ],
    ],
    'Combined' => [
        [
            'id' => 'all-features',
            'title' => 'All Features',
            'file' => 'demo-all-features.php',
            'description' => 'Complete demo with all options',
            'icon' => 'grid'
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
