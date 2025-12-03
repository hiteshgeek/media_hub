/**
 * FileUploader Class
 * A flexible file uploader with drag & drop, preview, and AJAX upload
 * Compatible with Bootstrap 3-5 and standalone usage
 */
class FileUploader {
    constructor(element, options = {}) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;

        if (!this.element) {
            console.error('FileUploader: Element not found');
            return;
        }

        // Default options
        this.options = {
            uploadUrl: 'upload.php',
            deleteUrl: 'delete.php',
            downloadAllUrl: 'download-all.php',
            cleanupZipUrl: 'cleanup-zip.php',
            configUrl: 'get-config.php',
            allowedExtensions: [],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxFileSizeDisplay: '10MB',
            fileTypeSizeLimits: {},
            fileTypeSizeLimitsDisplay: {},
            totalSizeLimit: 100 * 1024 * 1024, // 100MB
            totalSizeLimitDisplay: '100MB',
            maxFiles: 10,
            imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            videoExtensions: ['mp4', 'mpeg', 'mov', 'avi', 'webm'],
            documentExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
            archiveExtensions: ['zip', 'rar', '7z'],
            multiple: true,
            autoFetchConfig: true,
            showLimits: true,
            onUploadStart: null,
            onUploadSuccess: null,
            onUploadError: null,
            onDeleteSuccess: null,
            onDeleteError: null,
            ...options
        };

