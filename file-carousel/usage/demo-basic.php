<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic Usage - FileCarousel</title>
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

        .info-box {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #11998e;
        }

        .info-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
        }

        .info-box ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .info-box li {
            color: #4a5568;
            font-size: 14px;
            padding: 4px 0 4px 20px;
            position: relative;
        }

        .info-box li::before {
            content: ">";
            position: absolute;
            left: 0;
            color: #11998e;
            font-weight: bold;
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

        .file-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
        }

        .file-card {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .file-card:hover {
            border-color: #11998e;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(17, 153, 142, 0.15);
        }

        .file-card img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
        }

        .file-card .file-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 10px;
            fill: #64748b;
        }

        .file-card span {
            display: block;
            font-size: 12px;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .code-block {
            background: #1e293b;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            overflow-x: auto;
        }

        .code-block pre {
            margin: 0;
            color: #e2e8f0;
            font-family: 'Fira Code', monospace;
            font-size: 13px;
        }

        .code-block .keyword { color: #c792ea; }
        .code-block .string { color: #c3e88d; }
        .code-block .property { color: #82aaff; }

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
                    <h1>Basic Usage</h1>
                    <p>Initialize FileCarousel with sample files and explore the modal gallery</p>
                </div>

                <div class="info-box">
                    <h3>Instructions:</h3>
                    <ul>
                        <li>Click any file below to open the carousel</li>
                        <li>Use arrow keys or swipe to navigate</li>
                        <li>Press Escape or click outside to close</li>
                        <li>Click the download button to save files</li>
                    </ul>
                </div>

                <div class="demo-section">
                    <h2>Sample Files</h2>
                    <div class="file-grid" id="fileGrid">
                        <!-- Files will be rendered here -->
                    </div>
                </div>

                <div class="demo-section">
                    <h2>Code Example</h2>
                    <div class="code-block">
                        <pre><span class="keyword">import</span> { FileCarousel } <span class="keyword">from</span> <span class="string">'file-uploader'</span>;

<span class="keyword">const</span> carousel = <span class="keyword">new</span> FileCarousel({
  <span class="property">container</span>: document.body,
  <span class="property">files</span>: [
    { <span class="property">name</span>: <span class="string">'photo.jpg'</span>, <span class="property">url</span>: <span class="string">'/images/photo.jpg'</span>, <span class="property">type</span>: <span class="string">'image'</span> },
    { <span class="property">name</span>: <span class="string">'video.mp4'</span>, <span class="property">url</span>: <span class="string">'/videos/video.mp4'</span>, <span class="property">type</span>: <span class="string">'video'</span> },
  ],
  <span class="property">autoPreload</span>: <span class="keyword">true</span>,
  <span class="property">showDownloadButton</span>: <span class="keyword">true</span>,
});

<span class="comment">// Open at specific index</span>
carousel.open(<span class="number">0</span>);</pre>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>
    <script type="module">
        import { FileCarousel } from '<?php echo asset('file-uploader.js'); ?>';

        const sampleFiles = [
            { name: 'Mountain View.jpg', url: 'https://picsum.photos/800/600?random=1', type: 'image', mime: 'image/jpeg' },
            { name: 'City Skyline.jpg', url: 'https://picsum.photos/1200/800?random=2', type: 'image', mime: 'image/jpeg' },
            { name: 'Nature Scene.png', url: 'https://picsum.photos/900/700?random=3', type: 'image', mime: 'image/png' },
            { name: 'Beach Sunset.jpg', url: 'https://picsum.photos/1000/600?random=4', type: 'image', mime: 'image/jpeg' },
            { name: 'Sample Video.mp4', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', mime: 'video/mp4' },
        ];

        let carousel = null;

        function renderFiles() {
            const grid = document.getElementById('fileGrid');
            grid.innerHTML = sampleFiles.map((file, index) => {
                if (file.type === 'image') {
                    return `
                        <div class="file-card" onclick="openCarousel(${index})">
                            <img src="${file.url}" alt="${file.name}">
                            <span>${file.name}</span>
                        </div>
                    `;
                } else {
                    return `
                        <div class="file-card" onclick="openCarousel(${index})">
                            <svg class="file-icon" viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
                            </svg>
                            <span>${file.name}</span>
                        </div>
                    `;
                }
            }).join('');
        }

        window.openCarousel = function(index) {
            if (carousel) {
                carousel.destroy();
            }
            carousel = new FileCarousel({
                container: document.body,
                files: sampleFiles,
                autoPreload: true,
                showDownloadButton: true,
            });
            carousel.open(index);
        };

        renderFiles();
    </script>
</body>
</html>
