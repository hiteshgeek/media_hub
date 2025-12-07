<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validation Test - File Uploader</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f7fafc;
            color: #2d3748;
        }

        .demo-main {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }

        .demo-header {
            margin-bottom: 30px;
        }

        .demo-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
        }

        .demo-header p {
            color: #718096;
            font-size: 16px;
        }

        .info-box {
            background-color: #e6fffa;
            border-left: 4px solid #319795;
            padding: 16px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        .info-box h3 {
            margin: 0 0 10px;
            color: #234e52;
            font-size: 16px;
        }

        .info-box p {
            margin: 5px 0;
            color: #2d3748;
        }

        .demo-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
        }

        .test-section {
            margin-top: 30px;
            padding: 20px;
            background-color: #f7fafc;
            border-radius: 8px;
        }

        .test-section h3 {
            margin: 0 0 15px;
            color: #2d3748;
        }

        .test-section ul {
            margin: 10px 0;
            padding-left: 20px;
        }

        .test-section li {
            margin: 5px 0;
            color: #4a5568;
        }

        @media (max-width: 992px) {
            .demo-main {
                padding: 20px;
                padding-top: 70px;
            }
        }
    </style>
</head>
<body>
    <div class="demo-layout">
        <?php include __DIR__ . '/sidebar.php'; ?>

        <main class="demo-content">
            <div class="demo-main">
                <div class="demo-header">
                    <h1>File Validation Test</h1>
                    <p>This demo only allows image files to demonstrate validation</p>
                </div>

                <div class="info-box">
                    <h3>Allowed Files Only:</h3>
                    <p><strong>Allowed:</strong> Images only (.jpg, .jpeg, .png, .gif, .webp, .svg)</p>
                    <p><strong>Max Size:</strong> 10MB</p>
                </div>

                <div class="demo-section">
                    <div id="fileUploader"></div>
                </div>

                <div class="test-section">
                    <h3>Test Cases:</h3>
                    <p>Try uploading these types of files to see the validation in action:</p>
                    <ul>
                        <li><strong>Should work:</strong> Any image file (JPG, PNG, GIF, etc.)</li>
                        <li><strong>Should fail with error:</strong> PDF, Word documents, Excel files</li>
                        <li><strong>Should fail with error:</strong> Video files (MP4, AVI, etc.)</li>
                        <li><strong>Should fail with error:</strong> ZIP files or other archives</li>
                        <li><strong>Should fail with error:</strong> Files larger than 10MB</li>
                    </ul>
                    <p><strong>Important:</strong> Files that are not allowed will NOT show a preview - only an error message will appear.</p>
                </div>
            </div>
        </main>
    </div>

    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module">
        import { FileUploader } from '<?= asset('file-uploader.js') ?>';

        // Initialize uploader with ONLY images allowed
        const uploader = new FileUploader('#fileUploader', {
            uploadUrl: '../../upload.php',
            deleteUrl: '../../delete.php',
            downloadAllUrl: '../../download-all.php',
            configUrl: '../../get-config-profile.php',
            multiple: true,
            showLimits: true,
            defaultLimitsView: 'concise',
            // Override to allow only images
            allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            onUploadSuccess: (fileObj, result) => {
                console.log('Upload success:', fileObj.name);
            },
            onUploadError: (fileObj, error) => {
                console.error('Upload error:', fileObj.name, error);
            }
        });

        console.log('%cValidation Test Mode Active', 'color: #319795; font-weight: bold; font-size: 14px;');
        console.log('Allowed extensions:', uploader.options.allowedExtensions);
    </script>
</body>
</html>
