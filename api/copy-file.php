<?php
/**
 * File Copy Handler
 * Handles copying files between different upload directories (for cross-uploader operations)
 */

header('Content-Type: application/json');

// Load configuration
$config = require_once '../config.php';
require_once __DIR__ . '/../includes/functions.php';

// Get base path for URLs
$basePath = get_base_path();

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

/**
 * Get sanitized upload directory from input
 * @param string $uploadDir Raw upload directory path
 * @param array $config Configuration array
 * @return string Full path to upload directory
 */
function getUploadDir($uploadDir, $config) {
    $uploadSubDir = '';
    if (!empty($uploadDir)) {
        // Sanitize the upload directory path to prevent directory traversal attacks
        $uploadSubDir = trim($uploadDir, '/\\');
        // Remove any directory traversal attempts
        $uploadSubDir = str_replace(['..', '\\'], ['', '/'], $uploadSubDir);
        // Ensure it ends with a slash
        $uploadSubDir = rtrim($uploadSubDir, '/') . '/';
    }
    return $config['upload_dir'] . $uploadSubDir;
}

/**
 * Generate a unique filename if the file already exists
 * @param string $directory Target directory
 * @param string $filename Original filename
 * @return string Unique filename
 */
function getUniqueFilename($directory, $filename) {
    if (!file_exists($directory . $filename)) {
        return $filename;
    }

    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    $nameWithoutExt = pathinfo($filename, PATHINFO_FILENAME);
    $counter = 1;

    while (file_exists($directory . $nameWithoutExt . '_' . $counter . '.' . $extension)) {
        $counter++;
    }

    return $nameWithoutExt . '_' . $counter . '.' . $extension;
}

// Validate required input
if (!isset($input['sourceFilename']) || empty($input['sourceFilename'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Source filename not provided'
    ]);
    exit;
}

if (!isset($input['sourceUploadDir'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Source upload directory not provided'
    ]);
    exit;
}

if (!isset($input['targetUploadDir'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Target upload directory not provided'
    ]);
    exit;
}

// Security: use basename to prevent directory traversal
$sourceFilename = basename($input['sourceFilename']);
$sourceUploadDir = getUploadDir($input['sourceUploadDir'], $config);
$targetUploadDir = getUploadDir($input['targetUploadDir'], $config);

$sourcePath = $sourceUploadDir . $sourceFilename;

// Check if source file exists
if (!file_exists($sourcePath) || !is_file($sourcePath)) {
    echo json_encode([
        'success' => false,
        'error' => 'Source file not found'
    ]);
    exit;
}

// Create target directory if it doesn't exist
if (!is_dir($targetUploadDir)) {
    if (!mkdir($targetUploadDir, 0755, true)) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create target directory'
        ]);
        exit;
    }
}

// Generate unique filename for target (handles duplicates)
$targetFilename = getUniqueFilename($targetUploadDir, $sourceFilename);
$targetPath = $targetUploadDir . $targetFilename;

// Copy the file
if (!copy($sourcePath, $targetPath)) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to copy file'
    ]);
    exit;
}

// Get file info for response
$extension = strtolower(pathinfo($targetFilename, PATHINFO_EXTENSION));
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $targetPath);
finfo_close($finfo);

// Determine file type
$fileType = 'other';
if (in_array($extension, $config['image_extensions'])) {
    $fileType = 'image';
} elseif (in_array($extension, $config['video_extensions'])) {
    $fileType = 'video';
}

// Build target URL path
$targetUrlSubDir = '';
if (!empty($input['targetUploadDir'])) {
    $targetUrlSubDir = trim($input['targetUploadDir'], '/\\');
    $targetUrlSubDir = str_replace(['..', '\\'], ['', '/'], $targetUrlSubDir);
    $targetUrlSubDir = rtrim($targetUrlSubDir, '/') . '/';
}
$uploadUrlPath = '/uploads/' . $targetUrlSubDir;

// Return success response
echo json_encode([
    'success' => true,
    'file' => [
        'name' => $sourceFilename, // Original name
        'filename' => $targetFilename, // New server filename (may be different if renamed)
        'size' => filesize($targetPath),
        'type' => $mimeType,
        'extension' => $extension,
        'fileType' => $fileType,
        'url' => $basePath . $uploadUrlPath . $targetFilename,
        'path' => $targetPath
    ],
    'renamed' => ($targetFilename !== $sourceFilename)
]);
