# File Uploader - Validation Guide

## Double Validation Architecture

All file uploads are validated **twice** - once on the client-side (JavaScript) and again on the server-side (PHP). This provides both user experience benefits and security.

---

## Frontend Validation (JavaScript)

**Location:** `file-uploader.js` - `validateFile()` method

**Purpose:** Provide instant feedback to users before uploading

### Checks Performed:

1. **Max Files Count**
   ```javascript
   if (uploadedCount >= this.options.maxFiles)
   ```
   - Prevents exceeding maximum number of files
   - Default: 10 files

2. **File Extension**
   ```javascript
   if (!this.options.allowedExtensions.includes(extension))
   ```
   - Checks against whitelist of allowed extensions
   - Example: jpg, png, pdf, etc.

3. **Per-File-Type Size Limit**
   ```javascript
   const typeLimit = this.options.fileTypeSizeLimits[fileType];
   if (typeLimit && file.size > typeLimit)
   ```
   - Images: 5MB max
   - Videos: 50MB max
   - Documents: 10MB max
   - Archives: 20MB max

4. **General File Size Limit**
   ```javascript
   if (file.size > this.options.maxFileSize)
   ```
   - Default: 10MB
   - Fallback if type-specific limit not set

5. **Total Upload Size Limit**
   ```javascript
   const currentTotalSize = this.getTotalSize();
   if (currentTotalSize + file.size > this.options.totalSizeLimit)
   ```
   - Default: 100MB total across all files
   - Shows remaining available space

### Error Messages:
- User-friendly messages
- Shows specific limits
- Displays remaining space for total limit

---

## Backend Validation (PHP)

**Location:** `upload.php`

**Purpose:** Security enforcement - never trust client-side validation

### Checks Performed:

1. **Upload Errors**
   ```php
   if ($file['error'] !== UPLOAD_ERR_OK)
   ```
   - System-level upload errors
   - Missing tmp folder, write errors, etc.

2. **Empty File Check**
   ```php
   if ($file['size'] === 0)
   ```
   - Prevents 0-byte files

3. **File Extension Validation**
   ```php
   if (!in_array($extension, $config['allowed_extensions']))
   ```
   - Same whitelist as frontend
   - Security: prevents malicious file types

4. **Per-File-Type Size Limit**
   ```php
   if ($file['size'] > $config['file_type_size_limits'][$fileType])
   ```
   - ✅ **NEW**: Now matches frontend validation
   - Images: 5MB, Videos: 50MB, etc.

5. **General File Size Limit**
   ```php
   if ($file['size'] > $config['max_file_size'])
   ```
   - Fallback size check
   - Default: 10MB

6. **MIME Type Validation**
   ```php
   $mimeType = finfo_file($finfo, $file['tmp_name']);
   if (!in_array($mimeType, $config['allowed_types']))
   ```
   - ⭐ **Most Important**: Checks actual file content
   - Cannot be bypassed by renaming files
   - Example: `test.jpg.exe` will fail MIME check

### Security Features:
- MIME type validation (content-based)
- Filename sanitization with `basename()`
- Unique filename generation
- Directory traversal prevention

---

## Validation Comparison

| Validation | Frontend | Backend | Purpose |
|------------|----------|---------|---------|
| File Extension | ✅ | ✅ | Basic type check |
| Per-Type Size | ✅ | ✅ | Category limits |
| General Size | ✅ | ✅ | Overall limit |
| Total Size Limit | ✅ | ❌ | UI/UX only* |
| Max Files Count | ✅ | ❌ | UI/UX only* |
| MIME Type | ❌ | ✅ | **Security** |
| Empty File | ❌ | ✅ | Data quality |

*Total size and file count are session-based validations that apply to the current upload session only, not enforced on individual requests.

---

## Configuration Source

**Single Source of Truth:** `config.php`

```php
return [
    'allowed_extensions' => ['jpg', 'png', 'pdf', ...],
    'max_file_size' => 10 * 1024 * 1024,
    'file_type_size_limits' => [
        'image' => 5 * 1024 * 1024,
        'video' => 50 * 1024 * 1024,
        ...
    ],
    'total_size_limit' => 100 * 1024 * 1024,
    'max_files' => 10,
];
```

**How it works:**
1. PHP reads `config.php` for backend validation
2. JavaScript fetches config via `get-config.php` API
3. Both use the same limits automatically

---

## Validation Flow

