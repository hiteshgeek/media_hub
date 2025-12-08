<?php
/**
 * Download All Files Handler
 * Downloads a single file or creates a zip archive for multiple files
 */

header('Content-Type: application/json');

try {
    // Load configuration
    $config = require_once '../config.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Configuration error: ' . $e->getMessage()
    ]);
    exit;
}

// Get JSON input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

// Validate input
if (!$input) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON input',
        'debug' => 'Raw input: ' . substr($rawInput, 0, 100)
    ]);
    exit;
}

if (!isset($input['files']) || !is_array($input['files']) || empty($input['files'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'No files provided',
        'debug' => 'Input received: ' . json_encode($input)
    ]);
    exit;
}

$files = $input['files'];

// If only one file, return the direct download URL
if (count($files) === 1) {
    $filename = basename($files[0]['serverFilename']);
    $filepath = $config['upload_dir'] . $filename;

    if (!file_exists($filepath)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'File not found'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'type' => 'single',
        'url' => '/media_hub/uploads/' . $filename,
        'filename' => $files[0]['originalName']
    ]);
    exit;
}

// Multiple files - create zip archive
$zipFilename = 'download_' . time() . '.zip';
$zipPath = $config['upload_dir'] . $zipFilename;

// Check if ZipArchive is available
if (!class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'ZIP extension not available on server'
    ]);
    exit;
}

$zip = new ZipArchive();
if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to create ZIP archive'
    ]);
    exit;
}

$addedFiles = 0;
$usedNames = [];

foreach ($files as $file) {
    $serverFilename = basename($file['serverFilename']);
    $originalName = $file['originalName'];
    $filepath = $config['upload_dir'] . $serverFilename;

    if (!file_exists($filepath)) {
        continue;
    }

    // Handle duplicate names
    $zipName = $originalName;
    $counter = 1;
    while (in_array($zipName, $usedNames)) {
        $pathinfo = pathinfo($originalName);
        $zipName = $pathinfo['filename'] . '_' . $counter . '.' . $pathinfo['extension'];
        $counter++;
    }
    $usedNames[] = $zipName;

    // Add file to zip with original name
    $zip->addFile($filepath, $zipName);
    $addedFiles++;
}

$zip->close();

if ($addedFiles === 0) {
    if (file_exists($zipPath)) {
        unlink($zipPath);
    }
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'No valid files found'
    ]);
    exit;
}

// Return zip download URL
echo json_encode([
    'success' => true,
    'type' => 'zip',
    'url' => '/media_hub/uploads/' . $zipFilename,
    'filename' => 'files.zip',
    'fileCount' => $addedFiles,
    'cleanup' => $zipFilename // For cleanup after download
]);
