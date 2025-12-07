<?php
include_once __DIR__ . '/../../includes/functions.php';
$basePath = get_base_path();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modal File Uploader - Bootstrap 3 Demo</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
    <style>
        /* Detailed Preview Summary (shown below button) */
        .file-preview-summary {
            display: none;
            margin-top: 16px;
            padding: 16px 20px;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 10px;
        }

        .file-preview-summary.has-files {
            display: block;
        }

        .summary-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }

        .summary-header svg {
            width: 20px;
            height: 20px;
            color: #0284c7;
        }

        .summary-header>span {
            font-weight: 600;
            color: #0369a1;
            font-size: 15px;
        }

        .summary-actions {
            display: flex;
            gap: 8px;
            margin-left: auto;
        }

        .summary-action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .summary-action-btn svg {
            width: 18px;
            height: 18px;
        }

        .summary-action-btn.download-all-btn {
            background: #dbeafe;
            color: #2563eb;
        }

        .summary-action-btn.download-all-btn:hover {
            background: #bfdbfe;
            color: #1d4ed8;
        }

        .summary-action-btn.clear-all-btn {
            background: #fee2e2;
            color: #dc2626;
        }

        .summary-action-btn.clear-all-btn:hover {
            background: #fecaca;
            color: #b91c1c;
        }

        .summary-stats {
            display: flex;
            gap: 24px;
            margin-bottom: 12px;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .stat-value {
            font-weight: 600;
            color: #1e40af;
            font-size: 18px;
        }

        .stat-label {
            color: #64748b;
            font-size: 13px;
        }

        .file-types {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .file-type-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            background: white;
            border-radius: 20px;
            font-size: 12px;
            color: #475569;
            border: 1px solid #e2e8f0;
        }

        .file-type-badge .count {
            background: #3b82f6;
            color: white;
            padding: 1px 6px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
        }

        .edit-files-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 12px;
            color: #3b82f6;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
        }

        .edit-files-link:hover {
            text-decoration: underline;
        }

        .edit-files-link svg {
            width: 16px;
            height: 16px;
        }

        /* Minimal Preview (inline in button) */
        .upload-btn-wrapper {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-file-badge {
            display: none;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: #e0f2fe;
            border-radius: 20px;
            font-size: 13px;
            color: #0369a1;
            font-weight: 500;
        }

        .btn-file-badge.has-files {
            display: inline-flex;
        }

        .btn-file-badge .badge-separator {
            color: #94a3b8;
            font-weight: 400;
        }

        .btn-file-badge .badge-count {
            font-weight: 600;
        }

        .btn-file-badge .badge-size {
            font-weight: 500;
        }

        /* Fix for Bootstrap 3 modal-dialog-centered */
        .modal-dialog-centered {
            display: flex;
            align-items: center;
            min-height: calc(100% - 60px);
        }

        /* Demo section styling */
        .demo-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .demo-section h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #374151;
        }

        .demo-section .demo-label {
            display: inline-block;
            padding: 2px 8px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
    </style>
</head>

<body>
    <div class="demo-layout">
        <?php include __DIR__ . '/sidebar.php'; ?>

        <main class="demo-content">
            <div class="container" style="margin-top: 40px;">
                <div class="page-header">
                    <h1>Modal File Uploader <small>Bootstrap 3 Integration</small></h1>
                </div>

        <div class="alert alert-info">
            <h4>Two Display Modes</h4>
            <p>This demo shows two preview modes: <strong>Detailed</strong> (full summary below button) and <strong>Minimal</strong> (compact badge inline with button).</p>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">User Registration Form</h3>
            </div>
            <div class="panel-body">
                <form id="registrationForm">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" class="form-control" id="name" placeholder="Enter your name" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter email" required>
                    </div>

                    <!-- MINIMAL MODE DEMO -->
                    <div class="demo-section">
                        <span class="demo-label">Minimal Mode</span>
                        <h4>Documents (Minimal Preview)</h4>
                        <div class="form-group" style="margin-bottom: 0;">
                            <div class="upload-btn-wrapper">
                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#uploadModal1" id="openModalBtn1">
                                    <span class="glyphicon glyphicon-cloud-upload" style="margin-right: 6px;"></span>
                                    Upload Files
                                </button>
                                <span class="btn-file-badge" id="minimalBadge1">
                                    <span class="badge-count" id="minimalCount1">0</span> files
                                    <span class="badge-separator">|</span>
                                    <span class="badge-size" id="minimalSize1">0 KB</span>
                                </span>
                            </div>
                            <p class="help-block">File count and size shown inline with button</p>
                        </div>
                    </div>

                    <!-- DETAILED MODE DEMO -->
                    <div class="demo-section">
                        <span class="demo-label">Detailed Mode</span>
                        <h4>Portfolio (Detailed Preview)</h4>
                        <div class="form-group" style="margin-bottom: 0;">
                            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#uploadModal2" id="openModalBtn2">
                                <span class="glyphicon glyphicon-cloud-upload" style="margin-right: 6px;"></span>
                                Upload Files
                            </button>

                            <div class="file-preview-summary" id="filePreviewSummary2">
                                <div class="summary-header">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Files Ready</span>
                                    <div class="summary-actions">
                                        <button type="button" class="summary-action-btn download-all-btn" id="downloadAllBtn2" title="Download All">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                            </svg>
                                        </button>
                                        <button type="button" class="summary-action-btn clear-all-btn" id="clearAllBtn2" title="Clear All">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="summary-stats">
                                    <div class="stat-item">
                                        <span class="stat-value" id="summaryFileCount2">0</span>
                                        <span class="stat-label">files</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-value" id="summaryTotalSize2">0 KB</span>
                                        <span class="stat-label">total</span>
                                    </div>
                                </div>
                                <div class="file-types" id="summaryFileTypes2"></div>
                                <a class="edit-files-link" data-toggle="modal" data-target="#uploadModal2">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit files
                                </a>
                            </div>
                            <p class="help-block">Full preview with file types, download and clear actions</p>
                        </div>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn btn-success">Submit</button>
                        <button type="button" class="btn btn-default" onclick="resetForm()">Reset</button>
                    </div>
                </form>
            </div>
        </div>

            </div>
        </main>
    </div>

    <!-- Bootstrap 3 Modal 1 (Minimal) -->
    <div class="modal fade" id="uploadModal1" tabindex="-1" role="dialog" aria-labelledby="uploadModalLabel1">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title" id="uploadModalLabel1">Upload Documents</h4>
                </div>
                <div class="modal-body">
                    <div id="modalFileUploader1"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal">Done</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap 3 Modal 2 (Detailed) -->
    <div class="modal fade" id="uploadModal2" tabindex="-1" role="dialog" aria-labelledby="uploadModalLabel2">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title" id="uploadModalLabel2">Upload Portfolio</h4>
                </div>
                <div class="modal-body">
                    <div id="modalFileUploader2"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal">Done</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module">
        // Wait for FileUploader to be available on window (set by the module above)
        function waitForFileUploader(callback, maxAttempts = 50) {
            let attempts = 0;
            const check = () => {
                if (typeof window.FileUploader !== "undefined") {
                    callback();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(check, 100);
                } else {
                    console.error("FileUploader not available after waiting");
                }
            };
            check();
        }

        waitForFileUploader(initModalUploaders);

        function initModalUploaders() {
            // ============================================
            // MINIMAL MODE UPLOADER (Uploader 1)
            // ============================================
            const minimalBadge1 = document.getElementById('minimalBadge1');
            const minimalCount1 = document.getElementById('minimalCount1');
            const minimalSize1 = document.getElementById('minimalSize1');

            // Configuration for minimal preview
            const minimalConfig = {
                showFileCount: true, // Show file count in badge
                showTotalSize: true // Show total size in badge
            };

            const basePath = "<?= $basePath ?>";
            const uploader1 = new window.FileUploader('#modalFileUploader1', {
                multiple: true,
                uploadUrl: basePath + "/upload.php",
                deleteUrl: basePath + "/delete.php",
                downloadAllUrl: basePath + "/download-all.php",
                cleanupZipUrl: basePath + "/cleanup-zip.php",
                configUrl: basePath + "/get-config.php",
                showLimits: true,
                showLimitsToggle: true,
                defaultLimitsVisible: false,
                preventDuplicates: true,
                enableCarouselPreview: true,
                carouselAutoPreload: true,
                carouselEnableManualLoading: false
            });

            // Update minimal badge when modal is hidden
            $('#uploadModal1').on('hidden.bs.modal', updateMinimalPreview);

            function updateMinimalPreview() {
                const files = uploader1.getFiles();

                if (files.length === 0) {
                    minimalBadge1.classList.remove('has-files');
                    return;
                }

                minimalBadge1.classList.add('has-files');

                // Build badge content based on config
                let badgeHTML = '';

                if (minimalConfig.showFileCount) {
                    badgeHTML += `<span class="badge-count">${files.length}</span> file${files.length !== 1 ? 's' : ''}`;
                }

                if (minimalConfig.showFileCount && minimalConfig.showTotalSize) {
                    badgeHTML += '<span class="badge-separator">|</span>';
                }

                if (minimalConfig.showTotalSize) {
                    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
                    badgeHTML += `<span class="badge-size">${formatFileSize(totalSize)}</span>`;
                }

                minimalBadge1.innerHTML = badgeHTML;
            }

            // ============================================
            // DETAILED MODE UPLOADER (Uploader 2)
            // ============================================
            const filePreviewSummary2 = document.getElementById('filePreviewSummary2');
            const downloadAllBtn2 = document.getElementById('downloadAllBtn2');
            const clearAllBtn2 = document.getElementById('clearAllBtn2');

            const uploader2 = new window.FileUploader('#modalFileUploader2', {
                multiple: true,
                uploadUrl: basePath + "/upload.php",
                deleteUrl: basePath + "/delete.php",
                downloadAllUrl: basePath + "/download-all.php",
                cleanupZipUrl: basePath + "/cleanup-zip.php",
                configUrl: basePath + "/get-config.php",
                showLimits: true,
                showLimitsToggle: true,
                defaultLimitsVisible: false,
                preventDuplicates: true,
                enableCarouselPreview: true,
                carouselAutoPreload: true,
                carouselEnableManualLoading: false
            });

            // Update summary when modal is hidden
            $('#uploadModal2').on('hidden.bs.modal', updateDetailedPreview);

            downloadAllBtn2.addEventListener('click', () => uploader2.downloadAll());
            clearAllBtn2.addEventListener('click', () => {
                if (confirm('Are you sure you want to remove all files?')) {
                    uploader2.clear();
                    updateDetailedPreview();
                }
            });

            function updateDetailedPreview() {
                const files = uploader2.getFiles();
                if (files.length === 0) {
                    filePreviewSummary2.classList.remove('has-files');
                    return;
                }
                filePreviewSummary2.classList.add('has-files');
                document.getElementById('summaryFileCount2').textContent = files.length;
                const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
                document.getElementById('summaryTotalSize2').textContent = formatFileSize(totalSize);
                const typeGroups = {};
                files.forEach(f => {
                    const ext = f.name.split('.').pop().toLowerCase();
                    const type = getFileTypeLabel(ext);
                    typeGroups[type] = (typeGroups[type] || 0) + 1;
                });
                document.getElementById('summaryFileTypes2').innerHTML = Object.entries(typeGroups)
                    .map(([type, count]) => `<span class="file-type-badge">${type}<span class="count">${count}</span></span>`)
                    .join('');
            }

            // ============================================
            // SHARED UTILITIES
            // ============================================
            function formatFileSize(bytes) {
                if (bytes === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
            }

            function getFileTypeLabel(ext) {
                const typeMap = {
                    'jpg': 'Images',
                    'jpeg': 'Images',
                    'png': 'Images',
                    'gif': 'Images',
                    'webp': 'Images',
                    'mp4': 'Videos',
                    'webm': 'Videos',
                    'avi': 'Videos',
                    'mov': 'Videos',
                    'mp3': 'Audio',
                    'wav': 'Audio',
                    'ogg': 'Audio',
                    'pdf': 'PDFs',
                    'doc': 'Documents',
                    'docx': 'Documents',
                    'xls': 'Spreadsheets',
                    'xlsx': 'Spreadsheets',
                    'csv': 'Spreadsheets',
                    'zip': 'Archives',
                    'rar': 'Archives'
                };
                return typeMap[ext] || 'Files';
            }

            // Initial updates
            updateMinimalPreview();
            updateDetailedPreview();

            // Reset form function
            window.resetForm = function() {
                if (confirm('Reset form and clear all files?')) {
                    document.getElementById('registrationForm').reset();
                    uploader1.clear();
                    uploader2.clear();
                    updateMinimalPreview();
                    updateDetailedPreview();
                }
            };
        }
    </script>
</body>

</html>