        this.files = [];
        this.init();
    }

    async init() {
        // Fetch config from server if enabled
        if (this.options.autoFetchConfig) {
            await this.fetchConfig();
        }

        this.createStructure();
        this.attachEvents();
    }

    async fetchConfig() {
        try {
            const response = await fetch(this.options.configUrl);
            const config = await response.json();

            // Merge server config with options
            this.options = {
                ...this.options,
                ...config
            };
        } catch (error) {
            console.warn('FileUploader: Could not fetch config from server, using default options');
        }
    }

    createStructure() {
        // Create wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'file-uploader-wrapper';

        // Create drop zone
        this.dropZone = document.createElement('div');
        this.dropZone.className = 'file-uploader-dropzone';
        this.dropZone.innerHTML = `
            <div class="file-uploader-dropzone-content">
                <svg class="file-uploader-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p class="file-uploader-text">Drag & drop files here or click to browse</p>
                <p class="file-uploader-subtext">Maximum file size: ${this.options.maxFileSizeDisplay}</p>
            </div>
        `;

        // Create file input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.className = 'file-uploader-input';
        this.fileInput.multiple = this.options.multiple;

        if (this.options.allowedExtensions.length > 0) {
            this.fileInput.accept = this.options.allowedExtensions.map(ext => '.' + ext).join(',');
        }

        // Create limits display (if enabled)
        if (this.options.showLimits) {
            this.limitsContainer = document.createElement('div');
            this.limitsContainer.className = 'file-uploader-limits';
            this.updateLimitsDisplay();
        }

        // Create preview container
        this.previewContainer = document.createElement('div');
        this.previewContainer.className = 'file-uploader-preview-container';

        // Create download all button
        this.downloadAllBtn = document.createElement('button');
        this.downloadAllBtn.type = 'button';
        this.downloadAllBtn.className = 'file-uploader-download-all';
        this.downloadAllBtn.style.display = 'none';
        this.downloadAllBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download All</span>
        `;
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());

        // Append elements
        this.dropZone.appendChild(this.fileInput);
        this.wrapper.appendChild(this.dropZone);
        if (this.options.showLimits) {
            this.wrapper.appendChild(this.limitsContainer);
        }
        this.wrapper.appendChild(this.downloadAllBtn);
        this.wrapper.appendChild(this.previewContainer);
        this.element.appendChild(this.wrapper);
    }

    updateLimitsDisplay() {
        if (!this.limitsContainer) return;

        const totalSize = this.getTotalSize();
        const totalSizeFormatted = this.formatFileSize(totalSize);
        const fileCount = this.files.filter(f => f.uploaded).length;

        let limitsHTML = '<div class="file-uploader-limits-grid">';

        // File type specific limits
        const typeLimits = this.options.fileTypeSizeLimitsDisplay;
        if (typeLimits && Object.keys(typeLimits).length > 0) {
            for (const [type, limit] of Object.entries(typeLimits)) {
                limitsHTML += `
                    <div class="file-uploader-limit-item">
                        <span class="file-uploader-limit-label">${this.capitalizeFirst(type)}:</span>
                        <span class="file-uploader-limit-value">${limit}</span>
                    </div>
                `;
            }
        }

        // Total size limit
        limitsHTML += `
            <div class="file-uploader-limit-item file-uploader-limit-highlight">
                <span class="file-uploader-limit-label">Total Size:</span>
                <span class="file-uploader-limit-value">${totalSizeFormatted} / ${this.options.totalSizeLimitDisplay}</span>
            </div>
        `;

        // Max files limit
        limitsHTML += `
            <div class="file-uploader-limit-item file-uploader-limit-highlight">
                <span class="file-uploader-limit-label">Files:</span>
                <span class="file-uploader-limit-value">${fileCount} / ${this.options.maxFiles}</span>
            </div>
        `;

        limitsHTML += '</div>';

        this.limitsContainer.innerHTML = limitsHTML;

        // Show/hide download all button
        if (this.downloadAllBtn) {
            this.downloadAllBtn.style.display = fileCount > 0 ? 'flex' : 'none';
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    attachEvents() {
        // Click to browse
        this.dropZone.addEventListener('click', (e) => {
            if (e.target !== this.fileInput) {
                this.fileInput.click();
            }
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag & drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('file-uploader-dragover');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('file-uploader-dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('file-uploader-dragover');
            this.handleFiles(e.dataTransfer.files);
        });
    }

    handleFiles(fileList) {
        const files = Array.from(fileList);

        files.forEach(file => {
            // Validate file
            const validation = this.validateFile(file);

            if (!validation.valid) {
                // Show error message with file name - do NOT create preview
                this.showError(validation.error);
                return; // Skip this file completely
            }

            // Create file object
            const fileObj = {
                id: Date.now() + Math.random(),
                file: file,
                name: file.name,
                size: file.size,
                type: file.type,
                extension: this.getFileExtension(file.name),
                uploaded: false,
                uploading: false,
                error: null,
                serverFilename: null
            };

            this.files.push(fileObj);
            this.createPreview(fileObj);
            this.uploadFile(fileObj);
        });

        // Clear input
        this.fileInput.value = '';
    }

    validateFile(file) {
        // Check max files limit
        const uploadedCount = this.files.filter(f => f.uploaded).length;
        if (uploadedCount >= this.options.maxFiles) {
            return {
                valid: false,
                error: `Maximum number of files (${this.options.maxFiles}) reached. Please delete some files before uploading more.`
            };
        }

        // Check file extension
        const extension = this.getFileExtension(file.name);
        if (this.options.allowedExtensions.length > 0 &&
            !this.options.allowedExtensions.includes(extension)) {
            const allowedList = this.options.allowedExtensions.slice(0, 5).map(ext => `.${ext}`).join(', ');
            const moreText = this.options.allowedExtensions.length > 5 ? ` and ${this.options.allowedExtensions.length - 5} more` : '';
            return {
                valid: false,
                error: `"${file.name}" file type is not allowed. Allowed types: ${allowedList}${moreText}.`
            };
        }

        // Check per-file-type size limit
        const fileType = this.getFileType(extension);
        const typeLimit = this.options.fileTypeSizeLimits[fileType];
        if (typeLimit && file.size > typeLimit) {
            const limitDisplay = this.options.fileTypeSizeLimitsDisplay[fileType];
            return {
                valid: false,
                error: `"${file.name}" exceeds the ${fileType} file size limit of ${limitDisplay}.`
            };
        }

        // Check general file size
        if (file.size > this.options.maxFileSize) {
            return {
                valid: false,
                error: `"${file.name}" is too large. Maximum file size is ${this.options.maxFileSizeDisplay}.`
            };
        }

        // Check total size limit
        const currentTotalSize = this.getTotalSize();
        if (currentTotalSize + file.size > this.options.totalSizeLimit) {
            const remaining = this.options.totalSizeLimit - currentTotalSize;
            return {
                valid: false,
                error: `Adding "${file.name}" would exceed the total size limit of ${this.options.totalSizeLimitDisplay}. Available: ${this.formatFileSize(remaining)}.`
            };
        }

        return { valid: true };
    }

    getTotalSize() {
        return this.files
            .filter(f => f.uploaded)
            .reduce((total, f) => total + f.size, 0);
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    getFileType(extension) {
        if (this.options.imageExtensions.includes(extension)) {
            return 'image';
        } else if (this.options.videoExtensions.includes(extension)) {
            return 'video';
        } else if (this.options.documentExtensions.includes(extension)) {
            return 'document';
        } else if (this.options.archiveExtensions.includes(extension)) {
            return 'archive';
        }
        return 'other';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    createPreview(fileObj) {
        const fileType = this.getFileType(fileObj.extension);

        const preview = document.createElement('div');
        preview.className = 'file-uploader-preview';
        preview.dataset.fileId = fileObj.id;

        const previewInner = document.createElement('div');
        previewInner.className = 'file-uploader-preview-inner';

        // Create preview content based on file type
        let previewContent = '';

        if (fileType === 'image') {
            const objectUrl = URL.createObjectURL(fileObj.file);
            previewContent = `<img src="${objectUrl}" alt="${fileObj.name}" class="file-uploader-preview-image">`;
        } else if (fileType === 'video') {
            const objectUrl = URL.createObjectURL(fileObj.file);
            previewContent = `<video src="${objectUrl}" class="file-uploader-preview-video" controls></video>`;
        } else {
            previewContent = `
                <div class="file-uploader-preview-file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <span class="file-uploader-extension">.${fileObj.extension}</span>
                </div>
            `;
        }

        previewInner.innerHTML = `
            ${previewContent}
            <div class="file-uploader-preview-overlay">
                <div class="file-uploader-spinner"></div>
            </div>
        `;

        const info = document.createElement('div');
        info.className = 'file-uploader-info';
        info.innerHTML = `
            <div class="file-uploader-info-text">
                <div class="file-uploader-filename" title="${fileObj.name}">${fileObj.name}</div>
                <div class="file-uploader-meta">
                    <span class="file-uploader-type">${fileObj.extension.toUpperCase()}</span>
                    <span class="file-uploader-size">${this.formatFileSize(fileObj.size)}</span>
                </div>
            </div>
            <div class="file-uploader-actions">
                <button type="button" class="file-uploader-download" data-file-id="${fileObj.id}" title="Download file" style="display: none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
                <button type="button" class="file-uploader-delete" data-file-id="${fileObj.id}" title="Delete file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        preview.appendChild(previewInner);
        preview.appendChild(info);
        this.previewContainer.appendChild(preview);

        // Attach delete event
        const deleteBtn = preview.querySelector('.file-uploader-delete');
        deleteBtn.addEventListener('click', () => this.deleteFile(fileObj.id));

        // Attach download event (will be shown after upload completes)
        const downloadBtn = preview.querySelector('.file-uploader-download');
        downloadBtn.addEventListener('click', () => this.downloadFile(fileObj.id));

        fileObj.previewElement = preview;
        fileObj.downloadBtn = downloadBtn;
    }

    async uploadFile(fileObj) {
        fileObj.uploading = true;
        this.updatePreviewState(fileObj, 'uploading');

        if (this.options.onUploadStart) {
            this.options.onUploadStart(fileObj);
        }

        const formData = new FormData();
        formData.append('file', fileObj.file);

        try {
            const response = await fetch(this.options.uploadUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                fileObj.uploaded = true;
                fileObj.uploading = false;
                fileObj.serverFilename = result.file.filename;
                fileObj.serverData = result.file;

                this.updatePreviewState(fileObj, 'success');

                // Show download button after successful upload
                if (fileObj.downloadBtn) {
                    fileObj.downloadBtn.style.display = 'flex';
                }

                // Update limits display
                this.updateLimitsDisplay();

                if (this.options.onUploadSuccess) {
                    this.options.onUploadSuccess(fileObj, result);
                }
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            fileObj.uploading = false;
            fileObj.error = error.message;

            // Remove the preview since upload failed
            if (fileObj.previewElement) {
                fileObj.previewElement.remove();
            }

            // Remove from files array
            this.files = this.files.filter(f => f.id !== fileObj.id);

            // Show error message
            this.showError(error.message);

            if (this.options.onUploadError) {
                this.options.onUploadError(fileObj, error);
            }
        }
    }

    updatePreviewState(fileObj, state) {
        if (!fileObj.previewElement) return;

        const overlay = fileObj.previewElement.querySelector('.file-uploader-preview-overlay');

        fileObj.previewElement.classList.remove('uploading', 'success', 'error');

        if (state === 'uploading') {
            fileObj.previewElement.classList.add('uploading');
            overlay.style.display = 'flex';
        } else if (state === 'success') {
            fileObj.previewElement.classList.add('success');
            overlay.style.display = 'none';
        } else if (state === 'error') {
            fileObj.previewElement.classList.add('error');
            overlay.style.display = 'none';
        }
    }

    async deleteFile(fileId) {
        const fileObj = this.files.find(f => f.id === fileId);
        if (!fileObj) return;

        // If file was uploaded to server, delete from server
        if (fileObj.uploaded && fileObj.serverFilename) {
            try {
                const response = await fetch(this.options.deleteUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        filename: fileObj.serverFilename
                    })
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'Delete failed');
                }

                if (this.options.onDeleteSuccess) {
                    this.options.onDeleteSuccess(fileObj, result);
                }
            } catch (error) {
                this.showError(`Failed to delete ${fileObj.name}: ${error.message}`);

                if (this.options.onDeleteError) {
                    this.options.onDeleteError(fileObj, error);
                }
                return;
            }
        }

        // Remove from UI
        if (fileObj.previewElement) {
            fileObj.previewElement.remove();
        }

        // Remove from files array
        this.files = this.files.filter(f => f.id !== fileId);

        // Update limits display
        this.updateLimitsDisplay();
    }

    downloadFile(fileId) {
        const fileObj = this.files.find(f => f.id === fileId);
        if (!fileObj || !fileObj.uploaded) return;

        // Create download link
        const downloadUrl = fileObj.serverData?.url || `uploads/${fileObj.serverFilename}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileObj.name; // Use original filename for download
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showError(message) {
        console.error('FileUploader:', message);

        // Create error message with icon
        const errorDiv = document.createElement('div');
        errorDiv.className = 'file-uploader-error';
        errorDiv.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="file-uploader-error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${message}</span>
        `;

        this.wrapper.insertBefore(errorDiv, this.previewContainer);

        // Auto-remove after 6 seconds
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }, 6000);
    }

    getFiles() {
        return this.files;
    }

    getUploadedFiles() {
        return this.files.filter(f => f.uploaded);
    }

    getUploadedFileNames() {
        // Returns array of server filenames for form submission
        return this.files
            .filter(f => f.uploaded)
            .map(f => f.serverFilename);
    }

    getUploadedFilesData() {
        // Returns detailed data for form submission
        return this.files
            .filter(f => f.uploaded)
            .map(f => ({
                originalName: f.name,
                serverFilename: f.serverFilename,
                size: f.size,
                type: f.type,
                extension: f.extension,
                url: f.serverData?.url || `uploads/${f.serverFilename}`
            }));
    }

    async downloadAll() {
        const uploadedFiles = this.getUploadedFilesData();

        if (uploadedFiles.length === 0) {
            this.showError('No files to download');
            return;
        }

        console.log('Downloading files:', uploadedFiles);

        // Show loading state
        const originalHTML = this.downloadAllBtn.innerHTML;
        this.downloadAllBtn.disabled = true;
        this.downloadAllBtn.innerHTML = `
            <div class="file-uploader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            <span>Preparing...</span>
        `;

        try {
            const requestBody = { files: uploadedFiles };
            console.log('Sending request to:', this.options.downloadAllUrl);
            console.log('Request body:', requestBody);

            const response = await fetch(this.options.downloadAllUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            const responseText = await response.text();
            console.log('Response text:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid JSON response: ' + responseText.substring(0, 200));
            }

            if (!result.success) {
                throw new Error(result.error || 'Download failed');
            }

            // Download the file
            const link = document.createElement('a');
            link.href = result.url;
            link.download = result.filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup temporary zip file if created
            if (result.type === 'zip' && result.cleanup) {
                setTimeout(async () => {
                    try {
                        await fetch(this.options.cleanupZipUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                filename: result.cleanup
                            })
                        });
                    } catch (error) {
                        console.warn('Failed to cleanup temporary zip:', error);
                    }
                }, 2000); // Wait 2 seconds for download to start
            }

        } catch (error) {
            this.showError(`Download failed: ${error.message}`);
        } finally {
            // Restore button state
            this.downloadAllBtn.disabled = false;
            this.downloadAllBtn.innerHTML = originalHTML;
        }
    }

    clear() {
        this.files.forEach(fileObj => {
            if (fileObj.uploaded && fileObj.serverFilename) {
                this.deleteFile(fileObj.id);
            }
        });
        this.files = [];
        this.previewContainer.innerHTML = '';
    }

    destroy() {
        this.wrapper.remove();
        this.files = [];
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUploader;
}
