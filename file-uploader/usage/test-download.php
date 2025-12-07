<?php
include_once __DIR__ . '/../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download Test - File Uploader</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../src/assets/images/download.svg">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f7fafc;
            color: #2d3748;
        }

        .demo-main {
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
        }

        .demo-header {
            margin-bottom: 30px;
        }

        .demo-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
        }

        .demo-header p {
            color: #718096;
            font-size: 16px;
        }

        .demo-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
        }

        .demo-section h3 {
            margin: 0 0 20px;
            color: #2d3748;
            font-size: 18px;
        }

        .test-results {
            background: #1a202c;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            max-height: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
        }

        @media (max-width: 992px) {
            .demo-main {
                padding: 20px;
                padding-top: 70px;
            }
        }
    </style>
</head>
<body>
    <div class="demo-layout">
        <?php include __DIR__ . '/sidebar.php'; ?>

        <main class="demo-content">
            <div class="demo-main">
                <div class="demo-header">
                    <h1>Download Test</h1>
                    <p>Test the download-all.php endpoint functionality</p>
                </div>

                <div class="demo-section">
                    <h3>Test Results</h3>
                    <div class="test-results">
<?php
// Simple test for download-all.php
echo "Testing download-all.php\n";
echo "========================\n\n";

// Test data
$testData = [
    'files' => [
        [
            'originalName' => 'test.txt',
            'serverFilename' => 'test_123.txt',
            'size' => 1024,
            'type' => 'text/plain',
            'extension' => 'txt',
            'url' => 'uploads/test_123.txt'
        ]
    ]
];

echo "Test Data:\n";
echo json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Check if curl is available
if (function_exists('curl_init')) {
    // Make a cURL request
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
    $downloadUrl = $baseUrl . dirname($_SERVER['REQUEST_URI']) . '/../download-all.php';

    echo "Testing URL: $downloadUrl\n\n";

    $ch = curl_init($downloadUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Response (HTTP $httpCode):\n";
    echo $response . "\n\n";

    // Try to decode JSON
    $decoded = json_decode($response, true);
    if ($decoded) {
        echo "Decoded JSON:\n";
        echo json_encode($decoded, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "Note: Response is not JSON (may be binary file data)\n";
    }
} else {
    echo "Note: cURL extension not available\n";
    echo "The download-all.php endpoint should be tested via browser.\n";
}
?>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
