<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Uploader - Download All Demo</title>
    <link rel="stylesheet" href="file-uploader.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: #fff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
            margin: 0 0 10px;
            color: #2d3748;
            font-size: 28px;
        }

        .subtitle {
            margin: 0 0 30px;
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

        .info-box ul {
            margin: 5px 0;
            padding-left: 20px;
            color: #2d3748;
        }

        .info-box li {
            margin: 5px 0;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }

        .feature-card {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
        }

        .feature-card h3 {
            margin: 0 0 10px;
            color: #2d3748;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .feature-card p {
            margin: 0;
            color: #4a5568;
            font-size: 14px;
            line-height: 1.5;
        }

        .icon {
            width: 24px;
            height: 24px;
            color: #4299e1;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Download All Feature</h1>
        <p class="subtitle">Smart downloading: single file or ZIP archive for multiple files</p>

        <div class="info-box">
            <h3>How It Works:</h3>
            <p><strong>Single File:</strong> Downloads directly with original filename</p>
            <p><strong>Multiple Files:</strong> Automatically creates a ZIP archive and downloads it</p>
            <p><strong>Smart Cleanup:</strong> Temporary ZIP files are automatically deleted after download</p>
        </div>

        <div id="fileUploader"></div>

        <div class="feature-grid">
            <div class="feature-card">
                <h3>
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Auto Cleanup
                </h3>
                <p>Temporary ZIP files are automatically deleted after download to save server space.</p>
            </div>
        </div>

        <div class="info-box" style="margin-top: 30px; background-color: #fef5e7; border-left-color: #f39c12;">
            <h3>Test Scenarios:</h3>
            <ul>
                <li>Upload 1 file → Click "Download All" → Downloads the single file directly</li>
                <li>Upload 3-5 files → Click "Download All" → Creates and downloads a ZIP</li>
                <li>Click individual download buttons → Each file downloads separately</li>
                <li>Upload files, download all, then delete some → Button updates in real-time</li>
            </ul>
        </div>
    </div>

    <script src="file-uploader.js"></script>
    <script>
        // Initialize uploader
        const uploader = new FileUploader('#fileUploader', {
            multiple: true,
            showLimits: true,
            onUploadSuccess: (fileObj, result) => {
                console.log('✅ Uploaded:', fileObj.name);
            }
        });

        console.log('%cDownload All Demo Active', 'color: #319795; font-weight: bold; font-size: 14px;');
        console.log('Try uploading multiple files and clicking the "Download All" button!');
    </script>
</body>
</html>
