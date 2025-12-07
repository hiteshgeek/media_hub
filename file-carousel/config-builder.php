<?php
include_once __DIR__ . '/../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FileCarousel - Configuration Builder</title>
    <link rel="icon" type="image/svg+xml" href="../src/assets/images/download.svg">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>">
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
            min-height: 100vh;
        }

        .builder-header {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 20px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .builder-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .builder-header h1 svg {
            width: 32px;
            height: 32px;
        }

        .builder-header-actions {
            display: flex;
            gap: 12px;
        }

        .builder-header-actions a {
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.15);
            transition: background 0.2s;
        }

        .builder-header-actions a:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        .builder-container {
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 20px;
            padding: 20px;
            max-width: 1600px;
            margin: 0 auto;
            min-height: calc(100vh - 80px);
        }

        .config-panel {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        .config-panel-header {
            padding: 16px 20px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
            color: #334155;
        }

        .config-section {
            padding: 20px;
            border-bottom: 1px solid #e2e8f0;
        }

        .config-section:last-child {
            border-bottom: none;
        }

        .config-section h3 {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            margin: 0 0 16px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .config-row {
            margin-bottom: 16px;
        }

        .config-row:last-child {
            margin-bottom: 0;
        }

        .config-row label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
            margin-bottom: 6px;
        }

        .config-row input[type="text"],
        .config-row input[type="number"],
        .config-row select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 14px;
            color: #334155;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .config-row input:focus,
        .config-row select:focus {
            outline: none;
            border-color: #11998e;
            box-shadow: 0 0 0 3px rgba(17, 153, 142, 0.1);
        }

        .checkbox-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .checkbox-row input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #11998e;
        }

        .checkbox-row label {
            margin: 0;
            font-size: 14px;
            color: #475569;
            cursor: pointer;
        }

        .checkbox-group {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .preview-panel {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
        }

        .preview-header {
            padding: 16px 20px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .preview-header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #334155;
        }

        .preview-actions {
            display: flex;
            gap: 8px;
        }

        .preview-actions button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
        }

        .btn-secondary {
            background: #f1f5f9;
            color: #475569;
        }

        .btn-secondary:hover {
            background: #e2e8f0;
        }

        .preview-content {
            flex: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-y: auto;
        }

        .preview-area {
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .sample-files {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 12px;
            width: 100%;
        }

        .sample-file {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .sample-file:hover {
            border-color: #11998e;
            box-shadow: 0 4px 12px rgba(17, 153, 142, 0.15);
            transform: translateY(-2px);
        }

        .sample-file svg {
            width: 32px;
            height: 32px;
            margin-bottom: 8px;
            fill: #64748b;
        }

        .sample-file span {
            display: block;
            font-size: 11px;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .code-output {
            background: #1e293b;
            border-radius: 8px;
            padding: 20px;
            overflow-x: auto;
        }

        .code-output pre {
            margin: 0;
            color: #e2e8f0;
            font-family: 'Fira Code', 'Monaco', 'Menlo', monospace;
            font-size: 13px;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .code-output .keyword { color: #c792ea; }
        .code-output .string { color: #c3e88d; }
        .code-output .property { color: #82aaff; }
        .code-output .boolean { color: #ff9cac; }
        .code-output .number { color: #f78c6c; }
        .code-output .comment { color: #676e95; }

        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 4px;
            color: #94a3b8;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .code-wrapper {
            position: relative;
        }

        @media (max-width: 1024px) {
            .builder-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header class="builder-header">
        <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
            </svg>
            FileCarousel Config Builder
        </h1>
        <div class="builder-header-actions">
            <a href="index.php">Back to Demos</a>
            <a href="../index.php">All Projects</a>
        </div>
    </header>

    <div class="builder-container">
        <div class="config-panel">
            <div class="config-panel-header">Configuration Options</div>

            <!-- Preloading Options -->
            <div class="config-section">
                <h3>Preloading</h3>
                <div class="config-row">
                    <label>Auto Preload Mode</label>
                    <select id="autoPreload">
                        <option value="true">All Files (true)</option>
                        <option value="false">Disabled (false)</option>
                        <option value="selective">Selective Types</option>
                    </select>
                </div>
                <div id="selectiveTypes" style="display: none; margin-top: 12px;">
                    <label style="margin-bottom: 10px; display: block;">Types to Preload:</label>
                    <div class="checkbox-group">
                        <div class="checkbox-row">
                            <input type="checkbox" id="preload-image" value="image" checked>
                            <label for="preload-image">Images</label>
                        </div>
                        <div class="checkbox-row">
                            <input type="checkbox" id="preload-video" value="video">
                            <label for="preload-video">Videos</label>
                        </div>
                        <div class="checkbox-row">
                            <input type="checkbox" id="preload-pdf" value="pdf">
                            <label for="preload-pdf">PDFs</label>
                        </div>
                        <div class="checkbox-row">
                            <input type="checkbox" id="preload-text" value="text">
                            <label for="preload-text">Text</label>
                        </div>
                    </div>
                </div>
                <div class="checkbox-row" style="margin-top: 12px;">
                    <input type="checkbox" id="enableManualLoading" checked>
                    <label for="enableManualLoading">Enable Manual Loading</label>
                </div>
            </div>

            <!-- Display Options -->
            <div class="config-section">
                <h3>Display Options</h3>
                <div class="checkbox-row">
                    <input type="checkbox" id="showDownloadButton" checked>
                    <label for="showDownloadButton">Show Download Button</label>
                </div>
            </div>

            <!-- Visible File Types -->
            <div class="config-section">
                <h3>Visible Types</h3>
                <div class="checkbox-group">
                    <div class="checkbox-row">
                        <input type="checkbox" id="visible-image" value="image" checked>
                        <label for="visible-image">Images</label>
                    </div>
                    <div class="checkbox-row">
                        <input type="checkbox" id="visible-video" value="video" checked>
                        <label for="visible-video">Videos</label>
                    </div>
                    <div class="checkbox-row">
                        <input type="checkbox" id="visible-audio" value="audio" checked>
                        <label for="visible-audio">Audio</label>
                    </div>
                    <div class="checkbox-row">
                        <input type="checkbox" id="visible-pdf" value="pdf" checked>
                        <label for="visible-pdf">PDFs</label>
                    </div>
                    <div class="checkbox-row">
                        <input type="checkbox" id="visible-excel" value="excel" checked>
                        <label for="visible-excel">Excel</label>
                    </div>
                    <div class="checkbox-row">
                        <input type="checkbox" id="visible-csv" value="csv" checked>
                        <label for="visible-csv">CSV</label>
                    </div>
                    <div class="checkbox-row">
                        <input type="checkbox" id="visible-text" value="text" checked>
                        <label for="visible-text">Text</label>
                    </div>
                </div>
            </div>

            <!-- Preview Limits -->
            <div class="config-section">
                <h3>Preview Limits</h3>
                <div class="config-row">
                    <label>Max Preview Rows (Excel/CSV)</label>
                    <input type="number" id="maxPreviewRows" value="100" min="10" max="1000">
                </div>
                <div class="config-row">
                    <label>Max Text Preview Characters</label>
                    <input type="number" id="maxTextPreviewChars" value="50000" min="1000" max="500000">
                </div>
            </div>
        </div>

        <div class="preview-panel">
            <div class="preview-header">
                <h2>Preview & Code</h2>
                <div class="preview-actions">
                    <button class="btn-secondary" onclick="copyCode()">Copy Code</button>
                    <button class="btn-primary" onclick="testCarousel()">Test Carousel</button>
                </div>
            </div>

            <div class="preview-content">
                <div class="preview-area">
                    <p style="color: #64748b; margin-bottom: 20px;">Click on any file below to open the carousel:</p>
                    <div class="sample-files" id="sampleFiles">
                        <!-- Sample files will be rendered here -->
                    </div>
                </div>

                <div class="code-wrapper">
                    <button class="copy-btn" onclick="copyCode()">Copy</button>
                    <div class="code-output">
                        <pre id="codeOutput"></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>
    <script type="module">
        import { FileCarousel } from '<?php echo asset('file-uploader.js'); ?>';

        // Sample files for demo
        const sampleFiles = [
            { name: 'photo.jpg', url: 'https://picsum.photos/800/600?random=1', type: 'image', mime: 'image/jpeg' },
            { name: 'landscape.png', url: 'https://picsum.photos/1200/800?random=2', type: 'image', mime: 'image/png' },
            { name: 'portrait.jpg', url: 'https://picsum.photos/600/900?random=3', type: 'image', mime: 'image/jpeg' },
            { name: 'video.mp4', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', mime: 'video/mp4' },
            { name: 'document.pdf', url: '/sample.pdf', type: 'pdf', mime: 'application/pdf' },
            { name: 'data.csv', url: '/sample.csv', type: 'csv', mime: 'text/csv' },
        ];

        let carousel = null;

        function getConfig() {
            const autoPreloadValue = document.getElementById('autoPreload').value;
            let autoPreload;

            if (autoPreloadValue === 'true') {
                autoPreload = true;
            } else if (autoPreloadValue === 'false') {
                autoPreload = false;
            } else {
                // Selective - get checked types
                autoPreload = [];
                document.querySelectorAll('#selectiveTypes input:checked').forEach(cb => {
                    autoPreload.push(cb.value);
                });
            }

            const visibleTypes = [];
            document.querySelectorAll('[id^="visible-"]:checked').forEach(cb => {
                visibleTypes.push(cb.value);
            });

            return {
                autoPreload,
                enableManualLoading: document.getElementById('enableManualLoading').checked,
                showDownloadButton: document.getElementById('showDownloadButton').checked,
                visibleTypes,
                maxPreviewRows: parseInt(document.getElementById('maxPreviewRows').value) || 100,
                maxTextPreviewChars: parseInt(document.getElementById('maxTextPreviewChars').value) || 50000,
            };
        }

        function generateCode() {
            const config = getConfig();
            let code = `<span class="keyword">import</span> { FileCarousel } <span class="keyword">from</span> <span class="string">'file-uploader'</span>;\n\n`;
            code += `<span class="keyword">const</span> carousel = <span class="keyword">new</span> FileCarousel({\n`;
            code += `  <span class="property">container</span>: document.getElementById(<span class="string">'my-carousel'</span>),\n`;
            code += `  <span class="property">files</span>: myFiles,\n`;

            // autoPreload
            if (Array.isArray(config.autoPreload)) {
                code += `  <span class="property">autoPreload</span>: [${config.autoPreload.map(t => `<span class="string">'${t}'</span>`).join(', ')}],\n`;
            } else {
                code += `  <span class="property">autoPreload</span>: <span class="boolean">${config.autoPreload}</span>,\n`;
            }

            code += `  <span class="property">enableManualLoading</span>: <span class="boolean">${config.enableManualLoading}</span>,\n`;
            code += `  <span class="property">showDownloadButton</span>: <span class="boolean">${config.showDownloadButton}</span>,\n`;
            code += `  <span class="property">visibleTypes</span>: [${config.visibleTypes.map(t => `<span class="string">'${t}'</span>`).join(', ')}],\n`;
            code += `  <span class="property">maxPreviewRows</span>: <span class="number">${config.maxPreviewRows}</span>,\n`;
            code += `  <span class="property">maxTextPreviewChars</span>: <span class="number">${config.maxTextPreviewChars}</span>,\n`;
            code += `});\n\n`;
            code += `<span class="comment">// Open carousel at specific index</span>\n`;
            code += `carousel.open(<span class="number">0</span>);`;

            document.getElementById('codeOutput').innerHTML = code;
        }

        function renderSampleFiles() {
            const container = document.getElementById('sampleFiles');
            container.innerHTML = sampleFiles.map((file, index) => `
                <div class="sample-file" onclick="window.openCarouselAt(${index})">
                    ${getFileIcon(file.type)}
                    <span>${file.name}</span>
                </div>
            `).join('');
        }

        function getFileIcon(type) {
            const icons = {
                image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
                video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
                pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>',
                csv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>',
            };
            return icons[type] || icons.image;
        }

        window.openCarouselAt = function(index) {
            const config = getConfig();
            if (carousel) {
                carousel.destroy();
            }
            carousel = new FileCarousel({
                container: document.body,
                files: sampleFiles,
                ...config
            });
            carousel.open(index);
        };

        window.testCarousel = function() {
            window.openCarouselAt(0);
        };

        window.copyCode = function() {
            const code = document.getElementById('codeOutput').innerText;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            });
        };

        // Event listeners
        document.getElementById('autoPreload').addEventListener('change', function() {
            document.getElementById('selectiveTypes').style.display =
                this.value === 'selective' ? 'block' : 'none';
            generateCode();
        });

        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('change', generateCode);
        });

        // Initialize
        renderSampleFiles();
        generateCode();
    </script>
</body>
</html>
