<?php
include_once __DIR__ . '/../../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Limits Demo - File Uploader</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../../src/assets/images/download.svg">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
            border-left: 4px solid #319795;
        }
        .info-box.warning {
            border-left-color: #f39c12;
            background: #fef5e7;
        }
        .info-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #234e52;
            margin-bottom: 12px;
        }
        .info-box ul {
            margin: 0;
            padding-left: 20px;
        }
        .info-box li {
            color: #2d3748;
            margin: 6px 0;
            font-size: 14px;
        }
        .demo-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
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
                    <h1>Limits Demo</h1>
                    <p>Demonstrates per-file-type size limits and total upload limits</p>
                </div>

                <div class="info-box">
                    <h3>Configured Limits:</h3>
                    <ul>
                        <li><strong>Images:</strong> Max 10MB per file, 50MB total, 5 files max</li>
                        <li><strong>Videos:</strong> Max 100MB per file, 200MB total, 3 files max</li>
                        <li><strong>Audio:</strong> Max 25MB per file, 100MB total, 3 files max</li>
                        <li><strong>Documents:</strong> Max 10MB per file, 50MB total, 5 files max</li>
                        <li><strong>Archives:</strong> Max 20MB per file, 100MB total, 2 files max</li>
                        <li><strong>Total Size:</strong> 100MB across all files</li>
                        <li><strong>Max Files:</strong> 10 files maximum</li>
                    </ul>
                </div>

                <div class="demo-section">
                    <div id="fileUploader"></div>
                </div>

                <div class="info-box warning">
                    <h3>Try These Tests:</h3>
                    <ul>
                        <li>Upload more than 10 files - should show error</li>
                        <li>Upload a large image (>10MB) - should fail with type-specific error</li>
                        <li>Upload files until total exceeds 100MB - should show remaining space error</li>
                        <li>Watch the limits display update in real-time</li>
                        <li>Toggle between concise and detailed view</li>
                        <li><strong>Upload multiple files and click "Download All"</strong> - creates a ZIP file</li>
                    </ul>
                </div>
            </div>
        </main>
    </div>

    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module">
        import { FileUploader } from '<?= asset('file-uploader.js') ?>';

        const uploader = new FileUploader('#fileUploader', {
            uploadUrl: '../../../api/upload.php',
            deleteUrl: '../../../api/delete.php',
            downloadAllUrl: '../../../api/download-all.php',
            cleanupZipUrl: '../../../api/cleanup-zip.php',
            configUrl: '../../../api/get-config.php',
            multiple: true,
            showLimits: true,
            defaultLimitsView: 'detailed',
            allowLimitsViewToggle: true,
            onUploadSuccess: (fileObj, result) => {
                console.log('✅ Uploaded:', fileObj.name);
                console.log('Current total size:', uploader.getTotalSize(), 'bytes');
                console.log('Files uploaded:', uploader.getUploadedFiles().length);
            },
            onUploadError: (fileObj, error) => {
                console.error('❌ Upload failed:', fileObj.name, error);
            }
        });

        console.log('%cLimits Demo Mode Active', 'color: #319795; font-weight: bold; font-size: 14px;');
    </script>
</body>
</html>
