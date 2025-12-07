<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bootstrap 4 Demo - File Uploader</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
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
            <div class="container py-5">
                <div class="jumbotron">
                    <h1 class="display-4">File Uploader</h1>
                    <p class="lead">Bootstrap 4 Integration</p>
                    <hr class="my-4">
                    <p>Modern file uploader with full Bootstrap 4 support, drag & drop, validation, and instant uploads.</p>
                </div>

                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h3 class="mb-0">Project Submission Form</h3>
                    </div>
                    <div class="card-body">
                        <form id="submissionForm">
                            <div class="form-group">
                                <label for="projectName">Project Name</label>
                                <input type="text" class="form-control" id="projectName" placeholder="Enter project name" required>
                            </div>

                            <div class="form-group">
                                <label for="description">Description</label>
                                <textarea class="form-control" id="description" rows="3" placeholder="Enter project description" required></textarea>
                            </div>

                            <div class="form-group">
                                <label>Project Images</label>
                                <div id="projectImages"></div>
                                <small class="form-text text-muted">Upload project screenshots or images</small>
                            </div>

                            <div class="form-group">
                                <label>Additional Files</label>
                                <div id="additionalFiles"></div>
                                <small class="form-text text-muted">Upload any supporting documents</small>
                            </div>

                            <button type="submit" class="btn btn-primary">Submit Project</button>
                            <button type="reset" class="btn btn-secondary">Reset</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module">
        import { FileUploader } from '<?= asset('file-uploader.js') ?>';

        // Project Images uploader
        const imagesUploader = new FileUploader('#projectImages', {
            uploadUrl: '../../upload.php',
            deleteUrl: '../../delete.php',
            downloadAllUrl: '../../download-all.php',
            configUrl: '../../get-config-profile.php',
            multiple: true,
            showLimits: true,
            defaultLimitsView: 'concise',
            allowLimitsViewToggle: true
        });

        // Additional Files uploader
        const filesUploader = new FileUploader('#additionalFiles', {
            uploadUrl: '../../upload.php',
            deleteUrl: '../../delete.php',
            downloadAllUrl: '../../download-all.php',
            configUrl: '../../get-config.php',
            multiple: true,
            showLimits: true,
            defaultLimitsView: 'concise',
            allowLimitsViewToggle: true
        });

        document.getElementById('submissionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const images = imagesUploader.getUploadedFiles();
            const files = filesUploader.getUploadedFiles();

            console.log('Form submitted:', {
                projectName: document.getElementById('projectName').value,
                description: document.getElementById('description').value,
                images: images,
                files: files
            });

            alert('Project submitted! Check console for details.');
        });
    </script>
</body>
</html>
