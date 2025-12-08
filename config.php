<?php

/**
 * File Uploader Configuration
 * This configuration is shared between PHP and JavaScript
 */

// Define file size limits in bytes
$perFileMaxSize = 5 * 1024 * 1024;  // 5MB (fallback for types without specific limit)
$totalMaxSize = 100 * 1024 * 1024;  // 100MB (total for all files combined)

// Per file max size limit - maximum size for a SINGLE file of each type
$perFileMaxSizePerType = [
    'image' => 10 * 1024 * 1024,      // 10MB per image file
    'video' => 100 * 1024 * 1024,     // 100MB per video file
    'audio' => 25 * 1024 * 1024,      // 25MB per audio file
    'document' => 10 * 1024 * 1024,   // 10MB per document file
    'archive' => 20 * 1024 * 1024,    // 20MB per archive file
];

// Per type max total size limit - maximum TOTAL size for all files of that type combined
$perTypeMaxTotalSize = [
    'image' => 50 * 1024 * 1024,      // 50MB total for all images
    'video' => 200 * 1024 * 1024,     // 200MB total for all videos
    'audio' => 100 * 1024 * 1024,     // 100MB total for all audio files
    'document' => 50 * 1024 * 1024,   // 50MB total for all documents
    'archive' => 100 * 1024 * 1024,   // 100MB total for all archives
];

// Per type max file count - maximum number of files allowed for each type
$perTypeMaxFileCount = [
    'image' => 5,
    'video' => 3,
    'audio' => 3,
    'document' => 5,
    'archive' => 2,
];

return [
    // Upload directory (relative to this file)
    'upload_dir' => __DIR__ . '/uploads/',

    // Allowed file types (MIME types)
    'allowed_types' => [
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        // Videos
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        // Audio
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/ogg',
        'audio/webm',
        'audio/aac',
        'audio/x-m4a',
        'audio/mp4',
        'audio/flac',
        // Documents
        // 'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        // Archives
        'application/zip',
        'application/x-zip-compressed',
        'application/x-zip',
        'application/octet-stream', // Generic binary, used by some systems for archives
        'application/x-rar-compressed',
        'application/x-rar',
        'application/rar',
        'application/x-7z-compressed',
        'application/x-compressed',
        'application/x-gzip',
        'application/gzip',
        'application/x-tar',

        'application/json',
        'text/json',
        'application/xml',
        'text/xml',
    ],

    // Allowed file extensions
    'allowed_extensions' => [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'mp4',
        'mpeg',
        'mov',
        'avi',
        'webm',
        'mp3',
        'wav',
        'ogg',
        'aac',
        'm4a',
        'flac',
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'txt',
        'csv',
        'zip',
        'rar',
        '7z',
        'tar',
        'gz',
        'json',
        'xml'
    ],

    // Per file max size (fallback for types without specific limit)
    'per_file_max_size' => $perFileMaxSize,

    // Per file max size per type - maximum size for a SINGLE file of each type
    'per_file_max_size_per_type' => $perFileMaxSizePerType,

    // Per type max total size - maximum TOTAL size for all files of that type combined
    'per_type_max_total_size' => $perTypeMaxTotalSize,

    // Per type max file count - maximum number of files allowed for each type
    'per_type_max_file_count' => $perTypeMaxFileCount,

    // Total max size - maximum size across all files combined
    'total_max_size' => $totalMaxSize,

    // Maximum number of files
    'max_files' => 10,

    // Generate unique filenames
    'unique_filenames' => true,

    // Image file extensions for preview
    'image_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],

    // Video file extensions for preview
    'video_extensions' => ['mp4', 'mpeg', 'mov', 'avi', 'webm'],

    // Audio file extensions for preview
    'audio_extensions' => ['mp3', 'wav', 'ogg', 'webm', 'aac', 'm4a', 'flac'],

    // Document file extensions
    'document_extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],

    // Archive file extensions
    'archive_extensions' => ['zip', 'rar', '7z', 'tar', 'gz'],
];
