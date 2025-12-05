<?php
include_once __DIR__ . '/includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FileUploader Configuration Builder</title>
    <link rel="icon" type="image/svg+xml" href="src/assets/images/download.svg">

    <!-- FileUploader Styles -->
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>">

    <style>
        /* Reset and base styles */
        *, *::before, *::after {
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
    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>

    <!-- Config Builder Script -->
    <script type="module">
        import ConfigBuilder from './src/library/js/components/ConfigBuilder.js';

        // Initialize the config builder
        const builder = new ConfigBuilder('#configBuilder', {
            onConfigChange: (config) => {
                console.log('Config changed:', config);
            }
        });

        // Make it globally accessible for debugging
        window.configBuilder = builder;
    </script>
</body>
</html>
