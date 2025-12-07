<?php
include_once __DIR__ . '/includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Button Configuration Demo - File Uploader</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <style>
        body {
            background-color: #f8f9fa;
        }

        .demo-section {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .demo-title {
            color: #1a202c;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .demo-description {
            color: #718096;
            margin-bottom: 1.5rem;
        }

        .code-snippet {
            background: #1a202c;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
            overflow-x: auto;
            margin-top: 1rem;
        }

        .badge-custom {
            font-size: 0.75rem;
            padding: 0.35em 0.65em;
        }

        .fab-download {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #1976d2;
            color: white;
            border: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            z-index: 1000;
        }

        .fab-download:hover:not(:disabled) {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            transform: scale(1.1);
        }

        .fab-download:disabled {
            background-color: #ccc;
            cursor: not-allowed;
            box-shadow: none;
        }

        .nav-pills .nav-link.active {
            background-color: #4299e1;
        }
    </style>
</head>

<body>
    <div class="container py-5">
        <!-- Header -->
        <div class="text-center mb-5">
            <h1 class="display-4 fw-bold text-primary">
                <i class="bi bi-download"></i> Download Button Configuration
            </h1>
            <p class="lead text-muted">
                Explore different download button configurations with Bootstrap & standalone
            </p>
        </div>

        <!-- Tab Navigation -->
        <ul class="nav nav-pills nav-fill mb-4" id="demoTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="standalone-tab" data-bs-toggle="pill"
                    data-bs-target="#standalone" type="button">
                    Standalone
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="bootstrap3-tab" data-bs-toggle="pill"
                    data-bs-target="#bootstrap3" type="button">
                    Bootstrap 3
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="bootstrap4-tab" data-bs-toggle="pill"
                    data-bs-target="#bootstrap4" type="button">
                    Bootstrap 4
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="bootstrap5-tab" data-bs-toggle="pill"
                    data-bs-target="#bootstrap5" type="button">
                    Bootstrap 5
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="external-tab" data-bs-toggle="pill"
                    data-bs-target="#external" type="button">
                    External Button
                </button>
            </li>
        </ul>

        <div class="tab-content" id="demoTabsContent">
            <!-- Standalone Tab -->
            <div class="tab-pane fade show active" id="standalone" role="tabpanel">
                <div class="demo-section">
                    <h3 class="demo-title">1. Default Standalone Button</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Uses default FileUploader styling with custom text
                    </p>
                    <div id="uploader1"></div>
                    <div class="code-snippet">
new FileUploader('#uploader1', {
    showDownloadAllButton: true,
    downloadAllButtonText: '📥 Download All Files'
});</div>
                </div>

                <div class="demo-section">
                    <h3 class="demo-title">2. Custom Classes</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Internal button with custom CSS classes
                    </p>
                    <div id="uploader2"></div>
                    <div class="code-snippet">
new FileUploader('#uploader2', {
    showDownloadAllButton: true,
    downloadAllButtonText: 'Get Files',
    downloadAllButtonClasses: ['custom-btn', 'btn-large']
});</div>
                </div>
            </div>

            <!-- Bootstrap 3 Tab -->
            <div class="tab-pane fade" id="bootstrap3" role="tabpanel">
                <div class="demo-section">
                    <h3 class="demo-title">Bootstrap 3 - Primary Button</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Using Bootstrap 3 button classes
                    </p>
                    <div id="uploader-bs3"></div>
                    <div class="code-snippet">
new FileUploader('#uploader-bs3', {
    downloadAllButtonText: 'Download All',
    downloadAllButtonClasses: ['btn', 'btn-primary']
});</div>
                </div>

                <div class="demo-section">
                    <h3 class="demo-title">Bootstrap 3 - Success Button</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Compact button with success styling
                    </p>
                    <div id="uploader-bs3-block"></div>
                    <div class="code-snippet">
new FileUploader('#uploader-bs3-block', {
    downloadAllButtonText: 'Download All Files',
    downloadAllButtonClasses: ['btn', 'btn-success', 'btn-sm']
});</div>
                </div>
            </div>

            <!-- Bootstrap 4 Tab -->
            <div class="tab-pane fade" id="bootstrap4" role="tabpanel">
                <div class="demo-section">
                    <h3 class="demo-title">Bootstrap 4 - Info Button</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Using Bootstrap 4 info button styling
                    </p>
                    <div id="uploader-bs4"></div>
                    <div class="code-snippet">
new FileUploader('#uploader-bs4', {
    downloadAllButtonText: 'Download Package',
    downloadAllButtonClasses: ['btn', 'btn-info', 'btn-lg']
});</div>
                </div>

                <div class="demo-section">
                    <h3 class="demo-title">Bootstrap 4 - Outline Button</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Outline style with custom icon
                    </p>
                    <div id="uploader-bs4-outline"></div>
                    <div class="code-snippet">
new FileUploader('#uploader-bs4-outline', {
    downloadAllButtonText: '⬇️ Get All Files',
    downloadAllButtonClasses: ['btn', 'btn-outline-primary']
});</div>
                </div>
            </div>

            <!-- Bootstrap 5 Tab -->
            <div class="tab-pane fade" id="bootstrap5" role="tabpanel">
                <div class="demo-section">
                    <h3 class="demo-title">Bootstrap 5 - Primary Button</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Modern Bootstrap 5 button styling
                    </p>
                    <div id="uploader-bs5"></div>
                    <div class="code-snippet">
new FileUploader('#uploader-bs5', {
    downloadAllButtonText: 'Download All Files',
    downloadAllButtonClasses: ['btn', 'btn-primary', 'w-100']
});</div>
                </div>

                <div class="demo-section">
                    <h3 class="demo-title">Bootstrap 5 - Gradient Button</h3>
                    <p class="demo-description">
                        <span class="badge bg-success badge-custom">Internal Button</span>
                        Custom gradient with shadow
                    </p>
                    <div id="uploader-bs5-gradient"></div>
                    <div class="code-snippet">
new FileUploader('#uploader-bs5-gradient', {
    downloadAllButtonText: 'Download Collection',
    downloadAllButtonClasses: ['btn', 'btn-lg', 'w-100', 'shadow-sm',
                                'bg-gradient', 'text-white']
});</div>
                    <style>
                        .bg-gradient {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                        }
                    </style>
                </div>
            </div>

            <!-- External Button Tab -->
            <div class="tab-pane fade" id="external" role="tabpanel">
                <div class="demo-section">
                    <h3 class="demo-title">External Button - Card Footer</h3>
                    <p class="demo-description">
                        <span class="badge bg-info badge-custom">External Button</span>
                        Custom button positioned in card footer
                    </p>
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">Upload Center</h5>
                        </div>
                        <div class="card-body">
                            <div id="uploader-external"></div>
                        </div>
                        <div class="card-footer">
                            <button id="downloadBtn1" class="btn btn-success w-100">
                                <i class="bi bi-download"></i> Download All Files
                            </button>
                        </div>
                    </div>
                    <div class="code-snippet">
&lt;button id="downloadBtn1" class="btn btn-success w-100"&gt;
    &lt;i class="bi bi-download"&gt;&lt;/i&gt; Download All Files
&lt;/button&gt;

new FileUploader('#uploader-external', {
    showDownloadAllButton: false,
    downloadAllButtonElement: '#downloadBtn1'
});</div>
                </div>

                <div class="demo-section">
                    <h3 class="demo-title">External Button - Toolbar</h3>
                    <p class="demo-description">
                        <span class="badge bg-info badge-custom">External Button</span>
                        Button in a separate toolbar
                    </p>
                    <div id="uploader-toolbar"></div>
                    <div class="btn-toolbar mt-3" role="toolbar">
                        <div class="btn-group me-2" role="group">
                            <button id="downloadBtn2" class="btn btn-primary">
                                <i class="bi bi-cloud-download"></i> Download
                            </button>
                            <button id="clearBtn" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i> Clear
                            </button>
                        </div>
                    </div>
                    <div class="code-snippet">
new FileUploader('#uploader-toolbar', {
    showDownloadAllButton: false,
    downloadAllButtonElement: '#downloadBtn2'
});</div>
                </div>

                <div class="demo-section">
                    <h3 class="demo-title">External Button - Icon Only</h3>
                    <p class="demo-description">
                        <span class="badge bg-info badge-custom">External Button</span>
                        Compact icon-only button
                    </p>
                    <div class="row">
                        <div class="col-md-10">
                            <div id="uploader-icon"></div>
                        </div>
                        <div class="col-md-2 d-flex align-items-center justify-content-center">
                            <button id="downloadBtn3" class="btn btn-lg btn-primary rounded-circle"
                                title="Download All Files" style="width: 60px; height: 60px;">
                                <i class="bi bi-download fs-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="code-snippet">
new FileUploader('#uploader-icon', {
    showDownloadAllButton: false,
    downloadAllButtonElement: '#downloadBtn3'
});</div>
                </div>
            </div>
        </div>

        <!-- Floating Action Button (visible on all tabs) -->
        <button id="fab" class="fab-download" title="Download All Files">
            <i class="bi bi-cloud-arrow-down fs-4"></i>
        </button>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module">
        import { FileUploader } from '<?= asset('file-uploader.js') ?>';

        // Common options
        const commonOptions = {
            maxFiles: 5,
            maxFileSize: 5 * 1024 * 1024,
        };

        // Standalone demos
        const uploader1 = new FileUploader('#uploader1', {
            ...commonOptions,
            showDownloadAllButton: true,
            downloadAllButtonText: '📥 Download All Files'
        });

        const uploader2 = new FileUploader('#uploader2', {
            ...commonOptions,
            showDownloadAllButton: true,
            downloadAllButtonText: 'Get Files',
            downloadAllButtonClasses: ['custom-btn', 'btn-large']
        });

        // Bootstrap 3 demos
        const uploaderBs3 = new FileUploader('#uploader-bs3', {
            ...commonOptions,
            downloadAllButtonText: 'Download All',
            downloadAllButtonClasses: ['btn', 'btn-primary']
        });

        const uploaderBs3Block = new FileUploader('#uploader-bs3-block', {
            ...commonOptions,
            downloadAllButtonText: 'Download All Files',
            downloadAllButtonClasses: ['btn', 'btn-success', 'btn-block', 'btn-lg']
        });

        // Bootstrap 4 demos
        const uploaderBs4 = new FileUploader('#uploader-bs4', {
            ...commonOptions,
            downloadAllButtonText: 'Download Package',
            downloadAllButtonClasses: ['btn', 'btn-info', 'btn-lg']
        });

        const uploaderBs4Outline = new FileUploader('#uploader-bs4-outline', {
            ...commonOptions,
            downloadAllButtonText: '⬇️ Get All Files',
            downloadAllButtonClasses: ['btn', 'btn-outline-primary', 'btn-block']
        });

        // Bootstrap 5 demos
        const uploaderBs5 = new FileUploader('#uploader-bs5', {
            ...commonOptions,
            downloadAllButtonText: 'Download All Files',
            downloadAllButtonClasses: ['btn', 'btn-primary', 'w-100']
        });

        const uploaderBs5Gradient = new FileUploader('#uploader-bs5-gradient', {
            ...commonOptions,
            downloadAllButtonText: 'Download Collection',
            downloadAllButtonClasses: ['btn', 'btn-lg', 'w-100', 'shadow-sm', 'bg-gradient', 'text-white']
        });

        // External button demos
        const uploaderExternal = new FileUploader('#uploader-external', {
            ...commonOptions,
            showDownloadAllButton: false,
            downloadAllButtonElement: '#downloadBtn1'
        });

        const uploaderToolbar = new FileUploader('#uploader-toolbar', {
            ...commonOptions,
            showDownloadAllButton: false,
            downloadAllButtonElement: '#downloadBtn2'
        });

        const uploaderIcon = new FileUploader('#uploader-icon', {
            ...commonOptions,
            showDownloadAllButton: false,
            downloadAllButtonElement: '#downloadBtn3'
        });

        // Clear button handler
        document.getElementById('clearBtn').addEventListener('click', () => {
            uploaderToolbar.clear();
        });

        // Note: FAB button would need to be connected to one specific uploader
        // For demo purposes, we'll connect it to the currently active tab's uploader
        let currentUploader = uploader1;

        document.getElementById('fab').addEventListener('click', () => {
            if (currentUploader) {
                currentUploader.downloadAll();
            }
        });

        // Update FAB state based on current uploader
        const updateFAB = () => {
            const fab = document.getElementById('fab');
            const hasFiles = currentUploader && currentUploader.getUploadedFiles().length > 0;
            fab.disabled = !hasFiles;
        };

        // Update current uploader based on active tab
        document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const tabId = e.target.id;
                switch (tabId) {
                    case 'standalone-tab': currentUploader = uploader1; break;
                    case 'bootstrap3-tab': currentUploader = uploaderBs3; break;
                    case 'bootstrap4-tab': currentUploader = uploaderBs4; break;
                    case 'bootstrap5-tab': currentUploader = uploaderBs5; break;
                    case 'external-tab': currentUploader = uploaderExternal; break;
                }
                updateFAB();
            });
        });

        // Update FAB periodically
        setInterval(updateFAB, 500);
    </script>
</body>

</html>
