<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Uploader - Form Submission Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="file-uploader.css">
</head>

<body>
    <div class="container mt-5">
        <div class="bg-light p-4 rounded mb-4">
            <h1 class="display-5">Form Submission Demo</h1>
            <p class="lead">Shows how to submit uploaded file names to backend</p>
        </div>

        <div class="alert alert-info">
            <strong>How it works:</strong>
            <ol class="mb-0 mt-2">
                <li>Files are uploaded instantly via AJAX to <code>upload.php</code></li>
                <li>Server returns the stored filename (e.g., <code>abc123_1234567890.jpg</code>)</li>
                <li>When form is submitted, only the server filenames are sent</li>
                <li>Backend saves these filenames in database</li>
            </ol>
        </div>

        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h3 class="mb-0">User Profile Form</h3>
            </div>
            <div class="card-body">
                <form id="profileForm">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="name" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                            <input type="email" class="form-control" id="email" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Profile Picture</label>
                        <div id="profilePicture"></div>
                        <small class="form-text text-muted">Upload your profile picture</small>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Documents</label>
                        <div id="documents"></div>
                        <small class="form-text text-muted">Upload any supporting documents</small>
                    </div>

                    <div class="d-grid gap-2 d-md-flex">
                        <button type="submit" class="btn btn-primary">Submit Form</button>
                        <button type="button" class="btn btn-secondary" onclick="resetForm()">Reset</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">Form Data Preview</h4>
            </div>
            <div class="card-body">
                <p>This shows the data that would be sent to the backend:</p>
                <pre id="formDataPreview" class="bg-light p-3 rounded"><code>{
  "name": "",
  "email": "",
  "profilePicture": [],
  "documents": []
}</code></pre>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="file-uploader.js"></script>
    <script>
        // Initialize uploaders
        const profileUploader = new FileUploader('#profilePicture', {
            multiple: false,
            onUploadSuccess: (fileObj, result) => {
                console.log('✅ Profile picture uploaded:', result.file.filename);
                updatePreview();
            }
        });

        const documentsUploader = new FileUploader('#documents', {
            multiple: true,
            onUploadSuccess: (fileObj, result) => {
                console.log('✅ Document uploaded:', result.file.filename);
                updatePreview();
            },
            onDeleteSuccess: () => {
                updatePreview();
            }
        });

        // Update preview whenever form changes
        document.getElementById('name').addEventListener('input', updatePreview);
        document.getElementById('email').addEventListener('input', updatePreview);

        function updatePreview() {
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                // Just the server filenames - ready for database storage
                profilePicture: profileUploader.getUploadedFileNames(),
                documents: documentsUploader.getUploadedFileNames()
            };

            document.getElementById('formDataPreview').innerHTML =
                '<code>' + JSON.stringify(formData, null, 2) + '</code>';
        }

        // Handle form submission
        document.getElementById('profileForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data with uploaded filenames
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                profilePicture: profileUploader.getUploadedFileNames(),
                documents: documentsUploader.getUploadedFileNames()
            };

            console.log('📤 Submitting form data:', formData);

            // Example: Send to backend
            try {
                const response = await fetch('submit-form-example.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fullName: formData.name,
                        email: formData.email,
                        resumeFiles: formData.profilePicture,
                        portfolioFiles: formData.documents,
                        terms: true
                    })
                });

                const result = await response.json();

                if (result.success) {
                    // Show success message
                    const alert = document.createElement('div');
                    alert.className = 'alert alert-success alert-dismissible fade show';
                    alert.innerHTML = `
                        <strong>Success!</strong> Form submitted successfully.
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;
                    document.querySelector('.container').insertBefore(
                        alert,
                        document.querySelector('.card')
                    );

                    console.log('✅ Backend response:', result);
                } else {
                    throw new Error(result.error || 'Submission failed');
                }
            } catch (error) {
                console.error('❌ Submission error:', error);
                alert('Error: ' + error.message);
            }
        });

        function resetForm() {
            if (confirm('Are you sure you want to reset the form?')) {
                document.getElementById('profileForm').reset();
                profileUploader.clear();
                documentsUploader.clear();
                updatePreview();
            }
        }

        // Initialize preview
        updatePreview();
    </script>
</body>

</html>