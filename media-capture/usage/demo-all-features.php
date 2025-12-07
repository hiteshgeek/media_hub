<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Features - MediaCapture</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
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
            margin-bottom: 8px;
        }

        .demo-section > p {
            color: #718096;
            margin-bottom: 20px;
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
        }

        .action-btn {
            padding: 20px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: white;
        }

        .action-btn svg {
            width: 32px;
            height: 32px;
        }

        .action-btn.screen { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
        .action-btn.region { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .action-btn.fullpage { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
        .action-btn.video { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
        .action-btn.audio { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

        .action-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .action-btn.recording {
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .results-container {
            margin-top: 24px;
            display: grid;
            gap: 16px;
        }

        .result-item {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .result-item img {
            width: 120px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
        }

        .result-item video,
        .result-item audio {
            max-width: 300px;
        }

        .result-info {
            flex: 1;
        }

        .result-info strong {
            display: block;
            color: #1a202c;
            margin-bottom: 4px;
        }

        .result-info span {
            font-size: 12px;
            color: #64748b;
        }

        .clear-btn {
            background: #e2e8f0;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .clear-btn:hover {
            background: #cbd5e1;
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
                    <h1>All Features Demo</h1>
                    <p>Complete demonstration of all MediaCapture capabilities</p>
                </div>

                <div class="demo-section">
                    <h2>Capture & Recording</h2>
                    <p>Try all capture and recording methods:</p>

                    <div class="action-grid">
                        <button class="action-btn screen" onclick="captureScreen()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            Screen
                        </button>

                        <button class="action-btn region" onclick="captureRegion()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                            </svg>
                            Region
                        </button>

                        <button class="action-btn fullpage" onclick="captureFullPage()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                <path d="M14 2v6h6"/>
                            </svg>
                            Full Page
                        </button>

                        <button class="action-btn video" id="videoBtn" onclick="toggleVideo()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="23 7 16 12 23 17 23 7"/>
                                <rect x="1" y="5" width="15" height="14" rx="2"/>
                            </svg>
                            <span id="videoText">Video</span>
                        </button>

                        <button class="action-btn audio" id="audioBtn" onclick="toggleAudio()">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                                <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                            </svg>
                            <span id="audioText">Audio</span>
                        </button>
                    </div>
                </div>

                <div class="demo-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0;">Captured Media</h2>
                        <button class="clear-btn" onclick="clearResults()">Clear All</button>
                    </div>

                    <div class="results-container" id="resultsContainer">
                        <p style="color: #64748b; text-align: center; padding: 40px;">
                            Captured screenshots, videos, and audio will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/webm-duration-fix@latest/dist/webm-duration-fix.min.js"></script>
    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>
    <script type="module">
        import { MediaCapture } from '<?php echo asset('file-uploader.js'); ?>';

        let mediaCapture = null;
        let isRecordingVideo = false;
        let isRecordingAudio = false;
        const results = [];

        function initCapture() {
            mediaCapture = new MediaCapture({
                showRecordingUI: true,
                onCapture: (file, type) => addResult(file, type),
                onRecordingStart: () => {},
                onRecordingStop: (file, type) => {
                    addResult(file, type);
                    if (type === 'video') {
                        isRecordingVideo = false;
                        updateVideoUI();
                    } else {
                        isRecordingAudio = false;
                        updateAudioUI();
                    }
                },
                onError: (error, context) => {
                    console.error('Error:', error, context);
                    isRecordingVideo = false;
                    isRecordingAudio = false;
                    updateVideoUI();
                    updateAudioUI();
                }
            });
        }

        function addResult(file, type) {
            results.push({ file, type, url: URL.createObjectURL(file) });
            renderResults();
        }

        function renderResults() {
            const container = document.getElementById('resultsContainer');

            if (results.length === 0) {
                container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 40px;">Captured screenshots, videos, and audio will appear here.</p>';
                return;
            }

            container.innerHTML = results.map((item, index) => {
                let media = '';
                if (item.type === 'screen' || item.type === 'region' || item.type === 'fullpage') {
                    media = `<img src="${item.url}" alt="Screenshot">`;
                } else if (item.type === 'video') {
                    media = `<video src="${item.url}" controls style="max-width: 200px;"></video>`;
                } else if (item.type === 'audio') {
                    media = `<audio src="${item.url}" controls></audio>`;
                }

                return `
                    <div class="result-item">
                        ${media}
                        <div class="result-info">
                            <strong>${item.file.name}</strong>
                            <span>${item.type} - ${(item.file.size / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateVideoUI() {
            const btn = document.getElementById('videoBtn');
            const text = document.getElementById('videoText');
            if (isRecordingVideo) {
                btn.classList.add('recording');
                text.textContent = 'Stop';
            } else {
                btn.classList.remove('recording');
                text.textContent = 'Video';
            }
        }

        function updateAudioUI() {
            const btn = document.getElementById('audioBtn');
            const text = document.getElementById('audioText');
            if (isRecordingAudio) {
                btn.classList.add('recording');
                text.textContent = 'Stop';
            } else {
                btn.classList.remove('recording');
                text.textContent = 'Audio';
            }
        }

        window.captureScreen = async function() {
            initCapture();
            try { await mediaCapture.captureScreen(); } catch(e) {}
        };

        window.captureRegion = async function() {
            initCapture();
            try { await mediaCapture.captureRegion(); } catch(e) {}
        };

        window.captureFullPage = async function() {
            initCapture();
            try { await mediaCapture.captureFullPage(); } catch(e) {}
        };

        window.toggleVideo = async function() {
            if (!isRecordingVideo) {
                initCapture();
                try {
                    await mediaCapture.startVideoRecording();
                    isRecordingVideo = true;
                    updateVideoUI();
                } catch(e) {
                    isRecordingVideo = false;
                    updateVideoUI();
                }
            } else {
                await mediaCapture.stopRecording();
            }
        };

        window.toggleAudio = async function() {
            if (!isRecordingAudio) {
                initCapture();
                try {
                    await mediaCapture.startAudioRecording();
                    isRecordingAudio = true;
                    updateAudioUI();
                } catch(e) {
                    isRecordingAudio = false;
                    updateAudioUI();
                }
            } else {
                await mediaCapture.stopRecording();
            }
        };

        window.clearResults = function() {
            results.forEach(item => URL.revokeObjectURL(item.url));
            results.length = 0;
            renderResults();
        };
    </script>
</body>
</html>
