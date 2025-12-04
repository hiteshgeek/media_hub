<?php
include_once __DIR__ . '/../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Uploader - Bootstrap 5 Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
</head>

<body>
    <div class="container mt-5">
        <div class="bg-light p-5 rounded">
            <h1 class="display-4">File Uploader</h1>
            <p class="lead">Bootstrap 5 Integration</p>
            <hr class="my-4">
            <p>Modern file uploader with full Bootstrap 5 support, drag & drop, validation, and instant uploads.</p>
        </div>

        <div class="card mt-4 mb-4">
            <div class="card-header bg-primary text-white">
                <h3 class="mb-0">Job Application Form</h3>
            </div>
            <div class="card-body">
                <form id="applicationForm" class="needs-validation" novalidate>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="fullName" class="form-label">Full Name</label>
                            <input type="text" class="form-control" id="fullName" required>
                            <div class="invalid-feedback">
                                Please provide your full name.
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="email" class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="email" required>
                            <div class="invalid-feedback">
                                Please provide a valid email.
                            </div>
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
                        <div class="invalid-feedback">
                            Please select a position.
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Resume/CV <span class="text-danger">*</span></label>
                        <div id="resume"></div>
                        <div class="form-text">Upload your resume in PDF, DOC, or DOCX format (max 10MB)</div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Cover Letter</label>
                        <div id="coverLetter"></div>
                        <div class="form-text">Optional: Upload your cover letter</div>
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
                            <div class="invalid-feedback">
                                You must agree before submitting.
                            </div>
                        </div>
                    </div>

                    <div class="d-grid gap-2 d-md-flex">
                        <button type="submit" class="btn btn-primary">Submit Application</button>
                        <button type="button" class="btn btn-secondary" onclick="resetForm()">Reset</button>
                        <a href="index.php" class="btn btn-outline-secondary">Back to Standalone Demo</a>
                    </div>
                </form>
            </div>
        </div>

        <div class="alert alert-info" role="alert">
            <h5 class="alert-heading">Other Demos</h5>
            <hr>
            <a href="../index.php" class="btn btn-sm btn-outline-info">Standalone</a>
            <a href="../demo-bootstrap3.php" class="btn btn-sm btn-outline-info">Bootstrap 3</a>
            <a href="../demo-bootstrap4.php" class="btn btn-sm btn-outline-info">Bootstrap 4</a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module" src="<?= asset('bootstrap_5.js') ?>"></script>
    <script nomodule src="<?php echo asset('bootstrap_5.js', 'nomodule'); ?>"></script>
</body>

</html>