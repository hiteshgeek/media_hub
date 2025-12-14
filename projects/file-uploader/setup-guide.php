<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FileUploader - Setup Guide</title>
    <link rel="stylesheet" href="<?php echo asset('media-hub.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        /* Header */
        .header {
            text-align: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin-bottom: 40px;
        }

        .header h1 {
            font-size: 42px;
            font-weight: 800;
            color: white;
            margin-bottom: 15px;
        }

        .header p {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.9);
            max-width: 600px;
            margin: 0 auto 25px;
        }

        .header-links {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .header-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
        }

        .header-link:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
        }

        .header-link svg {
            width: 18px;
            height: 18px;
            fill: currentColor;
        }

        /* Navigation */
        .nav-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            background: #1e293b;
            padding: 8px;
            border-radius: 12px;
        }

        .nav-tab {
            padding: 12px 24px;
            background: transparent;
            border: none;
            border-radius: 8px;
            color: #94a3b8;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .nav-tab:hover {
            background: #334155;
            color: #e2e8f0;
        }

        .nav-tab.active {
            background: #667eea;
            color: white;
        }

        /* Section */
        .section {
            background: #1e293b;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }

        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #f1f5f9;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-title .badge {
            font-size: 12px;
            padding: 4px 10px;
            background: #667eea;
            border-radius: 20px;
            font-weight: 500;
        }

        .section-title .badge.iife {
            background: #f59e0b;
        }

        .section-subtitle {
            font-size: 18px;
            font-weight: 600;
            color: #cbd5e1;
            margin: 25px 0 15px;
        }

        .section-desc {
            color: #94a3b8;
            margin-bottom: 20px;
        }

        /* Code blocks */
        .code-block {
            background: #0f172a;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
        }

        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: #1a1a2e;
            border-bottom: 1px solid #334155;
        }

        .code-lang {
            font-size: 12px;
            font-weight: 600;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .code-copy {
            padding: 6px 12px;
            background: #334155;
            border: none;
            border-radius: 4px;
            color: #94a3b8;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .code-copy:hover {
            background: #475569;
            color: white;
        }

        .code-copy.copied {
            background: #10b981;
            color: white;
        }

        .code-content {
            padding: 20px;
            overflow-x: auto;
        }

        .code-content pre {
            margin: 0;
            font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
            font-size: 13px;
            line-height: 1.6;
            color: #e2e8f0;
        }

        .code-content .comment {
            color: #6b7280;
        }

        .code-content .keyword {
            color: #c084fc;
        }

        .code-content .string {
            color: #34d399;
        }

        .code-content .function {
            color: #60a5fa;
        }

        .code-content .property {
            color: #fbbf24;
        }

        .code-content .tag {
            color: #f472b6;
        }

        .code-content .attr {
            color: #a78bfa;
        }

        /* File structure */
        .file-structure {
            background: #0f172a;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .file-structure-title {
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .file-tree {
            font-family: 'JetBrains Mono', Consolas, monospace;
            font-size: 13px;
            color: #94a3b8;
        }

        .file-tree .folder {
            color: #fbbf24;
        }

        .file-tree .file {
            color: #60a5fa;
        }

        .file-tree .highlight {
            color: #34d399;
            font-weight: 600;
        }

        /* Info boxes */
        .info-box {
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .info-box.tip {
            background: rgba(16, 185, 129, 0.1);
            border-left: 4px solid #10b981;
        }

        .info-box.warning {
            background: rgba(245, 158, 11, 0.1);
            border-left: 4px solid #f59e0b;
        }

        .info-box.info {
            background: rgba(59, 130, 246, 0.1);
            border-left: 4px solid #3b82f6;
        }

        .info-box-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #f1f5f9;
        }

        .info-box p {
            color: #cbd5e1;
            font-size: 14px;
        }

        /* Events table */
        .events-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .events-table th,
        .events-table td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #334155;
        }

        .events-table th {
            background: #0f172a;
            color: #94a3b8;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .events-table td {
            color: #e2e8f0;
            font-size: 14px;
        }

        .events-table code {
            background: #334155;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 13px;
            color: #f472b6;
        }

        /* Demo section */
        .demo-section {
            background: #1e293b;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }

        .demo-title {
            font-size: 24px;
            font-weight: 700;
            color: #f1f5f9;
            margin-bottom: 10px;
        }

        .demo-desc {
            color: #94a3b8;
            margin-bottom: 25px;
        }

        .demo-container {
            background: #f7fafc;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 20px;
        }

        .demo-output {
            background: #0f172a;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }

        .demo-output-title {
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .demo-output pre {
            font-family: 'JetBrains Mono', Consolas, monospace;
            font-size: 12px;
            color: #94a3b8;
            white-space: pre-wrap;
            margin: 0;
            max-height: 300px;
            overflow-y: auto;
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: 4px;
            margin-bottom: 20px;
            background: #0f172a;
            padding: 4px;
            border-radius: 8px;
            width: fit-content;
        }

        .tab {
            padding: 8px 16px;
            background: transparent;
            border: none;
            border-radius: 6px;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .tab:hover {
            background: #1e293b;
        }

        .tab.active {
            background: #667eea;
            color: white;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        /* Grid */
        .grid-2 {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 28px;
            }

            .container {
                padding: 20px;
            }

            .section {
                padding: 20px;
            }

            .events-table {
                display: block;
                overflow-x: auto;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>FileUploader Setup Guide</h1>
        <p>Complete setup instructions for ES Modules and IIFE builds with live demos and examples</p>
        <div class="header-links">
            <a href="index.php" class="header-link">
                <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Demos
            </a>
            <a href="config-builder.php" class="header-link">
                <svg viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                Config Builder
            </a>
        </div>
    </header>

    <div class="container">
        <!-- Quick Navigation -->
        <nav class="nav-tabs">
            <button class="nav-tab active" data-section="files">Required Files</button>
            <button class="nav-tab" data-section="module">ES Module Setup</button>
            <button class="nav-tab" data-section="iife">IIFE Setup</button>
            <button class="nav-tab" data-section="php">PHP Backend</button>
            <button class="nav-tab" data-section="config">Configuration</button>
            <button class="nav-tab" data-section="events">Events</button>
            <button class="nav-tab" data-section="demo">Live Demo</button>
        </nav>

        <!-- Section: Required Files -->
        <section class="section" id="section-files">
            <h2 class="section-title">Required Files</h2>
            <p class="section-desc">After running <code>npm run prod</code> (or <code>gulp prod</code>), the following files are generated in the <code>dist/</code> directory:</p>

            <div class="file-structure">
                <div class="file-structure-title">Distribution Files</div>
                <div class="file-tree">
<pre>dist/
├── <span class="folder">css/</span>
│   └── <span class="file highlight">media-hub.css</span>          <span class="comment">← Single CSS file (all styles)</span>
│
└── <span class="folder">js/</span>
    ├── <span class="file highlight">media-hub.js</span>           <span class="comment">← ES Module build</span>
    └── <span class="file highlight">media-hub.iife.js</span>      <span class="comment">← IIFE build (no modules)</span></pre>
                </div>
            </div>

            <div class="grid-2">
                <div class="info-box info">
                    <div class="info-box-title">ES Module Build</div>
                    <p>Use <code>media-hub.js</code> for modern browsers with ES module support. Import classes directly using <code>import { FileUploader } from '...'</code></p>
                </div>
                <div class="info-box info">
                    <div class="info-box-title">IIFE Build</div>
                    <p>Use <code>media-hub.iife.js</code> for legacy browsers or when modules aren't available. Classes are exposed globally via <code>window.MediaHub.FileUploader</code></p>
                </div>
            </div>

            <h3 class="section-subtitle">Which Build Should You Use?</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Scenario</th>
                        <th>Recommended Build</th>
                        <th>File</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Modern web apps (React, Vue, Angular)</td>
                        <td><code>ES Module</code></td>
                        <td><code>media-hub.js</code></td>
                    </tr>
                    <tr>
                        <td>Vanilla JS with bundler (Webpack, Vite)</td>
                        <td><code>ES Module</code></td>
                        <td><code>media-hub.js</code></td>
                    </tr>
                    <tr>
                        <td>Traditional PHP/HTML pages</td>
                        <td><code>IIFE</code></td>
                        <td><code>media-hub.iife.js</code></td>
                    </tr>
                    <tr>
                        <td>WordPress, Drupal, CMS</td>
                        <td><code>IIFE</code></td>
                        <td><code>media-hub.iife.js</code></td>
                    </tr>
                    <tr>
                        <td>Support both modern + legacy</td>
                        <td><code>Both</code></td>
                        <td>Use <code>type="module"</code> + <code>nomodule</code></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- Section: ES Module Setup -->
        <section class="section" id="section-module" style="display: none;">
            <h2 class="section-title">ES Module Setup <span class="badge">Recommended</span></h2>
            <p class="section-desc">Modern browsers support ES modules natively. This is the recommended approach for new projects.</p>

            <h3 class="section-subtitle">1. Include CSS</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">&lt;!-- In your &lt;head&gt; section --&gt;</span>
<span class="tag">&lt;link</span> <span class="attr">rel</span>=<span class="string">"stylesheet"</span> <span class="attr">href</span>=<span class="string">"/path/to/dist/css/media-hub.css"</span><span class="tag">&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">2. Include JavaScript</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">&lt;!-- At the end of &lt;body&gt; --&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">type</span>=<span class="string">"module"</span><span class="tag">&gt;</span>
    <span class="keyword">import</span> { FileUploader } <span class="keyword">from</span> <span class="string">'/path/to/dist/js/media-hub.js'</span>;

    <span class="comment">// Initialize the uploader</span>
    <span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
        <span class="property">urls</span>: {
            <span class="property">uploadUrl</span>: <span class="string">'/api/upload.php'</span>,
            <span class="property">deleteUrl</span>: <span class="string">'/api/delete.php'</span>
        },
        <span class="property">behavior</span>: {
            <span class="property">multiple</span>: <span class="keyword">true</span>
        }
    });
<span class="tag">&lt;/script&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">3. Add Container Element</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">&lt;!-- Container where FileUploader will be rendered --&gt;</span>
<span class="tag">&lt;div</span> <span class="attr">id</span>=<span class="string">"file-uploader"</span><span class="tag">&gt;&lt;/div&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Complete Example</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;!DOCTYPE html&gt;</span>
<span class="tag">&lt;html</span> <span class="attr">lang</span>=<span class="string">"en"</span><span class="tag">&gt;</span>
<span class="tag">&lt;head&gt;</span>
    <span class="tag">&lt;meta</span> <span class="attr">charset</span>=<span class="string">"UTF-8"</span><span class="tag">&gt;</span>
    <span class="tag">&lt;meta</span> <span class="attr">name</span>=<span class="string">"viewport"</span> <span class="attr">content</span>=<span class="string">"width=device-width, initial-scale=1.0"</span><span class="tag">&gt;</span>
    <span class="tag">&lt;title&gt;</span>File Upload<span class="tag">&lt;/title&gt;</span>
    <span class="tag">&lt;link</span> <span class="attr">rel</span>=<span class="string">"stylesheet"</span> <span class="attr">href</span>=<span class="string">"/dist/css/media-hub.css"</span><span class="tag">&gt;</span>
<span class="tag">&lt;/head&gt;</span>
<span class="tag">&lt;body&gt;</span>
    <span class="tag">&lt;div</span> <span class="attr">id</span>=<span class="string">"file-uploader"</span><span class="tag">&gt;&lt;/div&gt;</span>

    <span class="tag">&lt;script</span> <span class="attr">type</span>=<span class="string">"module"</span><span class="tag">&gt;</span>
        <span class="keyword">import</span> { FileUploader } <span class="keyword">from</span> <span class="string">'/dist/js/media-hub.js'</span>;

        <span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
            <span class="comment">// URLs (Required)</span>
            <span class="property">urls</span>: {
                <span class="property">uploadUrl</span>: <span class="string">'/api/upload.php'</span>,
                <span class="property">deleteUrl</span>: <span class="string">'/api/delete.php'</span>,
                <span class="property">downloadAllUrl</span>: <span class="string">'/api/download-all.php'</span>,
                <span class="property">cleanupZipUrl</span>: <span class="string">'/api/cleanup-zip.php'</span>
            },

            <span class="comment">// Behavior</span>
            <span class="property">behavior</span>: {
                <span class="property">multiple</span>: <span class="keyword">true</span>,
                <span class="property">confirmBeforeDelete</span>: <span class="keyword">true</span>
            },

            <span class="comment">// Limits</span>
            <span class="property">limits</span>: {
                <span class="property">maxFiles</span>: <span class="number">10</span>,
                <span class="property">perFileMaxSize</span>: <span class="number">10485760</span> <span class="comment">// 10MB</span>
            },

            <span class="comment">// UI Options</span>
            <span class="property">limitsDisplay</span>: {
                <span class="property">showLimits</span>: <span class="keyword">true</span>
            },
            <span class="property">buttons</span>: {
                <span class="property">showDownloadAllButton</span>: <span class="keyword">true</span>
            },

            <span class="comment">// Callbacks</span>
            <span class="property">callbacks</span>: {
                <span class="property">onUploadSuccess</span>: (file, response) => {
                    console.log(<span class="string">'Uploaded:'</span>, file.name, response);
                },
                <span class="property">onUploadError</span>: (file, error) => {
                    console.error(<span class="string">'Upload failed:'</span>, file.name, error);
                }
            }
        });

        <span class="comment">// Make available globally for debugging</span>
        window.uploader = uploader;
    <span class="tag">&lt;/script&gt;</span>
<span class="tag">&lt;/body&gt;</span>
<span class="tag">&lt;/html&gt;</span></pre>
                </div>
            </div>

            <div class="info-box tip">
                <div class="info-box-title">Supporting Both Module and Legacy Browsers</div>
                <p>Use the <code>nomodule</code> attribute to provide a fallback for older browsers:</p>
            </div>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">&lt;!-- Modern browsers load this --&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">type</span>=<span class="string">"module"</span> <span class="attr">src</span>=<span class="string">"/dist/js/media-hub.js"</span><span class="tag">&gt;&lt;/script&gt;</span>

<span class="comment">&lt;!-- Legacy browsers load this (ignored by modern browsers) --&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">nomodule</span> <span class="attr">src</span>=<span class="string">"/dist/js/media-hub.iife.js"</span><span class="tag">&gt;&lt;/script&gt;</span></pre>
                </div>
            </div>
        </section>

        <!-- Section: IIFE Setup -->
        <section class="section" id="section-iife" style="display: none;">
            <h2 class="section-title">IIFE Setup <span class="badge iife">Legacy Compatible</span></h2>
            <p class="section-desc">For traditional websites, CMS platforms, or when ES modules aren't available. All classes are exposed globally via the <code>MediaHub</code> namespace.</p>

            <h3 class="section-subtitle">1. Include CSS</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">&lt;!-- In your &lt;head&gt; section --&gt;</span>
<span class="tag">&lt;link</span> <span class="attr">rel</span>=<span class="string">"stylesheet"</span> <span class="attr">href</span>=<span class="string">"/path/to/dist/css/media-hub.css"</span><span class="tag">&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">2. Include JavaScript</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">&lt;!-- At the end of &lt;body&gt; --&gt;</span>
<span class="tag">&lt;script</span> <span class="attr">src</span>=<span class="string">"/path/to/dist/js/media-hub.iife.js"</span><span class="tag">&gt;&lt;/script&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">3. Initialize (Using Global Namespace)</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;script&gt;</span>
    <span class="comment">// Classes are available under window.MediaHub</span>
    <span class="keyword">var</span> FileUploader = MediaHub.FileUploader;

    <span class="keyword">var</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
        <span class="property">urls</span>: {
            <span class="property">uploadUrl</span>: <span class="string">'/api/upload.php'</span>,
            <span class="property">deleteUrl</span>: <span class="string">'/api/delete.php'</span>
        },
        <span class="property">behavior</span>: {
            <span class="property">multiple</span>: <span class="keyword">true</span>
        }
    });
<span class="tag">&lt;/script&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Complete Example</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">HTML</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;!DOCTYPE html&gt;</span>
<span class="tag">&lt;html</span> <span class="attr">lang</span>=<span class="string">"en"</span><span class="tag">&gt;</span>
<span class="tag">&lt;head&gt;</span>
    <span class="tag">&lt;meta</span> <span class="attr">charset</span>=<span class="string">"UTF-8"</span><span class="tag">&gt;</span>
    <span class="tag">&lt;meta</span> <span class="attr">name</span>=<span class="string">"viewport"</span> <span class="attr">content</span>=<span class="string">"width=device-width, initial-scale=1.0"</span><span class="tag">&gt;</span>
    <span class="tag">&lt;title&gt;</span>File Upload<span class="tag">&lt;/title&gt;</span>
    <span class="tag">&lt;link</span> <span class="attr">rel</span>=<span class="string">"stylesheet"</span> <span class="attr">href</span>=<span class="string">"/dist/css/media-hub.css"</span><span class="tag">&gt;</span>
<span class="tag">&lt;/head&gt;</span>
<span class="tag">&lt;body&gt;</span>
    <span class="tag">&lt;div</span> <span class="attr">id</span>=<span class="string">"file-uploader"</span><span class="tag">&gt;&lt;/div&gt;</span>

    <span class="comment">&lt;!-- IIFE build (no module support needed) --&gt;</span>
    <span class="tag">&lt;script</span> <span class="attr">src</span>=<span class="string">"/dist/js/media-hub.iife.js"</span><span class="tag">&gt;&lt;/script&gt;</span>
    <span class="tag">&lt;script&gt;</span>
        <span class="comment">// Using the global MediaHub namespace</span>
        <span class="keyword">var</span> FileUploader = MediaHub.FileUploader;

        <span class="keyword">var</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
            <span class="comment">// URLs (Required)</span>
            <span class="property">urls</span>: {
                <span class="property">uploadUrl</span>: <span class="string">'/api/upload.php'</span>,
                <span class="property">deleteUrl</span>: <span class="string">'/api/delete.php'</span>,
                <span class="property">downloadAllUrl</span>: <span class="string">'/api/download-all.php'</span>,
                <span class="property">cleanupZipUrl</span>: <span class="string">'/api/cleanup-zip.php'</span>
            },

            <span class="comment">// Behavior</span>
            <span class="property">behavior</span>: {
                <span class="property">multiple</span>: <span class="keyword">true</span>,
                <span class="property">confirmBeforeDelete</span>: <span class="keyword">true</span>
            },

            <span class="comment">// Limits</span>
            <span class="property">limits</span>: {
                <span class="property">maxFiles</span>: <span class="number">10</span>,
                <span class="property">perFileMaxSize</span>: <span class="number">10485760</span> <span class="comment">// 10MB</span>
            },

            <span class="comment">// UI Options</span>
            <span class="property">limitsDisplay</span>: {
                <span class="property">showLimits</span>: <span class="keyword">true</span>
            },
            <span class="property">buttons</span>: {
                <span class="property">showDownloadAllButton</span>: <span class="keyword">true</span>
            },

            <span class="comment">// Callbacks</span>
            <span class="property">callbacks</span>: {
                <span class="property">onUploadSuccess</span>: <span class="keyword">function</span>(file, response) {
                    console.log(<span class="string">'Uploaded:'</span>, file.name, response);
                },
                <span class="property">onUploadError</span>: <span class="keyword">function</span>(file, error) {
                    console.error(<span class="string">'Upload failed:'</span>, file.name, error);
                }
            }
        });

        <span class="comment">// Make available globally for debugging</span>
        window.uploader = uploader;
    <span class="tag">&lt;/script&gt;</span>
