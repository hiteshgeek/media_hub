<?php
/**
 * FileUploader Sidebar Component
 * Include this file in all demo pages for consistent navigation
 */

// Include demos configuration
require_once __DIR__ . '/demos-config.php';

// Get current demo ID
$currentDemoId = getCurrentDemoId();
?>

<style>
/* Demo Layout Styles */
.demo-layout {
    display: flex;
    min-height: 100vh;
}

.demo-sidebar {
    width: 280px;
    background: linear-gradient(180deg, #4c1d95 0%, #7c3aed 100%);
    color: #e2e8f0;
    padding: 0;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.demo-sidebar-header {
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.demo-sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: white;
}

.demo-sidebar-logo svg {
    width: 32px;
    height: 32px;
    fill: white;
}

.demo-sidebar-logo-text {
    font-size: 18px;
    font-weight: 700;
    color: white;
}

.demo-sidebar-logo-text span {
    color: #c4b5fd;
}

.demo-sidebar-nav {
    padding: 15px 0;
}

.demo-sidebar-category {
    padding: 10px 20px 5px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 10px;
}

.demo-sidebar-category:first-child {
    margin-top: 0;
}

.demo-sidebar-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 14px;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
}

.demo-sidebar-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-left-color: #c4b5fd;
}

.demo-sidebar-link.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-left-color: #c4b5fd;
    font-weight: 500;
}

.demo-sidebar-link svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
    flex-shrink: 0;
}

.demo-sidebar-footer {
    padding: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: auto;
}

.demo-sidebar-footer a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 13px;
    padding: 8px 0;
    transition: color 0.2s;
}

.demo-sidebar-footer a:hover {
    color: #c4b5fd;
}

.demo-sidebar-footer svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
}

/* Main content area */
.demo-content {
    flex: 1;
    margin-left: 280px;
    min-height: 100vh;
}

/* Mobile toggle button */
.demo-sidebar-toggle {
    display: none;
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1001;
    background: #7c3aed;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.demo-sidebar-toggle svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
}

/* Mobile responsive */
@media (max-width: 992px) {
    .demo-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .demo-sidebar.open {
        transform: translateX(0);
    }

    .demo-sidebar-toggle {
        display: flex;
    }

    .demo-content {
        margin-left: 0;
    }

    .demo-sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }

    .demo-sidebar-overlay.open {
        display: block;
    }
}
</style>

<!-- Mobile toggle button -->
<button class="demo-sidebar-toggle" onclick="toggleSidebar()">
    <svg viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
</button>

<!-- Overlay for mobile -->
<div class="demo-sidebar-overlay" onclick="toggleSidebar()"></div>

<!-- Sidebar -->
<aside class="demo-sidebar">
    <div class="demo-sidebar-header">
        <a href="../../../index.php" class="demo-sidebar-logo">
            <svg viewBox="0 0 640 640"><path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z"/></svg>
            <span class="demo-sidebar-logo-text">File<span>Uploader</span></span>
        </a>
    </div>

    <nav class="demo-sidebar-nav">
        <?php foreach ($demos as $category => $items): ?>
            <div class="demo-sidebar-category"><?= htmlspecialchars($category) ?></div>
            <?php foreach ($items as $demo): ?>
                <a href="<?= htmlspecialchars($demo['file']) ?>"
                   class="demo-sidebar-link <?= $currentDemoId === $demo['id'] ? 'active' : '' ?>">
                    <?= getSidebarIcon($demo['icon']) ?>
                    <span><?= htmlspecialchars($demo['title']) ?></span>
                </a>
            <?php endforeach; ?>
        <?php endforeach; ?>
    </nav>

    <div class="demo-sidebar-footer">
        <a href="../../../index.php">
            <svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
            Home
        </a>
        <a href="demo-modular-library.php">
            <svg viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" fill="currentColor"/></svg>
            Demos
        </a>
        <a href="../config-builder.php">
            <svg viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/></svg>
            Config Builder
        </a>
        <a href="../../../index.php">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
            All Projects
        </a>
    </div>
</aside>

<script>
function toggleSidebar() {
    document.querySelector('.demo-sidebar').classList.toggle('open');
    document.querySelector('.demo-sidebar-overlay').classList.toggle('open');
}

// Close sidebar when clicking a link on mobile
document.querySelectorAll('.demo-sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
            toggleSidebar();
        }
    });
});
</script>

<?php
/**
 * Get SVG icon for sidebar
 */
function getSidebarIcon($icon) {
    $icons = [
        'modules' => '<svg viewBox="0 0 24 24"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" fill="currentColor"/></svg>',
        'rocket' => '<svg viewBox="0 0 24 24"><path d="M13.828 4.172a4 4 0 015.657 5.657l-5.828 5.829a4 4 0 01-1.414.94l-3.172 1.058a1 1 0 01-1.263-1.263l1.058-3.172a4 4 0 01.94-1.414l5.828-5.829zM4.929 17.071a3 3 0 014.243 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 00-1.414 0 1 1 0 01-1.414-1.414z" fill="currentColor"/></svg>',
        'gauge' => '<svg viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
        'bootstrap' => '<svg viewBox="0 0 24 24"><path d="M5.062 0a2.5 2.5 0 00-2.5 2.5v19a2.5 2.5 0 002.5 2.5h13.875a2.5 2.5 0 002.5-2.5v-19a2.5 2.5 0 00-2.5-2.5H5.063zm4.938 6h4.125c1.658 0 2.813 1.219 2.813 2.813 0 1.219-.781 2.093-1.781 2.406v.063c1.313.25 2.156 1.281 2.156 2.656 0 1.813-1.344 3.063-3.281 3.063H10V6zm2.094 1.75v3h1.75c1.031 0 1.625-.563 1.625-1.5 0-.938-.594-1.5-1.625-1.5h-1.75zm0 4.688v3.312h2.031c1.125 0 1.75-.594 1.75-1.656 0-1.063-.625-1.656-1.75-1.656h-2.031z" fill="currentColor"/></svg>',
        'window' => '<svg viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 9h16" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="6.5" r="0.5" fill="currentColor"/><circle cx="9.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="12" cy="6.5" r="0.5" fill="currentColor"/></svg>',
        'download' => '<svg viewBox="0 0 24 24"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
        'button' => '<svg viewBox="0 0 24 24"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
        'shield' => '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
        'form' => '<svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
        'check' => '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
    ];

    return $icons[$icon] ?? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
}
?>
