<?php
include_once __DIR__ . '/../../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tooltip System - Utils Documentation</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../../src/assets/images/download.svg">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 0;
            background: #f5f7fa;
            color: #1a202c;
            line-height: 1.6;
        }

        .demo-layout {
            display: flex;
            min-height: 100vh;
        }

        .demo-content {
            flex: 1;
            padding: 40px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .demo-header {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }

        .demo-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a202c;
            margin: 0 0 10px 0;
        }

        .demo-header p {
            font-size: 1.1rem;
            color: #718096;
            margin: 0;
        }

        .demo-section {
            background: #fff;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .demo-section h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .demo-section h2 .badge {
            font-size: 0.75rem;
            padding: 3px 8px;
            background: #6366f1;
            color: white;
            border-radius: 4px;
            font-weight: 500;
        }

        .demo-section > p {
            color: #718096;
            margin: 0 0 24px 0;
        }

        .demo-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 24px;
        }

        .demo-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .demo-btn-primary {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: white;
        }

        .demo-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .demo-btn-secondary {
            background: #e2e8f0;
            color: #4a5568;
        }

        .demo-btn-secondary:hover {
            background: #cbd5e1;
        }

        .demo-btn-outline {
            background: transparent;
            border: 2px solid #6366f1;
            color: #6366f1;
        }

        .demo-btn-outline:hover {
            background: #6366f1;
            color: white;
        }

        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            line-height: 1.6;
        }

        .code-block code {
            color: inherit;
        }

        .code-block .comment {
            color: #64748b;
        }

        .code-block .tag {
            color: #f472b6;
        }

        .code-block .attr {
            color: #a5b4fc;
        }

        .code-block .string {
            color: #86efac;
        }

        .code-block .keyword {
            color: #c4b5fd;
        }

        .code-block .function {
            color: #93c5fd;
        }

        /* Theme demo containers */
        .theme-demo-container {
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 16px;
        }

        .theme-demo-container.dark {
            background: #1e293b;
        }

        .theme-demo-container.light {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
        }

        .theme-demo-container.system {
            background: linear-gradient(135deg, #1e293b 50%, #f1f5f9 50%);
        }

        .theme-demo-container h4 {
            margin: 0 0 16px 0;
            font-size: 14px;
            font-weight: 600;
        }

        .theme-demo-container.dark h4 {
            color: #e2e8f0;
        }

        .theme-demo-container.light h4 {
            color: #334155;
        }

        .theme-demo-container.system h4 {
            color: #6366f1;
            text-align: center;
            background: white;
            padding: 8px 16px;
            border-radius: 6px;
            display: inline-block;
        }

        /* Scroll container demo */
        .scroll-demo-container {
            height: 200px;
            overflow: auto;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            padding: 20px;
            background: #f8fafc;
        }

        .scroll-demo-content {
            height: 400px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .scroll-demo-content p {
            color: #64748b;
            font-size: 13px;
            margin: 0;
        }

        /* Feature list */
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
        }

        .feature-item svg {
            width: 20px;
            height: 20px;
            fill: #6366f1;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .feature-item h5 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: #2d3748;
        }

        .feature-item p {
            margin: 0;
            font-size: 13px;
            color: #718096;
        }

        /* API table */
        .api-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .api-table th,
        .api-table td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .api-table th {
            background: #f8fafc;
            font-weight: 600;
            color: #2d3748;
            font-size: 13px;
        }

        .api-table td {
            font-size: 14px;
            color: #4a5568;
        }

        .api-table code {
            background: #eef2ff;
            color: #4f46e5;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
        }

        /* Theme toggle in header */
        .page-theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            background: white;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }

        .page-theme-toggle button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            background: #f1f5f9;
            color: #64748b;
        }

        .page-theme-toggle button.active {
            background: #6366f1;
            color: white;
        }

        .page-theme-toggle button:hover:not(.active) {
            background: #e2e8f0;
        }

        /* Back link */
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #6366f1;
            text-decoration: none;
            font-weight: 500;
            margin-bottom: 20px;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        /* Icon in button */
        .demo-btn svg {
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        /* Subsection */
        .subsection {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
        }

        .subsection h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 12px 0;
        }

        /* Dynamic demo area */
        .dynamic-demo-area {
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 16px;
        }

        .dynamic-demo-area p {
            margin: 0 0 12px 0;
            color: #64748b;
            font-size: 13px;
        }

        #dynamicTooltipBtn {
            min-width: 200px;
        }

        /* Note box */
        .note-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            border-radius: 0 8px 8px 0;
            margin: 16px 0;
        }

        .note-box strong {
            color: #92400e;
        }

        .note-box p {
            margin: 0;
            color: #78350f;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <?php include __DIR__ . '/sidebar.php'; ?>

    <main class="demo-content">
        <a href="../index.php" class="back-link">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Utils
        </a>

        <div class="demo-header">
            <h1>Tooltip System</h1>
            <p>A modern, flexible tooltip system with fixed positioning, theme support, keyboard shortcuts, and smart viewport detection.</p>
        </div>

        <!-- Overview Section -->
        <div class="demo-section">
            <h2>Overview</h2>
            <p>The TooltipManager provides a global tooltip system that uses <code>position: fixed</code> to escape scroll containers and <code>overflow: hidden</code> constraints.</p>

            <div class="feature-list">
                <div class="feature-item">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div>
                        <h5>Fixed Positioning</h5>
                        <p>Escapes scroll containers and overflow constraints</p>
                    </div>
                </div>
                <div class="feature-item">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div>
                        <h5>Smart Positioning</h5>
                        <p>Auto-flips when near viewport edges</p>
                    </div>
                </div>
                <div class="feature-item">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div>
                        <h5>Theme Support</h5>
                        <p>Dark, light, and system themes</p>
                    </div>
                </div>
                <div class="feature-item">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div>
                        <h5>Keyboard Shortcuts</h5>
                        <p>Display shortcuts with styled badges</p>
                    </div>
                </div>
                <div class="feature-item">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div>
                        <h5>Smooth Animations</h5>
                        <p>Direction-aware slide animations</p>
                    </div>
                </div>
                <div class="feature-item">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    <div>
                        <h5>Singleton Pattern</h5>
                        <p>One tooltip element for all targets</p>
                    </div>
                </div>
            </div>

            <div class="code-block">
<code><span class="comment">// Basic HTML usage</span>
<span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Click to save"</span><span class="tag">&gt;</span>Save<span class="tag">&lt;/button&gt;</span>

<span class="comment">// Initialize the tooltip system</span>
<span class="keyword">import</span> TooltipManager <span class="keyword">from</span> <span class="string">'./TooltipManager.js'</span>;
TooltipManager.<span class="function">init</span>();</code>
            </div>
        </div>

        <!-- Position Examples -->
        <div class="demo-section">
            <h2>Position Examples</h2>
            <p>Tooltips can be positioned in four directions. The position auto-flips when near viewport edges.</p>

            <div class="demo-buttons">
                <button class="demo-btn demo-btn-primary" data-tooltip="Tooltip on top (default)" data-tooltip-position="top">
                    Top Position
                </button>
                <button class="demo-btn demo-btn-primary" data-tooltip="Tooltip on bottom" data-tooltip-position="bottom">
                    Bottom Position
                </button>
                <button class="demo-btn demo-btn-primary" data-tooltip="Tooltip on left" data-tooltip-position="left">
                    Left Position
                </button>
                <button class="demo-btn demo-btn-primary" data-tooltip="Tooltip on right" data-tooltip-position="right">
                    Right Position
                </button>
            </div>

            <div class="code-block">
<code><span class="comment">&lt;!-- Top (default) --&gt;</span>
<span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Tooltip on top"</span><span class="tag">&gt;</span>Top<span class="tag">&lt;/button&gt;</span>

<span class="comment">&lt;!-- Bottom --&gt;</span>
<span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Tooltip on bottom"</span> <span class="attr">data-tooltip-position</span>=<span class="string">"bottom"</span><span class="tag">&gt;</span>Bottom<span class="tag">&lt;/button&gt;</span>

<span class="comment">&lt;!-- Left --&gt;</span>
<span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Tooltip on left"</span> <span class="attr">data-tooltip-position</span>=<span class="string">"left"</span><span class="tag">&gt;</span>Left<span class="tag">&lt;/button&gt;</span>

<span class="comment">&lt;!-- Right --&gt;</span>
<span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Tooltip on right"</span> <span class="attr">data-tooltip-position</span>=<span class="string">"right"</span><span class="tag">&gt;</span>Right<span class="tag">&lt;/button&gt;</span></code>
            </div>
        </div>

        <!-- Keyboard Shortcuts -->
        <div class="demo-section">
            <h2>Keyboard Shortcuts <span class="badge">Popular</span></h2>
            <p>Display keyboard shortcuts alongside tooltip text with styled badges.</p>

            <div class="demo-buttons">
                <button class="demo-btn demo-btn-secondary" data-tooltip="Save document" data-tooltip-shortcut="Ctrl+S" data-tooltip-position="top">
                    <svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                    Save
                </button>
                <button class="demo-btn demo-btn-secondary" data-tooltip="Open file" data-tooltip-shortcut="Ctrl+O" data-tooltip-position="top">
                    <svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
                    Open
                </button>
                <button class="demo-btn demo-btn-secondary" data-tooltip="Undo action" data-tooltip-shortcut="Ctrl+Z" data-tooltip-position="top">
                    <svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
                    Undo
                </button>
                <button class="demo-btn demo-btn-secondary" data-tooltip="Copy selection" data-tooltip-shortcut="Ctrl+C" data-tooltip-position="top">
                    <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    Copy
                </button>
            </div>

            <div class="code-block">
<code><span class="comment">&lt;!-- With keyboard shortcut --&gt;</span>
<span class="tag">&lt;button</span>
  <span class="attr">data-tooltip</span>=<span class="string">"Save document"</span>
  <span class="attr">data-tooltip-shortcut</span>=<span class="string">"Ctrl+S"</span>
  <span class="attr">data-tooltip-position</span>=<span class="string">"top"</span><span class="tag">&gt;</span>
  Save
<span class="tag">&lt;/button&gt;</span></code>
            </div>
        </div>

        <!-- Theme Support -->
        <div class="demo-section">
            <h2>Theme Support</h2>
            <p>Tooltips automatically adapt to their container's theme. Supports dark, light, and system (auto-detect) themes.</p>

            <div class="theme-demo-container dark" data-theme="dark">
                <h4>Dark Theme</h4>
                <div class="demo-buttons">
                    <button class="demo-btn demo-btn-outline" style="color: #a5b4fc; border-color: #a5b4fc;" data-tooltip="Dark theme tooltip" data-tooltip-position="top">
                        Hover me
                    </button>
                    <button class="demo-btn demo-btn-outline" style="color: #a5b4fc; border-color: #a5b4fc;" data-tooltip="With shortcut" data-tooltip-shortcut="Ctrl+D" data-tooltip-position="right">
                        With Shortcut
                    </button>
                </div>
            </div>

            <div class="theme-demo-container light" data-theme="light">
                <h4>Light Theme</h4>
                <div class="demo-buttons">
                    <button class="demo-btn demo-btn-primary" data-tooltip="Light theme tooltip" data-tooltip-position="top">
                        Hover me
                    </button>
                    <button class="demo-btn demo-btn-primary" data-tooltip="With shortcut" data-tooltip-shortcut="Ctrl+L" data-tooltip-position="right">
                        With Shortcut
                    </button>
                </div>
            </div>

            <div class="theme-demo-container system" data-theme="system">
                <h4>System Theme (follows OS preference)</h4>
                <div class="demo-buttons" style="justify-content: center;">
                    <button class="demo-btn demo-btn-primary" data-tooltip="Follows your OS theme" data-tooltip-position="bottom">
                        System Theme
                    </button>
                </div>
            </div>

            <div class="code-block">
<code><span class="comment">&lt;!-- Dark theme container --&gt;</span>
<span class="tag">&lt;div</span> <span class="attr">data-theme</span>=<span class="string">"dark"</span><span class="tag">&gt;</span>
  <span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Dark tooltip"</span><span class="tag">&gt;</span>Button<span class="tag">&lt;/button&gt;</span>
<span class="tag">&lt;/div&gt;</span>

<span class="comment">&lt;!-- Light theme container --&gt;</span>
<span class="tag">&lt;div</span> <span class="attr">data-theme</span>=<span class="string">"light"</span><span class="tag">&gt;</span>
  <span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Light tooltip"</span><span class="tag">&gt;</span>Button<span class="tag">&lt;/button&gt;</span>
<span class="tag">&lt;/div&gt;</span>

<span class="comment">&lt;!-- System theme (auto-detect) --&gt;</span>
<span class="tag">&lt;div</span> <span class="attr">data-theme</span>=<span class="string">"system"</span><span class="tag">&gt;</span>
  <span class="tag">&lt;button</span> <span class="attr">data-tooltip</span>=<span class="string">"Follows OS theme"</span><span class="tag">&gt;</span>Button<span class="tag">&lt;/button&gt;</span>
<span class="tag">&lt;/div&gt;</span></code>
            </div>
        </div>

        <!-- Fixed Positioning in Scroll Containers -->
        <div class="demo-section">
            <h2>Fixed Positioning in Scroll Containers</h2>
            <p>Tooltips use <code>position: fixed</code> to escape scrollable containers and <code>overflow: hidden</code> constraints.</p>

            <div class="scroll-demo-container">
                <div class="scroll-demo-content">
                    <p>This is a scrollable container with <code>overflow: auto</code>. Scroll down to see more buttons.</p>

                    <button class="demo-btn demo-btn-primary" data-tooltip="Tooltip escapes scroll container!" data-tooltip-position="right">
                        Button at Top
                    </button>

                    <p style="margin-top: 60px;">Keep scrolling...</p>

                    <button class="demo-btn demo-btn-secondary" data-tooltip="Even works when scrolled" data-tooltip-position="right">
                        Middle Button
                    </button>

                    <p style="margin-top: 60px;">Almost there...</p>

                    <button class="demo-btn demo-btn-outline" data-tooltip="Fixed positioning FTW!" data-tooltip-position="top">
                        Button at Bottom
                    </button>
                </div>
            </div>

            <div class="note-box">
                <p><strong>Note:</strong> The tooltip uses <code>position: fixed</code> and calculates position using <code>getBoundingClientRect()</code>, so it stays correctly positioned even while scrolling.</p>
            </div>
        </div>

        <!-- Programmatic API -->
        <div class="demo-section">
            <h2>Programmatic API</h2>
            <p>Control tooltips programmatically with the TooltipManager API.</p>

            <table class="api-table">
                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Description</th>
                        <th>Parameters</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>init(container)</code></td>
                        <td>Initialize tooltip system and scan for elements</td>
                        <td><code>container</code> - DOM element (default: document.body)</td>
                    </tr>
                    <tr>
                        <td><code>show(target, text, options)</code></td>
                        <td>Programmatically show a tooltip</td>
                        <td><code>target</code> - Element, <code>text</code> - String, <code>options</code> - {position, shortcut}</td>
                    </tr>
                    <tr>
                        <td><code>hide()</code></td>
                        <td>Hide the current tooltip</td>
                        <td>None</td>
                    </tr>
                    <tr>
                        <td><code>updateContent(text, shortcut)</code></td>
                        <td>Update tooltip content while visible</td>
                        <td><code>text</code> - String, <code>shortcut</code> - String (optional)</td>
                    </tr>
                    <tr>
                        <td><code>destroy()</code></td>
                        <td>Remove tooltip element and cleanup</td>
                        <td>None</td>
                    </tr>
                </tbody>
            </table>

            <div class="subsection">
                <h3>Dynamic Tooltip Example</h3>
                <div class="dynamic-demo-area">
                    <p>Click the button to see the tooltip content change dynamically:</p>
                    <button id="dynamicTooltipBtn" class="demo-btn demo-btn-primary">
                        Click to Start Process
                    </button>
                </div>
            </div>

            <div class="code-block">
<code><span class="comment">// Programmatic tooltip control</span>
<span class="keyword">const</span> button = document.<span class="function">querySelector</span>(<span class="string">'#myButton'</span>);

<span class="comment">// Show tooltip programmatically</span>
TooltipManager.<span class="function">show</span>(button, <span class="string">'Processing...'</span>, {
  position: <span class="string">'right'</span>
});

<span class="comment">// Update content while visible</span>
<span class="function">setTimeout</span>(() => {
  TooltipManager.<span class="function">updateContent</span>(<span class="string">'Complete!'</span>, <span class="string">'Ctrl+D'</span>);
}, 2000);

<span class="comment">// Hide tooltip</span>
TooltipManager.<span class="function">hide</span>();

<span class="comment">// Cleanup (on component destroy)</span>
TooltipManager.<span class="function">destroy</span>();</code>
            </div>
        </div>

        <!-- Data Attributes Reference -->
        <div class="demo-section">
            <h2>Data Attributes Reference</h2>
            <p>Complete list of data attributes for configuring tooltips.</p>

            <table class="api-table">
                <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Description</th>
                        <th>Values</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>data-tooltip</code></td>
                        <td>Tooltip text content (required)</td>
                        <td>Any string</td>
                    </tr>
                    <tr>
                        <td><code>data-tooltip-position</code></td>
                        <td>Preferred position</td>
                        <td><code>top</code> (default), <code>bottom</code>, <code>left</code>, <code>right</code></td>
                    </tr>
                    <tr>
                        <td><code>data-tooltip-shortcut</code></td>
                        <td>Keyboard shortcut to display</td>
                        <td>e.g., <code>Ctrl+S</code>, <code>Alt+F4</code></td>
                    </tr>
                    <tr>
                        <td><code>data-theme</code></td>
                        <td>Theme for tooltip (on container)</td>
                        <td><code>dark</code>, <code>light</code>, <code>system</code></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Configuration Options -->
        <div class="demo-section">
            <h2>Configuration Options</h2>
            <p>Static properties that can be modified to customize tooltip behavior.</p>

            <table class="api-table">
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>TooltipManager.showDelay</code></td>
                        <td><code>200</code></td>
                        <td>Milliseconds before tooltip appears on hover</td>
                    </tr>
                    <tr>
                        <td><code>TooltipManager.hideDelay</code></td>
                        <td><code>100</code></td>
                        <td>Milliseconds before tooltip disappears on leave</td>
                    </tr>
                    <tr>
                        <td><code>TooltipManager.offset</code></td>
                        <td><code>10</code></td>
                        <td>Pixel distance between tooltip and target element</td>
                    </tr>
                </tbody>
            </table>

            <div class="code-block">
<code><span class="comment">// Customize timing</span>
TooltipManager.showDelay = 300;  <span class="comment">// Wait 300ms before showing</span>
TooltipManager.hideDelay = 150;  <span class="comment">// Wait 150ms before hiding</span>
TooltipManager.offset = 15;       <span class="comment">// 15px gap between tooltip and element</span>

<span class="comment">// Then initialize</span>
TooltipManager.<span class="function">init</span>();</code>
            </div>
        </div>
    </main>

    <script type="module">
        import { TooltipManager } from '<?= asset('file-uploader.js') ?>';

        // Initialize tooltip system
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize for the whole page
            TooltipManager.init(document.body);

            // Dynamic tooltip demo
            const dynamicBtn = document.getElementById('dynamicTooltipBtn');
            let isProcessing = false;

            dynamicBtn.addEventListener('click', () => {
                if (isProcessing) return;
                isProcessing = true;

                dynamicBtn.textContent = 'Processing...';
                TooltipManager.show(dynamicBtn, 'Processing your request...', { position: 'right' });

                setTimeout(() => {
                    TooltipManager.updateContent('Almost done...', null);
                }, 1500);

                setTimeout(() => {
                    TooltipManager.updateContent('Complete!', 'Ctrl+D');
                    dynamicBtn.textContent = 'Process Complete!';
                }, 3000);

                setTimeout(() => {
                    TooltipManager.hide();
                    dynamicBtn.textContent = 'Click to Start Process';
                    isProcessing = false;
                }, 5000);
            });
        });
    </script>
</body>
</html>
