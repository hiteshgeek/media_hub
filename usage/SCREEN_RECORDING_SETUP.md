# Screen Recording & Capture Setup Guide

## Overview

Your file uploader now includes **screen capture** and **video recording** features with automatic WebM duration metadata fixing!

## Features

✅ **Screenshot Capture** - Capture screenshots using browser's screen sharing
✅ **Video Recording** - Record screen with audio support (up to 5 minutes)
✅ **Duration Fix** - Automatic WebM duration metadata correction
✅ **Visual Indicators** - Camera/video icons on captured files
✅ **Recording Timer** - Real-time recording duration display
✅ **Auto-stop** - Recording stops automatically after 5 minutes

---

## Quick Setup (3 Steps)

### Step 1: Add webm-duration-fix CDN Script

Add this script tag to your HTML **before** loading the file uploader:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Your CSS -->
    <link rel="stylesheet" href="dist/css/file-uploader.css">
</head>
<body>
    <!-- Your content -->

    <!-- STEP 1: Add webm-duration-fix for WebM duration fixing -->
    <script src="https://cdn.jsdelivr.net/npm/webm-duration-fix@latest/dist/webm-duration-fix.min.js"></script>

    <!-- STEP 2: Load file uploader -->
    <script type="module">
        import { FileUploader } from './dist/js/file-uploader.js';

        // STEP 3: Initialize with capture features enabled
        const uploader = new FileUploader('#file-uploader', {
            uploadUrl: '/upload',
            enableScreenCapture: true,  // Enable screenshot button
            enableVideoRecording: true, // Enable video recording button
        });
    </script>
