<?php
include_once __DIR__ . '/includes/functions.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Uploader - Standalone Demo</title>
    <link rel="stylesheet" href="<?php echo asset('main.css'); ?>" />
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="src/assets/images/download.svg">

</head>

<body>
    <div class="container">
        <h1>File Uploader</h1>
        <p class="subtitle">Standalone implementation with drag & drop, preview, and AJAX upload</p>

        <div class="info-box">
            <h3>Features:</h3>
            <ul>
                <li>Drag & drop file upload</li>
                <li>File type validation (images, videos, documents, archives)</li>
                <li>Image and video preview with thumbnails</li>
                <li>File info display (name, type, size)</li>
                <li>Instant AJAX upload on file selection</li>
                <li>Download individual or all files at once</li>
                <li>Auto-compress multiple files to ZIP</li>
                <li>Delete uploaded files</li>
                <li>Maximum file size: 10MB</li>
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Upload Files</h2>
            <div id="fileUploader"></div>

            <div class="button-group">
                <button class="btn btn-primary" onclick="getUploadedFiles()">Get Uploaded Files</button>
                <button class="btn btn-secondary" onclick="getAllFiles()">Get All Files</button>
            </div>

            <div id="fileInfo"></div>
        </div>

        <div class="demo-links">
            <h3>Other Demos:</h3>
            <a href="usage/demo-bootstrap3.php">Bootstrap 3 Demo</a>
            <a href="usage/demo-bootstrap4.php">Bootstrap 4 Demo</a>
            <a href="usage/demo-bootstrap5.php">Bootstrap 5 Demo</a>
            <a href="modal_file_uploader.php">Modal Demo</a>
        </div>

        <div class="demo-links">
            <a href="config-builder.php">Config Builder</a>
        </div>
    </div>

    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module" src="<?= asset('main.js') ?>"></script>
    <script nomodule src="<?php echo asset('main.js', 'nomodule'); ?>"></script>
</body>

</html>