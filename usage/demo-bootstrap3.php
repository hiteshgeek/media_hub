<?php
include_once __DIR__ . '/../includes/functions.php';
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File Uploader - Bootstrap 3 Demo</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
</head>

<body>
    <div class="container" style="margin-top: 40px;">
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
                        <p class="help-block">Upload your profile picture (images only, max 10MB)</p>
                    </div>

                    <div class="form-group">
                        <label>Supporting Documents</label>
                        <div id="documents"></div>
                        <p class="help-block">Upload any supporting documents</p>
                    </div>

                    <div class="form-group">
                        <button type="submit" class="btn btn-primary">Submit</button>
                        <button type="button" class="btn btn-default" onclick="window.location.href='index.php'">Back to Standalone Demo</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="panel panel-info">
            <div class="panel-heading">
                <h3 class="panel-title">Other Demos</h3>
            </div>
            <div class="panel-body">
                <a href="../index.php" class="btn btn-default btn-sm">Standalone</a>
                <a href="../demo-bootstrap4.php" class="btn btn-default btn-sm">Bootstrap 4</a>
                <a href="../demo-bootstrap5.php" class="btn btn-default btn-sm">Bootstrap 5</a>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

    <script type="module" src="<?= asset('file-uploader.js') ?>"></script>
    <script nomodule src="<?= asset('file-uploader.js', 'nomodule') ?>"></script>

    <script type="module" src="<?= asset('bootstrap_3.js') ?>"></script>
    <script nomodule src="<?php echo asset('bootstrap_3.js', 'nomodule'); ?>"></script>

</body>

</html>