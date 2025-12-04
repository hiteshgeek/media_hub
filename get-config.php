<?php
/**
 * Config API
 * Returns configuration as JSON for JavaScript initialization
 */

header('Content-Type: application/json');

// Load configuration
$config = require_once 'config.php';

// Prepare config for JavaScript (exclude server-side only settings)
$jsConfig = [
    'allowedExtensions' => $config['allowed_extensions'],
    'maxFileSize' => $config['max_file_size'],
    'maxFileSizeDisplay' => $config['max_file_size_display'],
    'fileTypeSizeLimits' => $config['file_type_size_limits'],
    'fileTypeSizeLimitsDisplay' => $config['file_type_size_limits_display'],
    'fileTypeCountLimits' => $config['file_type_count_limits'] ?? [],
    'totalSizeLimit' => $config['total_size_limit'],
    'totalSizeLimitDisplay' => $config['total_size_limit_display'],
    'maxFiles' => $config['max_files'],
    'imageExtensions' => $config['image_extensions'],
    'videoExtensions' => $config['video_extensions'],
    'audioExtensions' => $config['audio_extensions'],
    'documentExtensions' => $config['document_extensions'],
    'archiveExtensions' => $config['archive_extensions'],
    'uploadUrl' => 'upload.php',
    'deleteUrl' => 'delete.php'
];

echo json_encode($jsConfig);
