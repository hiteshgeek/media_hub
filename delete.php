<?php
/**
 * File Delete Handler
 * Handles AJAX file deletion
 */

header('Content-Type: application/json');

// Load configuration
$config = require_once 'config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['filename']) || empty($input['filename'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Filename not provided'
    ]);
    exit;
}

$filename = basename($input['filename']); // Security: prevent directory traversal
$filePath = $config['upload_dir'] . $filename;

// Check if file exists
if (!file_exists($filePath)) {
    echo json_encode([
        'success' => false,
        'error' => 'File not found'
    ]);
    exit;
}

// Check if it's a file (not a directory)
if (!is_file($filePath)) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid file'
    ]);
    exit;
}

// Delete the file
if (unlink($filePath)) {
    echo json_encode([
        'success' => true,
        'message' => 'File deleted successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to delete file'
    ]);
}
