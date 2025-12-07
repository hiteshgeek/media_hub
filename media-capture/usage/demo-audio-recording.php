<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audio Recording - MediaCapture</title>
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

        .record-btn {
            padding: 24px 48px;
            border: none;
            border-radius: 50%;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            width: 120px;
            height: 120px;
        }

        .record-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
        }

        .record-btn.recording {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            50% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        }

        .record-btn svg {
            width: 48px;
            height: 48px;
        }

        .record-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .record-label {
            font-size: 14px;
            color: #64748b;
        }

        .status-info {
            margin-top: 24px;
            padding: 16px 20px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 14px;
            color: #475569;
            text-align: center;
        }

        .result-area {
            margin-top: 24px;
            text-align: center;
        }

        .result-area audio {
            width: 100%;
            max-width: 500px;
        }

        .visualizer {
            width: 100%;
            height: 60px;
            background: #f1f5f9;
            border-radius: 8px;
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            overflow: hidden;
        }

        .visualizer-bar {
            width: 4px;
            height: 20px;
            background: #8b5cf6;
            border-radius: 2px;
            transition: height 0.1s;
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
                    <h1>Audio Recording</h1>
                    <p>Record audio from your microphone with high-quality WAV output</p>
                </div>

                <div class="demo-section">
                    <h2>Microphone Recording</h2>

                    <div class="record-container">
                        <button class="record-btn" id="recordBtn" onclick="toggleRecording()">
                            <svg id="micIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                                <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                                <line x1="12" y1="19" x2="12" y2="23"/>
                                <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                        </button>
                        <span class="record-label" id="recordLabel">Click to start recording</span>
                    </div>

                    <div class="visualizer" id="visualizer">
                        <!-- Bars will be added dynamically -->
                    </div>

                    <div class="status-info" id="statusInfo">
                        Click the microphone button to start recording. Make sure to allow microphone access when prompted.
                    </div>

                    <div class="result-area" id="resultArea"></div>
                </div>
            </div>
        </main>
    </div>

    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>
    <script type="module">
        import { MediaCapture } from '<?php echo asset('file-uploader.js'); ?>';

        let mediaCapture = null;
        let isRecording = false;

        // Create visualizer bars
        const visualizer = document.getElementById('visualizer');
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            visualizer.appendChild(bar);
        }
        const bars = visualizer.querySelectorAll('.visualizer-bar');

        function animateVisualizer() {
            if (!isRecording) return;

            bars.forEach(bar => {
                const height = Math.random() * 40 + 10;
                bar.style.height = height + 'px';
            });

            requestAnimationFrame(() => {
                setTimeout(animateVisualizer, 100);
            });
        }

        function resetVisualizer() {
            bars.forEach(bar => {
                bar.style.height = '20px';
            });
        }

        function initCapture() {
            mediaCapture = new MediaCapture({
                showRecordingUI: true,
                audioRecorderOptions: {
                    format: 'wav',
                },
                onRecordingStart: () => {
                    isRecording = true;
                    updateUI();
                    animateVisualizer();
                    document.getElementById('statusInfo').textContent = 'Recording... Speak into your microphone.';
                },
                onRecordingStop: (file, type) => {
                    isRecording = false;
                    updateUI();
                    resetVisualizer();
                    showResult(file);
                },
                onError: (error, context) => {
                    isRecording = false;
                    updateUI();
                    resetVisualizer();
                    console.error('Recording error:', error, context);
                    document.getElementById('statusInfo').textContent = 'Recording failed: ' + error.message;
                }
            });
        }

        function updateUI() {
            const btn = document.getElementById('recordBtn');
            const label = document.getElementById('recordLabel');

            if (isRecording) {
                btn.classList.add('recording');
                label.textContent = 'Click to stop recording';
            } else {
                btn.classList.remove('recording');
                label.textContent = 'Click to start recording';
            }
        }

        function showResult(file) {
            const resultArea = document.getElementById('resultArea');
            const url = URL.createObjectURL(file);

            resultArea.innerHTML = `
                <audio src="${url}" controls></audio>
                <p style="margin-top: 12px; font-size: 13px; color: #64748b;">
                    <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)
                </p>
            `;

            document.getElementById('statusInfo').textContent = 'Recording complete! Your audio is ready to play above.';
        }

        window.toggleRecording = async function() {
            if (!isRecording) {
                initCapture();
                try {
                    await mediaCapture.startAudioRecording();
                } catch (e) {
                    isRecording = false;
                    updateUI();
                    resetVisualizer();
                    if (e.name !== 'NotAllowedError') {
                        document.getElementById('statusInfo').textContent = 'Could not start recording: ' + e.message;
                    } else {
                        document.getElementById('statusInfo').textContent = 'Microphone access denied. Please allow microphone access and try again.';
                    }
                }
            } else {
                await mediaCapture.stopRecording();
            }
        };
    </script>
</body>
</html>
