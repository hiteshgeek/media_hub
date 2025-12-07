<?php
/**
 * Example: Form Submission Handler
 * Shows how to process uploaded file data from the form
 */

header('Content-Type: application/json');

// Get JSON data from form submission
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON data'
    ]);
    exit;
}

// Extract form data
$formData = [
    'full_name' => $input['fullName'] ?? '',
    'email' => $input['email'] ?? '',
    'position' => $input['position'] ?? '',
    'resume_files' => $input['resumeFiles'] ?? [],
    'cover_letter_files' => $input['coverLetterFiles'] ?? [],
    'portfolio_files' => $input['portfolioFiles'] ?? [],
    'terms_accepted' => $input['terms'] ?? false,
    'submitted_at' => date('Y-m-d H:i:s')
];

// Validate required fields
if (empty($formData['full_name']) || empty($formData['email'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Name and email are required'
    ]);
    exit;
}

// Validate resume is uploaded
if (empty($formData['resume_files'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Resume is required'
    ]);
    exit;
}

// Example: Insert into database
// The file names are already stored on server, we just save references
try {
    // Example using PDO
    /*
    $pdo = new PDO('mysql:host=localhost;dbname=yourdb', 'username', 'password');

    $stmt = $pdo->prepare("
        INSERT INTO applications
        (full_name, email, position, resume_files, cover_letter_files, portfolio_files, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $formData['full_name'],
        $formData['email'],
        $formData['position'],
        json_encode($formData['resume_files']),      // Store as JSON array
        json_encode($formData['cover_letter_files']), // Store as JSON array
        json_encode($formData['portfolio_files']),    // Store as JSON array
        $formData['submitted_at']
    ]);

    $applicationId = $pdo->lastInsertId();
    */

    // For demo purposes, just return success
    $applicationId = rand(1000, 9999);

    echo json_encode([
        'success' => true,
        'message' => 'Application submitted successfully',
        'data' => [
            'application_id' => $applicationId,
            'form_data' => $formData
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
