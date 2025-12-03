<?php
// Simple test for download-all.php
header('Content-Type: text/html');

echo "<h2>Testing download-all.php</h2>";

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

echo "<h3>Test Data:</h3>";
echo "<pre>" . json_encode($testData, JSON_PRETTY_PRINT) . "</pre>";

// Make a cURL request
$ch = curl_init('http://localhost/file_uploader/download-all.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<h3>Response (HTTP $httpCode):</h3>";
echo "<pre>$response</pre>";

// Try to decode JSON
$decoded = json_decode($response, true);
if ($decoded) {
    echo "<h3>Decoded JSON:</h3>";
    echo "<pre>" . json_encode($decoded, JSON_PRETTY_PRINT) . "</pre>";
} else {
    echo "<p style='color:red'>Failed to decode JSON: " . json_last_error_msg() . "</p>";
}
