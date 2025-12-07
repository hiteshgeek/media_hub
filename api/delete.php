<?php
/**
 * File Delete Handler
 * Handles AJAX file deletion (single or bulk)
 */

header('Content-Type: application/json');

// Load configuration
$config = require_once '../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

/**
 * Get sanitized upload directory from input
 * @param array $data Input data containing optional uploadDir
 * @param array $config Configuration array
 * @return string Full path to upload directory
 */
function getUploadDir($data, $config) {
    $uploadSubDir = '';
    if (isset($data['uploadDir']) && !empty($data['uploadDir'])) {
        // Sanitize the upload directory path to prevent directory traversal attacks
        $uploadSubDir = trim($data['uploadDir'], '/\\');
        // Remove any directory traversal attempts
        $uploadSubDir = str_replace(['..', '\\'], ['', '/'], $uploadSubDir);
        // Ensure it ends with a slash
        $uploadSubDir = rtrim($uploadSubDir, '/') . '/';
    }
    return $config['upload_dir'] . $uploadSubDir;
}

// Check if it's a bulk delete request (array of files)
if (isset($input['files']) && is_array($input['files'])) {
    $results = [];
    $successCount = 0;
    $failCount = 0;

    // Get upload directory (use global uploadDir if provided, otherwise check per-file)
    $globalUploadDir = getUploadDir($input, $config);

    foreach ($input['files'] as $fileData) {
        if (!isset($fileData['filename']) || empty($fileData['filename'])) {
            $failCount++;
            continue;
        }

        $filename = basename($fileData['filename']); // Security: prevent directory traversal
        // Use per-file uploadDir if provided, otherwise use global
        $uploadDir = isset($fileData['uploadDir']) ? getUploadDir($fileData, $config) : $globalUploadDir;
        $filePath = $uploadDir . $filename;

        // Check if file exists and is a file
        if (file_exists($filePath) && is_file($filePath)) {
            if (unlink($filePath)) {
                $successCount++;
                $results[] = [
                    'filename' => $filename,
                    'success' => true
                ];
            } else {
                $failCount++;
                $results[] = [
                    'filename' => $filename,
                    'success' => false,
                    'error' => 'Failed to delete'
                ];
            }
        } else {
            $failCount++;
            $results[] = [
                'filename' => $filename,
                'success' => false,
                'error' => 'File not found'
            ];
        }
    }

    echo json_encode([
        'success' => $failCount === 0,
        'message' => "Deleted $successCount file(s), $failCount failed",
        'deleted' => $successCount,
        'failed' => $failCount,
        'results' => $results
    ]);
    exit;
}

// Single file delete
// Validate input
if (!isset($input['filename']) || empty($input['filename'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Filename not provided'
    ]);
    exit;
}

$filename = basename($input['filename']); // Security: prevent directory traversal
$uploadDir = getUploadDir($input, $config);
$filePath = $uploadDir . $filename;

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
