<?php
/**
 * Config API for Documents Uploader
 * Returns configuration as JSON for JavaScript initialization
 */

header('Content-Type: application/json');

// Load base configuration
$config = require '../config.php';

// Documents-specific configuration
$jsConfig = [
    // Allow documents, archives, and images
    'allowedExtensions' => array_merge(
        $config['document_extensions'],
        $config['archive_extensions'],
        $config['image_extensions']
    ),

    // General per-file limit
    'perFileMaxSize' => $config['per_file_max_size'],
    'perFileMaxSizeDisplay' => $config['per_file_max_size_display'],

    // Per-type limits
    'perFileMaxSizePerType' => $config['per_file_max_size_per_type'],
    'perFileMaxSizePerTypeDisplay' => $config['per_file_max_size_per_type_display'],
    'perTypeMaxTotalSize' => $config['per_type_max_total_size'],
    'perTypeMaxTotalSizeDisplay' => $config['per_type_max_total_size_display'],
    'perTypeMaxFileCount' => $config['per_type_max_file_count'],

    // Total limits
    'totalMaxSize' => $config['total_max_size'],
    'totalMaxSizeDisplay' => $config['total_max_size_display'],
    'maxFiles' => $config['max_files'],

    // File type extensions
    'imageExtensions' => $config['image_extensions'],
    'videoExtensions' => [],
    'audioExtensions' => [],
    'documentExtensions' => $config['document_extensions'],
    'archiveExtensions' => $config['archive_extensions'],

    // Upload directory for this uploader
    'uploadDir' => 'documents'
];

echo json_encode($jsConfig);
