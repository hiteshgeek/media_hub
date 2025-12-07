<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preloading Options - FileCarousel</title>
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

        .demo-section p {
            color: #718096;
            margin-bottom: 20px;
        }

        .option-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }

        .option-card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .option-card:hover {
            border-color: #11998e;
        }

        .option-card.active {
            border-color: #11998e;
            background: linear-gradient(135deg, rgba(17, 153, 142, 0.05) 0%, rgba(56, 239, 125, 0.05) 100%);
        }

        .option-card h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 8px;
        }

        .option-card p {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 12px;
        }

        .option-card code {
            display: block;
            background: #1e293b;
            color: #38ef7d;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: monospace;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-primary {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
        }

        .btn-group {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }

        .status-bar {
            background: #f1f5f9;
            border-radius: 8px;
            padding: 16px 20px;
            margin-top: 20px;
            font-size: 14px;
        }

        .status-bar strong {
            color: #11998e;
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
                    <h1>Preloading Options</h1>
                    <p>Configure how FileCarousel loads and caches file content</p>
                </div>

                <div class="demo-section">
                    <h2>Choose Preload Mode</h2>
                    <p>Select a preloading strategy and test the carousel behavior:</p>

                    <div class="option-cards">
                        <div class="option-card active" data-mode="all" onclick="selectMode('all')">
                            <h3>Preload All</h3>
                            <p>Load all files immediately when carousel initializes. Best for small file sets.</p>
                            <code>autoPreload: true</code>
                        </div>

                        <div class="option-card" data-mode="none" onclick="selectMode('none')">
                            <h3>No Preload</h3>
                            <p>Load files only when viewed. Saves bandwidth but may show loading indicators.</p>
                            <code>autoPreload: false</code>
                        </div>

                        <div class="option-card" data-mode="selective" onclick="selectMode('selective')">
                            <h3>Selective Preload</h3>
                            <p>Only preload specific file types like images. Good for mixed content.</p>
                            <code>autoPreload: ['image']</code>
                        </div>
                    </div>

                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="testCarousel()">Test Carousel</button>
                    </div>

                    <div class="status-bar" id="statusBar">
                        Current Mode: <strong>Preload All</strong>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>
    <script type="module">
        import { FileCarousel } from '<?php echo asset('file-uploader.js'); ?>';

        const sampleFiles = [
            { name: 'Image 1.jpg', url: 'https://picsum.photos/800/600?random=1', type: 'image', mime: 'image/jpeg' },
            { name: 'Image 2.jpg', url: 'https://picsum.photos/900/700?random=2', type: 'image', mime: 'image/jpeg' },
            { name: 'Image 3.png', url: 'https://picsum.photos/1000/600?random=3', type: 'image', mime: 'image/png' },
            { name: 'Video.mp4', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', mime: 'video/mp4' },
        ];

        let currentMode = 'all';
        let carousel = null;

        window.selectMode = function(mode) {
            currentMode = mode;

            // Update UI
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.toggle('active', card.dataset.mode === mode);
            });

            const modeNames = {
                all: 'Preload All',
                none: 'No Preload',
                selective: 'Selective Preload (Images Only)'
            };
            document.getElementById('statusBar').innerHTML = `Current Mode: <strong>${modeNames[mode]}</strong>`;
        };

        window.testCarousel = function() {
            if (carousel) {
                carousel.destroy();
            }

            let autoPreload;
            switch (currentMode) {
                case 'all': autoPreload = true; break;
                case 'none': autoPreload = false; break;
                case 'selective': autoPreload = ['image']; break;
            }

            carousel = new FileCarousel({
                container: document.body,
                files: sampleFiles,
                autoPreload: autoPreload,
                enableManualLoading: true,
                showDownloadButton: true,
            });
            carousel.open(0);
        };
    </script>
</body>
</html>
