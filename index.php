<?php
include_once __DIR__ . '/includes/functions.php';
include_once __DIR__ . '/usage/demos-config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Uploader - Demo Gallery</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="src/assets/images/download.svg">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #667eea;
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

        .category {
            margin-bottom: 40px;
        }

        .category-title {
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
            padding-left: 5px;
            opacity: 0.8;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #667eea;
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
            background: rgba(99, 102, 241, 0.3);
            border-color: rgba(99, 102, 241, 0.5);
            color: #ffffff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
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

        /* Responsive tools section */
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
        <div class="hero-logo">
            <svg viewBox="0 0 640 640"><path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z"/></svg>
        </div>
        <h1>File Uploader</h1>
        <p>A modern, flexible file upload library with drag & drop, preview, validation, and Bootstrap integration</p>
        <div class="hero-buttons">
            <a href="usage/demo-standalone.php" class="hero-btn hero-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Try Demo
            </a>
            <a href="DOCUMENTATION.md" class="hero-btn hero-btn-secondary" target="_blank">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Documentation
            </a>
        </div>
    </header>

    <main class="container">
        <?php foreach ($demos as $category => $items): ?>
        <section class="category">
            <h2 class="category-title"><?= htmlspecialchars($category) ?></h2>
            <div class="demo-grid">
                <?php foreach ($items as $demo): ?>
                <a href="usage/<?= htmlspecialchars($demo['file']) ?>" class="demo-card">
                    <div class="demo-card-icon">
                        <?= getCardIcon($demo['icon']) ?>
                    </div>
                    <h3><?= htmlspecialchars($demo['title']) ?></h3>
                    <p><?= htmlspecialchars($demo['description']) ?></p>
                    <div class="demo-card-arrow">
                        View Demo
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>
        </section>
        <?php endforeach; ?>

        <section class="tools-section">
            <h2>Developer Tools</h2>
            <div class="tools-grid">
                <a href="config-builder.php" class="tool-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Config Builder</span>
                </a>
                <a href="DOCUMENTATION.md" class="tool-link" target="_blank">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span>Documentation</span>
                </a>
                <a href="https://github.com" class="tool-link" target="_blank">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    <span>GitHub Repository</span>
                </a>
            </div>
        </section>
    </main>

    <footer>
        <p>File Uploader Library &copy; <?= date('Y') ?> | <a href="DOCUMENTATION.md">Documentation</a></p>
    </footer>
</body>
</html>

<?php
/**
 * Get SVG icon for demo cards
 */
function getCardIcon($icon) {
    $icons = [
        'rocket' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
        'gauge' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
        'bootstrap' => '<svg viewBox="0 0 24 24"><path d="M5.062 0a2.5 2.5 0 00-2.5 2.5v19a2.5 2.5 0 002.5 2.5h13.875a2.5 2.5 0 002.5-2.5v-19a2.5 2.5 0 00-2.5-2.5H5.063zm4.938 6h4.125c1.658 0 2.813 1.219 2.813 2.813 0 1.219-.781 2.093-1.781 2.406v.063c1.313.25 2.156 1.281 2.156 2.656 0 1.813-1.344 3.063-3.281 3.063H10V6zm2.094 1.75v3h1.75c1.031 0 1.625-.563 1.625-1.5 0-.938-.594-1.5-1.625-1.5h-1.75zm0 4.688v3.312h2.031c1.125 0 1.75-.594 1.75-1.656 0-1.063-.625-1.656-1.75-1.656h-2.031z"/></svg>',
        'window' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>',
        'download' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
        'button' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M12 12h.01"/></svg>',
        'shield' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
        'form' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
        'check' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    ];

    return $icons[$icon] ?? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
}
?>
