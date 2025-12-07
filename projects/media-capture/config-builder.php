<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediaCapture - Configuration Builder</title>
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .builder-header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .builder-header-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 20px;
            font-weight: 700;
        }

        .builder-header-title svg {
            width: 28px;
            height: 28px;
        }

        /* Theme Switcher */
        .theme-switcher {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 8px;
        }

        .theme-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            padding: 0;
            background: transparent;
            border: none;
            border-radius: 6px;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .theme-btn svg {
            width: 18px;
            height: 18px;
            stroke: currentColor;
            fill: none;
        }

        .theme-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            color: white;
        }

        .theme-btn.active {
            background: rgba(255, 255, 255, 0.25);
            color: white;
        }

        .builder-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .builder-header-actions a {
            display: flex;
            align-items: center;
            gap: 6px;
            color: white;
            text-decoration: none;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.15);
            transition: background 0.2s;
        }

        .builder-header-actions a svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
            fill: none;
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
            border-color: #f5576c;
            box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
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
            accent-color: #f5576c;
        }

        .checkbox-row label {
            margin: 0;
            font-size: 14px;
            color: #475569;
            cursor: pointer;
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
            min-height: 200px;
        }

        .action-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }

        .action-btn {
            padding: 16px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .action-btn svg {
            width: 20px;
            height: 20px;
        }

        .action-btn.screenshot {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
        }

        .action-btn.video {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }

        .action-btn.audio {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
        }

        .action-btn.region {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .result-area {
            margin-top: 20px;
        }

        .result-area img,
        .result-area video,
        .result-area audio {
            max-width: 100%;
            border-radius: 8px;
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

        .code-wrapper {
            position: relative;
        }

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

        @media (max-width: 1024px) {
            .builder-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header class="builder-header">
        <div class="builder-header-left">
            <div class="builder-header-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>MediaCapture Config Builder</span>
            </div>
            <div class="theme-switcher" id="theme-switcher">
                <button class="theme-btn" data-theme="light" title="Light Mode">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                </button>
                <button class="theme-btn active" data-theme="dark" title="Dark Mode">
                    <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </button>
                <button class="theme-btn" data-theme="system" title="System Default">
                    <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </button>
            </div>
        </div>
        <div class="builder-header-actions">
            <a href="index.php">
                <svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Home
            </a>
            <a href="usage/demo-screenshots.php">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Demos
            </a>
            <a href="../../index.php">
                <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                All Projects
            </a>
        </div>
    </header>

    <div class="builder-container">
        <div class="config-panel">
            <div class="config-panel-header">Configuration Options</div>

            <!-- UI Options -->
            <div class="config-section">
                <h3>Recording UI</h3>
                <div class="checkbox-row">
                    <input type="checkbox" id="showRecordingUI" checked>
                    <label for="showRecordingUI">Show Recording UI</label>
                </div>
            </div>

            <!-- Video Options -->
            <div class="config-section">
                <h3>Video Recording</h3>
                <div class="config-row">
                    <label>Max Duration (seconds)</label>
                    <input type="number" id="maxVideoDuration" value="300" min="10" max="3600">
                </div>
                <div class="checkbox-row">
                    <input type="checkbox" id="includeSystemAudio" checked>
                    <label for="includeSystemAudio">Include System Audio</label>
                </div>
                <div class="checkbox-row">
                    <input type="checkbox" id="includeMicrophone">
                    <label for="includeMicrophone">Include Microphone</label>
                </div>
            </div>

            <!-- Screenshot Options -->
            <div class="config-section">
                <h3>Screenshot</h3>
                <div class="config-row">
                    <label>Image Format</label>
                    <select id="imageFormat">
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WebP</option>
                    </select>
                </div>
                <div class="config-row">
                    <label>Quality (JPEG/WebP)</label>
                    <input type="number" id="imageQuality" value="0.92" min="0.1" max="1" step="0.01">
                </div>
            </div>

            <!-- Audio Options -->
            <div class="config-section">
                <h3>Audio Recording</h3>
                <div class="config-row">
                    <label>Output Format</label>
                    <select id="audioFormat">
                        <option value="wav">WAV</option>
                        <option value="webm">WebM</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="preview-panel">
            <div class="preview-header">
                <h2>Test & Code</h2>
            </div>

            <div class="preview-content">
                <div class="preview-area">
                    <h3 style="margin: 0 0 16px 0; color: #334155;">Try MediaCapture</h3>
                    <div class="action-buttons">
                        <button class="action-btn screenshot" onclick="captureScreen()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            Screen Capture
                        </button>
                        <button class="action-btn region" onclick="captureRegion()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            Region Capture
                        </button>
                        <button class="action-btn video" onclick="toggleVideoRecording()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                            <span id="videoBtn">Start Video</span>
                        </button>
                        <button class="action-btn audio" onclick="toggleAudioRecording()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
                            <span id="audioBtn">Start Audio</span>
                        </button>
                    </div>

                    <div class="result-area" id="resultArea"></div>
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
        import { MediaCapture } from '<?php echo asset('file-uploader.js'); ?>';

        let mediaCapture = null;
        let isRecordingVideo = false;
        let isRecordingAudio = false;

        function getConfig() {
            return {
                showRecordingUI: document.getElementById('showRecordingUI').checked,
                videoRecorderOptions: {
                    maxDuration: parseInt(document.getElementById('maxVideoDuration').value) || 300,
                    includeSystemAudio: document.getElementById('includeSystemAudio').checked,
                    includeMicrophone: document.getElementById('includeMicrophone').checked,
                },
                screenCaptureOptions: {
                    format: document.getElementById('imageFormat').value,
                    quality: parseFloat(document.getElementById('imageQuality').value) || 0.92,
                },
            };
        }

        function initCapture() {
            const config = getConfig();
            mediaCapture = new MediaCapture({
                ...config,
                onCapture: (file, type) => {
                    showResult(file, type);
                },
                onRecordingStart: () => {
                    console.log('Recording started');
                },
                onRecordingStop: (file, type) => {
                    showResult(file, type);
                    if (type === 'video') {
                        isRecordingVideo = false;
                        document.getElementById('videoBtn').textContent = 'Start Video';
                    } else {
                        isRecordingAudio = false;
                        document.getElementById('audioBtn').textContent = 'Start Audio';
                    }
                },
            });
        }

        function showResult(file, type) {
            const resultArea = document.getElementById('resultArea');
            const url = URL.createObjectURL(file);

            if (type === 'screen' || type === 'region' || type === 'fullpage') {
                resultArea.innerHTML = `<img src="${url}" alt="Screenshot" style="margin-top: 16px;">`;
            } else if (type === 'video') {
                resultArea.innerHTML = `<video src="${url}" controls style="margin-top: 16px;"></video>`;
            } else if (type === 'audio') {
                resultArea.innerHTML = `<audio src="${url}" controls style="margin-top: 16px; width: 100%;"></audio>`;
            }
        }

        window.captureScreen = async function() {
            initCapture();
            try {
                await mediaCapture.captureScreen();
            } catch (e) {
                console.log('Screen capture cancelled or failed:', e.message);
            }
        };

        window.captureRegion = async function() {
            initCapture();
            try {
                await mediaCapture.captureRegion();
            } catch (e) {
                console.log('Region capture cancelled or failed:', e.message);
            }
        };

        window.toggleVideoRecording = async function() {
            if (!isRecordingVideo) {
                initCapture();
                try {
                    await mediaCapture.startVideoRecording();
                    isRecordingVideo = true;
                    document.getElementById('videoBtn').textContent = 'Stop Video';
                } catch (e) {
                    console.log('Video recording failed:', e.message);
                }
            } else {
                await mediaCapture.stopRecording();
            }
        };

        window.toggleAudioRecording = async function() {
            if (!isRecordingAudio) {
                initCapture();
                try {
                    await mediaCapture.startAudioRecording();
                    isRecordingAudio = true;
                    document.getElementById('audioBtn').textContent = 'Stop Audio';
                } catch (e) {
                    console.log('Audio recording failed:', e.message);
                }
            } else {
                await mediaCapture.stopRecording();
            }
        };

        function generateCode() {
            const config = getConfig();
            let code = `<span class="keyword">import</span> { MediaCapture } <span class="keyword">from</span> <span class="string">'file-uploader'</span>;\n\n`;
            code += `<span class="keyword">const</span> capture = <span class="keyword">new</span> MediaCapture({\n`;
            code += `  <span class="property">showRecordingUI</span>: <span class="boolean">${config.showRecordingUI}</span>,\n\n`;

            code += `  <span class="comment">// Video recording options</span>\n`;
            code += `  <span class="property">videoRecorderOptions</span>: {\n`;
            code += `    <span class="property">maxDuration</span>: <span class="number">${config.videoRecorderOptions.maxDuration}</span>,\n`;
            code += `    <span class="property">includeSystemAudio</span>: <span class="boolean">${config.videoRecorderOptions.includeSystemAudio}</span>,\n`;
            code += `    <span class="property">includeMicrophone</span>: <span class="boolean">${config.videoRecorderOptions.includeMicrophone}</span>,\n`;
            code += `  },\n\n`;

            code += `  <span class="comment">// Screenshot options</span>\n`;
            code += `  <span class="property">screenCaptureOptions</span>: {\n`;
            code += `    <span class="property">format</span>: <span class="string">'${config.screenCaptureOptions.format}'</span>,\n`;
            code += `    <span class="property">quality</span>: <span class="number">${config.screenCaptureOptions.quality}</span>,\n`;
            code += `  },\n\n`;

            code += `  <span class="comment">// Callbacks</span>\n`;
            code += `  <span class="property">onCapture</span>: (file, type) => {\n`;
            code += `    console.log(<span class="string">'Captured:'</span>, file.name, type);\n`;
            code += `  },\n`;
            code += `  <span class="property">onRecordingStop</span>: (file, type) => {\n`;
            code += `    console.log(<span class="string">'Recording saved:'</span>, file.name);\n`;
            code += `  },\n`;
            code += `});\n\n`;

            code += `<span class="comment">// Screenshot methods</span>\n`;
            code += `<span class="keyword">await</span> capture.captureScreen();   <span class="comment">// Full screen</span>\n`;
            code += `<span class="keyword">await</span> capture.captureRegion();   <span class="comment">// Select region</span>\n`;
            code += `<span class="keyword">await</span> capture.captureFullPage(); <span class="comment">// Scrolling page</span>\n\n`;

            code += `<span class="comment">// Recording methods</span>\n`;
            code += `<span class="keyword">await</span> capture.startVideoRecording();\n`;
            code += `<span class="keyword">await</span> capture.startAudioRecording();\n`;
            code += `capture.stopRecording();`;

            document.getElementById('codeOutput').innerHTML = code;
        }

        window.copyCode = function() {
            const code = document.getElementById('codeOutput').innerText;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            });
        };

        // Event listeners
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('change', generateCode);
        });

        // Theme Switcher
        const themeSwitcher = document.getElementById('theme-switcher');
        let currentTheme = localStorage.getItem('mc-config-builder-theme') || 'system';

        function applyTheme(theme) {
            currentTheme = theme;
            localStorage.setItem('mc-config-builder-theme', theme);

            // Update button states
            themeSwitcher.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === theme);
            });

            // Apply theme (for future dark mode support)
            let effectiveTheme = theme;
            if (theme === 'system') {
                effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            document.body.dataset.theme = effectiveTheme;
        }

        themeSwitcher.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
        });

        // Apply saved theme on load
        applyTheme(currentTheme);

        // Initialize
        generateCode();
    </script>
</body>
</html>
