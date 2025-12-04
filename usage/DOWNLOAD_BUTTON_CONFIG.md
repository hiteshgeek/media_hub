# Download All Button Configuration Guide

The FileUploader provides flexible configuration for the "Download All" button, supporting both **internal** (auto-generated) and **external** (custom element) implementations.

## 📋 Table of Contents

- [Configuration Options](#configuration-options)
- [Internal Button (Default)](#internal-button-default)
- [External Button](#external-button)
- [Bootstrap Integration](#bootstrap-integration)
- [Examples](#examples)
- [API Reference](#api-reference)

---

## Configuration Options

### `showDownloadAllButton`
**Type:** `boolean`
**Default:** `true`

Enable or disable the internal download-all button.

```javascript
showDownloadAllButton: true  // Show internal button
```

### `downloadAllButtonText`
**Type:** `string`
**Default:** `"Download All"`

Custom text for the internal download button.

```javascript
downloadAllButtonText: "Download All Files"
```

### `downloadAllButtonClasses`
**Type:** `array`
**Default:** `[]`

Additional CSS classes for the internal button (useful for Bootstrap styling).

```javascript
downloadAllButtonClasses: ['btn', 'btn-primary', 'btn-lg']
```

### `downloadAllButtonElement`
**Type:** `string|HTMLElement`
**Default:** `null`

External element selector or DOM element to use as download button.

⚠️ **Important:** Cannot be used together with `showDownloadAllButton: true`

```javascript
downloadAllButtonElement: '#myDownloadButton'
```

---

## Internal Button (Default)

### Default Behavior

By default, the FileUploader creates and manages its own download button:

```javascript
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: true  // Default
});
```

**Features:**
- ✅ Automatically shows/hides based on uploaded files
- ✅ Positioned within the uploader component
- ✅ Styled with `.file-uploader-download-all` class
- ✅ Includes download icon SVG

### Custom Text

```javascript
const uploader = new FileUploader('#fileUploader', {
  downloadAllButtonText: "📦 Download Everything"
});
```

### Hide Internal Button

```javascript
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false
});
```

---

## External Button

Use your own button element outside the uploader component:

### Using Selector

```html
<button id="myDownloadBtn">Download All Files</button>
<div id="fileUploader"></div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#myDownloadBtn'
});
</script>
```

### Using DOM Element

```javascript
const downloadBtn = document.getElementById('myDownloadBtn');
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: downloadBtn
});
```

### External Button Behavior

- **Initially:** `display: none` and `disabled: true`
- **When files uploaded:** `display: block` and `disabled: false`
- **When no files:** `disabled: true` (but remains visible)

---

## Bootstrap Integration

### Bootstrap 3

```javascript
const uploader = new FileUploader('#fileUploader', {
  downloadAllButtonText: "Download All",
  downloadAllButtonClasses: ['btn', 'btn-primary']
});
```

**HTML Structure (Internal):**
```html
<button class="file-uploader-download-all btn btn-primary">
  <svg>...</svg>
  <span>Download All</span>
</button>
```

**External Button:**
```html
<button class="btn btn-primary btn-block" id="downloadBtn">
  <span class="glyphicon glyphicon-download"></span>
  Download All Files
</button>

<div id="fileUploader"></div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadBtn'
});
</script>
```

### Bootstrap 4

```javascript
const uploader = new FileUploader('#fileUploader', {
  downloadAllButtonText: "Download All Files",
  downloadAllButtonClasses: ['btn', 'btn-success', 'btn-lg', 'btn-block']
});
```

**External Button:**
```html
<button class="btn btn-info btn-lg" id="downloadBtn">
  <i class="fas fa-download"></i> Download All
</button>

<div id="fileUploader"></div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadBtn'
});
</script>
```

### Bootstrap 5

```javascript
const uploader = new FileUploader('#fileUploader', {
  downloadAllButtonText: "Download All Files",
  downloadAllButtonClasses: ['btn', 'btn-primary', 'w-100', 'mb-3']
});
```

**External Button with Icon:**
```html
<button class="btn btn-outline-primary" id="downloadBtn">
  <i class="bi bi-download"></i> Download All Files
</button>

<div id="fileUploader"></div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadBtn'
});
</script>
```

---

## Examples

### Example 1: Standalone with Custom Classes

```javascript
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: true,
  downloadAllButtonText: "📥 Get All Files",
  downloadAllButtonClasses: ['my-custom-btn', 'primary']
});
```

**Result:**
```html
<button class="file-uploader-download-all my-custom-btn primary">
  <svg>...</svg>
  <span>📥 Get All Files</span>
</button>
```

### Example 2: Bootstrap 3 Grid Layout

```html
<div class="container">
  <div class="row">
    <div class="col-md-8">
      <div id="fileUploader"></div>
    </div>
    <div class="col-md-4">
      <button class="btn btn-success btn-block" id="downloadBtn">
        <span class="glyphicon glyphicon-save"></span> Save All
      </button>
    </div>
  </div>
</div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadBtn'
});
</script>
```

### Example 3: Bootstrap 5 Card Layout

```html
<div class="card">
  <div class="card-header">
    <h5>File Upload</h5>
  </div>
  <div class="card-body">
    <div id="fileUploader"></div>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary w-100" id="downloadBtn">
      <i class="bi bi-cloud-download"></i> Download All Files
    </button>
  </div>
</div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadBtn'
});
</script>
```

### Example 4: Multiple Buttons

```html
<div id="fileUploader"></div>

<div class="button-toolbar">
  <button id="downloadBtn" class="btn btn-primary">
    Download All
  </button>
  <button id="clearBtn" class="btn btn-danger">
    Clear All
  </button>
</div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadBtn'
});

// Clear button handler
document.getElementById('clearBtn').addEventListener('click', () => {
  uploader.clear();
});
</script>
```

### Example 5: Icon-Only Button

```html
<button id="downloadBtn" class="btn btn-lg btn-primary" title="Download All Files">
  <i class="fas fa-download"></i>
</button>

<div id="fileUploader"></div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadBtn'
});
</script>
```

### Example 6: Floating Action Button (Material Design)

```html
<style>
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
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.fab-download:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
  transform: scale(1.1);
}

.fab-download:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

<button id="downloadFab" class="fab-download" title="Download All">
  <i class="material-icons">get_app</i>
</button>

<div id="fileUploader"></div>

<script>
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#downloadFab'
});
</script>
```

---

## API Reference

### Button State Management

The FileUploader automatically manages the button state:

#### Internal Button
- **No files uploaded:** `display: none`
- **Files uploaded:** `display: flex`
- **During download:** `disabled: true` (temporarily)

#### External Button
- **No files uploaded:** `disabled: true`
- **Files uploaded:** `disabled: false`
- **During download:** `disabled: true` (temporarily)

### Manual Control

You can also manually control the button:

```javascript
// Get button reference
const downloadBtn = uploader.downloadAllBtn;

// Hide button
downloadBtn.style.display = 'none';

// Disable button
downloadBtn.disabled = true;

// Change text (internal button only)
const span = downloadBtn.querySelector('span');
span.textContent = 'Custom Text';
```

---

## Validation Rules

### ⚠️ Cannot Use Both

```javascript
// ❌ ERROR: Cannot use both
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: true,
  downloadAllButtonElement: '#myBtn'  // This will be ignored
});
// Console: "FileUploader: Cannot use both showDownloadAllButton and downloadAllButtonElement. Using internal button."
```

### ✅ Correct Usage

**Option 1: Internal Button**
```javascript
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: true,
  downloadAllButtonClasses: ['btn', 'btn-primary']
});
```

**Option 2: External Button**
```javascript
const uploader = new FileUploader('#fileUploader', {
  showDownloadAllButton: false,
  downloadAllButtonElement: '#myBtn'
});
```

---

## CSS Styling

### Default Styles

The internal button has the class `.file-uploader-download-all`:

```css
.file-uploader-download-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px 0;
  padding: 12px 20px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
```

### Override Styles

```css
/* Override default styles */
.file-uploader-download-all {
  background-color: #28a745;
  font-size: 16px;
  padding: 15px 30px;
}

/* Hover state */
.file-uploader-download-all:hover:not(:disabled) {
  background-color: #218838;
}
```

### Custom Classes

```javascript
const uploader = new FileUploader('#fileUploader', {
  downloadAllButtonClasses: ['my-btn', 'my-btn--large', 'my-btn--success']
});
```

**Result:**
```html
<button class="file-uploader-download-all my-btn my-btn--large my-btn--success">
  ...
</button>
```

---

## Troubleshooting

### Button Not Appearing

**Issue:** Internal button doesn't show up.

**Solutions:**
1. Ensure `showDownloadAllButton: true`
2. Upload at least one file
3. Check CSS for `display: none` overrides

### External Button Not Working

**Issue:** External button click doesn't download files.

**Solutions:**
1. Verify selector is correct: `document.querySelector('#myBtn')` returns element
2. Ensure `showDownloadAllButton: false`
3. Check console for errors

### Button Always Disabled

**Issue:** External button remains disabled.

**Solutions:**
1. Upload at least one file successfully
2. Check if files are actually uploaded: `uploader.getUploadedFiles()`
3. Verify `updateLimitsDisplay()` is being called

### Classes Not Applied

**Issue:** Bootstrap classes not visible on button.

**Solutions:**
1. Ensure Bootstrap CSS is loaded
2. Check class array: `downloadAllButtonClasses: ['btn', 'btn-primary']`
3. Inspect element to verify classes are applied

---

## Best Practices

### ✅ Do

- Use external button for better layout control
- Apply Bootstrap classes for consistent styling
- Provide clear button text/icons
- Test button states (enabled/disabled)

### ❌ Don't

- Use both internal and external buttons simultaneously
- Forget to set `showDownloadAllButton: false` when using external
- Rely on button visibility for logic (check file count instead)

---

**Version:** 1.0.0
**Last Updated:** 2025-12-03