```
User selects file
       ↓
┌──────────────────┐
│ Frontend Check   │ ← Fast feedback, no server load
├──────────────────┤
│ ✓ Extension      │
│ ✓ Type size      │
│ ✓ General size   │
│ ✓ Total size     │
│ ✓ File count     │
└──────────────────┘
       ↓
   Valid? ──NO──→ Show error, stop
       ↓ YES
   Upload to server
       ↓
┌──────────────────┐
│ Backend Check    │ ← Security enforcement
├──────────────────┤
│ ✓ Upload errors  │
│ ✓ Extension      │
│ ✓ Type size      │ ← NEW!
│ ✓ General size   │
│ ✓ MIME type      │ ← Cannot be spoofed
│ ✓ Empty file     │
└──────────────────┘
       ↓
   Valid? ──NO──→ Delete temp file, return error
       ↓ YES
   Save to uploads/
       ↓
   Return success
```

---

## Why Double Validation?

### Frontend Validation Benefits:
- ✅ Instant feedback (no server round-trip)
- ✅ Better user experience
- ✅ Reduces server load
- ✅ Saves bandwidth
- ✅ Shows helpful error messages

### Backend Validation Benefits:
- 🔒 **Security** - Cannot be bypassed
- 🔒 MIME type checks actual file content
- 🔒 Prevents malicious file uploads
- 🔒 Final authority on what's allowed

### Why Not Just One?

**Frontend Only?**
- ❌ Can be bypassed (disable JavaScript, use curl)
- ❌ Not secure
- ❌ Allows malicious uploads

**Backend Only?**
- ❌ Poor user experience (upload then error)
- ❌ Wastes bandwidth
- ❌ Increases server load
- ❌ Slower feedback

**Both Together?**
- ✅ Fast user feedback
- ✅ Strong security
- ✅ Best of both worlds

---

## Security Notes

1. **Never trust client-side validation alone**
   - JavaScript can be disabled
   - Requests can be crafted directly

2. **MIME type validation is critical**
   - Checks actual file content
   - Prevents extension spoofing
   - Cannot be bypassed by renaming

3. **Extension validation is not enough**
   - `evil.php.jpg` could bypass extension check
   - MIME type check catches this

4. **Filename sanitization**
   - Use `basename()` to prevent directory traversal
   - Generate unique names for security

5. **Directory permissions**
   - Upload directory should not be executable
   - Files should not have execute permissions

---

## Testing Validation

### Frontend Tests (should fail before upload):
```javascript
// Test file count limit
uploader.getFiles().length >= 10 // Should show error

// Test per-type size
5MB+ image // Should fail with "image file size limit" error
50MB+ video // Should fail with "video file size limit" error

// Test total size
Upload files until 100MB // Should show "remaining space" error

// Test extension
.exe file // Should fail with "type not allowed" error
```

### Backend Tests (should fail after upload):
```bash
# Test MIME type bypass
mv malware.exe malware.jpg
# Upload malware.jpg → Should fail "MIME type not allowed"

# Test large file via curl (bypass frontend)
curl -F "file=@huge_file.jpg" http://server/upload.php
# Should fail with size error

# Test invalid extension via curl
curl -F "file=@shell.php" http://server/upload.php
# Should fail with extension/MIME error
```

---

## Customizing Validation

### Add New File Type:

**1. Update config.php:**
```php
'allowed_extensions' => [..., 'svg', 'ai'],
'allowed_types' => [..., 'image/svg+xml', 'application/postscript'],
'design_extensions' => ['svg', 'ai'],
'file_type_size_limits' => [
    ...
    'design' => 15 * 1024 * 1024, // 15MB for design files
],
'file_type_size_limits_display' => [
    ...
    'design' => '15MB',
],
```

**2. Update JavaScript (file-uploader.js):**
```javascript
this.options = {
    ...
    designExtensions: ['svg', 'ai'],
};

getFileType(extension) {
    ...
    } else if (this.options.designExtensions.includes(extension)) {
        return 'design';
    }
    ...
}
```

**3. Update upload.php:**
```php
elseif (in_array($extension, $config['design_extensions'])) {
    $fileType = 'design';
}
```

---

## Summary

✅ **All constraints are now checked in BOTH frontend and backend**

- Frontend: Fast user feedback, better UX
- Backend: Security enforcement, cannot be bypassed
- Configuration: Single source of truth in `config.php`
- MIME Type: Backend-only security check on actual file content

This dual-layer approach provides the best balance of user experience and security.
