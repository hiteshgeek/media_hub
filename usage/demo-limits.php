<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Uploader - Limits Demo</title>
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

        .info-box ul {
            margin: 5px 0;
            padding-left: 20px;
            color: #2d3748;
        }

        .info-box li {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>File Uploader with Limits</h1>
        <p class="subtitle">Demonstrates per-file-type size limits and total upload limits</p>

        <div class="info-box">
            <h3>Configured Limits:</h3>
            <ul>
                <li><strong>Images:</strong> Max 5MB per file</li>
                <li><strong>Videos:</strong> Max 50MB per file</li>
                <li><strong>Documents:</strong> Max 10MB per file</li>
                <li><strong>Archives:</strong> Max 20MB per file</li>
                <li><strong>Total Size:</strong> 100MB across all files</li>
                <li><strong>Max Files:</strong> 10 files maximum</li>
            </ul>
        </div>

        <div id="fileUploader"></div>

        <div class="info-box" style="margin-top: 30px; background-color: #fef5e7; border-left-color: #f39c12;">
            <h3>Try These Tests:</h3>
            <ul>
                <li>Upload more than 10 files - should show error</li>
                <li>Upload a large image (>5MB) - should fail with type-specific error</li>
                <li>Upload files until total exceeds 100MB - should show remaining space error</li>
                <li>Watch the limits display update in real-time</li>
                <li><strong>Upload multiple files and click "Download All"</strong> - creates a ZIP file</li>
                <li><strong>Upload single file and click "Download All"</strong> - downloads directly</li>
            </ul>
        </div>
    </div>

    <script src="file-uploader.js"></script>
    <script>
        // Initialize uploader with limits
        const uploader = new FileUploader('#fileUploader', {
            multiple: true,
            showLimits: true,
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
        console.log('File type limits:', uploader.options.fileTypeSizeLimits);
        console.log('Total size limit:', uploader.options.totalSizeLimit, 'bytes');
        console.log('Max files:', uploader.options.maxFiles);
    </script>
</body>
</html>