</body>
</html>
```

---

## Configuration Options

```javascript
const uploader = new FileUploader('#file-uploader', {
    // Screen capture options
    enableScreenCapture: true,      // Show screenshot capture button
    enableVideoRecording: true,     // Show video recording button

    // File validation
    maxFileSize: 10485760,          // 10MB max
    videoExtensions: ['mp4', 'webm', 'mov', 'avi'],
    imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],

    // Upload configuration
    uploadUrl: '/upload',
    multiple: true,
});
```

---

## How It Works

### Screenshot Capture Flow
1. User clicks camera icon button (bottom right of dropzone)
2. Browser asks for screen sharing permission
3. User selects screen/window to share
4. Screenshot is captured immediately
5. File is added to preview with camera indicator icon
6. File is uploaded automatically

### Video Recording Flow
1. User clicks video icon button (bottom right of dropzone)
2. Browser asks for screen sharing permission
3. User selects screen/window to record
4. Recording starts with red indicator and timer
5. User clicks stop button (or 5-minute auto-stop)
6. WebM duration is automatically fixed
7. File is added to preview with video indicator icon
8. File is uploaded automatically

---

## WebM Duration Fix Details

### Why It's Needed
MediaRecorder API creates WebM files without proper duration metadata, causing:
- Video players showing "0:00" duration
- Broken seek/scrub functionality
- Incorrect progress bars

### How It's Fixed
1. Recording duration is tracked from start to stop
2. `webm-duration-fix` library decodes the EBML structure
3. Duration metadata is injected correctly
4. File becomes fully seekable with proper cues
5. Fixed file is uploaded to server

### Verification
To verify the fix is working:
```javascript
// Check console for this message after stopping recording:
// "✅ WebM duration fixed: [duration]ms"
```

---

## UI Elements

### Capture Buttons (Bottom Right Corner)
- **Camera Icon** - Screenshot capture
- **Video Icon** - Start/stop recording
- **Recording Indicator** - Red dot with timer during recording

### Preview Indicators (Top Right of File)
- **Camera Badge** - Shows on captured screenshots
- **Video Badge** - Shows on recorded videos

---

## Browser Support

### Screen Capture API Support
✅ Chrome/Edge 72+
✅ Firefox 66+
✅ Opera 60+
✅ Safari 13+ (macOS only)
❌ IE 11 (not supported)

### MediaRecorder API Support
✅ Chrome/Edge 49+
✅ Firefox 25+
✅ Opera 36+
✅ Safari 14.1+
❌ IE 11 (not supported)

Buttons automatically hide on unsupported browsers.

---

## Video Format & Codec

**Default Output**: WebM format with VP9/VP8 codec

The VideoRecorder automatically selects the best supported format:
1. `video/webm;codecs=vp9` (preferred)
2. `video/webm;codecs=vp8` (fallback)
3. `video/webm` (generic)
4. `video/mp4` (if WebM not supported)

---

## Recording Limits

- **Max Duration**: 5 minutes (300 seconds)
- **Auto-stop**: Recording stops automatically at limit
- **Bitrate**: 2.5 Mbps (2,500,000 bps)
- **File Size**: ~110 MB for 5-minute recording

To customize:
```javascript
const uploader = new FileUploader('#file-uploader', {
    // Custom video recorder options (passed to VideoRecorder class)
    // Note: These are not direct FileUploader options
});
```

---

## Troubleshooting

### Issue: Duration still shows 0:00
**Solution**: Ensure webm-duration-fix script is loaded before file uploader
```html
<!-- Correct order -->
<script src="https://cdn.jsdelivr.net/npm/webm-duration-fix@latest/dist/webm-duration-fix.min.js"></script>
<script type="module" src="./dist/js/file-uploader.js"></script>
```

### Issue: Buttons don't appear
**Causes**:
1. Browser doesn't support MediaDevices API
2. Options are disabled: Check `enableScreenCapture` and `enableVideoRecording`
3. Page not served over HTTPS (required for getUserMedia)

**Solution**: Serve your site over HTTPS in production

### Issue: Permission denied
**Cause**: User denied screen sharing permission

**Solution**: Inform users they need to allow permission when browser prompts

### Issue: Recording stops unexpectedly
**Causes**:
1. User stopped screen sharing from browser UI
2. 5-minute limit reached
3. Browser tab closed/minimized (in some browsers)

---

## Testing Checklist

- [ ] Load page over HTTPS
- [ ] Verify webm-duration-fix script loads: type `window.fixWebmDuration` in console
- [ ] Camera icon appears in dropzone
- [ ] Video icon appears in dropzone
- [ ] Click camera icon → permission prompt → screenshot captured
- [ ] Click video icon → permission prompt → recording starts
- [ ] Recording indicator shows with timer
- [ ] Click stop → recording stops and uploads
- [ ] Preview shows indicator badges
- [ ] Download recorded file → check duration in video player
- [ ] Video player shows correct duration
- [ ] Seek/scrub works properly

---

## Security Considerations

1. **HTTPS Required**: MediaDevices API requires secure context
2. **User Permission**: Browser prompts for screen sharing
3. **Same-origin Policy**: File upload follows CORS rules
4. **File Validation**: Server should re-validate file types
5. **Size Limits**: Enforce server-side size limits

---

## Performance Tips

1. **Limit Recording Duration**: Default 5 minutes prevents huge files
2. **Bitrate Control**: 2.5 Mbps balances quality and size
3. **Chunk Collection**: Data collected every 100ms for smooth recording
4. **Memory Cleanup**: Streams properly closed after capture/recording

---

## Additional Resources

- [WEBM_DURATION_FIX.md](WEBM_DURATION_FIX.md) - Detailed duration fix documentation
- [USAGE_EXAMPLE.html](USAGE_EXAMPLE.html) - Complete working example
- [ts-ebml GitHub](https://github.com/legokichi/ts-ebml) - Library documentation
- [MDN MediaDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices) - API reference

---

## Example Implementation

See [USAGE_EXAMPLE.html](USAGE_EXAMPLE.html) for a complete working example.

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify webm-duration-fix is loaded: `console.log(window.fixWebmDuration)`
3. Test in Chrome/Edge first (best support)
4. Ensure HTTPS in production

---

**🎉 That's it! Your file uploader now has professional screen capture and recording capabilities!**
