# Preview in Dropzone Feature

## Overview

The FileUploader now displays **file previews inside the dropzone** instead of outside, creating a more cohesive and intuitive user experience.

## 🎯 What Changed

### Before
```
┌─────────────────────────────┐
│     Dropzone (Upload Area)  │
│   "Drag & drop files here"  │
└─────────────────────────────┘

┌─────────────────────────────┐
│   Preview 1   Preview 2     │  ← Outside dropzone
└─────────────────────────────┘
```

### After
```
┌─────────────────────────────┐
│     Dropzone                │
│  ┌─────────────────────┐    │
│  │  "Drag & drop..."   │    │  ← Header (hides when files exist)
│  └─────────────────────┘    │
│                              │
│  ┌────┐ ┌────┐ ┌────┐      │  ← Previews inside dropzone
│  │ P1 │ │ P2 │ │ P3 │      │
│  └────┘ └────┘ └────┘      │
│                              │
│  [ 📥 Download All ]        │  ← Button inside dropzone
└─────────────────────────────┘
```

## ✨ Key Features

### 1. **Dynamic Layout**
- **Empty state:** Shows upload prompt
- **With files:** Hides prompt, shows previews
- **Flexible height:** Dropzone expands to fit previews

### 2. **Smart Click Handling**
- Click on **empty area** → Opens file browser
- Click on **dropzone header** → Opens file browser
- Click on **preview items** → No action (allows interactions with buttons)

### 3. **Drag & Drop Still Works**
- Drag files anywhere in dropzone
- Works even when previews are visible
- Visual feedback with hover and drag states

## 🏗️ Technical Implementation

### HTML Structure

```html
<div class="file-uploader-wrapper">
  <div class="file-uploader-dropzone">
    <input type="file" class="file-uploader-input" />

    <!-- Upload prompt header -->
    <div class="file-uploader-dropzone-content">
      <svg class="file-uploader-icon">...</svg>
      <p class="file-uploader-text">Drag & drop files here or click to browse</p>
      <p class="file-uploader-subtext">Maximum file size: 10MB</p>
    </div>

    <!-- Preview container (inside dropzone) -->
    <div class="file-uploader-preview-container">
      <div class="file-uploader-preview">...</div>
      <div class="file-uploader-preview">...</div>
      <!-- More previews... -->
    </div>

    <!-- Download button (inside dropzone) -->
    <button class="file-uploader-download-all">
      <svg>...</svg>
      <span>Download All</span>
    </button>
  </div>

  <!-- External elements (limits only) -->
  <div class="file-uploader-limits">...</div>
</div>
```

### CSS Behavior

#### Dropzone Styling
```scss
.file-uploader-dropzone {
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: 40px 20px;

  // When files exist, reduce top padding
  &:has(.file-uploader-preview) {
    padding-top: 20px;
  }
}
```

#### Header Auto-Hide
```scss
.file-uploader-dropzone-content {
  // Hide when previews exist
  &:has(+ .file-uploader-preview-container:not(:empty)) {
    display: none;
  }
}
```

#### Preview Container
```scss
.file-uploader-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  flex: 1;
  align-content: start;

  // Show spacing only when not empty
  &:not(:empty) {
    margin-top: 16px;
  }
}
```

### JavaScript Click Handler

```javascript
attachEvents() {
  this.dropZone.addEventListener("click", (e) => {
    // Don't trigger if clicking on previews or their children
    const isPreview = e.target.closest(".file-uploader-preview");
    const isInput = e.target === this.fileInput;

    if (!isPreview && !isInput) {
      this.fileInput.click();
    }
  });
}
```

## 🎨 Visual States

### State 1: Empty (No Files)
```
┌────────────────────────────────┐
│         📤 Upload Icon          │
│  "Drag & drop files here..."   │
│    "Maximum file size: 10MB"   │
└────────────────────────────────┘
```

### State 2: With Files
```
┌────────────────────────────────┐
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ 📄 │ │ 🖼️ │ │ 📹 │ │ 📦 │  │
│  │DOC │ │JPG │ │MP4 │ │ZIP │  │
│  └────┘ └────┘ └────┘ └────┘  │
└────────────────────────────────┘
```

### State 3: Dragging Over
```
┌────────────────────────────────┐ (highlighted border)
│  ┌────┐ ┌────┐                 │
│  │    │ │    │  ⬇️ Drop here   │
│  └────┘ └────┘                 │
└────────────────────────────────┘
```

## 🔧 Customization

### Adjust Minimum Height

```css
.file-uploader-dropzone {
  min-height: 300px; /* Default: 200px */
}
```

### Keep Header Visible

```css
.file-uploader-dropzone-content {
  display: block !important;
  opacity: 0.5;
  margin-bottom: 20px;
}
```

### Change Grid Layout

```css
.file-uploader-preview-container {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
```

