<?php
include_once __DIR__ . '/../../../includes/functions.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FileUploader Integration - FileCarousel</title>
    <link rel="stylesheet" href="<?php echo asset('file-uploader.css'); ?>" />
    <link rel="icon" type="image/svg+xml" href="../../../src/assets/images/download.svg">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #f7fafc;
            color: #2d3748;
        }

        .demo-main {
            padding: 40px;
            max-width: 1000px;
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

        .info-box {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #11998e;
        }

        .info-box h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 12px;
        }

        .info-box p {
            color: #4a5568;
            font-size: 14px;
            line-height: 1.6;
        }

        .demo-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
        }

        .demo-section h2 {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
        }

        .code-block {
            background: #1e293b;
            border-radius: 8px;
            padding: 20px;
            overflow-x: auto;
        }

        .code-block pre {
            margin: 0;
            color: #e2e8f0;
            font-family: 'Fira Code', monospace;
            font-size: 13px;
            line-height: 1.6;
        }

        .code-block .keyword { color: #c792ea; }
        .code-block .string { color: #c3e88d; }
        .code-block .property { color: #82aaff; }
        .code-block .comment { color: #676e95; }

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
                    <h1>FileUploader Integration</h1>
                    <p>Use FileCarousel with the FileUploader component for a complete file management solution</p>
                </div>

                <div class="info-box">
                    <h3>How It Works</h3>
                    <p>
                        FileUploader has built-in carousel preview support. When enabled, clicking on an uploaded file
                        opens the FileCarousel modal for a full-screen preview. This integration is automatic when you
                        set <code>enableCarouselPreview: true</code> in the FileUploader configuration.
                    </p>
                </div>

                <div class="demo-section">
                    <h2>Upload Files to Test</h2>
                    <div id="fileUploader"></div>
                </div>

                <div class="demo-section">
                    <h2>Integration Code</h2>
                    <div class="code-block">
                        <pre><span class="keyword">import</span> { FileUploader } <span class="keyword">from</span> <span class="string">'file-uploader'</span>;

<span class="comment">// FileUploader automatically includes FileCarousel</span>
<span class="keyword">const</span> uploader = <span class="keyword">new</span> FileUploader(<span class="string">'#myUploader'</span>, {
  <span class="property">urls</span>: {
    <span class="property">uploadUrl</span>: <span class="string">'/api/upload'</span>,
    <span class="property">deleteUrl</span>: <span class="string">'/api/delete'</span>,
  },

  <span class="comment">// Enable carousel preview</span>
  <span class="property">carousel</span>: {
    <span class="property">enableCarouselPreview</span>: <span class="keyword">true</span>,
    <span class="property">carouselShowDownloadButton</span>: <span class="keyword">true</span>,
    <span class="property">carouselAutoPreload</span>: <span class="keyword">true</span>,
  },

  <span class="comment">// Carousel options are passed through</span>
  <span class="property">carouselOptions</span>: {
    <span class="property">maxPreviewRows</span>: <span class="number">100</span>,
    <span class="property">maxTextPreviewChars</span>: <span class="number">50000</span>,
  },
});</pre>
                    </div>
                </div>

                <div class="demo-section">
                    <h2>Standalone Integration</h2>
                    <div class="code-block">
                        <pre><span class="keyword">import</span> { FileUploader, FileCarousel } <span class="keyword">from</span> <span class="string">'file-uploader'</span>;

<span class="comment">// Create uploader without built-in carousel</span>
<span class="keyword">const</span> uploader = <span class="keyword">new</span> FileUploader(<span class="string">'#myUploader'</span>, {
  <span class="property">carousel</span>: {
    <span class="property">enableCarouselPreview</span>: <span class="keyword">false</span>,
  },
});

<span class="comment">// Create standalone carousel</span>
<span class="keyword">let</span> carousel = <span class="keyword">null</span>;

<span class="comment">// Add custom click handler</span>
document.addEventListener(<span class="string">'click'</span>, (e) => {
  <span class="keyword">const</span> fileItem = e.target.closest(<span class="string">'.file-item'</span>);
  <span class="keyword">if</span> (fileItem) {
    <span class="keyword">const</span> files = uploader.getFiles();
    <span class="keyword">const</span> index = parseInt(fileItem.dataset.index);

    <span class="keyword">if</span> (carousel) carousel.destroy();
    carousel = <span class="keyword">new</span> FileCarousel({
      <span class="property">container</span>: document.body,
      <span class="property">files</span>: files,
      <span class="property">autoPreload</span>: <span class="keyword">true</span>,
    });
    carousel.open(index);
  }
});</pre>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="<?php echo asset('file-uploader.js', 'nomodule'); ?>"></script>
    <script type="module">
        import { FileUploader } from '<?php echo asset('file-uploader.js'); ?>';

        const uploader = new FileUploader('#fileUploader', {
            uploadUrl: '../../../api/upload.php',
            deleteUrl: '../../../api/delete.php',
            multiple: true,
            enableCarouselPreview: true,
            carouselShowDownloadButton: true,
        });
    </script>
</body>
</html>
