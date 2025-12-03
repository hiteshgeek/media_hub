# File Uploader

A flexible, feature-rich file uploader that works standalone or integrates seamlessly with Bootstrap 3-5 forms.

## Features

- **Drag & Drop**: Intuitive drag and drop interface
- **File Type Validation**: Control allowed file types (images, videos, documents, archives)
- **File Preview**:
  - Image preview with thumbnails
  - Video preview with player
  - Generic file icon for other types
- **File Information**: Display file name, type, and size
- **AJAX Upload**: Files upload instantly via AJAX
- **Download Button**: Download uploaded files with original filename
- **Delete Functionality**: Remove uploaded files from server
- **Shared Configuration**: Same validation rules in PHP and JavaScript
- **Bootstrap Compatible**: Works with Bootstrap 3, 4, and 5
- **Standalone Mode**: Can be used without any framework
- **Responsive Design**: Mobile-friendly interface

## Installation

1. Copy all files to your web server
2. Ensure PHP is installed and configured (with ZipArchive extension for download all feature)
3. Set proper permissions:
   ```bash
   chmod 755 /var/www/html/file_uploader
   chmod 755 /var/www/html/file_uploader/uploads
   chmod 644 /var/www/html/file_uploader/*.php
   chmod 644 /var/www/html/file_uploader/*.js
   chmod 644 /var/www/html/file_uploader/*.css
   ```
4. Ensure web server can write to uploads directory:
   ```bash
   chown www-data:www-data /var/www/html/file_uploader/uploads
   # or
   chmod 777 /var/www/html/file_uploader/uploads  # Less secure, for testing only
   ```

## Quick Start

### Standalone Usage

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="file-uploader.css">
</head>
<body>
    <div id="myUploader"></div>

    <script src="file-uploader.js"></script>
    <script>
        const uploader = new FileUploader('#myUploader');
    </script>
</body>
</html>
```

### With Bootstrap 5

```html
<!DOCTYPE html>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="file-uploader.css">
</head>
<body>
    <div class="container">
        <form>
            <div class="mb-3">
                <label class="form-label">Upload Files</label>
                <div id="fileUploader"></div>
            </div>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="file-uploader.js"></script>
    <script>
        const uploader = new FileUploader('#fileUploader', {
            multiple: true
        });
    </script>
</body>
</html>
```

## Configuration

### PHP Configuration (`config.php`)

```php
return [
    'upload_dir' => __DIR__ . '/uploads/',
    'allowed_types' => ['image/jpeg', 'image/png', ...],
    'allowed_extensions' => ['jpg', 'png', 'pdf', ...],
    'max_file_size' => 10 * 1024 * 1024, // 10MB
    'unique_filenames' => true,
];
```

### JavaScript Options

```javascript
const uploader = new FileUploader('#element', {
    // Upload endpoints
    uploadUrl: 'upload.php',
    deleteUrl: 'delete.php',
    configUrl: 'get-config.php',

    // File restrictions
    allowedExtensions: ['jpg', 'png', 'pdf'],
    maxFileSize: 10 * 1024 * 1024,
    maxFileSizeDisplay: '10MB',

    // File type detection
    imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    videoExtensions: ['mp4', 'mpeg', 'mov', 'avi', 'webm'],

    // Upload settings
    multiple: true,
    autoFetchConfig: true, // Fetch config from server

    // Callbacks
    onUploadStart: (fileObj) => {},
    onUploadSuccess: (fileObj, result) => {},
    onUploadError: (fileObj, error) => {},
    onDeleteSuccess: (fileObj, result) => {},
    onDeleteError: (fileObj, error) => {}
});
```

## API Methods

### getFiles()
Returns all files (uploaded and uploading).

```javascript
const allFiles = uploader.getFiles();
```

### getUploadedFiles()
Returns only successfully uploaded files with full details.

```javascript
const uploadedFiles = uploader.getUploadedFiles();
```

### getUploadedFileNames()
**For form submission:** Returns array of server filenames only - perfect for storing in database.

```javascript
const fileNames = uploader.getUploadedFileNames();
// Returns: ['abc123_1234567890.jpg', 'def456_0987654321.pdf']

// Use in form submission
const formData = {
    name: 'John Doe',
    email: 'john@example.com',
    attachments: uploader.getUploadedFileNames()
};
```

### getUploadedFilesData()
Returns detailed data about uploaded files for form submission.

```javascript
const filesData = uploader.getUploadedFilesData();
// Returns: [
//   {
//     originalName: 'resume.pdf',
//     serverFilename: 'abc123_1234567890.pdf',
//     size: 54321,
//     type: 'application/pdf',
//     extension: 'pdf',
//     url: 'uploads/abc123_1234567890.pdf'
//   }
// ]
```

### clear()
Removes all files and deletes them from the server.

```javascript
uploader.clear();
```

### destroy()
Removes the uploader from the DOM.

```javascript
uploader.destroy();
```

## File Structure

```
file_uploader/
├── config.php              # Shared configuration
├── upload.php              # Upload handler
├── delete.php              # Delete handler
├── get-config.php          # Config API endpoint
├── file-uploader.js        # JavaScript class
├── file-uploader.css       # Styles
├── index.html              # Standalone demo
├── demo-bootstrap3.html    # Bootstrap 3 demo
├── demo-bootstrap4.html    # Bootstrap 4 demo
├── demo-bootstrap5.html    # Bootstrap 5 demo
├── uploads/                # Upload directory (auto-created)
└── README.md               # This file
```

## Security Features

- File type validation (MIME type + extension)
- File size validation
- Filename sanitization
- Directory traversal prevention
- Server-side validation matches client-side

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Customization

### Custom Styling

You can override the default styles by adding your own CSS:

```css
.file-uploader-dropzone {
    border-color: #your-color;
    background-color: #your-bg;
}
```

### Custom Error Handling

```javascript
const uploader = new FileUploader('#element', {
    onUploadError: (fileObj, error) => {
        // Custom error handling
        alert(`Failed to upload ${fileObj.name}: ${error.message}`);
    }
});
```

## PHP Requirements

- PHP 7.0 or higher
- `fileinfo` extension enabled
- Write permissions on upload directory

## License

Free to use for personal and commercial projects.

## Demo

Open `index.html` in your browser to see the standalone demo, or check out the Bootstrap demos for framework integration examples.
