<?php
/**
 * Config API
 * Returns configuration as JSON for JavaScript initialization
 */

header('Content-Type: application/json');

// Load configuration
$config = require_once '../config.php';

// Prepare config for JavaScript (exclude server-side only settings)
$jsConfig = [
    'allowedExtensions' => $config['allowed_extensions'],
    'perFileMaxSize' => $config['per_file_max_size'],
    'perFileMaxSizeDisplay' => $config['per_file_max_size_display'],
    'perFileMaxSizePerType' => $config['per_file_max_size_per_type'] ?? [],
    'perFileMaxSizePerTypeDisplay' => $config['per_file_max_size_per_type_display'] ?? [],
    'perTypeMaxTotalSize' => $config['per_type_max_total_size'],
    'perTypeMaxTotalSizeDisplay' => $config['per_type_max_total_size_display'],
    'perTypeMaxFileCount' => $config['per_type_max_file_count'] ?? [],
    'totalMaxSize' => $config['total_max_size'],
    'totalMaxSizeDisplay' => $config['total_max_size_display'],
    'maxFiles' => $config['max_files'],
    'imageExtensions' => $config['image_extensions'],
    'videoExtensions' => $config['video_extensions'],
    'audioExtensions' => $config['audio_extensions'],
    'documentExtensions' => $config['document_extensions'],
    'archiveExtensions' => $config['archive_extensions']
    // Note: URL options (uploadUrl, deleteUrl, etc.) are NOT included here
    // because they should be set by the user based on their project structure
];

echo json_encode($jsConfig);
