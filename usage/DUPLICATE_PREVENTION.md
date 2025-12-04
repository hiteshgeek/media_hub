# Duplicate File Prevention Feature

The FileUploader now supports preventing duplicate file uploads with flexible configuration options.

## Configuration Options

### `preventDuplicates`
**Type:** `boolean`
**Default:** `false`

Enable or disable duplicate file prevention.

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: true
});
```

### `duplicateCheckBy`
**Type:** `string`
**Default:** `"name-size"`
**Options:** `"name"`, `"size"`, `"name-size"`, `"hash"`

Determines how files are compared for duplicates:

- **`"name"`** - Only check file name
- **`"size"`** - Only check file size
- **`"name-size"`** - Check both name AND size (recommended, default)
- **`"hash"`** - Hash-based comparison (currently falls back to name-size)

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: true,
  duplicateCheckBy: 'name-size'  // Most reliable option
});
```

### `onDuplicateFile`
**Type:** `function`
**Default:** `null`

Callback function that fires when a duplicate file is detected.

**Parameters:**
- `file` - The new file being uploaded (File object)
- `duplicate` - The existing file object that matches

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: true,
  onDuplicateFile: (file, duplicate) => {
    console.log('Duplicate detected!');
    console.log('New file:', file.name);
    console.log('Existing file:', duplicate.name);
    // You can show custom UI or take other actions here
  }
});
```

## Usage Examples

### Example 1: Basic Duplicate Prevention

Prevent files with the same name and size:

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: true,
  duplicateCheckBy: 'name-size'
});
```

### Example 2: Check by Name Only

Prevent files with the same name, regardless of size:

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: true,
  duplicateCheckBy: 'name'
});
```

### Example 3: With Custom Callback

Handle duplicate detection with custom logic:

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: true,
  duplicateCheckBy: 'name-size',
  onDuplicateFile: (file, duplicate) => {
    // Show custom notification
    alert(`The file "${file.name}" has already been uploaded!`);

    // Log for debugging
    console.log('Duplicate file details:', {
      newFile: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      existingFile: {
        name: duplicate.name,
        size: duplicate.size,
        uploaded: duplicate.uploaded
      }
    });
  }
});
```

### Example 4: Disable Duplicate Prevention

Default behavior (allow duplicates):

```javascript
const uploader = new FileUploader('#fileUploader', {
  preventDuplicates: false  // This is the default
});
```

## How It Works

1. When a user selects files, the FileUploader checks each file against already uploaded or uploading files.

2. The comparison is done based on the `duplicateCheckBy` option:
   - **name**: Compares `file.name`
   - **size**: Compares `file.size`
   - **name-size**: Compares both `file.name` AND `file.size`

3. If a duplicate is found:
   - The file is **not uploaded**
   - An error message is displayed to the user
   - The `onDuplicateFile` callback is triggered (if provided)

4. Only files that are **uploaded** or **currently uploading** are checked. Files that failed to upload are not considered.

## User Experience

When a duplicate file is detected:

1. ❌ The file is **rejected** before upload
2. 💬 An error message appears: `"filename.ext" is a duplicate file and has already been uploaded.`
3. 📋 The file does **not** appear in the preview list
4. 🔔 Optional custom callback fires for additional handling

## Best Practices

### Recommended: Use `name-size` Check

```javascript
{
  preventDuplicates: true,
  duplicateCheckBy: 'name-size'  // Most reliable
}
```

**Why?** Checking both name and size is the most reliable method without requiring file hash computation:
- Same name + same size = very likely the same file
- Faster than hash-based checking
- No false positives (unlike name-only or size-only)

### For Strict Name Checking

```javascript
{
  preventDuplicates: true,
  duplicateCheckBy: 'name'  // Prevent same filename
}
```

**Use case:** When you want to prevent files with the same name, even if the content is different (e.g., versioned files).

### Complete Example with All Features

```html
<!DOCTYPE html>
<html>
<head>
  <title>File Uploader - Duplicate Prevention</title>
  <link rel="stylesheet" href="dist/css/file-uploader.css">
</head>
<body>
  <div id="fileUploader"></div>

  <script type="module">
    import { FileUploader } from './dist/js/file-uploader.js';

    const uploader = new FileUploader('#fileUploader', {
      // File constraints
      maxFiles: 10,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ['jpg', 'png', 'pdf', 'docx'],

      // Duplicate prevention
      preventDuplicates: true,
      duplicateCheckBy: 'name-size',

      // Callbacks
      onDuplicateFile: (file, duplicate) => {
        console.warn(`Duplicate file detected: ${file.name}`);
      },

      onUploadSuccess: (fileObj, result) => {
        console.log(`File uploaded: ${fileObj.name}`);
      }
    });
  </script>
</body>
</html>
```

## Testing Duplicate Prevention

To test the feature:

1. **Enable the feature:**
   ```javascript
   preventDuplicates: true
   ```

2. **Upload a file** (e.g., "document.pdf")

3. **Try to upload the same file again**
   - You should see an error message
   - The file should NOT appear in the preview
   - The duplicate callback should fire (if configured)

4. **Test different scenarios:**
   - Same file name, different content (rename and edit)
   - Different file name, same content
   - Completely different files

## Integration with Server-Side Validation

While this feature prevents duplicate uploads on the client side, you should also implement server-side duplicate checking for security:

```php
// upload.php
$uploadedFile = $_FILES['file'];
$filename = basename($uploadedFile['name']);

// Check if file already exists on server
if (file_exists("uploads/$filename")) {
    echo json_encode([
        'success' => false,
        'error' => 'File already exists on server'
    ]);
    exit;
}

// Continue with upload...
```

## Troubleshooting

### Issue: Duplicates are still being uploaded

**Solution:** Make sure `preventDuplicates` is set to `true`:
```javascript
preventDuplicates: true
```

### Issue: Different files are being flagged as duplicates

**Solution:** Change the `duplicateCheckBy` method:
```javascript
duplicateCheckBy: 'name-size'  // More specific than 'name' or 'size' alone
```

### Issue: Callback not firing

**Solution:** Ensure the callback function is properly defined:
```javascript
onDuplicateFile: function(file, duplicate) {
  console.log('Duplicate:', file.name);
}
```

## Future Enhancements

- ✨ Hash-based duplicate detection (SHA-256)
- ✨ Option to replace existing file with new upload
- ✨ Option to skip duplicate or show confirmation dialog
- ✨ Duplicate detection across page refreshes (using localStorage)

---

**Version:** 1.0.0
**Last Updated:** 2025-12-03
