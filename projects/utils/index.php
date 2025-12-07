<?php
include_once __DIR__ . '/../../includes/functions.php';
include_once __DIR__ . '/usage/demos-config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Utils - Shared Utilities</title>
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
            background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
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
            fill: none;
            stroke: white;
            stroke-width: 2;
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
            color: #0f766e;
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
            fill: currentColor;
        }

        .demos-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px 60px;
        }

        .demo-category {
            margin-bottom: 40px;
        }

        .demo-category h2 {
            color: white;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
            padding-left: 10px;
            border-left: 4px solid rgba(255, 255, 255, 0.5);
        }

        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }

        .demo-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .demo-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .demo-card-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }

        .demo-card-icon svg {
            width: 24px;
            height: 24px;
            fill: none;
            stroke: white;
            stroke-width: 2;
        }

        .demo-card h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 8px;
        }

        .demo-card p {
            font-size: 14px;
            color: #718096;
            line-height: 1.5;
        }

        .demo-card-arrow {
            margin-top: 16px;
            color: #14b8a6;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .demo-card-arrow svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
            transition: transform 0.2s;
        }

        .demo-card:hover .demo-card-arrow svg {
            transform: translateX(4px);
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-logo">
            <svg viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <h1>Utils</h1>
        <p>Shared utility components used across FileUploader, FileCarousel, and MediaCapture</p>
        <div class="hero-buttons">
            <a href="usage/demo-tooltip.php" class="hero-btn hero-btn-primary">
                <svg viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                Tooltip System
            </a>
            <a href="../../index.php" class="hero-btn hero-btn-secondary">
                <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
                All Projects
            </a>
        </div>
    </div>

    <div class="demos-container">
        <?php foreach ($demos as $category => $items): ?>
        <div class="demo-category">
            <h2><?= htmlspecialchars($category) ?></h2>
            <div class="demo-grid">
                <?php foreach ($items as $demo): ?>
                <a href="usage/<?= htmlspecialchars($demo['file']) ?>" class="demo-card">
                    <div class="demo-card-icon">
                        <?= getCardIcon($demo['icon']) ?>
                    </div>
                    <h3><?= htmlspecialchars($demo['title']) ?></h3>
                    <p><?= htmlspecialchars($demo['description']) ?></p>
                    <div class="demo-card-arrow">
                        View Documentation
                        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</body>
</html>

<?php
function getCardIcon($icon) {
    $icons = [
        'tooltip' => '<svg viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>',
    ];

    return $icons[$icon] ?? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
}
?>
