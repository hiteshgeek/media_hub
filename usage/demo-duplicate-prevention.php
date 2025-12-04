<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Duplicate Prevention Demo - File Uploader</title>
    <link rel="stylesheet" href="<?php echo asset('main.css'); ?>" />
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: #f7fafc;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 10px;
            color: #1a202c;
        }

        .subtitle {
            font-size: 18px;
            color: #718096;
            margin: 0 0 30px;
        }

        .info-box {
            background: white;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .info-box h3 {
            margin-top: 0;
            color: #2d3748;
            font-size: 20px;
        }

        .info-box ul {
            margin: 10px 0;
            padding-left: 20px;
        }

        .info-box li {
            margin: 8px 0;
            color: #4a5568;
        }

        .section {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-title {
            margin-top: 0;
            font-size: 24px;
            color: #1a202c;
            margin-bottom: 20px;
        }

        .controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .control-group {
            background: #f7fafc;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }

        .control-group label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #2d3748;
            font-size: 14px;
        }

        .control-group select,
        .control-group input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #cbd5e0;
            border-radius: 4px;
            font-size: 14px;
            background: white;
        }

        .control-group input[type="checkbox"] {
            width: auto;
            margin-right: 8px;
        }

        .checkbox-wrapper {
            display: flex;
            align-items: center;
        }

        .checkbox-wrapper label {
            margin: 0;
            font-weight: 500;
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background-color: #4299e1;
            color: white;
        }

        .btn-primary:hover {
            background-color: #3182ce;
        }

        .btn-secondary {
            background-color: #718096;
            color: white;
        }

        .btn-secondary:hover {
            background-color: #4a5568;
        }

        .btn-danger {
            background-color: #fc8181;
            color: white;
        }

        .btn-danger:hover {
            background-color: #f56565;
        }

        #log {
            background: #1a202c;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 20px;
        }

        #log .log-entry {
            margin: 4px 0;
            padding: 4px 0;
            border-bottom: 1px solid #2d3748;
        }

        #log .log-entry:last-child {
            border-bottom: none;
        }

        #log .log-time {
            color: #a0aec0;
            font-size: 11px;
        }

        #log .log-type-info {
            color: #63b3ed;
        }

        #log .log-type-warn {
            color: #f6ad55;
        }

        #log .log-type-error {
            color: #fc8181;
        }

        #log .log-type-success {
            color: #68d391;
        }

        .highlight {
            background: #fef5e7;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.9em;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>🔒 Duplicate Prevention Demo</h1>
        <p class="subtitle">Test the duplicate file prevention feature with real-time configuration</p>

        <div class="info-box">
            <h3>How to Test:</h3>
            <ul>
                <li>✅ Enable duplicate prevention below</li>
                <li>📁 Upload a file</li>
                <li>🔄 Try to upload the same file again</li>
                <li>👀 Watch the console log for duplicate detection messages</li>
                <li>⚙️ Change the detection method to see different behaviors</li>
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">⚙️ Configuration</h2>

            <div class="controls">
                <div class="control-group">
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="preventDuplicates" checked>
                        <label for="preventDuplicates">Enable Duplicate Prevention</label>
                    </div>
                </div>

                <div class="control-group">
                    <label for="duplicateCheckBy">Check Duplicates By:</label>
                    <select id="duplicateCheckBy">
                        <option value="name">Name Only</option>
                        <option value="size">Size Only</option>
                        <option value="name-size" selected>Name + Size (Recommended)</option>
                        <option value="hash">Hash (Not implemented yet)</option>
                    </select>
                </div>
            </div>

            <button class="btn btn-primary" onclick="applyConfig()">🔄 Apply Configuration</button>
        </div>

        <div class="section">
            <h2 class="section-title">📤 Upload Files</h2>
            <div id="fileUploader"></div>

            <div class="button-group">
                <button class="btn btn-primary" onclick="getUploadedFiles()">📋 Get Uploaded Files</button>
                <button class="btn btn-secondary" onclick="getAllFiles()">📊 Get All Files</button>
                <button class="btn btn-danger" onclick="clearFiles()">🗑️ Clear All</button>
                <button class="btn btn-secondary" onclick="clearLog()">🧹 Clear Log</button>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">📝 Event Log</h2>
            <div id="log"></div>
        </div>
    </div>

    <script type="module">
        import { FileUploader } from './dist/js/file-uploader.js';

        let uploader;

        // Initialize with default config
        function initUploader() {
            const preventDuplicates = document.getElementById('preventDuplicates').checked;
            const duplicateCheckBy = document.getElementById('duplicateCheckBy').value;

            log('info', `Initializing FileUploader with preventDuplicates=${preventDuplicates}, duplicateCheckBy=${duplicateCheckBy}`);

            // Destroy existing uploader if any
            if (uploader) {
                uploader.destroy();
            }

            uploader = new FileUploader('#fileUploader', {
                maxFiles: 10,
                maxFileSize: 10 * 1024 * 1024,
                preventDuplicates: preventDuplicates,
                duplicateCheckBy: duplicateCheckBy,

                onUploadStart: (fileObj) => {
                    log('info', `Upload started: ${fileObj.name} (${formatBytes(fileObj.size)})`);
                },

                onUploadSuccess: (fileObj, result) => {
                    log('success', `Upload successful: ${fileObj.name}`);
                },

                onUploadError: (fileObj, error) => {
                    log('error', `Upload failed: ${fileObj.name} - ${error.message}`);
                },

                onDuplicateFile: (file, duplicate) => {
                    log('warn', `🔒 DUPLICATE DETECTED: "${file.name}" (${formatBytes(file.size)}) matches existing file "${duplicate.name}"`);
                    console.log('Duplicate file details:', {
                        newFile: file,
                        existingFile: duplicate
                    });
                },

                onDeleteSuccess: (fileObj, result) => {
                    log('info', `File deleted: ${fileObj.name}`);
                }
            });

            log('success', 'FileUploader initialized successfully!');
        }

        // Apply configuration
        window.applyConfig = function() {
            log('info', '⚙️ Applying new configuration...');
            initUploader();
        };

        // Get uploaded files
        window.getUploadedFiles = function() {
            const files = uploader.getUploadedFiles();
            log('info', `📋 Uploaded files: ${files.length}`);
            files.forEach(f => {
                log('info', `  - ${f.name} (${formatBytes(f.size)})`);
            });
        };

        // Get all files
        window.getAllFiles = function() {
            const files = uploader.getFiles();
            log('info', `📊 All files: ${files.length}`);
            files.forEach(f => {
                const status = f.uploaded ? '✅ Uploaded' : f.uploading ? '⏳ Uploading' : '❌ Failed';
                log('info', `  - ${f.name} (${formatBytes(f.size)}) - ${status}`);
            });
        };

        // Clear files
        window.clearFiles = function() {
            uploader.clear();
            log('info', '🗑️ All files cleared');
        };

        // Clear log
        window.clearLog = function() {
            document.getElementById('log').innerHTML = '';
            log('info', '🧹 Log cleared');
        };

        // Logging function
        function log(type, message) {
            const logDiv = document.getElementById('log');
            const time = new Date().toLocaleTimeString();
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-type-${type}">${message}</span>`;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        // Format bytes helper
        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
        }

        // Make functions available globally
        window.log = log;
        window.formatBytes = formatBytes;

        // Initialize on load
        initUploader();
    </script>
</body>

</html>