<span class="tag">&lt;/body&gt;</span>
<span class="tag">&lt;/html&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Available Global Classes</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">// All classes under MediaHub namespace</span>
MediaHub.FileUploader     <span class="comment">// Main file uploader class</span>
MediaHub.FileCarousel     <span class="comment">// Carousel preview component</span>
MediaHub.MediaCapture     <span class="comment">// Screen/audio capture</span>
MediaHub.ConfigBuilder    <span class="comment">// Visual config builder</span></pre>
                </div>
            </div>
        </section>

        <!-- Section: PHP Backend -->
        <section class="section" id="section-php" style="display: none;">
            <h2 class="section-title">PHP Backend Configuration</h2>
            <p class="section-desc">FileUploader communicates with your backend via AJAX. Here are the required PHP endpoints and their expected responses.</p>

            <h3 class="section-subtitle">Upload Endpoint (upload.php)</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">PHP</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;?php</span>
<span class="comment">// api/upload.php</span>
<span class="property">header</span>(<span class="string">'Content-Type: application/json'</span>);

<span class="keyword">if</span> (<span class="property">$_SERVER</span>[<span class="string">'REQUEST_METHOD'</span>] !== <span class="string">'POST'</span>) {
    <span class="property">http_response_code</span>(<span class="string">405</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'error'</span> => <span class="string">'Method not allowed'</span>]);
    <span class="keyword">exit</span>;
}

