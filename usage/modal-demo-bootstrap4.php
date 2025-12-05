<?php
include_once __DIR__ . '/../includes/functions.php';
$basePath = get_base_path();
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modal File Uploader - Bootstrap 4 Demo</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <style>
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
        .summary-header span {
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
    </style>
</head>

<body>
    <div class="container mt-5">
        <div class="jumbotron">
            <h1 class="display-4">Modal File Uploader</h1>
            <p class="lead">Bootstrap 4 Integration with Modal Interface</p>
            <hr class="my-4">
            <p>Click the button to open a modal with file uploader. Files persist between modal opens.</p>
        </div>

        <div class="card mb-4">
            <div class="card-header">
                <h3 class="mb-0">Project Submission</h3>
            </div>
            <div class="card-body">
                <form id="submissionForm">
                    <div class="form-group">
                        <label for="projectName">Project Name</label>
                        <input type="text" class="form-control" id="projectName" placeholder="Enter project name" required>
                    </div>

                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea class="form-control" id="description" rows="3" placeholder="Enter project description"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Project Files</label>
                        <div>
                            <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#uploadModal">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="mr-2" viewBox="0 0 16 16" style="vertical-align: -2px;">
                                    <path fill-rule="evenodd" d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 1-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383"/>
                                    <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708z"/>
                                </svg>
                                Upload Files
                            </button>

                            <div class="file-preview-summary" id="filePreviewSummary">
                                <div class="summary-header">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Files Ready</span>
                                    <div class="summary-actions">
                                        <button type="button" class="summary-action-btn download-all-btn" id="downloadAllBtn" title="Download All">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                            </svg>
                                        </button>
                                        <button type="button" class="summary-action-btn clear-all-btn" id="clearAllBtn" title="Clear All">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="summary-stats">
                                    <div class="stat-item">
                                        <span class="stat-value" id="summaryFileCount">0</span>
                                        <span class="stat-label">files</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-value" id="summaryTotalSize">0 KB</span>
                                        <span class="stat-label">total</span>
                                    </div>
                                </div>
                                <div class="file-types" id="summaryFileTypes"></div>
                                <a class="edit-files-link" data-toggle="modal" data-target="#uploadModal">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit files
                                </a>
                            </div>
                        </div>
                        <small class="form-text text-muted">Upload project files, images, or documents</small>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Submit Project</button>
                        <button type="button" class="btn btn-secondary" onclick="resetForm()">Reset</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header">Other Demos</div>
            <div class="card-body">
                <a href="../index.php" class="btn btn-sm btn-outline-primary">Standalone</a>
                <a href="../modal_file_uploader.php" class="btn btn-sm btn-outline-primary">Modal (Standalone)</a>
                <a href="modal-demo-bootstrap3.php" class="btn btn-sm btn-outline-primary">Modal BS3</a>
                <a href="modal-demo-bootstrap5.php" class="btn btn-sm btn-outline-primary">Modal BS5</a>
            </div>
        </div>
    </div>

    <!-- Bootstrap 4 Modal -->
    <div class="modal fade" id="uploadModal" tabindex="-1" role="dialog" aria-labelledby="uploadModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="uploadModalLabel">Upload Files</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="documentTitle">Document Title</label>
                        <input type="text" class="form-control" id="documentTitle" placeholder="Enter a title for your submission">
                    </div>
                    <div class="form-group">
                        <label for="documentDescription">Description (optional)</label>
                        <textarea class="form-control" id="documentDescription" rows="2" placeholder="Add any notes..."></textarea>
                    </div>
                    <label class="text-muted text-uppercase small">Attachments</label>
                    <div id="modalFileUploader"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="saveModalBtn">Done</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

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

        waitForFileUploader(initModalUploader);

        function initModalUploader() {
            const filePreviewSummary = document.getElementById('filePreviewSummary');
            const downloadAllBtn = document.getElementById('downloadAllBtn');
            const clearAllBtn = document.getElementById('clearAllBtn');

            const basePath = "<?= $basePath ?>";
            const uploader = new window.FileUploader('#modalFileUploader', {
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

            // Update summary when modal is hidden (Bootstrap 4 event)
            $('#uploadModal').on('hidden.bs.modal', updatePreviewSummary);

            downloadAllBtn.addEventListener('click', () => uploader.downloadAll());
            clearAllBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to remove all files?')) {
                    uploader.clear();
                    updatePreviewSummary();
                }
            });

            function updatePreviewSummary() {
                const files = uploader.getFiles();
                if (files.length === 0) {
                    filePreviewSummary.classList.remove('has-files');
                    return;
                }
                filePreviewSummary.classList.add('has-files');
                document.getElementById('summaryFileCount').textContent = files.length;
                const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
                document.getElementById('summaryTotalSize').textContent = formatFileSize(totalSize);
                const typeGroups = {};
                files.forEach(f => {
                    const ext = f.name.split('.').pop().toLowerCase();
                    const type = getFileTypeLabel(ext);
                    typeGroups[type] = (typeGroups[type] || 0) + 1;
                });
                document.getElementById('summaryFileTypes').innerHTML = Object.entries(typeGroups)
                    .map(([type, count]) => `<span class="file-type-badge">${type}<span class="count">${count}</span></span>`)
                    .join('');
            }

            function formatFileSize(bytes) {
                if (bytes === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
            }

            function getFileTypeLabel(ext) {
                const typeMap = {
                    'jpg': 'Images', 'jpeg': 'Images', 'png': 'Images', 'gif': 'Images', 'webp': 'Images',
                    'mp4': 'Videos', 'webm': 'Videos', 'avi': 'Videos', 'mov': 'Videos',
                    'mp3': 'Audio', 'wav': 'Audio', 'ogg': 'Audio',
                    'pdf': 'PDFs', 'doc': 'Documents', 'docx': 'Documents',
                    'xls': 'Spreadsheets', 'xlsx': 'Spreadsheets', 'csv': 'Spreadsheets',
                    'zip': 'Archives', 'rar': 'Archives'
                };
                return typeMap[ext] || 'Files';
            }

            updatePreviewSummary();

            window.resetForm = function() {
                if (confirm('Reset form and clear all files?')) {
                    document.getElementById('submissionForm').reset();
                    uploader.clear();
                    updatePreviewSummary();
                }
            };
        }
    </script>
</body>

</html>
