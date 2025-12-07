<?php
/**
 * Utils Sidebar Component
 * Include this file in all utils demo pages for consistent navigation
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
    background: linear-gradient(180deg, #0f766e 0%, #14b8a6 100%);
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
    color: #5eead4;
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
    border-left-color: #5eead4;
}

.demo-sidebar-link.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-left-color: #5eead4;
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
    color: #5eead4;
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
    background: #14b8a6;
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
            <svg viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/></svg>
            <span class="demo-sidebar-logo-text"><span>Utils</span></span>
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
        'tooltip' => '<svg viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
    ];

    return $icons[$icon] ?? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>';
}
?>
