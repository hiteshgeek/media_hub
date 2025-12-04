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
$originalName = basename($file['name']);

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'exceeds upload_max_filesize directive in php.ini',
        UPLOAD_ERR_FORM_SIZE => 'exceeds MAX_FILE_SIZE directive in HTML form',
        UPLOAD_ERR_PARTIAL => 'was only partially uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'upload failed - missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'upload failed - cannot write file to disk',
        UPLOAD_ERR_EXTENSION => 'upload was stopped by a PHP extension'
    ];

    $errorMsg = $errorMessages[$file['error']] ?? 'unknown upload error';
    echo json_encode([
        'success' => false,
        'error' => "\"{$originalName}\" {$errorMsg}"
    ]);
    exit;
}

// Validate file size (not empty)
if ($file['size'] === 0) {
    echo json_encode([
        'success' => false,
        'error' => "\"{$originalName}\" is empty"
    ]);
    exit;
}

// Get file extension
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

// Validate file extension
if (!in_array($extension, $config['allowed_extensions'])) {
    echo json_encode([
        'success' => false,
        'error' => "\"{$originalName}\" file type is not allowed. Allowed types: " . implode(', ', $config['allowed_extensions'])
    ]);
    exit;
}

// Determine file type for per-type size limit validation
$fileType = 'other';
if (in_array($extension, $config['image_extensions'])) {
    $fileType = 'image';
} elseif (in_array($extension, $config['video_extensions'])) {
    $fileType = 'video';
} elseif (in_array($extension, $config['audio_extensions'])) {
    $fileType = 'audio';
} elseif (in_array($extension, $config['document_extensions'])) {
    $fileType = 'document';
} elseif (in_array($extension, $config['archive_extensions'])) {
    $fileType = 'archive';
}

// Validate per-file max size (use per-type limit if available, otherwise use general limit)
if (isset($config['per_file_max_size_per_type'][$fileType])) {
    // Use per-type limit for this file type
    $perFileLimit = $config['per_file_max_size_per_type'][$fileType];
    $limitDisplay = $config['per_file_max_size_per_type_display'][$fileType] ?? 'unknown';
    if ($file['size'] > $perFileLimit) {
        echo json_encode([
            'success' => false,
            'error' => "\"{$originalName}\" exceeds the maximum {$fileType} file size of {$limitDisplay}"
        ]);
        exit;
    }
} else {
    // Fallback to general per-file max size (for types without specific limit)
    if ($file['size'] > $config['per_file_max_size']) {
        echo json_encode([
            'success' => false,
            'error' => "\"{$originalName}\" exceeds maximum file size of " . $config['per_file_max_size_display']
        ]);
        exit;
    }
}

// Validate MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $config['allowed_types'])) {
    echo json_encode([
        'success' => false,
        'error' => "\"{$originalName}\" file type not allowed (MIME type: {$mimeType})"
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
