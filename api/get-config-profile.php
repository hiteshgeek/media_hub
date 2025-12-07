<?php
/**
 * Config API for Profile Picture Uploader
 * Returns configuration as JSON for JavaScript initialization
 */

header('Content-Type: application/json');

// Load base configuration
$config = require '../config.php';

// Profile-specific overrides
$jsConfig = [
    // Only allow image extensions for profile pictures
    'allowedExtensions' => $config['image_extensions'],

    // Use image-specific limits
    'perFileMaxSize' => $config['per_file_max_size_per_type']['image'] ?? $config['per_file_max_size'],
    'perFileMaxSizeDisplay' => $config['per_file_max_size_per_type_display']['image'] ?? $config['per_file_max_size_display'],

    // No per-type limits needed since we only allow images
    'perFileMaxSizePerType' => [],
    'perFileMaxSizePerTypeDisplay' => [],
    'perTypeMaxTotalSize' => [],
    'perTypeMaxTotalSizeDisplay' => [],
    'perTypeMaxFileCount' => [],

    // Single file for profile picture
    'totalMaxSize' => $config['per_file_max_size_per_type']['image'] ?? $config['per_file_max_size'],
    'totalMaxSizeDisplay' => $config['per_file_max_size_per_type_display']['image'] ?? $config['per_file_max_size_display'],
    'maxFiles' => 1,

    // File type extensions
    'imageExtensions' => $config['image_extensions'],
    'videoExtensions' => [],
    'audioExtensions' => [],
    'documentExtensions' => [],
    'archiveExtensions' => [],

    // Upload directory for this uploader
    'uploadDir' => 'profile_pictures'
];

echo json_encode($jsConfig);
