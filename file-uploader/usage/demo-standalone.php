<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Standalone Demo - File Uploader</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #f7fafc;
            color: #2d3748;
        }

        .demo-main {
            padding: 40px;
            max-width: 1000px;
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
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #4299e1;
        }

        .info-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
        }

        .info-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 8px;
        }

        .info-box li {
            color: #4a5568;
            font-size: 14px;
            padding-left: 20px;
            position: relative;
        }

        .info-box li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #48bb78;
            font-weight: bold;
        }

        .demo-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
        }

        .demo-section h2 {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #4299e1;
            color: white;
        }

        .btn-primary:hover {
            background: #3182ce;
        }

        .btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }

        .btn-secondary:hover {
            background: #cbd5e0;
        }

        #fileInfo {
            margin-top: 20px;
            padding: 15px;
            background: #f7fafc;
            border-radius: 6px;
            font-family: monospace;
            font-size: 13px;
            white-space: pre-wrap;
            display: none;
        }

        #fileInfo.show {
            display: block;
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
                    <h1>Standalone Demo</h1>
                    <p>Basic standalone implementation with drag & drop, preview, and AJAX upload</p>
                </div>

                <div class="info-box">
                    <h3>Features Demonstrated:</h3>
                    <ul>
                        <li>Drag & drop file upload</li>
                        <li>File type validation</li>
                        <li>Image and video preview</li>
                        <li>Instant AJAX upload</li>
                        <li>Download individual files</li>
                        <li>Download all as ZIP</li>
                        <li>Delete uploaded files</li>
                        <li>Real-time limits display</li>
                    </ul>
                </div>

                <div class="demo-section">
                    <h2>Upload Files</h2>
                    <div id="fileUploader"></div>

                    <div class="button-group">
                        <button class="btn btn-primary" onclick="getUploadedFiles()">Get Uploaded Files</button>
                        <button class="btn btn-secondary" onclick="getAllFiles()">Get All Files</button>
                    </div>

                    <div id="fileInfo"></div>
                </div>
            </div>
        </main>
    </div>

    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module">
        import { FileUploader } from '<?= asset('file-uploader.js') ?>';

        const uploader = new FileUploader('#fileUploader', {
            uploadUrl: '../../upload.php',
            deleteUrl: '../../delete.php',
            downloadAllUrl: '../../download-all.php',
            cleanupZipUrl: '../../cleanup-zip.php',
            configUrl: '../../get-config.php',
            multiple: true,
            showLimits: true,
            defaultLimitsView: 'concise',
            allowLimitsViewToggle: true,
            confirmBeforeDelete: false,
            onUploadSuccess: (fileObj, result) => {
                console.log('✅ Uploaded:', fileObj.name);
            },
            onUploadError: (fileObj, error) => {
                console.error('❌ Upload failed:', fileObj.name, error);
            }
        });

        window.uploader = uploader;

        window.getUploadedFiles = function() {
            const files = uploader.getUploadedFiles();
            const info = document.getElementById('fileInfo');
            info.classList.add('show');
            info.textContent = 'Uploaded Files:\n' + JSON.stringify(files, null, 2);
        };

        window.getAllFiles = function() {
            const files = uploader.getFiles();
            const info = document.getElementById('fileInfo');
            info.classList.add('show');
            info.textContent = 'All Files:\n' + JSON.stringify(files, null, 2);
        };
    </script>
</body>
</html>
