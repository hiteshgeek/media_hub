<?php
include_once __DIR__ . '/../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FileCarousel - Demo Gallery</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../src/assets/images/download.svg">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            min-height: 100vh;
            color: #2d3748;
        }

        .hero {
            text-align: center;
            padding: 60px 20px 40px;
            color: white;
        }

        .hero-logo {
            display: inline-flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }

        .hero-logo svg {
            width: 60px;
            height: 60px;
            fill: white;
        }

        .hero h1 {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 15px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .hero p {
            font-size: 20px;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto 30px;
        }

        .hero-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .hero-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }

        .hero-btn-primary {
            background: white;
            color: #11998e;
        }

        .hero-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .hero-btn-secondary {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .hero-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        .hero-btn svg {
            width: 20px;
            height: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px 60px;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            font-size: 14px;
            margin-bottom: 20px;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: white;
        }

        .back-link svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .features-section {
            margin-bottom: 50px;
        }

        .section-title {
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
            padding-left: 5px;
            opacity: 0.8;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }

        .feature-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .feature-card-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }

        .feature-card-icon svg {
            width: 24px;
            height: 24px;
            fill: white;
            stroke: white;
        }

        .feature-card h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 8px;
        }

        .feature-card p {
            font-size: 14px;
            color: #718096;
            line-height: 1.6;
        }

        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 14px;
        }

        .demo-card {
            background: white;
            border-radius: 10px;
            padding: 16px;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .demo-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .demo-card-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
        }

        .demo-card-icon svg {
            width: 18px;
            height: 18px;
            fill: white;
            stroke: white;
        }

        .demo-card h3 {
            font-size: 15px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 6px;
        }

        .demo-card p {
            font-size: 12px;
            color: #718096;
            line-height: 1.4;
            flex: 1;
        }

        .demo-card-arrow {
            margin-top: 12px;
            color: #11998e;
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .demo-card-arrow svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
            transition: transform 0.2s;
        }

        .demo-card:hover .demo-card-arrow svg {
            transform: translateX(3px);
        }

        .tools-section {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 16px 30px;
            margin-top: 40px;
            position: sticky;
            bottom: 0;
            z-index: 100;
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
        }

        .tools-section h2 {
            color: rgba(255, 255, 255, 0.6);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 0;
            white-space: nowrap;
        }

        .tools-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: flex-end;
            flex: 1;
        }

        .tool-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 18px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.85);
            text-decoration: none;
            transition: all 0.25s ease;
            font-size: 13px;
        }

        .tool-link:hover {
            background: rgba(17, 153, 142, 0.3);
            border-color: rgba(17, 153, 142, 0.5);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(17, 153, 142, 0.25);
        }

        .tool-link svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
            stroke: currentColor;
            opacity: 0.8;
        }

        .tool-link:hover svg {
            opacity: 1;
        }

        .tool-link span {
            font-weight: 500;
        }

        footer {
            text-align: center;
            padding: 30px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }

        footer a {
            color: white;
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .tools-section {
                flex-direction: column;
                gap: 12px;
                padding: 14px 20px;
            }

            .tools-section h2 {
                text-align: center;
            }

            .tools-grid {
                justify-content: center;
            }

            .tool-link {
                padding: 8px 14px;
                font-size: 12px;
            }

            .tool-link span {
                display: none;
            }

            .tool-link svg {
                width: 18px;
                height: 18px;
            }
        }
    </style>
</head>
<body>
    <header class="hero">
        <a href="../index.php" class="back-link">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to All Projects
        </a>
        <div class="hero-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
        </div>
        <h1>FileCarousel</h1>
        <p>A powerful modal gallery viewer for images, videos, PDFs, Excel, CSV, and text files with preloading support</p>
        <div class="hero-buttons">
            <a href="usage/demo-basic.php" class="hero-btn hero-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Try Demo
            </a>
            <a href="config-builder.php" class="hero-btn hero-btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                Config Builder
            </a>
        </div>
    </header>

    <main class="container">
        <!-- Features Section -->
        <section class="features-section">
            <h2 class="section-title">Key Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                    <h3>Multi-Format Support</h3>
                    <p>View images, videos, audio, PDFs, Excel spreadsheets, CSV files, and text files in a beautiful modal gallery.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    </div>
                    <h3>Smart Preloading</h3>
                    <p>Automatic content preloading with configurable file type filtering. Load all files or only specific types.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </div>
                    <h3>Keyboard Navigation</h3>
                    <p>Full keyboard support with arrow keys for navigation and Escape to close. Touch-friendly for mobile devices.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>
                    </div>
                    <h3>Data Rendering</h3>
                    <p>Beautiful table rendering for Excel and CSV files with configurable row limits and column handling.</p>
                </div>
            </div>
        </section>

        <!-- Demos Section -->
        <section class="features-section">
            <h2 class="section-title">Demos</h2>
            <div class="demo-grid">
                <a href="usage/demo-basic.php" class="demo-card">
                    <div class="demo-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                    <h3>Basic Usage</h3>
                    <p>Initialize FileCarousel with sample files and test the modal gallery</p>
                    <div class="demo-card-arrow">
                        View Demo
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </a>
                <a href="usage/demo-preloading.php" class="demo-card">
                    <div class="demo-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    </div>
                    <h3>Preloading Options</h3>
                    <p>Configure auto-preload, selective preload, and manual loading</p>
                    <div class="demo-card-arrow">
                        View Demo
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </a>
                <a href="usage/demo-file-types.php" class="demo-card">
                    <div class="demo-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                    </div>
                    <h3>File Type Support</h3>
                    <p>Explore rendering for images, videos, PDFs, Excel, CSV, and text</p>
                    <div class="demo-card-arrow">
                        View Demo
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </a>
                <a href="usage/demo-integration.php" class="demo-card">
                    <div class="demo-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </div>
                    <h3>FileUploader Integration</h3>
                    <p>Use FileCarousel with the FileUploader component</p>
                    <div class="demo-card-arrow">
                        View Demo
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </a>
            </div>
        </section>

        <section class="tools-section">
            <h2>Developer Tools</h2>
            <div class="tools-grid">
                <a href="config-builder.php" class="tool-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Config Builder</span>
                </a>
                <a href="../DOCUMENTATION.md" class="tool-link" target="_blank">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span>Documentation</span>
                </a>
            </div>
        </section>
    </main>

    <footer>
        <p>FileCarousel Library &copy; <?= date('Y') ?> | Part of the FileUploader Project</p>
    </footer>
</body>
</html>
