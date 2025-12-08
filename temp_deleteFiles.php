<?php

function deleteFiles($input = null)
{
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }

    if (!$input) {
        $input = json_decode(file_get_contents('php://input'), true);
    }

    $uploadDir = BaseConfig::FILES_DIR . "tmp/issue/";

    if (isset($input['uploadDir']) && !empty($input['uploadDir'])) {
        $uploadDirRaw = trim($input['uploadDir']);

        if (strpos($uploadDirRaw, '/') === 0) {
            $uploadDirRaw = str_replace(['..', '\\'], ['', '/'], $uploadDirRaw);
            $uploadDir = rtrim($uploadDirRaw, '/') . '/';
        } else {
            $uploadDirNameOnly = trim($uploadDirRaw, '/\\');
            $uploadDirNameOnly = str_replace(['..', '\\'], ['', '/'], $uploadDirNameOnly);
            $uploadDirNameOnly = rtrim($uploadDirNameOnly, '/') . '/';
            $uploadDir = BaseConfig::FILES_DIR . $uploadDirNameOnly;
        }
    }

    if (isset($input['files']) && is_array($input['files'])) {
        $deleted = 0;
        $failed = 0;

        foreach ($input['files'] as $fileInfo) {
            $filename = basename($fileInfo['filename'] ?? '');
            if ($filename) {
                $filepath = $uploadDir . $filename;
                if (file_exists($filepath) && unlink($filepath)) {
                    $deleted++;
                } else {
                    $failed++;
                }
            }
        }

        echo json_encode([
            'success' => true,
            'deleted' => $deleted,
            'failed' => $failed
        ]);
    } else {
        $filename = isset($input['filename']) ? basename($input['filename']) : null;

        if (!$filename) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Filename required']);
            exit;
        }

        $filepath = $uploadDir . $filename;

        if (file_exists($filepath) && unlink($filepath)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'File not found or could not be deleted']);
        }
    }

    exit;
}
