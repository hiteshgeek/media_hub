<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FileUploader Configuration Builder</title>
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">

    <!-- FileUploader Styles -->
    <link rel="stylesheet" href="<?php echo asset('media-hub.css'); ?>">

    <!-- ConfigBuilder Styles -->
    <link rel="stylesheet" href="<?php echo asset('config-builder.css'); ?>">

    <style>
        /* Reset and base styles */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        html {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
            min-height: 100vh;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }
    </style>
</head>

<body>
    <!-- Config Builder Container -->
    <div id="configBuilder"></div>

    <!-- FileUploader Scripts (IIFE for global access) -->
    <script src="<?php echo asset('media-hub.js', 'nomodule'); ?>"></script>

    <!-- ConfigBuilder Scripts (IIFE for global access) -->
    <script src="<?php echo asset('config-builder.js', 'nomodule'); ?>"></script>

    <!-- Config Builder Script -->
    <script>
        // ConfigBuilder is now exposed globally from config-builder.iife.js
        // FileUploader is exposed from media-hub.iife.js as window.FileUploader

        // Initialize the config builder
        const builder = new ConfigBuilder('#configBuilder', {
            onConfigChange: (config) => {
                console.log('Config changed:', config);
            }
        });

        // Override default URLs for subfolder location
        builder.config.uploadUrl = '../../api/upload.php';
        builder.config.deleteUrl = '../../api/delete.php';
        builder.config.downloadAllUrl = '../../api/download-all.php';
        builder.config.cleanupZipUrl = '../../api/cleanup-zip.php';
        builder.config.copyFileUrl = '../../api/copy-file.php';

        // Refresh the UI and preview to apply URL changes
        builder.updateCodeOutput();
        builder.updatePreview();

        // Make it globally accessible for debugging
        window.configBuilder = builder;
    </script>
</body>

</html>