<span class="keyword">if</span> (!<span class="keyword">isset</span>(<span class="property">$_FILES</span>[<span class="string">'file'</span>])) {
    <span class="property">http_response_code</span>(<span class="string">400</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'error'</span> => <span class="string">'No file uploaded'</span>]);
    <span class="keyword">exit</span>;
}

<span class="property">$file</span> = <span class="property">$_FILES</span>[<span class="string">'file'</span>];
<span class="property">$uploadDir</span> = <span class="string">'../uploads/'</span>;

<span class="comment">// Create upload directory if it doesn't exist</span>
<span class="keyword">if</span> (!<span class="property">is_dir</span>(<span class="property">$uploadDir</span>)) {
    <span class="property">mkdir</span>(<span class="property">$uploadDir</span>, <span class="string">0755</span>, <span class="keyword">true</span>);
}

<span class="comment">// Generate unique filename</span>
<span class="property">$extension</span> = <span class="property">pathinfo</span>(<span class="property">$file</span>[<span class="string">'name'</span>], <span class="string">PATHINFO_EXTENSION</span>);
<span class="property">$filename</span> = <span class="property">uniqid</span>() . <span class="string">'.'</span> . <span class="property">$extension</span>;
<span class="property">$filepath</span> = <span class="property">$uploadDir</span> . <span class="property">$filename</span>;

