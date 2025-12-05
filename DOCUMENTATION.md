# FileUploader Documentation

A flexible, feature-rich file uploader component with drag & drop, preview, AJAX upload, screen capture, video/audio recording, carousel preview, cross-uploader drag-drop, alert notifications, and comprehensive file management capabilities. Compatible with Bootstrap 3-5 and standalone usage.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Options](#configuration-options)
   - [URL Configuration](#url-configuration)
   - [Upload Directory](#upload-directory)
   - [File Size Limits](#file-size-limits)
   - [File Type Configuration](#file-type-configuration)
   - [Upload Behavior](#upload-behavior)
   - [Alert Notification Options](#alert-notification-options)
   - [Limits Display Options](#limits-display-options)
   - [Button Configuration](#button-configuration)
   - [Media Capture Options](#media-capture-options)
   - [Carousel Preview Options](#carousel-preview-options)
   - [Callback Functions](#callback-functions)
3. [Usage Examples](#usage-examples)
4. [Cross-Uploader Drag & Drop](#cross-uploader-drag--drop)
5. [Multiple Config Files](#multiple-config-files)
6. [Server-Side Configuration](#server-side-configuration)
7. [Server-Side Endpoints](#server-side-endpoints)
8. [Public Methods](#public-methods)
9. [Alert Notification System](#alert-notification-system)
10. [Styling & Customization](#styling--customization)

---

## Quick Start

### Basic HTML Setup

```html
<div id="fileUploader"></div>

<script type="module">
  import FileUploader from './src/library/js/components/FileUploader.js';

  const uploader = new FileUploader('#fileUploader', {
    // Your options here
  });
</script>
```

### Minimal Configuration

```javascript
const uploader = new FileUploader('#fileUploader', {
  uploadUrl: 'upload.php',
  deleteUrl: 'delete.php'
});
```

---

## Configuration Options

### URL Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `uploadUrl` | `string` | `"./upload.php"` | Server endpoint for file uploads |
| `deleteUrl` | `string` | `"./delete.php"` | Server endpoint for file deletion |
| `downloadAllUrl` | `string` | `"./download-all.php"` | Server endpoint for downloading all files as ZIP |
| `cleanupZipUrl` | `string` | `"./cleanup-zip.php"` | Server endpoint for cleaning up temporary ZIP files |
| `copyFileUrl` | `string` | `"./copy-file.php"` | Server endpoint for copying files between directories (cross-uploader) |
| `configUrl` | `string` | `"./get-config.php"` | Server endpoint to fetch configuration (used with `autoFetchConfig`) |

#### Example: Custom URLs

```javascript
const uploader = new FileUploader('#fileUploader', {
  uploadUrl: '/api/files/upload',
  deleteUrl: '/api/files/delete',
  downloadAllUrl: '/api/files/download-all',
  copyFileUrl: '/api/files/copy',
  configUrl: '/api/files/config'
});
```

---

### Upload Directory

The `uploadDir` option allows you to specify a target subdirectory for uploaded files. This is useful when you have multiple uploaders that should save files to different locations.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `uploadDir` | `string` | `""` | Target folder for uploads (relative to server's base upload directory) |

#### Example: Custom Upload Directory

```javascript
// Profile pictures go to uploads/profile_pictures/
const profileUploader = new FileUploader('#profilePicture', {
  uploadDir: 'profile_pictures',
  uploadUrl: '/file_uploader/upload.php',
  deleteUrl: '/file_uploader/delete.php'
});

// Documents go to uploads/documents/
const documentsUploader = new FileUploader('#documents', {
  uploadDir: 'documents',
  uploadUrl: '/file_uploader/upload.php',
  deleteUrl: '/file_uploader/delete.php'
});
```

The `uploadDir` is automatically included in:
- Upload requests (sent as POST parameter)
- Delete requests (sent in JSON body)
- Page unload cleanup (when `cleanupOnUnload` is enabled)
- Cross-uploader copy/move operations

---

### File Size Limits

The FileUploader supports a sophisticated multi-level file size limit system:

#### Global Limits

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `perFileMaxSize` | `number` | `10485760` (10MB) | Maximum size for a single file (fallback when no type-specific limit exists) |
| `perFileMaxSizeDisplay` | `string` | `"10MB"` | Human-readable display of `perFileMaxSize` |
| `totalMaxSize` | `number` | `104857600` (100MB) | Maximum total size for all files combined |
| `totalMaxSizeDisplay` | `string` | `"100MB"` | Human-readable display of `totalMaxSize` |
| `maxFiles` | `number` | `10` | Maximum number of files allowed |

#### Per-Type Limits

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `perFileMaxSizePerType` | `object` | `{}` | Maximum size for a SINGLE file of each type |
| `perFileMaxSizePerTypeDisplay` | `object` | `{}` | Human-readable display values |
| `perTypeMaxTotalSize` | `object` | `{}` | Maximum TOTAL size for all files of that type combined |
| `perTypeMaxTotalSizeDisplay` | `object` | `{}` | Human-readable display values |
| `perTypeMaxFileCount` | `object` | `{}` | Maximum number of files allowed per type |

#### Example: Comprehensive Size Limits

```javascript
const uploader = new FileUploader('#fileUploader', {
  // Global fallback limits
  perFileMaxSize: 5 * 1024 * 1024,        // 5MB fallback
  perFileMaxSizeDisplay: '5MB',
  totalMaxSize: 100 * 1024 * 1024,        // 100MB total
  totalMaxSizeDisplay: '100MB',
  maxFiles: 10,

  // Per-file size limits by type
  perFileMaxSizePerType: {
    image: 10 * 1024 * 1024,              // 10MB per image
    video: 100 * 1024 * 1024,             // 100MB per video
    audio: 25 * 1024 * 1024,              // 25MB per audio
    document: 10 * 1024 * 1024,           // 10MB per document
    archive: 20 * 1024 * 1024             // 20MB per archive
  },
  perFileMaxSizePerTypeDisplay: {
    image: '10MB',
    video: '100MB',
    audio: '25MB',
    document: '10MB',
    archive: '20MB'
  },

  // Total size limits per type (all files of that type combined)
  perTypeMaxTotalSize: {
    image: 50 * 1024 * 1024,              // 50MB total for all images
    video: 200 * 1024 * 1024,             // 200MB total for all videos
    audio: 100 * 1024 * 1024,             // 100MB total for all audio
    document: 50 * 1024 * 1024,           // 50MB total for all documents
    archive: 100 * 1024 * 1024            // 100MB total for all archives
  },
  perTypeMaxTotalSizeDisplay: {
    image: '50MB',
    video: '200MB',
    audio: '100MB',
    document: '50MB',
    archive: '100MB'
  },

  // File count limits per type
  perTypeMaxFileCount: {
    image: 5,
    video: 3,
    audio: 3,
    document: 5,
    archive: 2
  }
});
```

> **Note:** When any type-level limit is defined, the generic "Maximum file size: X" message in the dropzone is automatically hidden.

---

### File Type Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowedExtensions` | `array` | `[]` | Allowed file extensions (empty = all allowed) |
| `imageExtensions` | `array` | `['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']` | Extensions recognized as images |
| `videoExtensions` | `array` | `['mp4', 'mpeg', 'mov', 'avi', 'webm']` | Extensions recognized as videos |
| `audioExtensions` | `array` | `['mp3', 'wav', 'ogg', 'webm', 'aac', 'm4a', 'flac']` | Extensions recognized as audio |
| `documentExtensions` | `array` | `['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv']` | Extensions recognized as documents |
| `archiveExtensions` | `array` | `['zip', 'rar', '7z', 'tar', 'gz']` | Extensions recognized as archives |

#### Example: Images Only

```javascript
const uploader = new FileUploader('#fileUploader', {
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
});
```

#### Example: Documents and Archives Only

```javascript
const uploader = new FileUploader('#fileUploader', {
  allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'rar'],
  documentExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
  archiveExtensions: ['zip', 'rar']
});
```

---

### Upload Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multiple` | `boolean` | `true` | Allow multiple file selection |
| `autoFetchConfig` | `boolean` | `true` | Automatically fetch configuration from server on init |
| `preventDuplicates` | `boolean` | `false` | Prevent uploading duplicate files |
| `duplicateCheckBy` | `string` | `"name-size"` | How to check for duplicates: `'name'`, `'size'`, `'name-size'`, `'hash'` |
| `confirmBeforeDelete` | `boolean` | `false` | Show confirmation dialog before deleting files |
| `cleanupOnUnload` | `boolean` | `true` | Automatically delete uploaded files when leaving the page |

#### Example: Prevent Duplicates

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: true,
  duplicateCheckBy: 'name-size',  // Check by both name and size
  onDuplicateFile: (file) => {
    alert(`File "${file.name}" has already been uploaded.`);
  }
});
```

#### Example: Single File Upload

```javascript
const uploader = new FileUploader('#fileUploader', {
  multiple: false,
  maxFiles: 1
});
```

#### Example: Delete Confirmation

```javascript
const uploader = new FileUploader('#fileUploader', {
  confirmBeforeDelete: true  // Shows a modal dialog before deleting files
});
```

---

### Alert Notification Options

The FileUploader uses a toast-like alert notification system for displaying errors and messages. Alerts appear at the top center of the page with animations.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `alertAnimation` | `string` | `"shake"` | Animation for alerts: `'fade'`, `'shake'`, `'bounce'`, `'slideDown'`, `'pop'`, `'flip'` |
| `alertDuration` | `number` | `5000` | Auto-dismiss duration in milliseconds (0 = no auto-dismiss) |

#### Available Animations

- `fade` - Simple fade in/out
- `shake` - Slides in then shakes (good for errors)
- `bounce` - Bouncy entrance effect
- `slideDown` - Slides down from top
- `pop` - Pop/scale effect
- `flip` - 3D flip animation

#### Example: Custom Alert Animation

```javascript
const uploader = new FileUploader('#fileUploader', {
  alertAnimation: 'bounce',
  alertDuration: 3000  // Dismiss after 3 seconds
});
```

#### Example: Persistent Alerts

```javascript
const uploader = new FileUploader('#fileUploader', {
  alertAnimation: 'slideDown',
  alertDuration: 0  // Never auto-dismiss, user must click close
});
```

---

### Limits Display Options

Control how upload limits are displayed to users.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showLimits` | `boolean` | `true` | Show the limits section below the dropzone |
| `showLimitsToggle` | `boolean` | `true` | Show toggle button to show/hide limits section |
| `defaultLimitsVisible` | `boolean` | `true` | Initial visibility state of limits section |
| `defaultLimitsView` | `string` | `"concise"` | Default view mode: `'concise'` or `'detailed'` |
| `allowLimitsViewToggle` | `boolean` | `true` | Allow toggling between concise and detailed views |
| `showProgressBar` | `boolean` | `false` | Show progress bars for Total Size and File Count |
| `showPerFileLimit` | `boolean` | `true` | Show per-file size limit in type groups |
| `showTypeGroupSize` | `boolean` | `true` | Show total uploaded size per type group |
| `showTypeGroupCount` | `boolean` | `true` | Show file count per type group |

#### Example: Detailed Limits View

```javascript
const uploader = new FileUploader('#fileUploader', {
  showLimits: true,
  showLimitsToggle: true,
  defaultLimitsVisible: true,
  defaultLimitsView: 'detailed',
  allowLimitsViewToggle: true,
  showProgressBar: true,
  showPerFileLimit: true,
  showTypeGroupSize: true,
  showTypeGroupCount: true
});
```

#### Example: Minimal UI (No Limits Display)

```javascript
const uploader = new FileUploader('#fileUploader', {
  showLimits: false,
  showLimitsToggle: false
});
```

#### Example: Concise View Only (No Toggle)

```javascript
const uploader = new FileUploader('#fileUploader', {
  showLimits: true,
  defaultLimitsView: 'concise',
  allowLimitsViewToggle: false
});
```

---

### Button Configuration

#### Download All Button

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showDownloadAllButton` | `boolean` | `true` | Show internal download-all button |
| `downloadAllButtonText` | `string` | `"Download All"` | Button text |
| `downloadAllButtonClasses` | `array` | `[]` | Custom CSS classes (for Bootstrap, etc.) |
| `downloadAllButtonElement` | `string\|Element` | `null` | External element selector (mutually exclusive with `showDownloadAllButton`) |

#### Clear All Button

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showClearAllButton` | `boolean` | `true` | Show internal clear-all button |
| `clearAllButtonText` | `string` | `"Clear All"` | Button text |
| `clearAllButtonClasses` | `array` | `[]` | Custom CSS classes (for Bootstrap, etc.) |
| `clearAllButtonElement` | `string\|Element` | `null` | External element selector (mutually exclusive with `showClearAllButton`) |

#### Example: Bootstrap Styled Buttons

```javascript
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: true,
  downloadAllButtonText: 'Download All Files',
  downloadAllButtonClasses: ['btn', 'btn-primary', 'btn-sm'],

  showClearAllButton: true,
  clearAllButtonText: 'Remove All',
  clearAllButtonClasses: ['btn', 'btn-danger', 'btn-sm']
});
```

#### Example: External Buttons

```html
<button id="myDownloadBtn" class="btn btn-success">Download</button>
<button id="myClearBtn" class="btn btn-warning">Clear</button>
<div id="fileUploader"></div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#myDownloadBtn',

  showClearAllButton: false,
  clearAllButtonElement: '#myClearBtn'
});
</script>
```

---

### Media Capture Options

The FileUploader supports capturing screenshots, recording video, and recording audio directly from the browser.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableScreenCapture` | `boolean` | `true` | Enable screenshot capture button |
| `enableVideoRecording` | `boolean` | `true` | Enable video recording button |
| `enableAudioRecording` | `boolean` | `true` | Enable audio recording button |
| `maxVideoRecordingDuration` | `number` | `300` | Max video recording duration in seconds (5 minutes) |
| `maxAudioRecordingDuration` | `number` | `300` | Max audio recording duration in seconds (5 minutes) |
| `recordingCountdownDuration` | `number` | `3` | Countdown before recording starts (seconds) |
| `enableMicrophoneAudio` | `boolean` | `false` | Enable microphone audio during screen recording |
| `enableSystemAudio` | `boolean` | `false` | Enable system/tab audio during screen recording |

#### Example: Full Media Capture

```javascript
const uploader = new FileUploader('#fileUploader', {
  enableScreenCapture: true,
  enableVideoRecording: true,
  enableAudioRecording: true,
  enableMicrophoneAudio: true,
  enableSystemAudio: true,
  maxVideoRecordingDuration: 600,    // 10 minutes max
  maxAudioRecordingDuration: 600,    // 10 minutes max
  recordingCountdownDuration: 5       // 5 second countdown
});
```

#### Example: Screenshots Only

```javascript
const uploader = new FileUploader('#fileUploader', {
  enableScreenCapture: true,
  enableVideoRecording: false,
  enableAudioRecording: false
});
```

#### Example: Disable All Media Capture

```javascript
const uploader = new FileUploader('#fileUploader', {
  enableScreenCapture: false,
  enableVideoRecording: false,
  enableAudioRecording: false
});
```

---

### Carousel Preview Options

The FileUploader includes a carousel modal for previewing uploaded files with support for images, videos, audio, PDFs, and more.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableCarouselPreview` | `boolean` | `true` | Enable carousel preview modal on file click |
| `carouselAutoPreload` | `boolean` | `true` | Auto-preload files in carousel |
| `carouselEnableManualLoading` | `boolean` | `true` | Show "Load All" button in carousel |
| `carouselVisibleTypes` | `array` | `['image', 'video', 'audio', 'pdf', 'excel', 'csv', 'text']` | File types visible in carousel |
| `carouselPreviewableTypes` | `array` | `['image', 'video', 'audio', 'pdf', 'excel', 'csv', 'text']` | File types that can be previewed |

#### Example: Images and Videos Only in Carousel

```javascript
const uploader = new FileUploader('#fileUploader', {
  enableCarouselPreview: true,
  carouselVisibleTypes: ['image', 'video'],
  carouselPreviewableTypes: ['image', 'video']
});
```

---

### Callback Functions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onUploadStart` | `function` | `null` | Called when upload starts |
| `onUploadSuccess` | `function` | `null` | Called when upload succeeds |
| `onUploadError` | `function` | `null` | Called when upload fails |
| `onDeleteSuccess` | `function` | `null` | Called when file deletion succeeds |
| `onDeleteError` | `function` | `null` | Called when file deletion fails |
| `onDuplicateFile` | `function` | `null` | Called when a duplicate file is detected |

#### Callback Signatures

```javascript
const uploader = new FileUploader('#fileUploader', {
  onUploadStart: (fileObj) => {
    console.log('Upload started:', fileObj.name);
  },

  onUploadSuccess: (fileObj, serverResponse) => {
    console.log('Upload success:', fileObj.name);
    console.log('Server response:', serverResponse);
    // serverResponse contains: { success, file: { name, filename, size, type, extension, fileType, url, path } }
  },

  onUploadError: (fileObj, error) => {
    console.error('Upload failed:', fileObj.name, error);
  },

  onDeleteSuccess: (fileObj, serverResponse) => {
    console.log('File deleted:', fileObj.name);
  },

  onDeleteError: (fileObj, error) => {
    console.error('Delete failed:', fileObj.name, error);
  },

  onDuplicateFile: (file) => {
    console.warn('Duplicate file detected:', file.name);
  }
});
```

---

## Usage Examples

### Example 1: Image Gallery Uploader

```javascript
const imageUploader = new FileUploader('#imageGallery', {
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  multiple: true,
  maxFiles: 20,

  perFileMaxSizePerType: {
    image: 5 * 1024 * 1024  // 5MB per image
  },
  perTypeMaxTotalSize: {
    image: 50 * 1024 * 1024  // 50MB total
  },

  preventDuplicates: true,
  duplicateCheckBy: 'name-size',

  enableScreenCapture: true,
  enableVideoRecording: false,
  enableAudioRecording: false,

  showLimits: true,
  defaultLimitsView: 'concise',

  onUploadSuccess: (fileObj, result) => {
    console.log('Image uploaded:', result.file.url);
  }
});
```

### Example 2: Document Upload Form

```javascript
const documentUploader = new FileUploader('#documentUpload', {
  allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  multiple: true,
  maxFiles: 5,

  perFileMaxSize: 10 * 1024 * 1024,  // 10MB per file
  totalMaxSize: 25 * 1024 * 1024,    // 25MB total

  confirmBeforeDelete: true,
  cleanupOnUnload: false,  // Keep files on server

  enableScreenCapture: false,
  enableVideoRecording: false,
  enableAudioRecording: false,

  downloadAllButtonClasses: ['btn', 'btn-outline-primary'],
  clearAllButtonClasses: ['btn', 'btn-outline-danger']
});
```

### Example 3: Video Submission Platform

```javascript
const videoUploader = new FileUploader('#videoSubmission', {
  allowedExtensions: ['mp4', 'webm', 'mov'],
  multiple: false,
  maxFiles: 1,

  perFileMaxSizePerType: {
    video: 500 * 1024 * 1024  // 500MB per video
  },

  enableScreenCapture: false,
  enableVideoRecording: true,
  enableAudioRecording: false,
  enableMicrophoneAudio: true,
  maxVideoRecordingDuration: 300,  // 5 minutes max recording

  showLimits: true,
  defaultLimitsView: 'detailed',
  showProgressBar: true
});
```

### Example 4: Support Ticket Attachments

```javascript
const supportUploader = new FileUploader('#supportAttachments', {
  allowedExtensions: ['jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip'],
  multiple: true,
  maxFiles: 5,

  perFileMaxSize: 10 * 1024 * 1024,
  totalMaxSize: 25 * 1024 * 1024,

  enableScreenCapture: true,  // Allow screenshots for bug reports
  enableVideoRecording: true, // Allow screen recordings
  enableAudioRecording: false,

  showLimits: true,
  defaultLimitsVisible: false,  // Hidden by default
  showLimitsToggle: true,       // But can be shown

  alertAnimation: 'shake',
  alertDuration: 4000,

  onUploadSuccess: (fileObj, result) => {
    // Add file reference to ticket form
    addAttachmentToTicket(result.file.filename);
  }
});
```

---

## Cross-Uploader Drag & Drop

The FileUploader supports dragging files between different uploader instances on the same page. When you drag a file from one uploader to another, a dialog appears asking whether to **Move** or **Copy** the file.

### How It Works

1. Each FileUploader instance is automatically registered with a unique ID
2. When dragging a file preview, it carries metadata about its source uploader
3. When dropped on a different uploader, validation checks are performed:
   - File type compatibility (allowed extensions)
   - File count limits
   - File size limits (per-file and total)
   - Duplicate check (if enabled)
4. User chooses Move or Copy
5. If uploaders have different `uploadDir`, the file is physically copied on the server
6. For Move operations, the file is removed from the source uploader

### Example: Profile and Documents Uploaders

```javascript
// Profile pictures uploader - only images, single file
const profileUploader = new FileUploader('#profilePicture', {
  uploadDir: 'profile_pictures',
  configUrl: '/file_uploader/get-config-profile.php',
  copyFileUrl: '/file_uploader/copy-file.php',
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxFiles: 1,
  multiple: false
});

// Documents uploader - multiple file types
const documentsUploader = new FileUploader('#documents', {
  uploadDir: 'documents',
  configUrl: '/file_uploader/get-config-documents.php',
  copyFileUrl: '/file_uploader/copy-file.php',
  allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'png'],
  maxFiles: 10,
  multiple: true
});

// Now users can drag an image from documents to profile picture (if it passes validation)
// or drag from profile to documents
```

### Server-Side Copy Endpoint (copy-file.php)

When copying between uploaders with different `uploadDir`, the `copyFileUrl` endpoint is called:

```php
<?php
header('Content-Type: application/json');

$config = require_once 'config.php';
$input = json_decode(file_get_contents('php://input'), true);

// Required parameters:
// - sourceFilename: The server filename of the source file
// - sourceUploadDir: The source uploader's uploadDir
// - targetUploadDir: The target uploader's uploadDir

// The endpoint copies the file and returns the new file info
// If a file with the same name exists, it automatically renames (file.jpg -> file_1.jpg)
```

---

## Multiple Config Files

You can create separate configuration files for different uploaders, each returning different settings including `uploadDir`.

### Example: Profile Config (get-config-profile.php)

```php
<?php
header('Content-Type: application/json');

$config = require 'config.php';

$jsConfig = [
    'allowedExtensions' => $config['image_extensions'],
    'perFileMaxSize' => $config['per_file_max_size_per_type']['image'],
    'perFileMaxSizeDisplay' => $config['per_file_max_size_per_type_display']['image'],
    'maxFiles' => 1,
    'uploadDir' => 'profile_pictures',  // Files go to uploads/profile_pictures/
    // ... other settings
];

echo json_encode($jsConfig);
```

### Example: Documents Config (get-config-documents.php)

```php
<?php
header('Content-Type: application/json');

$config = require 'config.php';

$jsConfig = [
    'allowedExtensions' => array_merge(
        $config['document_extensions'],
        $config['image_extensions']
    ),
    'maxFiles' => 10,
    'uploadDir' => 'documents',  // Files go to uploads/documents/
    // ... other settings
];

echo json_encode($jsConfig);
```

### Using Different Configs

```javascript
const profileUploader = new FileUploader('#profile', {
  configUrl: '/file_uploader/get-config-profile.php'
});

const docsUploader = new FileUploader('#documents', {
  configUrl: '/file_uploader/get-config-documents.php'
});
```

---

## Server-Side Configuration

### PHP Configuration File (config.php)

```php
<?php
/**
 * File Uploader Configuration
 */

function formatFileSize($bytes) {
    if ($bytes === 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes) / log($k));
    $value = round($bytes / pow($k, $i), 2);
    if ($value == floor($value)) {
        $value = floor($value);
    }
    return $value . $sizes[$i];
}

// Define limits
$perFileMaxSize = 5 * 1024 * 1024;
$totalMaxSize = 100 * 1024 * 1024;

$perFileMaxSizePerType = [
    'image' => 10 * 1024 * 1024,
    'video' => 100 * 1024 * 1024,
    'audio' => 25 * 1024 * 1024,
    'document' => 10 * 1024 * 1024,
    'archive' => 20 * 1024 * 1024,
];

$perTypeMaxTotalSize = [
    'image' => 50 * 1024 * 1024,
    'video' => 200 * 1024 * 1024,
    'audio' => 100 * 1024 * 1024,
    'document' => 50 * 1024 * 1024,
    'archive' => 100 * 1024 * 1024,
];

$perTypeMaxFileCount = [
    'image' => 5,
    'video' => 3,
    'audio' => 3,
    'document' => 5,
    'archive' => 2,
];

// Auto-generate display values
$perFileMaxSizeDisplay = formatFileSize($perFileMaxSize);
$totalMaxSizeDisplay = formatFileSize($totalMaxSize);

$perFileMaxSizePerTypeDisplay = [];
foreach ($perFileMaxSizePerType as $type => $size) {
    $perFileMaxSizePerTypeDisplay[$type] = formatFileSize($size);
}

$perTypeMaxTotalSizeDisplay = [];
foreach ($perTypeMaxTotalSize as $type => $size) {
    $perTypeMaxTotalSizeDisplay[$type] = formatFileSize($size);
}

return [
    'upload_dir' => __DIR__ . '/uploads/',

    'allowed_types' => [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword',
        'application/zip'
    ],

    'allowed_extensions' => [
        'jpg', 'jpeg', 'png', 'gif', 'webp',
        'mp4', 'webm',
        'mp3', 'wav', 'ogg',
        'pdf', 'doc', 'docx',
        'zip'
    ],

    'per_file_max_size' => $perFileMaxSize,
    'per_file_max_size_display' => $perFileMaxSizeDisplay,
    'per_file_max_size_per_type' => $perFileMaxSizePerType,
    'per_file_max_size_per_type_display' => $perFileMaxSizePerTypeDisplay,
    'per_type_max_total_size' => $perTypeMaxTotalSize,
    'per_type_max_total_size_display' => $perTypeMaxTotalSizeDisplay,
    'per_type_max_file_count' => $perTypeMaxFileCount,
    'total_max_size' => $totalMaxSize,
    'total_max_size_display' => $totalMaxSizeDisplay,
    'max_files' => 10,
    'unique_filenames' => true,

    'image_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    'video_extensions' => ['mp4', 'mpeg', 'mov', 'avi', 'webm'],
    'audio_extensions' => ['mp3', 'wav', 'ogg', 'webm', 'aac', 'm4a', 'flac'],
    'document_extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
    'archive_extensions' => ['zip', 'rar', '7z', 'tar', 'gz'],
];
```

---

## Server-Side Endpoints

### upload.php

Handles file uploads. Accepts `uploadDir` as a POST parameter to specify the target subdirectory.

```php
<?php
header('Content-Type: application/json');

$config = require_once 'config.php';

// Get custom upload directory
$uploadSubDir = '';
if (isset($_POST['uploadDir']) && !empty($_POST['uploadDir'])) {
    $uploadSubDir = trim($_POST['uploadDir'], '/\\');
    $uploadSubDir = str_replace(['..', '\\'], ['', '/'], $uploadSubDir);
    $uploadSubDir = rtrim($uploadSubDir, '/') . '/';
}

$uploadDir = $config['upload_dir'] . $uploadSubDir;

// ... validation and file handling
```

### delete.php

Handles file deletion. Accepts `uploadDir` in JSON body.

```php
<?php
header('Content-Type: application/json');

$config = require_once 'config.php';
$input = json_decode(file_get_contents('php://input'), true);

// Supports single file: { filename: "...", uploadDir: "..." }
// Supports bulk: { files: [...], uploadDir: "..." }
```

### copy-file.php

Handles copying files between directories for cross-uploader operations.

```php
<?php
header('Content-Type: application/json');

$config = require_once 'config.php';
$input = json_decode(file_get_contents('php://input'), true);

// Required: sourceFilename, sourceUploadDir, targetUploadDir
// Returns: { success, file: {...}, renamed: bool }
```

---

## Public Methods

### File Management

| Method | Description |
|--------|-------------|
| `getFiles()` | Returns array of all files (uploaded and pending) |
| `getUploadedFiles()` | Returns array of successfully uploaded files only |
| `clearAll()` | Removes all files (triggers delete on server for uploaded files) |
| `downloadAll()` | Downloads all uploaded files as a ZIP archive |
| `downloadSelected()` | Downloads selected files |
| `deleteSelected()` | Deletes selected files |

### Notification Methods

| Method | Description |
|--------|-------------|
| `showError(message)` | Shows an error alert notification |
| `showSuccess(message)` | Shows a success alert notification |
| `showWarning(message)` | Shows a warning alert notification |
| `showInfo(message)` | Shows an info alert notification |

### Usage

```javascript
const uploader = new FileUploader('#fileUploader', { /* options */ });

// Get all files
const allFiles = uploader.getFiles();
console.log(allFiles);

// Get only uploaded files
const uploadedFiles = uploader.getUploadedFiles();
console.log(uploadedFiles);

// Clear all files
uploader.clearAll();

// Download all as ZIP
uploader.downloadAll();

// Show notifications
uploader.showSuccess('Files uploaded successfully!');
uploader.showWarning('Large file detected');
uploader.showInfo('Tip: You can drag files between uploaders');
```

---

## Alert Notification System

The FileUploader includes a standalone Alert notification system that can also be used independently.

### Alert Types

- **Error** - Red theme, for errors and failures
- **Success** - Green theme, for successful operations
- **Warning** - Amber/Yellow theme, for warnings
- **Info** - Blue theme, for informational messages

### Alert Animations

| Animation | Description |
|-----------|-------------|
| `fade` | Simple fade in/out |
| `shake` | Slides in then shakes horizontally |
| `bounce` | Bouncy entrance with overshoot |
| `slideDown` | Slides down from top |
| `pop` | Pops in with scale effect |
| `flip` | 3D flip animation |

### Standalone Usage

```javascript
import Alert from './src/library/js/components/Alert.js';

// Show alerts programmatically
Alert.error('Something went wrong!', { animation: 'shake' });
Alert.success('File uploaded successfully!', { animation: 'bounce' });
Alert.warning('File is very large', { animation: 'slideDown' });
Alert.info('Drag files to upload', { animation: 'fade', duration: 3000 });

// Dismiss all alerts
Alert.dismissAll();
```

### Styling

Alerts use solid backgrounds that work on any page background (light or dark). They automatically adapt when `data-theme="dark"` is set on the HTML or body element.

---

## Styling & Customization

### CSS Variables

The FileUploader uses CSS custom properties for easy theming:

```css
:root {
  /* Colors */
  --fu-color-primary: #4299e1;
  --fu-color-primary-hover: #3182ce;
  --fu-color-success: #48bb78;
  --fu-color-error: #f56565;
  --fu-color-text: #2d3748;
  --fu-color-text-muted: #718096;
  --fu-color-border: #e2e8f0;
  --fu-color-bg: #ffffff;
  --fu-color-bg-light: #f7fafc;

  /* Spacing */
  --fu-spacing-xs: 4px;
  --fu-spacing-sm: 8px;
  --fu-spacing-md: 12px;
  --fu-spacing-lg: 16px;
  --fu-spacing-xl: 24px;

  /* Border Radius */
  --fu-radius-sm: 4px;
  --fu-radius-md: 6px;
  --fu-radius-lg: 8px;

  /* Typography */
  --fu-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --fu-font-size-xs: 0.75rem;
  --fu-font-size-sm: 0.875rem;
  --fu-font-size-base: 1rem;
}
```

### Dark Mode

The component supports dark mode via `data-theme="dark"` attribute:

```html
<html data-theme="dark">
  <!-- Your content -->
</html>
```

Or via CSS media query:

```css
@media (prefers-color-scheme: dark) {
  .file-uploader-dropzone {
    background-color: #1a202c;
    border-color: #4a5568;
  }

  .file-uploader-text {
    color: #e2e8f0;
  }
}
```

### Compact Mode

Add the `file-uploader-wrapper--compact` class for smaller spacing:

```html
<div id="fileUploader" class="file-uploader-wrapper--compact"></div>
```

### Large Preview Mode

Add the `file-uploader-wrapper--large` class for larger preview thumbnails:

```html
<div id="fileUploader" class="file-uploader-wrapper--large"></div>
```

---

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

**Note:** Screen capture and video/audio recording features require modern browser APIs (MediaDevices, MediaRecorder) and may not be available in all browsers.

---

## License

MIT License - See LICENSE file for details.
