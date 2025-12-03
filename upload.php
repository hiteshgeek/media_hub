<?php
/**
 * File Upload Handler
 * Handles AJAX file uploads with validation
 */

header('Content-Type: application/json');

// Load configuration
$config = require_once 'config.php';

// Create uploads directory if it doesn't exist
if (!is_dir($config['upload_dir'])) {
    if (!mkdir($config['upload_dir'], 0755, true)) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create upload directory'
        ]);
        exit;
    }
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] === UPLOAD_ERR_NO_FILE) {
    echo json_encode([
        'success' => false,
        'error' => 'No file uploaded'
    ]);
    exit;
}

$file = $_FILES['file'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive in HTML form',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
    ];

    echo json_encode([
        'success' => false,
        'error' => $errorMessages[$file['error']] ?? 'Unknown upload error'
    ]);
    exit;
}

// Validate file size
if ($file['size'] > $config['max_file_size']) {
    echo json_encode([
        'success' => false,
        'error' => 'File size exceeds maximum allowed size of ' . $config['max_file_size_display']
    ]);
    exit;
}

// Validate file size (not empty)
if ($file['size'] === 0) {
    echo json_encode([
        'success' => false,
        'error' => 'File is empty'
    ]);
    exit;
}

// Get file extension
$originalName = basename($file['name']);
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

// Validate file extension
if (!in_array($extension, $config['allowed_extensions'])) {
    echo json_encode([
        'success' => false,
        'error' => 'File type not allowed. Allowed types: ' . implode(', ', $config['allowed_extensions'])
    ]);
    exit;
}

// Validate MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $config['allowed_types'])) {
    echo json_encode([
        'success' => false,
        'error' => 'File MIME type not allowed'
    ]);
    exit;
}

// Generate filename
if ($config['unique_filenames']) {
    $filename = uniqid() . '_' . time() . '.' . $extension;
} else {
    $filename = $originalName;
    // If file exists, add number suffix
    $counter = 1;
    while (file_exists($config['upload_dir'] . $filename)) {
        $nameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);
        $filename = $nameWithoutExt . '_' . $counter . '.' . $extension;
        $counter++;
    }
}

$destination = $config['upload_dir'] . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $destination)) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to move uploaded file'
    ]);
    exit;
}

// Determine file type for preview
$fileType = 'other';
if (in_array($extension, $config['image_extensions'])) {
    $fileType = 'image';
} elseif (in_array($extension, $config['video_extensions'])) {
    $fileType = 'video';
}

// Return success response
echo json_encode([
    'success' => true,
    'file' => [
        'name' => $originalName,
        'filename' => $filename,
        'size' => $file['size'],
        'type' => $mimeType,
        'extension' => $extension,
        'fileType' => $fileType,
        'url' => 'uploads/' . $filename,
        'path' => $destination
    ]
]);
