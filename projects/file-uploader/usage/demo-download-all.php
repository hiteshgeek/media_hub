<?php
include_once __DIR__ . '/../../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download All Demo - File Uploader</title>
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
            margin-bottom: 12px;
        }
        .info-box p {
            margin: 8px 0;
            font-size: 14px;
        }
        .info-box ul {
            margin: 0;
            padding-left: 20px;
        }
        .info-box li {
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
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 24px;
        }
        .feature-card {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
        }
        .feature-card h3 {
            font-size: 16px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .feature-card p {
            font-size: 14px;
            color: #4a5568;
            line-height: 1.5;
        }
        .feature-card svg {
            width: 24px;
            height: 24px;
            color: #4299e1;
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
                    <h1>Download All Feature</h1>
                    <p>Smart downloading: single file or ZIP archive for multiple files</p>
                </div>

                <div class="info-box">
                    <h3>How It Works:</h3>
                    <p><strong>Single File:</strong> Downloads directly with original filename</p>
                    <p><strong>Multiple Files:</strong> Automatically creates a ZIP archive and downloads it</p>
                    <p><strong>Smart Cleanup:</strong> Temporary ZIP files are automatically deleted after download</p>
                </div>

                <div class="demo-section">
                    <div id="fileUploader"></div>

                    <div class="feature-grid">
                        <div class="feature-card">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Individual Downloads
                            </h3>
                            <p>Each file has its own download button that downloads with the original filename.</p>
                        </div>

                        <div class="feature-card">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="9" y1="9" x2="15" y2="9"></line>
                                    <line x1="9" y1="15" x2="15" y2="15"></line>
                                </svg>
                                Bulk Download
                            </h3>
                            <p>Click "Download All" to get all files at once. Multiple files are automatically zipped.</p>
                        </div>

                        <div class="feature-card">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Auto Cleanup
                            </h3>
                            <p>Temporary ZIP files are automatically deleted after download to save server space.</p>
                        </div>
                    </div>
                </div>

                <div class="info-box warning">
                    <h3>Test Scenarios:</h3>
                    <ul>
                        <li>Upload 1 file → Click "Download All" → Downloads the single file directly</li>
                        <li>Upload 3-5 files → Click "Download All" → Creates and downloads a ZIP</li>
                        <li>Click individual download buttons → Each file downloads separately</li>
                        <li>Upload files, download all, then delete some → Button updates in real-time</li>
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
            defaultLimitsView: 'concise',
            onUploadSuccess: (fileObj, result) => {
                console.log('✅ Uploaded:', fileObj.name);
            }
        });

        console.log('%cDownload All Demo Active', 'color: #319795; font-weight: bold; font-size: 14px;');
    </script>
</body>
</html>