<span class="keyword">if</span> (<span class="property">move_uploaded_file</span>(<span class="property">$file</span>[<span class="string">'tmp_name'</span>], <span class="property">$filepath</span>)) {
    <span class="comment">// Success response - file data must be wrapped in 'file' object</span>
    <span class="keyword">echo</span> <span class="property">json_encode</span>([
        <span class="string">'success'</span> => <span class="keyword">true</span>,
        <span class="string">'file'</span> => [
            <span class="string">'filename'</span> => <span class="property">$filename</span>,           <span class="comment">// Saved filename</span>
            <span class="string">'originalName'</span> => <span class="property">$file</span>[<span class="string">'name'</span>],   <span class="comment">// Original filename</span>
            <span class="string">'path'</span> => <span class="property">$filepath</span>,               <span class="comment">// Path for deletion</span>
            <span class="string">'url'</span> => <span class="string">'/uploads/'</span> . <span class="property">$filename</span>   <span class="comment">// URL for preview/download</span>
        ]
    ]);
} <span class="keyword">else</span> {
    <span class="property">http_response_code</span>(<span class="string">500</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Failed to save file'</span>]);
}
<span class="tag">?&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Delete Endpoint (delete.php)</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">PHP</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;?php</span>
<span class="comment">// api/delete.php</span>
<span class="property">header</span>(<span class="string">'Content-Type: application/json'</span>);

<span class="keyword">if</span> (<span class="property">$_SERVER</span>[<span class="string">'REQUEST_METHOD'</span>] !== <span class="string">'POST'</span>) {
    <span class="property">http_response_code</span>(<span class="string">405</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'error'</span> => <span class="string">'Method not allowed'</span>]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Get JSON body</span>
<span class="property">$input</span> = <span class="property">json_decode</span>(<span class="property">file_get_contents</span>(<span class="string">'php://input'</span>), <span class="keyword">true</span>);
<span class="property">$filename</span> = <span class="property">$input</span>[<span class="string">'filename'</span>] ?? <span class="keyword">null</span>;

<span class="keyword">if</span> (!<span class="property">$filename</span>) {
    <span class="property">http_response_code</span>(<span class="string">400</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'error'</span> => <span class="string">'Filename required'</span>]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Sanitize filename (prevent directory traversal)</span>
<span class="property">$filename</span> = <span class="property">basename</span>(<span class="property">$filename</span>);
<span class="property">$filepath</span> = <span class="string">'../uploads/'</span> . <span class="property">$filename</span>;

<span class="keyword">if</span> (<span class="property">file_exists</span>(<span class="property">$filepath</span>) && <span class="property">unlink</span>(<span class="property">$filepath</span>)) {
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">true</span>]);
} <span class="keyword">else</span> {
    <span class="property">http_response_code</span>(<span class="string">404</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'error'</span> => <span class="string">'File not found or could not be deleted'</span>]);
}
<span class="tag">?&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Download All Endpoint (download-all.php)</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">PHP</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;?php</span>
<span class="comment">// api/download-all.php</span>
<span class="property">header</span>(<span class="string">'Content-Type: application/json'</span>);

<span class="keyword">if</span> (<span class="property">$_SERVER</span>[<span class="string">'REQUEST_METHOD'</span>] !== <span class="string">'POST'</span>) {
    <span class="property">http_response_code</span>(<span class="string">405</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Method not allowed'</span>]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Get files from request</span>
<span class="property">$input</span> = <span class="property">json_decode</span>(<span class="property">file_get_contents</span>(<span class="string">'php://input'</span>), <span class="keyword">true</span>);
<span class="property">$files</span> = <span class="property">$input</span>[<span class="string">'files'</span>] ?? [];

<span class="keyword">if</span> (<span class="keyword">empty</span>(<span class="property">$files</span>)) {
    <span class="property">http_response_code</span>(<span class="string">400</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'No files provided'</span>]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Single file - return direct URL</span>
<span class="keyword">if</span> (<span class="property">count</span>(<span class="property">$files</span>) === <span class="string">1</span>) {
    <span class="property">$filename</span> = <span class="property">basename</span>(<span class="property">$files</span>[<span class="string">0</span>][<span class="string">'serverFilename'</span>]);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([
        <span class="string">'success'</span> => <span class="keyword">true</span>,
        <span class="string">'type'</span> => <span class="string">'single'</span>,
        <span class="string">'url'</span> => <span class="string">'uploads/'</span> . <span class="property">$filename</span>,
        <span class="string">'filename'</span> => <span class="property">$files</span>[<span class="string">0</span>][<span class="string">'originalName'</span>]
    ]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Multiple files - create ZIP archive</span>
<span class="property">$zipFilename</span> = <span class="string">'download_'</span> . <span class="property">time</span>() . <span class="string">'.zip'</span>;
<span class="property">$zipPath</span> = <span class="string">'../uploads/'</span> . <span class="property">$zipFilename</span>;

<span class="property">$zip</span> = <span class="keyword">new</span> <span class="function">ZipArchive</span>();
<span class="keyword">if</span> (<span class="property">$zip</span>-><span class="function">open</span>(<span class="property">$zipPath</span>, ZipArchive::<span class="string">CREATE</span>) === <span class="keyword">true</span>) {
    <span class="keyword">foreach</span> (<span class="property">$files</span> <span class="keyword">as</span> <span class="property">$file</span>) {
        <span class="property">$filepath</span> = <span class="string">'../uploads/'</span> . <span class="property">basename</span>(<span class="property">$file</span>[<span class="string">'serverFilename'</span>]);
        <span class="keyword">if</span> (<span class="property">file_exists</span>(<span class="property">$filepath</span>)) {
            <span class="property">$zip</span>-><span class="function">addFile</span>(<span class="property">$filepath</span>, <span class="property">$file</span>[<span class="string">'originalName'</span>] ?? <span class="property">basename</span>(<span class="property">$filepath</span>));
        }
    }
    <span class="property">$zip</span>-><span class="function">close</span>();

    <span class="keyword">echo</span> <span class="property">json_encode</span>([
        <span class="string">'success'</span> => <span class="keyword">true</span>,
        <span class="string">'type'</span> => <span class="string">'zip'</span>,
        <span class="string">'url'</span> => <span class="string">'uploads/'</span> . <span class="property">$zipFilename</span>,
        <span class="string">'filename'</span> => <span class="string">'files.zip'</span>,
        <span class="string">'cleanup'</span> => <span class="property">$zipFilename</span>   <span class="comment">// For cleanup after download</span>
    ]);
} <span class="keyword">else</span> {
    <span class="property">http_response_code</span>(<span class="string">500</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Failed to create ZIP'</span>]);
}
<span class="tag">?&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Cleanup ZIP Endpoint (cleanup-zip.php)</h3>
            <div class="info-box info">
                <div class="info-box-title">Cleanup After Download</div>
                <p>FileUploader automatically calls this endpoint after downloading a ZIP file to clean up temporary files. This prevents accumulation of ZIP archives on the server.</p>
            </div>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">PHP</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;?php</span>
<span class="comment">// api/cleanup-zip.php</span>
<span class="property">header</span>(<span class="string">'Content-Type: application/json'</span>);

<span class="comment">// Get JSON input</span>
<span class="property">$input</span> = <span class="property">json_decode</span>(<span class="property">file_get_contents</span>(<span class="string">'php://input'</span>), <span class="keyword">true</span>);
<span class="property">$filename</span> = <span class="property">$input</span>[<span class="string">'filename'</span>] ?? <span class="keyword">null</span>;

<span class="keyword">if</span> (!<span class="property">$filename</span>) {
    <span class="property">http_response_code</span>(<span class="string">400</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Filename required'</span>]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Security: only allow .zip files matching our pattern</span>
<span class="property">$filename</span> = <span class="property">basename</span>(<span class="property">$filename</span>);
<span class="keyword">if</span> (!<span class="property">preg_match</span>(<span class="string">'/^download_\d+\.zip$/'</span>, <span class="property">$filename</span>)) {
    <span class="property">http_response_code</span>(<span class="string">400</span>);
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Invalid filename'</span>]);
    <span class="keyword">exit</span>;
}

<span class="property">$filepath</span> = <span class="string">'../uploads/'</span> . <span class="property">$filename</span>;

<span class="keyword">if</span> (<span class="property">file_exists</span>(<span class="property">$filepath</span>) && <span class="property">unlink</span>(<span class="property">$filepath</span>)) {
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">true</span>]);
} <span class="keyword">else</span> {
    <span class="comment">// Don't fail if already deleted</span>
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">true</span>]);
}
<span class="tag">?&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Copy File Endpoint (copy-file.php) - For Cross-Uploader Drag</h3>
            <div class="info-box info">
                <div class="info-box-title">Cross-Uploader File Operations</div>
                <p>When <code>enableCrossUploaderDrag: true</code>, users can drag files between different FileUploader instances. This endpoint handles copying files between upload directories.</p>
            </div>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">PHP</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;?php</span>
<span class="comment">// api/copy-file.php</span>
<span class="property">header</span>(<span class="string">'Content-Type: application/json'</span>);

<span class="comment">// Get JSON input</span>
<span class="property">$input</span> = <span class="property">json_decode</span>(<span class="property">file_get_contents</span>(<span class="string">'php://input'</span>), <span class="keyword">true</span>);

<span class="comment">// Required fields</span>
<span class="property">$sourceFilename</span> = <span class="property">$input</span>[<span class="string">'sourceFilename'</span>] ?? <span class="keyword">null</span>;
<span class="property">$sourceUploadDir</span> = <span class="property">$input</span>[<span class="string">'sourceUploadDir'</span>] ?? <span class="string">''</span>;
<span class="property">$targetUploadDir</span> = <span class="property">$input</span>[<span class="string">'targetUploadDir'</span>] ?? <span class="string">''</span>;

<span class="keyword">if</span> (!<span class="property">$sourceFilename</span>) {
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Source filename required'</span>]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Security: sanitize paths</span>
<span class="property">$sourceFilename</span> = <span class="property">basename</span>(<span class="property">$sourceFilename</span>);
<span class="property">$baseUploadDir</span> = <span class="string">'../uploads/'</span>;

<span class="comment">// Build source and target paths</span>
<span class="property">$sourcePath</span> = <span class="property">$baseUploadDir</span> . <span class="property">trim</span>(<span class="property">$sourceUploadDir</span>, <span class="string">'/'</span>) . <span class="string">'/'</span> . <span class="property">$sourceFilename</span>;
<span class="property">$targetDir</span> = <span class="property">$baseUploadDir</span> . <span class="property">trim</span>(<span class="property">$targetUploadDir</span>, <span class="string">'/'</span>) . <span class="string">'/'</span>;

<span class="keyword">if</span> (!<span class="property">file_exists</span>(<span class="property">$sourcePath</span>)) {
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Source file not found'</span>]);
    <span class="keyword">exit</span>;
}

<span class="comment">// Create target directory if needed</span>
<span class="keyword">if</span> (!<span class="property">is_dir</span>(<span class="property">$targetDir</span>)) {
    <span class="property">mkdir</span>(<span class="property">$targetDir</span>, <span class="string">0755</span>, <span class="keyword">true</span>);
}

<span class="comment">// Handle duplicate filenames</span>
<span class="property">$targetFilename</span> = <span class="property">$sourceFilename</span>;
<span class="property">$counter</span> = <span class="string">1</span>;
<span class="keyword">while</span> (<span class="property">file_exists</span>(<span class="property">$targetDir</span> . <span class="property">$targetFilename</span>)) {
    <span class="property">$ext</span> = <span class="property">pathinfo</span>(<span class="property">$sourceFilename</span>, <span class="string">PATHINFO_EXTENSION</span>);
    <span class="property">$name</span> = <span class="property">pathinfo</span>(<span class="property">$sourceFilename</span>, <span class="string">PATHINFO_FILENAME</span>);
    <span class="property">$targetFilename</span> = <span class="property">$name</span> . <span class="string">'_'</span> . <span class="property">$counter</span> . <span class="string">'.'</span> . <span class="property">$ext</span>;
    <span class="property">$counter</span>++;
}

<span class="property">$targetPath</span> = <span class="property">$targetDir</span> . <span class="property">$targetFilename</span>;

<span class="keyword">if</span> (<span class="property">copy</span>(<span class="property">$sourcePath</span>, <span class="property">$targetPath</span>)) {
    <span class="keyword">echo</span> <span class="property">json_encode</span>([
        <span class="string">'success'</span> => <span class="keyword">true</span>,
        <span class="string">'file'</span> => [
            <span class="string">'filename'</span> => <span class="property">$targetFilename</span>,
            <span class="string">'originalName'</span> => <span class="property">$sourceFilename</span>,
            <span class="string">'path'</span> => <span class="property">$targetPath</span>,
            <span class="string">'url'</span> => <span class="string">'/uploads/'</span> . <span class="property">trim</span>(<span class="property">$targetUploadDir</span>, <span class="string">'/'</span>) . <span class="string">'/'</span> . <span class="property">$targetFilename</span>
        ],
        <span class="string">'renamed'</span> => (<span class="property">$targetFilename</span> !== <span class="property">$sourceFilename</span>)
    ]);
} <span class="keyword">else</span> {
    <span class="keyword">echo</span> <span class="property">json_encode</span>([<span class="string">'success'</span> => <span class="keyword">false</span>, <span class="string">'error'</span> => <span class="string">'Failed to copy file'</span>]);
}
<span class="tag">?&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Additional Data in Requests</h3>
            <div class="info-box info">
                <div class="info-box-title">Passing Custom Data to Endpoints</div>
                <p>FileUploader provides three ways to include custom data in POST requests: global data for all requests, per-request type data, and a dynamic callback for runtime modifications.</p>
            </div>

            <h4 style="color: #94a3b8; margin: 20px 0 10px; font-size: 16px;">1. Global Additional Data (All Requests)</h4>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
    <span class="comment">// URL Configuration</span>
    <span class="property">urls</span>: {
        <span class="property">uploadUrl</span>: <span class="string">'?urlq=files/upload'</span>,
        <span class="property">deleteUrl</span>: <span class="string">'?urlq=files/delete'</span>,
        <span class="property">downloadAllUrl</span>: <span class="string">'?urlq=files/download'</span>,
        <span class="property">configUrl</span>: <span class="string">'?urlq=files/get-config'</span>,

        <span class="comment">// Data included in ALL POST requests</span>
        <span class="property">additionalData</span>: {
            <span class="property">csrf_token</span>: <span class="string">'abc123'</span>,
            <span class="property">user_id</span>: <span class="string">'42'</span>
        }
    }
});</pre>
                </div>
            </div>

            <h4 style="color: #94a3b8; margin: 20px 0 10px; font-size: 16px;">2. Per-Request Type Data</h4>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
    <span class="comment">// URL Configuration</span>
    <span class="property">urls</span>: {
        <span class="property">uploadUrl</span>: <span class="string">'?urlq=files/upload'</span>,
        <span class="property">deleteUrl</span>: <span class="string">'?urlq=files/delete'</span>,
        <span class="property">downloadAllUrl</span>: <span class="string">'?urlq=files/download'</span>,

        <span class="comment">// Data for ALL requests</span>
        <span class="property">additionalData</span>: { <span class="property">csrf_token</span>: <span class="string">'abc123'</span> },

        <span class="comment">// Data for specific request types only</span>
        <span class="property">uploadData</span>: { <span class="property">submit</span>: <span class="string">'upload'</span>, <span class="property">category</span>: <span class="string">'documents'</span> },
        <span class="property">deleteData</span>: { <span class="property">submit</span>: <span class="string">'delete'</span>, <span class="property">soft_delete</span>: <span class="string">'true'</span> },
        <span class="property">downloadData</span>: { <span class="property">submit</span>: <span class="string">'download'</span> },
        <span class="property">copyData</span>: { <span class="property">submit</span>: <span class="string">'copy'</span> }
    }
});</pre>
                </div>
            </div>

            <h4 style="color: #94a3b8; margin: 20px 0 10px; font-size: 16px;">3. Dynamic Data with onBeforeRequest Callback</h4>
            <div class="info-box tip">
                <div class="info-box-title">Most Flexible Option</div>
                <p>Use <code>onBeforeRequest</code> to dynamically modify request data at runtime. Perfect for adding timestamps, dynamic tokens, or file-specific metadata.</p>
            </div>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
    <span class="comment">// URL Configuration</span>
    <span class="property">urls</span>: {
        <span class="property">uploadUrl</span>: <span class="string">'?urlq=files/upload'</span>,
        <span class="property">deleteUrl</span>: <span class="string">'?urlq=files/delete'</span>
    },

    <span class="comment">// Callbacks</span>
    <span class="property">callbacks</span>: {
        <span class="comment">/**
         * Called before each request
         * @param {string} requestType - 'upload', 'delete', 'download', 'copy', 'cleanup'
         * @param {Object} data - Current data object (modify or return new object)
         * @param {Object} context - Contains fileObj, files array, etc.
         */</span>
        <span class="property">onBeforeRequest</span>: (requestType, data, context) => {
            <span class="comment">// Add timestamp to all requests</span>
            data.timestamp = Date.now();

            <span class="comment">// Add different submit values based on request type</span>
            data.submit = requestType;

            <span class="comment">// Add file-specific data for uploads</span>
            <span class="keyword">if</span> (requestType === <span class="string">'upload'</span> && context.fileObj) {
                data.original_name = context.fileObj.name;
                data.file_size = context.fileObj.size;
            }

            <span class="comment">// Add dynamic CSRF token</span>
            data.csrf_token = document.querySelector(<span class="string">'meta[name="csrf-token"]'</span>)?.content;

            <span class="keyword">return</span> data; <span class="comment">// Return modified data (or modify in place)</span>
        }
    }
});</pre>
                </div>
            </div>

            <h4 style="color: #94a3b8; margin: 20px 0 10px; font-size: 16px;">Data Merge Order</h4>
            <div class="info-box info">
                <div class="info-box-title">Priority (later values override earlier)</div>
                <p>1. Base request data (filename, files, etc.) → 2. <code>additionalData</code> (global) → 3. Per-request data (<code>uploadData</code>, etc.) → 4. <code>onBeforeRequest</code> callback</p>
            </div>

            <h4 style="color: #94a3b8; margin: 20px 0 10px; font-size: 16px;">Accessing Data in PHP</h4>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">PHP</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;?php</span>
<span class="comment">// For upload requests (FormData) - access via $_POST</span>
<span class="property">$submit</span> = <span class="property">$_POST</span>[<span class="string">'submit'</span>] ?? <span class="keyword">null</span>;
<span class="property">$csrfToken</span> = <span class="property">$_POST</span>[<span class="string">'csrf_token'</span>] ?? <span class="keyword">null</span>;

<span class="comment">// For JSON requests (delete, download, copy) - access via php://input</span>
<span class="property">$input</span> = <span class="property">json_decode</span>(<span class="property">file_get_contents</span>(<span class="string">'php://input'</span>), <span class="keyword">true</span>);
<span class="property">$submit</span> = <span class="property">$input</span>[<span class="string">'submit'</span>] ?? <span class="keyword">null</span>;
<span class="property">$csrfToken</span> = <span class="property">$input</span>[<span class="string">'csrf_token'</span>] ?? <span class="keyword">null</span>;

<span class="comment">// Route based on submit parameter</span>
<span class="keyword">switch</span> (<span class="property">$submit</span>) {
    <span class="keyword">case</span> <span class="string">'upload'</span>: handleUpload(); <span class="keyword">break</span>;
    <span class="keyword">case</span> <span class="string">'delete'</span>: handleDelete(); <span class="keyword">break</span>;
    <span class="keyword">case</span> <span class="string">'download'</span>: handleDownload(); <span class="keyword">break</span>;
}
<span class="tag">?&gt;</span></pre>
                </div>
            </div>

            <h3 class="section-subtitle">Server Configuration (get-config.php) - Optional</h3>
            <div class="info-box info">
                <div class="info-box-title">Auto-Fetch Server Config</div>
                <p>If <code>configUrl</code> is set and <code>autoFetchConfig: true</code>, FileUploader will fetch server limits on initialization. This ensures client-side validation matches server-side limits.</p>
            </div>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">PHP</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="tag">&lt;?php</span>
<span class="comment">// api/get-config.php</span>
<span class="property">header</span>(<span class="string">'Content-Type: application/json'</span>);

<span class="comment">// Return server-side limits</span>
<span class="keyword">echo</span> <span class="property">json_encode</span>([
    <span class="string">'limits'</span> => [
        <span class="string">'perFileMaxSize'</span> => <span class="string">10485760</span>,       <span class="comment">// 10MB per file</span>
        <span class="string">'totalMaxSize'</span> => <span class="string">52428800</span>,         <span class="comment">// 50MB total</span>
        <span class="string">'maxFiles'</span> => <span class="string">10</span>
    ],
    <span class="string">'fileTypes'</span> => [
        <span class="string">'allowedExtensions'</span> => [<span class="string">'jpg'</span>, <span class="string">'jpeg'</span>, <span class="string">'png'</span>, <span class="string">'gif'</span>, <span class="string">'pdf'</span>, <span class="string">'doc'</span>, <span class="string">'docx'</span>],
        <span class="string">'allowedMimeTypes'</span> => [<span class="string">'image/*'</span>, <span class="string">'application/pdf'</span>, <span class="string">'application/msword'</span>]
    ]
]);
<span class="tag">?&gt;</span></pre>
                </div>
            </div>
        </section>

        <!-- Section: Configuration -->
        <section class="section" id="section-config" style="display: none;">
            <h2 class="section-title">Configuration Options</h2>
            <p class="section-desc">All configuration options are organized into logical groups. Pass these as nested objects when initializing FileUploader.</p>

            <h3 class="section-subtitle">urls - Server Endpoints</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>uploadUrl</code></td>
                        <td><code>string</code></td>
                        <td><code>"./upload.php"</code></td>
                        <td>Server endpoint for file uploads</td>
                    </tr>
                    <tr>
                        <td><code>deleteUrl</code></td>
                        <td><code>string</code></td>
                        <td><code>"./delete.php"</code></td>
                        <td>Server endpoint for file deletion</td>
                    </tr>
                    <tr>
                        <td><code>downloadAllUrl</code></td>
                        <td><code>string</code></td>
                        <td><code>"./download-all.php"</code></td>
                        <td>Server endpoint for bulk download (zip)</td>
                    </tr>
                    <tr>
                        <td><code>cleanupZipUrl</code></td>
                        <td><code>string</code></td>
                        <td><code>"./cleanup-zip.php"</code></td>
                        <td>Server endpoint for zip file cleanup</td>
                    </tr>
                    <tr>
                        <td><code>copyFileUrl</code></td>
                        <td><code>string</code></td>
                        <td><code>"./copy-file.php"</code></td>
                        <td>Server endpoint for cross-uploader file copying</td>
                    </tr>
                    <tr>
                        <td><code>configUrl</code></td>
                        <td><code>string</code></td>
                        <td><code>"./get-config.php"</code></td>
                        <td>Server endpoint for fetching server-side config</td>
                    </tr>
                    <tr>
                        <td><code>uploadDir</code></td>
                        <td><code>string</code></td>
                        <td><code>""</code></td>
                        <td>Server-side upload directory path</td>
                    </tr>
                    <tr>
                        <td><code>additionalData</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Data included in ALL POST requests</td>
                    </tr>
                    <tr>
                        <td><code>uploadData</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Data included only in upload requests</td>
                    </tr>
                    <tr>
                        <td><code>deleteData</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Data included only in delete requests</td>
                    </tr>
                    <tr>
                        <td><code>downloadData</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Data included only in download requests</td>
                    </tr>
                    <tr>
                        <td><code>copyData</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Data included only in copy file requests</td>
                    </tr>
                    <tr>
                        <td><code>cleanupData</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Data included only in cleanup zip requests</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">limits - File Size Limits</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>perFileMaxSize</code></td>
                        <td><code>number</code></td>
                        <td><code>10485760</code></td>
                        <td>Maximum size per file in bytes (10MB)</td>
                    </tr>
                    <tr>
                        <td><code>totalMaxSize</code></td>
                        <td><code>number</code></td>
                        <td><code>104857600</code></td>
                        <td>Maximum total size of all files in bytes (100MB)</td>
                    </tr>
                    <tr>
                        <td><code>maxFiles</code></td>
                        <td><code>number</code></td>
                        <td><code>10</code></td>
                        <td>Maximum number of files allowed</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">perTypeLimits - Per-Type Limits</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>perFileMaxSizePerType</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Max file size per type, e.g., <code>{ image: 5242880, video: 52428800 }</code></td>
                    </tr>
                    <tr>
                        <td><code>perTypeMaxTotalSize</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Max total size per type, e.g., <code>{ image: 20971520 }</code></td>
                    </tr>
                    <tr>
                        <td><code>perTypeMaxFileCount</code></td>
                        <td><code>object</code></td>
                        <td><code>{}</code></td>
                        <td>Max file count per type, e.g., <code>{ image: 5, document: 3 }</code></td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">fileTypes - Allowed File Types</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>allowedExtensions</code></td>
                        <td><code>array</code></td>
                        <td><code>[]</code></td>
                        <td>Allowed file extensions (empty = all allowed)</td>
                    </tr>
                    <tr>
                        <td><code>imageExtensions</code></td>
                        <td><code>array</code></td>
                        <td><code>["jpg", "jpeg", "png", "gif", "webp", "svg"]</code></td>
                        <td>Extensions classified as images</td>
                    </tr>
                    <tr>
                        <td><code>videoExtensions</code></td>
                        <td><code>array</code></td>
                        <td><code>["mp4", "mpeg", "mov", "avi", "webm"]</code></td>
                        <td>Extensions classified as video</td>
                    </tr>
                    <tr>
                        <td><code>audioExtensions</code></td>
                        <td><code>array</code></td>
                        <td><code>["mp3", "wav", "ogg", "webm", "aac", "m4a", "flac"]</code></td>
                        <td>Extensions classified as audio</td>
                    </tr>
                    <tr>
                        <td><code>documentExtensions</code></td>
                        <td><code>array</code></td>
                        <td><code>["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"]</code></td>
                        <td>Extensions classified as documents</td>
                    </tr>
                    <tr>
                        <td><code>archiveExtensions</code></td>
                        <td><code>array</code></td>
                        <td><code>["zip", "rar", "7z", "tar", "gz"]</code></td>
                        <td>Extensions classified as archives</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">theme - Visual Theme</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>theme</code></td>
                        <td><code>string</code></td>
                        <td><code>"auto"</code></td>
                        <td>Theme mode: <code>"auto"</code>, <code>"light"</code>, or <code>"dark"</code></td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">behavior - Upload Behavior</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>multiple</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Allow multiple file selection</td>
                    </tr>
                    <tr>
                        <td><code>autoFetchConfig</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Automatically fetch server config on init</td>
                    </tr>
                    <tr>
                        <td><code>confirmBeforeDelete</code></td>
                        <td><code>boolean</code></td>
                        <td><code>false</code></td>
                        <td>Show confirmation dialog before deleting files</td>
                    </tr>
                    <tr>
                        <td><code>preventDuplicates</code></td>
                        <td><code>boolean</code></td>
                        <td><code>false</code></td>
                        <td>Prevent uploading duplicate files</td>
                    </tr>
                    <tr>
                        <td><code>duplicateCheckBy</code></td>
                        <td><code>string</code></td>
                        <td><code>"name-size"</code></td>
                        <td>How to detect duplicates: <code>"name"</code>, <code>"size"</code>, or <code>"name-size"</code></td>
                    </tr>
                    <tr>
                        <td><code>cleanupOnUnload</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Delete uploaded files when page unloads</td>
                    </tr>
                    <tr>
                        <td><code>cleanupOnDestroy</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Delete uploaded files when uploader is destroyed</td>
                    </tr>
                    <tr>
                        <td><code>showUploadProgress</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show upload progress bar on file preview</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">limitsDisplay - Limits UI</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>showLimits</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show limits section</td>
                    </tr>
                    <tr>
                        <td><code>showProgressBar</code></td>
                        <td><code>boolean</code></td>
                        <td><code>false</code></td>
                        <td>Show overall progress bar</td>
                    </tr>
                    <tr>
                        <td><code>showTypeProgressBar</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show progress bar per file type</td>
                    </tr>
                    <tr>
                        <td><code>showPerFileLimit</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show per-file size limit</td>
                    </tr>
                    <tr>
                        <td><code>showTypeGroupSize</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show size used per type</td>
                    </tr>
                    <tr>
                        <td><code>showTypeGroupCount</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show file count per type</td>
                    </tr>
                    <tr>
                        <td><code>defaultLimitsView</code></td>
                        <td><code>string</code></td>
                        <td><code>"concise"</code></td>
                        <td>Default view mode: <code>"concise"</code> or <code>"detailed"</code></td>
                    </tr>
                    <tr>
                        <td><code>allowLimitsViewToggle</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Allow toggling between concise/detailed views</td>
                    </tr>
                    <tr>
                        <td><code>showLimitsToggle</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show limits toggle button</td>
                    </tr>
                    <tr>
                        <td><code>defaultLimitsVisible</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Limits visible by default</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">buttons - Button Configuration</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>showDownloadAllButton</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show "Download All" button</td>
                    </tr>
                    <tr>
                        <td><code>downloadAllButtonText</code></td>
                        <td><code>string</code></td>
                        <td><code>"Download All"</code></td>
                        <td>Text for download all button</td>
                    </tr>
                    <tr>
                        <td><code>showClearAllButton</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show "Clear All" button</td>
                    </tr>
                    <tr>
                        <td><code>clearAllButtonText</code></td>
                        <td><code>string</code></td>
                        <td><code>"Clear All"</code></td>
                        <td>Text for clear all button</td>
                    </tr>
                    <tr>
                        <td><code>buttonSize</code></td>
                        <td><code>string</code></td>
                        <td><code>"md"</code></td>
                        <td>Button size: <code>"sm"</code>, <code>"md"</code>, or <code>"lg"</code></td>
                    </tr>
                    <tr>
                        <td><code>collapsibleCaptureButtons</code></td>
                        <td><code>boolean</code></td>
                        <td><code>false</code></td>
                        <td>Collapse capture buttons into dropdown</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">mediaCapture - Screen/Audio/Video Capture</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>enableFullPageCapture</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enable full page screenshot capture</td>
                    </tr>
                    <tr>
                        <td><code>enableRegionCapture</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enable region selection screenshot</td>
                    </tr>
                    <tr>
                        <td><code>enableScreenCapture</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enable screen/window capture</td>
                    </tr>
                    <tr>
                        <td><code>enableVideoRecording</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enable video recording</td>
                    </tr>
                    <tr>
                        <td><code>enableAudioRecording</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enable audio-only recording</td>
                    </tr>
                    <tr>
                        <td><code>maxVideoRecordingDuration</code></td>
                        <td><code>number</code></td>
                        <td><code>300</code></td>
                        <td>Max video recording duration in seconds</td>
                    </tr>
                    <tr>
                        <td><code>maxAudioRecordingDuration</code></td>
                        <td><code>number</code></td>
                        <td><code>300</code></td>
                        <td>Max audio recording duration in seconds</td>
                    </tr>
                    <tr>
                        <td><code>recordingCountdownDuration</code></td>
                        <td><code>number</code></td>
                        <td><code>3</code></td>
                        <td>Countdown seconds before recording starts</td>
                    </tr>
                    <tr>
                        <td><code>enableMicrophoneAudio</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Include microphone in video recording</td>
                    </tr>
                    <tr>
                        <td><code>enableSystemAudio</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Include system audio in video recording</td>
                    </tr>
                    <tr>
                        <td><code>showRecordingTime</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show elapsed time during recording</td>
                    </tr>
                    <tr>
                        <td><code>showRecordingLimit</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show time limit during recording</td>
                    </tr>
                    <tr>
                        <td><code>showRecordingSize</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show approximate file size during recording</td>
                    </tr>
                    <tr>
                        <td><code>videoBitsPerSecond</code></td>
                        <td><code>number</code></td>
                        <td><code>2500000</code></td>
                        <td>Video bitrate (2.5 Mbps)</td>
                    </tr>
                    <tr>
                        <td><code>audioBitsPerSecond</code></td>
                        <td><code>number</code></td>
                        <td><code>128000</code></td>
                        <td>Audio bitrate (128 kbps)</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">carousel - File Preview Carousel</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>enableCarouselPreview</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enable carousel/gallery preview</td>
                    </tr>
                    <tr>
                        <td><code>carouselAutoPreload</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Automatically preload files for preview</td>
                    </tr>
                    <tr>
                        <td><code>carouselVisibleTypes</code></td>
                        <td><code>array</code></td>
                        <td><code>["image", "video", "audio", "pdf", "excel", "csv", "text"]</code></td>
                        <td>File types visible in carousel</td>
                    </tr>
                    <tr>
                        <td><code>carouselPreviewableTypes</code></td>
                        <td><code>array</code></td>
                        <td><code>["image", "video", "audio", "pdf", "csv", "excel", "text"]</code></td>
                        <td>File types that can be previewed</td>
                    </tr>
                    <tr>
                        <td><code>carouselMaxPreviewRows</code></td>
                        <td><code>number</code></td>
                        <td><code>100</code></td>
                        <td>Max rows to show for CSV/Excel preview</td>
                    </tr>
                    <tr>
                        <td><code>carouselMaxTextPreviewChars</code></td>
                        <td><code>number</code></td>
                        <td><code>50000</code></td>
                        <td>Max characters for text file preview</td>
                    </tr>
                    <tr>
                        <td><code>carouselShowDownloadButton</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Show download button in carousel</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">dragDrop - Cross-Uploader Drag & Drop</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>enableCrossUploaderDrag</code></td>
                        <td><code>boolean</code></td>
                        <td><code>true</code></td>
                        <td>Enable dragging files between uploaders</td>
                    </tr>
                    <tr>
                        <td><code>externalDropZone</code></td>
                        <td><code>element|string|null</code></td>
                        <td><code>null</code></td>
                        <td>External drop zone element or selector</td>
                    </tr>
                    <tr>
                        <td><code>externalDropZoneActiveClass</code></td>
                        <td><code>string</code></td>
                        <td><code>"media-hub-drop-active"</code></td>
                        <td>CSS class added when dragging over external zone</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">alerts - Toast Notifications</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>alertAnimation</code></td>
                        <td><code>string</code></td>
                        <td><code>"shake"</code></td>
                        <td>Alert animation type</td>
                    </tr>
                    <tr>
                        <td><code>alertDuration</code></td>
                        <td><code>number</code></td>
                        <td><code>5000</code></td>
                        <td>Alert display duration in milliseconds</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">existingFiles - Pre-load Files</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>existingFiles</code></td>
                        <td><code>array</code></td>
                        <td><code>[]</code></td>
                        <td>Array of existing file objects to load on init (for edit forms)</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">Complete Example</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
    <span class="property">urls</span>: {
        <span class="property">uploadUrl</span>: <span class="string">'/api/upload.php'</span>,
        <span class="property">deleteUrl</span>: <span class="string">'/api/delete.php'</span>,
        <span class="property">downloadAllUrl</span>: <span class="string">'/api/download-all.php'</span>,
        <span class="property">additionalData</span>: { <span class="property">csrf_token</span>: <span class="string">'abc123'</span> }
    },
    <span class="property">limits</span>: {
        <span class="property">perFileMaxSize</span>: <span class="number">10485760</span>,
        <span class="property">totalMaxSize</span>: <span class="number">52428800</span>,
        <span class="property">maxFiles</span>: <span class="number">10</span>
    },
    <span class="property">perTypeLimits</span>: {
        <span class="property">perFileMaxSizePerType</span>: { <span class="property">image</span>: <span class="number">5242880</span>, <span class="property">video</span>: <span class="number">52428800</span> },
        <span class="property">perTypeMaxFileCount</span>: { <span class="property">image</span>: <span class="number">5</span>, <span class="property">document</span>: <span class="number">3</span> }
    },
    <span class="property">fileTypes</span>: {
        <span class="property">allowedExtensions</span>: [<span class="string">'jpg'</span>, <span class="string">'png'</span>, <span class="string">'pdf'</span>, <span class="string">'mp4'</span>]
    },
    <span class="property">theme</span>: {
        <span class="property">theme</span>: <span class="string">'auto'</span>
    },
    <span class="property">behavior</span>: {
        <span class="property">multiple</span>: <span class="keyword">true</span>,
        <span class="property">confirmBeforeDelete</span>: <span class="keyword">true</span>,
        <span class="property">preventDuplicates</span>: <span class="keyword">true</span>
    },
    <span class="property">limitsDisplay</span>: {
        <span class="property">showLimits</span>: <span class="keyword">true</span>,
        <span class="property">defaultLimitsView</span>: <span class="string">'detailed'</span>
    },
    <span class="property">buttons</span>: {
        <span class="property">showDownloadAllButton</span>: <span class="keyword">true</span>,
        <span class="property">showClearAllButton</span>: <span class="keyword">true</span>
    },
    <span class="property">mediaCapture</span>: {
        <span class="property">enableVideoRecording</span>: <span class="keyword">true</span>,
        <span class="property">maxVideoRecordingDuration</span>: <span class="number">120</span>
    },
    <span class="property">carousel</span>: {
        <span class="property">enableCarouselPreview</span>: <span class="keyword">true</span>
    },
    <span class="property">callbacks</span>: {
        <span class="property">onUploadSuccess</span>: (file, response) => {
            console.log(<span class="string">'Uploaded:'</span>, file.name);
        },
        <span class="property">onUploadError</span>: (file, error) => {
            console.error(<span class="string">'Failed:'</span>, file.name, error);
        }
    }
});</pre>
                </div>
            </div>
        </section>

        <!-- Section: Events -->
        <section class="section" id="section-events" style="display: none;">
            <h2 class="section-title">Events & Callbacks</h2>
            <p class="section-desc">FileUploader provides callbacks for all major events. Use these to integrate with your application logic.</p>

            <h3 class="section-subtitle">Available Callbacks</h3>
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Callback</th>
                        <th>Parameters</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>onBeforeRequest</code></td>
                        <td><code>(requestType, data, context)</code></td>
                        <td>Called before each POST request. Modify or return data object.</td>
                    </tr>
                    <tr>
                        <td><code>onUploadStart</code></td>
                        <td><code>(fileObj)</code></td>
                        <td>Called when a file upload begins</td>
                    </tr>
                    <tr>
                        <td><code>onUploadSuccess</code></td>
                        <td><code>(fileObj, response)</code></td>
                        <td>Called when a file is successfully uploaded</td>
                    </tr>
                    <tr>
                        <td><code>onUploadError</code></td>
                        <td><code>(fileObj, error)</code></td>
                        <td>Called when a file upload fails</td>
                    </tr>
                    <tr>
                        <td><code>onDeleteSuccess</code></td>
                        <td><code>(fileObj, response)</code></td>
                        <td>Called when a file is successfully deleted</td>
                    </tr>
                    <tr>
                        <td><code>onDeleteError</code></td>
                        <td><code>(fileObj, error)</code></td>
                        <td>Called when file deletion fails</td>
                    </tr>
                    <tr>
                        <td><code>onConfigFetched</code></td>
                        <td><code>(config)</code></td>
                        <td>Called when server config is successfully fetched</td>
                    </tr>
                    <tr>
                        <td><code>onDuplicateFile</code></td>
                        <td><code>(fileObj, existingFile)</code></td>
                        <td>Called when a duplicate file is detected (if preventDuplicates is enabled)</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="section-subtitle">Event Usage Example</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#file-uploader'</span>, {
    <span class="comment">// URL Configuration</span>
    <span class="property">urls</span>: {
        <span class="property">uploadUrl</span>: <span class="string">'?urlq=files/upload'</span>,
        <span class="property">deleteUrl</span>: <span class="string">'?urlq=files/delete'</span>
    },

    <span class="comment">// Callbacks</span>
    <span class="property">callbacks</span>: {
        <span class="comment">// Called before each POST request (upload, delete, download, copy, cleanup)</span>
        <span class="property">onBeforeRequest</span>: (requestType, data, context) => {
            <span class="comment">// Add routing key based on request type</span>
            data.submit = requestType;
            <span class="comment">// Add dynamic CSRF token</span>
            data.csrf_token = document.querySelector(<span class="string">'meta[name="csrf-token"]'</span>)?.content;
            <span class="keyword">return</span> data;
        },

        <span class="comment">// Upload started</span>
        <span class="property">onUploadStart</span>: (fileObj) => {
            console.log(<span class="string">'Starting upload:'</span>, fileObj.name);
        },

        <span class="comment">// Upload succeeded</span>
        <span class="property">onUploadSuccess</span>: (fileObj, response) => {
            console.log(<span class="string">'Upload complete:'</span>, {
                <span class="property">name</span>: fileObj.name,
                <span class="property">size</span>: fileObj.size,
                <span class="property">serverResponse</span>: response
            });

            <span class="comment">// Store file ID for form submission</span>
            <span class="keyword">const</span> hiddenInput = document.createElement(<span class="string">'input'</span>);
            hiddenInput.type = <span class="string">'hidden'</span>;
            hiddenInput.name = <span class="string">'uploaded_files[]'</span>;
            hiddenInput.value = response.filename;
            document.querySelector(<span class="string">'form'</span>).appendChild(hiddenInput);
        },

        <span class="comment">// Upload failed</span>
        <span class="property">onUploadError</span>: (fileObj, error) => {
            console.error(<span class="string">'Upload failed:'</span>, fileObj.name, error);
        },

        <span class="comment">// Delete succeeded</span>
        <span class="property">onDeleteSuccess</span>: (fileObj, response) => {
            console.log(<span class="string">'File deleted:'</span>, fileObj.name);
        },

        <span class="comment">// Delete failed</span>
        <span class="property">onDeleteError</span>: (fileObj, error) => {
            console.error(<span class="string">'Delete failed:'</span>, fileObj.name, error);
        }
    }
});</pre>
                </div>
            </div>

            <h3 class="section-subtitle">File Object Structure</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">// The fileObj parameter in callbacks contains:</span>
{
    <span class="property">id</span>: <span class="string">"fu_1234567890"</span>,      <span class="comment">// Unique file ID</span>
    <span class="property">name</span>: <span class="string">"document.pdf"</span>,      <span class="comment">// Original filename</span>
    <span class="property">size</span>: <span class="string">1048576</span>,             <span class="comment">// File size in bytes</span>
    <span class="property">type</span>: <span class="string">"application/pdf"</span>,   <span class="comment">// MIME type</span>
    <span class="property">status</span>: <span class="string">"uploaded"</span>,        <span class="comment">// "pending", "uploading", "uploaded", "error"</span>
    <span class="property">progress</span>: <span class="string">100</span>,             <span class="comment">// Upload progress (0-100)</span>
    <span class="property">serverFilename</span>: <span class="string">"abc123.pdf"</span>,  <span class="comment">// Filename on server (after upload)</span>
    <span class="property">url</span>: <span class="string">"/uploads/abc123.pdf"</span>     <span class="comment">// URL to access file (after upload)</span>
}</pre>
                </div>
            </div>

            <h3 class="section-subtitle">Response Object Structure</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="comment">// The response parameter from onUploadSuccess:</span>
<span class="comment">// Note: File data MUST be wrapped in a 'file' object</span>
{
    <span class="property">success</span>: <span class="keyword">true</span>,
    <span class="property">file</span>: {
        <span class="property">filename</span>: <span class="string">"abc123.pdf"</span>,        <span class="comment">// Server-side filename</span>
        <span class="property">originalName</span>: <span class="string">"document.pdf"</span>,  <span class="comment">// Original filename</span>
        <span class="property">path</span>: <span class="string">"uploads/abc123.pdf"</span>,    <span class="comment">// Server path</span>
        <span class="property">url</span>: <span class="string">"/uploads/abc123.pdf"</span>     <span class="comment">// Public URL</span>
    }
}</pre>
                </div>
            </div>
        </section>

        <!-- Section: Live Demo -->
        <section class="section" id="section-demo" style="display: none;">
            <h2 class="section-title">Live Demo</h2>
            <p class="section-desc">Try the FileUploader in action. All events are logged below.</p>

            <div class="demo-container" id="demo-uploader"></div>

            <div class="demo-output">
                <div class="demo-output-title">Event Log</div>
                <pre id="event-log">Waiting for events...</pre>
            </div>

            <h3 class="section-subtitle">Demo Configuration</h3>
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">JavaScript</span>
                    <button class="code-copy" onclick="copyCode(this)">Copy</button>
                </div>
                <div class="code-content">
<pre><span class="keyword">const</span> uploader = <span class="keyword">new</span> <span class="function">FileUploader</span>(<span class="string">'#demo-uploader'</span>, {
    <span class="property">uploadUrl</span>: <span class="string">'/api/upload.php'</span>,
    <span class="property">deleteUrl</span>: <span class="string">'/api/delete.php'</span>,
    <span class="property">downloadAllUrl</span>: <span class="string">'/api/download-all.php'</span>,
    <span class="property">cleanupZipUrl</span>: <span class="string">'/api/cleanup-zip.php'</span>,
    <span class="property">configUrl</span>: <span class="string">'/api/get-config.php'</span>,
    <span class="property">multiple</span>: <span class="keyword">true</span>,
    <span class="property">showLimits</span>: <span class="keyword">true</span>,
    <span class="property">showDownloadAllButton</span>: <span class="keyword">true</span>,
    <span class="property">confirmBeforeDelete</span>: <span class="keyword">false</span>,
    <span class="property">onUploadStart</span>: (fileObj) => { <span class="comment">/* logged */</span> },
    <span class="property">onUploadSuccess</span>: (fileObj, response) => { <span class="comment">/* logged */</span> },
    <span class="property">onUploadError</span>: (fileObj, error) => { <span class="comment">/* logged */</span> },
    <span class="property">onDeleteSuccess</span>: (fileObj, response) => { <span class="comment">/* logged */</span> },
    <span class="property">onDeleteError</span>: (fileObj, error) => { <span class="comment">/* logged */</span> }
});</pre>
                </div>
            </div>

            <h3 class="section-subtitle">Public Methods</h3>
            <div class="grid-2" style="margin-bottom: 20px;">
                <button class="btn-demo" onclick="demoGetFiles()">getFiles() - Get All Files</button>
                <button class="btn-demo" onclick="demoGetUploaded()">getUploadedFiles() - Get Uploaded Only</button>
                <button class="btn-demo" onclick="demoClearAll()">clearAll() - Remove All Files</button>
                <button class="btn-demo" onclick="demoDestroy()">destroy() - Destroy Instance</button>
            </div>

            <style>
                .btn-demo {
                    padding: 12px 20px;
                    background: #334155;
                    border: 1px solid #475569;
                    border-radius: 8px;
                    color: #e2e8f0;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-demo:hover {
                    background: #475569;
                }
            </style>
        </section>
    </div>

    <!-- Scripts -->
    <script type="module" src="<?= asset('media-hub.js') ?>"></script>
    <script nomodule src="<?= asset('media-hub.js', 'nomodule') ?>"></script>

    <script type="module">
        import { FileUploader } from '<?= asset('media-hub.js') ?>';

        // Navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        const sections = {
            files: document.getElementById('section-files'),
            module: document.getElementById('section-module'),
            iife: document.getElementById('section-iife'),
            php: document.getElementById('section-php'),
            config: document.getElementById('section-config'),
            events: document.getElementById('section-events'),
            demo: document.getElementById('section-demo')
        };

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;

                // Update tabs
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update sections
                Object.values(sections).forEach(s => s.style.display = 'none');
                sections[section].style.display = 'block';

                // Initialize demo if needed
                if (section === 'demo' && !window.demoUploader) {
                    initDemo();
                }
            });
        });

        // Event logging
        const eventLog = document.getElementById('event-log');
        let logEntries = [];

        function logEvent(type, data) {
            const timestamp = new Date().toLocaleTimeString();
            const entry = `[${timestamp}] ${type}\n${JSON.stringify(data, null, 2)}`;
            logEntries.unshift(entry);
            if (logEntries.length > 20) logEntries.pop();
            eventLog.textContent = logEntries.join('\n\n');
        }

        // Initialize demo
        function initDemo() {
            window.demoUploader = new FileUploader('#demo-uploader', {
                urls: {
                    uploadUrl: '../../api/upload.php',
                    deleteUrl: '../../api/delete.php',
                    downloadAllUrl: '../../api/download-all.php',
                    cleanupZipUrl: '../../api/cleanup-zip.php',
                    configUrl: '../../api/get-config.php',
                },
                behavior: {
                    multiple: true,
                    confirmBeforeDelete: false,
                },
                limitsDisplay: {
                    showLimits: true,
                },
                buttons: {
                    showDownloadAllButton: true,
                },
                callbacks: {
                    onUploadStart: (fileObj) => {
                        logEvent('onUploadStart', { name: fileObj.name, size: fileObj.size, type: fileObj.type });
                    },
                    onUploadSuccess: (fileObj, response) => {
                        logEvent('onUploadSuccess', { file: fileObj.name, response });
                    },
                    onUploadError: (fileObj, error) => {
                        logEvent('onUploadError', { file: fileObj.name, error: error.message || error });
                    },
                    onDeleteSuccess: (fileObj, response) => {
                        logEvent('onDeleteSuccess', { file: fileObj.name, response });
                    },
                    onDeleteError: (fileObj, error) => {
                        logEvent('onDeleteError', { file: fileObj.name, error: error.message || error });
                    }
                }
            });

            logEvent('Initialized', { message: 'FileUploader ready' });
        }

        // Demo methods
        window.demoGetFiles = function() {
            if (!window.demoUploader) return;
            const files = window.demoUploader.getFiles();
            logEvent('getFiles()', files);
        };

        window.demoGetUploaded = function() {
            if (!window.demoUploader) return;
            const files = window.demoUploader.getUploadedFiles();
            logEvent('getUploadedFiles()', files);
        };

        window.demoClearAll = function() {
            if (!window.demoUploader) return;
            window.demoUploader.clearAll();
            logEvent('clearAll()', { message: 'All files cleared' });
        };

        window.demoDestroy = function() {
            if (!window.demoUploader) return;
            window.demoUploader.destroy();
            window.demoUploader = null;
            logEvent('destroy()', { message: 'Instance destroyed. Refresh to reinitialize.' });
        };
    </script>

    <script>
        // Copy code functionality
        function copyCode(btn) {
            const codeBlock = btn.closest('.code-block');
            const code = codeBlock.querySelector('pre').textContent;

            navigator.clipboard.writeText(code).then(() => {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            });
        }
    </script>
</body>
</html>
