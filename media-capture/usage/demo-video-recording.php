<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Recording - MediaCapture</title>
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
            margin-bottom: 20px;
        }

        .options-row {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 24px;
        }

        .option-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .option-item input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: #ef4444;
        }

        .option-item label {
            font-size: 14px;
            color: #475569;
        }

        .record-btn {
            padding: 20px 40px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            color: white;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .record-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .record-btn.recording {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4); }
            50% { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0); }
        }

        .record-btn svg {
            width: 24px;
            height: 24px;
        }

        .status-info {
            margin-top: 20px;
            padding: 16px 20px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 14px;
            color: #475569;
        }

        .result-area {
            margin-top: 24px;
        }

        .result-area video {
            width: 100%;
            max-width: 640px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
                    <h1>Video Recording</h1>
                    <p>Record your screen with optional system audio and microphone</p>
                </div>

                <div class="demo-section">
                    <h2>Recording Options</h2>

                    <div class="options-row">
                        <div class="option-item">
                            <input type="checkbox" id="systemAudio" checked>
                            <label for="systemAudio">Include System Audio</label>
                        </div>
                        <div class="option-item">
                            <input type="checkbox" id="microphone">
                            <label for="microphone">Include Microphone</label>
                        </div>
                    </div>

                    <button class="record-btn" id="recordBtn" onclick="toggleRecording()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                        <span id="btnText">Start Recording</span>
                    </button>

                    <div class="status-info" id="statusInfo">
                        Click the button above to start screen recording. You'll be prompted to select a screen or window to record.
                    </div>

                    <div class="result-area" id="resultArea"></div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/webm-duration-fix@latest/dist/webm-duration-fix.min.js"></script>
    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>
    <script type="module">
        import { MediaCapture } from '<?php echo asset('file-uploader.js'); ?>';

        let mediaCapture = null;
        let isRecording = false;

        function initCapture() {
            const includeSystemAudio = document.getElementById('systemAudio').checked;
            const includeMicrophone = document.getElementById('microphone').checked;

            mediaCapture = new MediaCapture({
                showRecordingUI: true,
                videoRecorderOptions: {
                    includeSystemAudio,
                    includeMicrophone,
                    maxDuration: 300, // 5 minutes
                },
                onRecordingStart: () => {
                    isRecording = true;
                    updateUI();
                    document.getElementById('statusInfo').textContent = 'Recording in progress... Use the floating controls to pause or stop.';
                },
                onRecordingStop: (file, type) => {
                    isRecording = false;
                    updateUI();
                    showResult(file);
                },
                onError: (error, context) => {
                    isRecording = false;
                    updateUI();
                    console.error('Recording error:', error, context);
                    document.getElementById('statusInfo').textContent = 'Recording failed: ' + error.message;
                }
            });
        }

        function updateUI() {
            const btn = document.getElementById('recordBtn');
            const btnText = document.getElementById('btnText');

            if (isRecording) {
                btn.classList.add('recording');
                btnText.textContent = 'Stop Recording';
            } else {
                btn.classList.remove('recording');
                btnText.textContent = 'Start Recording';
            }
        }

        function showResult(file) {
            const resultArea = document.getElementById('resultArea');
            const url = URL.createObjectURL(file);

            resultArea.innerHTML = `
                <video src="${url}" controls></video>
                <p style="margin-top: 12px; font-size: 13px; color: #64748b;">
                    <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
            `;

            document.getElementById('statusInfo').textContent = 'Recording complete! Your video is ready to play above.';
        }

        window.toggleRecording = async function() {
            if (!isRecording) {
                initCapture();
                try {
                    await mediaCapture.startVideoRecording();
                } catch (e) {
                    isRecording = false;
                    updateUI();
                    if (e.name !== 'AbortError') {
                        document.getElementById('statusInfo').textContent = 'Could not start recording: ' + e.message;
                    }
                }
            } else {
                await mediaCapture.stopRecording();
            }
        };
    </script>
</body>
</html>
