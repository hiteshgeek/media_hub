<?php
/**
 * Demos Configuration
 * Central configuration for all demo pages
 */

// Demo categories and pages
$demos = [
    'Getting Started' => [
        [
            'id' => 'modular-library',
            'title' => 'Modular Library',
            'file' => 'demo-modular-library.php',
            'description' => 'Three independent components: FileUploader, FileCarousel, MediaCapture',
            'icon' => 'modules'
        ],
        [
            'id' => 'standalone',
            'title' => 'Standalone Demo',
            'file' => 'demo-standalone.php',
            'description' => 'Basic standalone implementation with all features',
            'icon' => 'rocket'
        ],
        [
            'id' => 'limits',
            'title' => 'Limits Demo',
            'file' => 'demo-limits.php',
            'description' => 'Per-file-type size limits and total upload limits',
            'icon' => 'gauge'
        ],
    ],
    'Bootstrap Integration' => [
        [
            'id' => 'bootstrap3',
            'title' => 'Bootstrap 3',
            'file' => 'demo-bootstrap3.php',
            'description' => 'Integration with Bootstrap 3 forms',
            'icon' => 'bootstrap'
        ],
        [
            'id' => 'bootstrap4',
            'title' => 'Bootstrap 4',
            'file' => 'demo-bootstrap4.php',
            'description' => 'Integration with Bootstrap 4 forms',
            'icon' => 'bootstrap'
        ],
        [
            'id' => 'bootstrap5',
            'title' => 'Bootstrap 5',
            'file' => 'demo-bootstrap5.php',
            'description' => 'Integration with Bootstrap 5 forms',
            'icon' => 'bootstrap'
        ],
    ],
    'Modal Examples' => [
        [
            'id' => 'modal-bs3',
            'title' => 'Modal - Bootstrap 3',
            'file' => 'modal-demo-bootstrap3.php',
            'description' => 'File uploader in Bootstrap 3 modal',
            'icon' => 'window'
        ],
        [
            'id' => 'modal-bs4',
            'title' => 'Modal - Bootstrap 4',
            'file' => 'modal-demo-bootstrap4.php',
            'description' => 'File uploader in Bootstrap 4 modal',
            'icon' => 'window'
        ],
        [
            'id' => 'modal-bs5',
            'title' => 'Modal - Bootstrap 5',
            'file' => 'modal-demo-bootstrap5.php',
            'description' => 'File uploader in Bootstrap 5 modal',
            'icon' => 'window'
        ],
    ],
    'Features' => [
        [
            'id' => 'download-all',
            'title' => 'Download All',
            'file' => 'demo-download-all.php',
            'description' => 'Smart download: single file or ZIP archive',
            'icon' => 'download'
        ],
        [
            'id' => 'download-button',
            'title' => 'External Buttons',
            'file' => 'demo-download-button.php',
            'description' => 'Using external download/clear buttons',
            'icon' => 'button'
        ],
        [
            'id' => 'duplicate-prevention',
            'title' => 'Duplicate Prevention',
            'file' => 'demo-duplicate-prevention.php',
            'description' => 'Prevent uploading duplicate files',
            'icon' => 'shield'
        ],
        [
            'id' => 'form-submission',
            'title' => 'Form Submission',
            'file' => 'demo-form-submission.php',
            'description' => 'Complete form with file uploads',
            'icon' => 'form'
        ],
    ],
    'Testing' => [
        [
            'id' => 'test-validation',
            'title' => 'Validation Test',
            'file' => 'test-validation.php',
            'description' => 'Test file validation rules',
            'icon' => 'check'
        ],
        [
            'id' => 'test-download',
            'title' => 'Download Test',
            'file' => 'test-download.php',
            'description' => 'Test download functionality',
            'icon' => 'download'
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