### Disable Click on Dropzone (Only Drag & Drop)

```javascript
const uploader = new FileUploader('#uploader');
// Remove click handler manually
uploader.dropZone.removeEventListener('click', ...);
```

## 📱 Responsive Behavior

### Desktop (> 768px)
- Preview grid: 4-6 columns
- Preview size: 200px minimum width
- Dropzone padding: 40px

### Tablet (768px - 576px)
- Preview grid: 2-3 columns
- Preview size: 150px minimum width
- Dropzone padding: 30px

### Mobile (< 576px)
- Preview grid: 2 columns
- Preview size: 150px minimum width
- Dropzone padding: 20px
- Preview height: 120px (reduced)

## ♿ Accessibility

### Keyboard Navigation
- Tab to focus dropzone
- Enter/Space to open file browser
- Preview buttons are keyboard accessible

### Screen Readers
```html
<div class="file-uploader-dropzone"
     role="button"
     aria-label="Upload files. Click or drag and drop.">
  <!-- Content -->
</div>
```

### Focus Management
- Dropzone has visible focus outline
- Focus ring on keyboard interaction
- No focus on mouse click

## 🐛 Known Issues & Solutions

### Issue 1: Click Not Working on Previews

**Problem:** Clicking preview buttons doesn't work.

**Solution:** The click handler now uses `closest('.file-uploader-preview')` to properly detect preview clicks and prevent file browser from opening.

### Issue 2: Header Not Hiding

**Problem:** Upload prompt still visible with files.

**Solution:** Modern `:has()` selector is used. For older browsers, add fallback:

```css
.file-uploader-dropzone-content {
  display: none; /* Force hide */
}
```

### Issue 3: Dropzone Too Small

**Problem:** Dropzone doesn't expand for many files.

**Solution:** The dropzone uses `flex-direction: column` with `flex: 1` on preview container, so it automatically expands.

## 🎯 Best Practices

### ✅ Do

- Use inside a container with defined width
- Allow dropzone to expand naturally
- Test with various file counts (1, 5, 10+)
- Test drag & drop with files visible

### ❌ Don't

- Set fixed height on dropzone
- Use `overflow: hidden` on dropzone
- Prevent click events on the entire dropzone
- Hide the dropzone when files exist

## 📊 Comparison

| Feature | Old Behavior | New Behavior |
|---------|-------------|--------------|
| Preview Location | Outside dropzone | Inside dropzone |
| Dropzone Click | Always triggers browse | Smart detection |
| Upload Prompt | Always visible | Auto-hides |
| Dropzone Height | Fixed | Dynamic |
| Visual Cohesion | Separated elements | Unified component |
| Drag & Drop Area | Only empty zone | Entire dropzone |

## 🚀 Migration Guide

### No Breaking Changes!

The change is **backward compatible**. Your existing code will work without modifications:

```javascript
// This still works exactly as before
const uploader = new FileUploader('#fileUploader', {
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024
});
```

### CSS Customizations

If you had custom CSS targeting `.file-uploader-preview-container`, review it:

**Before (if you had this):**
```css
.file-uploader-preview-container {
  margin-top: 30px; /* This might need adjustment */
}
```

**After:**
```css
.file-uploader-preview-container {
  margin-top: 0; /* Now inside dropzone */
}
```

## 💡 Examples

### Example 1: Basic Usage

```javascript
const uploader = new FileUploader('#uploader', {
  maxFiles: 5,
  maxFileSize: 5 * 1024 * 1024
});
```

**Result:**
- Empty: Shows upload prompt
- With files: Shows previews in grid
- Click anywhere: Opens browser

### Example 2: Custom Styling

```javascript
const uploader = new FileUploader('#uploader', {
  maxFiles: 10
});
```

```css
.file-uploader-dropzone {
  min-height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px dashed #fff;
}

.file-uploader-preview {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

### Example 3: Compact Mode

```javascript
const uploader = new FileUploader('#uploader', {
  maxFiles: 3
});
```

```css
.file-uploader-dropzone {
  min-height: 150px;
  padding: 20px;
}

.file-uploader-preview-container {
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
```

## 🔍 Testing Checklist

- [ ] Upload single file → Preview appears in dropzone
- [ ] Upload multiple files → Grid layout in dropzone
- [ ] Click on empty area → File browser opens
- [ ] Click on dropzone header → File browser opens
- [ ] Click on preview item → No file browser (buttons work)
- [ ] Click on delete button → File removes
- [ ] Click on download button → File downloads
- [ ] Drag file over dropzone → Hover state shows
- [ ] Drop file → File uploads
- [ ] Responsive layout → Works on mobile
- [ ] Delete all files → Upload prompt returns

---

**Version:** 2.0.0
**Last Updated:** 2025-12-03
**Breaking Changes:** None (backward compatible)
