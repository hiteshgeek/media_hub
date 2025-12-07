<?php
include_once __DIR__ . '/../../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bootstrap 3 Demo - File Uploader</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../../src/assets/images/download.svg">
    <style>
        .demo-layout { display: flex; min-height: 100vh; }
        .demo-content { flex: 1; margin-left: 280px; }
        @media (max-width: 992px) {
            .demo-content { margin-left: 0; padding-top: 60px; }
        }
    </style>
</head>
<body>
    <div class="demo-layout">
        <?php include __DIR__ . '/sidebar.php'; ?>

        <main class="demo-content">
            <div class="container" style="margin-top: 40px; padding-bottom: 40px;">
                <div class="page-header">
                    <h1>File Uploader <small>Bootstrap 3 Integration</small></h1>
                </div>

                <div class="alert alert-info">
                    <h4>Features:</h4>
                    <ul>
                        <li>Fully integrated with Bootstrap 3 forms</li>
                        <li>Drag & drop file upload</li>
                        <li>File type validation and preview</li>
                        <li>Instant AJAX upload</li>
                    </ul>
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

                            <div class="form-group">
                                <label>Profile Picture</label>
                                <div id="profilePicture"></div>
                                <p class="help-block">Upload your profile picture (images only)</p>
                            </div>

                            <div class="form-group">
                                <label>Supporting Documents</label>
                                <div id="documents"></div>
                                <p class="help-block">Upload any supporting documents</p>
                            </div>

                            <div class="form-group">
                                <button type="submit" class="btn btn-primary">Submit</button>
                                <button type="reset" class="btn btn-default">Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module">
        import { FileUploader } from '<?= asset('file-uploader.js') ?>';

        // Profile Picture uploader - single image only
        const profileUploader = new FileUploader('#profilePicture', {
            uploadUrl: '../../../api/upload.php',
            deleteUrl: '../../../api/delete.php',
            downloadAllUrl: '../../../api/download-all.php',
            configUrl: '../../../api/get-config-profile.php',
            multiple: false,
            showLimits: true,
            defaultLimitsView: 'concise',
            allowLimitsViewToggle: false
        });

        // Documents uploader - multiple files
        const documentsUploader = new FileUploader('#documents', {
            uploadUrl: '../../../api/upload.php',
            deleteUrl: '../../../api/delete.php',
            downloadAllUrl: '../../../api/download-all.php',
            configUrl: '../../../api/get-config-documents.php',
            multiple: true,
            showLimits: true,
            defaultLimitsView: 'concise',
            allowLimitsViewToggle: true
        });

        // Form submission
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();

            const profileFiles = profileUploader.getUploadedFiles();
            const documentFiles = documentsUploader.getUploadedFiles();

            if (profileFiles.length === 0) {
                alert('Please upload a profile picture');
                return;
            }

            console.log('Form submitted with:', {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                profilePicture: profileFiles,
                documents: documentFiles
            });

            alert('Form submitted successfully! Check console for details.');
        });
    </script>
</body>
</html>
