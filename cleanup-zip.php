<?php
/**
 * Cleanup temporary ZIP files
 * Called after download completes
 */

// Load configuration
$config = require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['filename']) || empty($input['filename'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Filename not provided'
    ]);
    exit;
}

$filename = basename($input['filename']); // Security: prevent directory traversal

// Only delete files that start with 'download_' and end with '.zip'
if (!preg_match('/^download_\d+\.zip$/', $filename)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid filename format'
    ]);
    exit;
}

$filepath = $config['upload_dir'] . $filename;

// Check if file exists
if (!file_exists($filepath)) {
    echo json_encode([
        'success' => true,
        'message' => 'File already deleted or does not exist'
    ]);
    exit;
}

// Delete the file
if (unlink($filepath)) {
    echo json_encode([
        'success' => true,
        'message' => 'Temporary ZIP file deleted'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to delete temporary file'
    ]);
}
