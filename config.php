<?php

/**
 * File Uploader Configuration
 * This configuration is shared between PHP and JavaScript
 */

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
        'application/pdf',
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
        'gz'
    ],

    // Maximum file size in bytes (10MB default)
    'max_file_size' => 1000 * 1024 * 1024,

    // Maximum file size for display (human readable)
    'max_file_size_display' => '1000MB',

    // Per file type size limits (in bytes)
    'file_type_size_limits' => [
        'image' => 5 * 1024 * 1024,      // 5MB for images
        'video' => 500 * 1024 * 1024,     // 500MB for videos
        'audio' => 50 * 1024 * 1024,     // 50MB for audio
        'document' => 10 * 1024 * 1024,  // 10MB for documents
        'archive' => 20 * 1024 * 1024,   // 20MB for archives
    ],

    // Per file type size limits display (human readable)
    'file_type_size_limits_display' => [
        'image' => '5MB',
        'video' => '500MB',
        'audio' => '50MB',
        'document' => '10MB',
        'archive' => '20MB',
    ],

    // Maximum number of files allowed per type
    'file_type_count_limits' => [
        'image' => 5,
        'video' => 3,
        'audio' => 3,
        'document' => 5,
        'archive' => 2,
    ],

    // Total upload size limit across all files (in bytes)
    'total_size_limit' => 1000 * 1024 * 1024,

    // Total upload size limit display (human readable)
    'total_size_limit_display' => '1000MB',

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
