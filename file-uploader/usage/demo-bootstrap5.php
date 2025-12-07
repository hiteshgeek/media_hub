<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bootstrap 5 Demo - File Uploader</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
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
                <div class="bg-light p-5 rounded mb-4">
                    <h1 class="display-4">File Uploader</h1>
                    <p class="lead">Bootstrap 5 Integration</p>
                    <hr class="my-4">
                    <p>Modern file uploader with full Bootstrap 5 support, drag & drop, validation, and instant uploads.</p>
                </div>

                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h3 class="mb-0">Job Application Form</h3>
                    </div>
                    <div class="card-body">
                        <form id="applicationForm" class="needs-validation" novalidate>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="fullName" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="fullName" required>
                                    <div class="invalid-feedback">Please provide your full name.</div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email" required>
                                    <div class="invalid-feedback">Please provide a valid email.</div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="position" class="form-label">Position Applied For</label>
                                <select class="form-select" id="position" required>
                                    <option value="">Choose...</option>
                                    <option value="developer">Software Developer</option>
                                    <option value="designer">UI/UX Designer</option>
                                    <option value="manager">Project Manager</option>
                                    <option value="analyst">Data Analyst</option>
                                </select>
                                <div class="invalid-feedback">Please select a position.</div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Resume/CV <span class="text-danger">*</span></label>
                                <div id="resume"></div>
                                <div class="form-text">Upload your resume (documents only)</div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Portfolio / Work Samples</label>
                                <div id="portfolio"></div>
                                <div class="form-text">Upload images, videos, or documents showcasing your work</div>
                            </div>

                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="terms" required>
                                    <label class="form-check-label" for="terms">
                                        I agree to the terms and conditions
                                    </label>
                                    <div class="invalid-feedback">You must agree before submitting.</div>
                                </div>
                            </div>

                            <div class="d-grid gap-2 d-md-flex">
                                <button type="submit" class="btn btn-primary">Submit Application</button>
                                <button type="reset" class="btn btn-secondary">Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module">
        import { FileUploader } from '<?= asset('file-uploader.js') ?>';

        // Resume uploader - documents only
        const resumeUploader = new FileUploader('#resume', {
            uploadUrl: '../../upload.php',
            deleteUrl: '../../delete.php',
            downloadAllUrl: '../../download-all.php',
            configUrl: '../../get-config-documents.php',
            multiple: false,
            showLimits: true,
            defaultLimitsView: 'concise',
            allowLimitsViewToggle: false
        });

        // Portfolio uploader - multiple file types
        const portfolioUploader = new FileUploader('#portfolio', {
            uploadUrl: '../../upload.php',
            deleteUrl: '../../delete.php',
            downloadAllUrl: '../../download-all.php',
            configUrl: '../../get-config.php',
            multiple: true,
            showLimits: true,
            defaultLimitsView: 'concise',
            allowLimitsViewToggle: true
        });

        // Bootstrap 5 form validation
        document.getElementById('applicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const form = e.target;
            form.classList.add('was-validated');

            if (form.checkValidity()) {
                const resumeFiles = resumeUploader.getUploadedFiles();
                const portfolioFiles = portfolioUploader.getUploadedFiles();

                if (resumeFiles.length === 0) {
                    alert('Please upload your resume');
                    return;
                }

                console.log('Application submitted:', {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    position: document.getElementById('position').value,
                    resume: resumeFiles,
                    portfolio: portfolioFiles
                });

                alert('Application submitted successfully! Check console for details.');
            }
        });
    </script>
</body>
</html>
