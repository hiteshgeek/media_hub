<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modular Library Demo - File Uploader</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #f7fafc;
            color: #2d3748;
        }

        .demo-main {
            padding: 40px;
            max-width: 1200px;
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
            border-left: 4px solid #4299e1;
        }

        .info-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
        }

        .info-box pre {
            background: #1a202c;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
            line-height: 1.5;
        }

        .info-box code {
            color: #68d391;
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
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .demo-section h2 .badge {
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 500;
        }

        .demo-section h2 .badge-blue {
            background: #ebf8ff;
            color: #2b6cb0;
        }

        .demo-section h2 .badge-green {
            background: #f0fff4;
            color: #276749;
        }

        .demo-section h2 .badge-purple {
            background: #faf5ff;
            color: #6b46c1;
        }

        .demo-section .description {
            color: #718096;
            font-size: 14px;
            margin-bottom: 20px;
        }

        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #4299e1;
            color: white;
        }

        .btn-primary:hover {
            background: #3182ce;
        }

        .btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }

        .btn-secondary:hover {
            background: #cbd5e0;
        }

        .btn-green {
            background: #48bb78;
            color: white;
        }

        .btn-green:hover {
            background: #38a169;
        }

        .btn-purple {
            background: #805ad5;
            color: white;
        }

        .btn-purple:hover {
            background: #6b46c1;
        }

        .btn-red {
            background: #f56565;
            color: white;
        }

        .btn-red:hover {
            background: #e53e3e;
        }

        #output {
            margin-top: 20px;
            padding: 15px;
            background: #f7fafc;
            border-radius: 6px;
            font-family: monospace;
            font-size: 13px;
            white-space: pre-wrap;
            display: none;
            border: 1px solid #e2e8f0;
        }

        #output.show {
            display: block;
        }

        /* Carousel demo files grid */
        .carousel-files {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .carousel-file {
            position: relative;
            aspect-ratio: 1;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
        }

        .carousel-file:hover {
            border-color: #4299e1;
            transform: translateY(-2px);
        }

        .carousel-file img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .carousel-file .file-icon {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #edf2f7;
            font-size: 32px;
        }

        .carousel-file .file-name {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 8px;
            font-size: 11px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Recording status */
        .recording-status {
            padding: 15px;
            background: #fff5f5;
            border: 1px solid #feb2b2;
            border-radius: 8px;
            color: #c53030;
            margin-top: 15px;
            display: none;
        }

        .recording-status.active {
            display: block;
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
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
                    <h1>Modular Library Demo</h1>
                    <p>Demonstrating the three independent, exportable components of the refactored library</p>
                </div>

                <div class="info-box">
                    <h3>Independent Imports</h3>
                    <pre><code>// Import all components together
import { FileUploader, FileCarousel, MediaCapture } from 'file-uploader';

// Or import each independently
import { FileUploader } from 'file-uploader/file-uploader';
import { FileCarousel } from 'file-uploader/file-carousel';
import { MediaCapture } from 'file-uploader/media-capture';</code></pre>
                </div>

                <!-- Section 1: FileUploader -->
                <div class="demo-section">
                    <h2>
                        1. FileUploader
                        <span class="badge badge-blue">Main Component</span>
                    </h2>
                    <p class="description">
                        The main file upload component with drag & drop, preview, validation, and AJAX upload.
                    </p>

                    <div id="fileUploader"></div>

                    <div class="button-group">
                        <button class="btn btn-primary" onclick="getUploaderFiles()">Get Uploaded Files</button>
                        <button class="btn btn-secondary" onclick="getUploaderDefaults()">Show Default Options</button>
                    </div>
                </div>

                <!-- Section 2: FileCarousel -->
                <div class="demo-section">
                    <h2>
                        2. FileCarousel
                        <span class="badge badge-green">Standalone</span>
                    </h2>
                    <p class="description">
                        Independent media carousel/gallery viewer. Click any file below to open the carousel.
                    </p>

                    <div class="carousel-files" id="carouselFiles">
                        <!-- Files will be rendered here -->
                    </div>

                    <div class="button-group">
                        <button class="btn btn-green" onclick="openCarousel(0)">Open First File</button>
                        <button class="btn btn-secondary" onclick="openCarousel(2)">Open Third File</button>
                    </div>

                    <!-- Container for standalone FileCarousel modal -->
                    <div id="standaloneCarouselContainer"></div>
                </div>

                <!-- Section 3: MediaCapture -->
                <div class="demo-section">
                    <h2>
                        3. MediaCapture
                        <span class="badge badge-purple">Standalone</span>
                    </h2>
                    <p class="description">
                        Independent screen capture and recording utilities. Captures are logged to console.
                    </p>

                    <div class="button-group">
                        <button class="btn btn-purple" onclick="captureScreen()">Capture Screen</button>
                        <button class="btn btn-purple" onclick="captureRegion()">Capture Region</button>
                        <button class="btn btn-purple" onclick="captureFullPage()">Capture Full Page</button>
                    </div>

                    <div class="button-group">
                        <button class="btn btn-red" onclick="startVideoRecording()" id="btnVideoRecord">Start Video Recording</button>
                        <button class="btn btn-red" onclick="startAudioRecording()" id="btnAudioRecord">Start Audio Recording</button>
                        <button class="btn btn-secondary" onclick="stopRecording()" id="btnStopRecord" disabled>Stop Recording</button>
                    </div>

                    <div class="recording-status" id="recordingStatus">
                        Recording in progress...
                    </div>
                </div>

                <!-- Output area -->
                <div id="output"></div>
            </div>
        </main>
    </div>

    <!-- Load the built library (IIFE for browser compatibility) -->
    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>

    <script>
        // ============================================================
        // INDEPENDENT COMPONENTS - Each available from window globals
        // ============================================================
        //
        // In ES Module environment, you would import like this:
        //   import { FileUploader } from 'file-uploader/file-uploader';
        //   import { FileCarousel } from 'file-uploader/file-carousel';
        //   import { MediaCapture } from 'file-uploader/media-capture';
        //
        // For browser usage with IIFE build, all are available globally:
        const { FileUploader, FileCarousel, MediaCapture } = window;

        // Verify components loaded
        console.log('Components loaded:', {
            FileUploader: typeof FileUploader,
            FileCarousel: typeof FileCarousel,
            MediaCapture: typeof MediaCapture
        });

        const DEFAULT_OPTIONS = FileUploader ? FileUploader.getDefaultOptions() : {};

        // ============================================================
        // 1. FILEUPLOADER DEMO
        // ============================================================

        let uploader = null;
        try {
            uploader = new FileUploader('#fileUploader', {
                uploadUrl: '../../upload.php',
                deleteUrl: '../../delete.php',
                downloadAllUrl: '../../download-all.php',
                cleanupZipUrl: '../../cleanup-zip.php',
                configUrl: '../../get-config.php',
                multiple: true,
                showLimits: true,
                defaultLimitsView: 'concise',
                onUploadSuccess: (fileObj, result) => {
                    console.log('FileUploader: Uploaded', fileObj.name);
                }
            });
            console.log('FileUploader initialized successfully');
        } catch (e) {
            console.error('FileUploader init error:', e);
        }

        window.uploader = uploader;
        window.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

        window.getUploaderFiles = function() {
            const files = uploader.getUploadedFiles();
            showOutput('Uploaded Files:\n' + JSON.stringify(files, null, 2));
        };

        window.getUploaderDefaults = function() {
            showOutput('Default Options:\n' + JSON.stringify(DEFAULT_OPTIONS, null, 2));
        };

        // ============================================================
        // 2. FILECAROUSEL DEMO
        // ============================================================

        // Sample files for carousel demo - diverse file types
        const carouselDemoFiles = [
            {
                name: 'Mountain_Landscape.jpg',
                url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
                thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop',
                carouselType: 'image'
            },
            {
                name: 'Nature_View.jpg',
                url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
                thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&h=150&fit=crop',
                carouselType: 'image'
            },
            {
                name: 'BigBuckBunny.mp4',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=150&h=150&fit=crop',
                carouselType: 'video'
            },
            {
                name: 'Ocean_Sunset.jpg',
                url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop',
                thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=150&h=150&fit=crop',
                carouselType: 'image'
            },
            {
                name: 'Sample_Document.pdf',
                url: 'https://pdfobject.com/pdf/sample.pdf',
                thumbnail: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
                carouselType: 'pdf'
            },
            {
                name: 'ForBiggerBlazes.mp4',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&h=150&fit=crop',
                carouselType: 'video'
            }
        ];

        // Render carousel file thumbnails
        const carouselFilesContainer = document.getElementById('carouselFiles');
        carouselDemoFiles.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'carousel-file';
            div.onclick = () => openCarousel(index);

            if (file.thumbnail) {
                div.innerHTML = `
                    <img src="${file.thumbnail}" alt="${file.name}">
                    <span class="file-name">${file.name}</span>
                `;
            } else {
                div.innerHTML = `
                    <div class="file-icon">${file.carouselType === 'video' ? '🎬' : '📄'}</div>
                    <span class="file-name">${file.name}</span>
                `;
            }

            carouselFilesContainer.appendChild(div);
        });

        // Initialize FileCarousel independently with a container
        let carousel = null;
        try {
            carousel = new FileCarousel({
                container: document.getElementById('standaloneCarouselContainer'),
                files: carouselDemoFiles,
                autoPreload: true,
                showDownloadButton: true
            });
            console.log('FileCarousel initialized successfully');
        } catch (e) {
            console.error('FileCarousel init error:', e);
        }

        window.carousel = carousel;

        window.openCarousel = function(index) {
            if (carousel) {
                carousel.open(index);
                console.log('FileCarousel: Opened at index', index);
            } else {
                console.error('Carousel not initialized');
            }
        };

        // ============================================================
        // 3. MEDIACAPTURE DEMO
        // ============================================================

        let mediaCapture = null;
        try {
            mediaCapture = new MediaCapture({
                onCapture: (file, type) => {
                    console.log('MediaCapture: Captured', type, file.name, formatSize(file.size));
                    showOutput(`Captured ${type}:\n  Name: ${file.name}\n  Size: ${formatSize(file.size)}\n  Type: ${file.type}`);
                },
                onRecordingStart: (type) => {
                    console.log('MediaCapture: Recording started', type);
                    document.getElementById('recordingStatus').classList.add('active');
                    document.getElementById('btnStopRecord').disabled = false;
                    document.getElementById('btnVideoRecord').disabled = true;
                    document.getElementById('btnAudioRecord').disabled = true;
                },
                onRecordingStop: (file, type) => {
                    console.log('MediaCapture: Recording stopped', type, file.name, formatSize(file.size));
                    document.getElementById('recordingStatus').classList.remove('active');
                    document.getElementById('btnStopRecord').disabled = true;
                    document.getElementById('btnVideoRecord').disabled = false;
                    document.getElementById('btnAudioRecord').disabled = false;
                    showOutput(`Recording saved:\n  Name: ${file.name}\n  Size: ${formatSize(file.size)}\n  Type: ${file.type}\n  Duration: ${type}`);
                },
                maxVideoRecordingDuration: 60,
                maxAudioRecordingDuration: 60,
                recordingCountdownDuration: 3
            });
            console.log('MediaCapture initialized successfully');
        } catch (e) {
            console.error('MediaCapture init error:', e);
        }

        window.mediaCapture = mediaCapture;

        window.captureScreen = function() {
            if (mediaCapture) mediaCapture.captureScreen();
            else console.error('MediaCapture not initialized');
        };

        window.captureRegion = function() {
            if (mediaCapture) mediaCapture.captureRegion();
            else console.error('MediaCapture not initialized');
        };

        window.captureFullPage = function() {
            if (mediaCapture) mediaCapture.captureFullPage();
            else console.error('MediaCapture not initialized');
        };

        window.startVideoRecording = function() {
            if (mediaCapture) mediaCapture.startVideoRecording();
            else console.error('MediaCapture not initialized');
        };

        window.startAudioRecording = function() {
            if (mediaCapture) mediaCapture.startAudioRecording();
            else console.error('MediaCapture not initialized');
        };

        window.stopRecording = function() {
            if (mediaCapture) mediaCapture.stopRecording();
            else console.error('MediaCapture not initialized');
        };

        // ============================================================
        // UTILITY FUNCTIONS
        // ============================================================

        function showOutput(text) {
            const output = document.getElementById('output');
            output.textContent = text;
            output.classList.add('show');
        }

        function formatSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Log to console for verification
        console.log('=== Modular Library Demo ===');
        console.log('FileUploader:', typeof FileUploader);
        console.log('FileCarousel:', typeof FileCarousel);
        console.log('MediaCapture:', typeof MediaCapture);
        console.log('All components loaded independently!');
    </script>
</body>
</html>
