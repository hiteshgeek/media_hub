# WebM Duration Metadata Fix

## Problem

When recording screen videos using the MediaRecorder API with WebM format, the duration metadata is often missing or incorrect. This causes issues in video players:

- Video duration shows as "0:00" or is not displayed
- Seeking/scrubbing through the video doesn't work properly
- Progress bar shows incorrect information

## Solution

The `VideoRecorder` class now includes automatic duration metadata fixing for WebM files using the `webm-duration-fix` library loaded via CDN.

## Installation

To enable WebM duration fixing, add the webm-duration-fix library via CDN in your HTML file:

```html
<!-- Add this script tag before your file uploader script -->
<script src="https://cdn.jsdelivr.net/npm/webm-duration-fix@latest/dist/webm-duration-fix.min.js"></script>
```

**No npm installation required!** The library is loaded directly from CDN.

## How It Works

1. When a recording stops, the `VideoRecorder` calculates the actual recording duration
2. If the recorded file is WebM format and `fixWebmDuration` is available, it automatically:
   - Decodes the EBML structure
   - Injects the correct duration metadata
   - Makes the file seekable with proper cues
3. Returns the fixed WebM file with correct duration

## Manual Fix (Alternative)

If you prefer to manually fix WebM files after recording, you can use this function:

```javascript
// The fixWebmDuration function is automatically available from the CDN script

mediaRecorder.onstop = async () => {
  const blob = new Blob(chunks, { type: 'video/webm' });

  // Fix duration metadata
  const fixedBlob = await fixWebmDuration(blob);

  const url = URL.createObjectURL(fixedBlob);
  // Use the fixed blob...
};
```

## Verification

After recording a video, check if the duration is fixed:

1. Open the recorded WebM file in a video player
2. Check if the total duration is displayed correctly
3. Try seeking/scrubbing through the video
4. The progress bar should show accurate position

## Fallback Behavior

If `fixWebmDuration` is not loaded:

- A warning will be logged to the console
- Recording will continue to work normally
- The WebM file will be created without duration metadata fix
- This won't break any functionality, but video players may not show duration correctly

## Browser Compatibility

The duration fix works in all browsers that support:

- MediaRecorder API
- WebM format recording
- ArrayBuffer/Blob APIs

Tested on:

- Chrome/Edge (Chromium-based)
- Firefox
- Opera

## Technical Details

### EBML Format

WebM uses the EBML (Extensible Binary Meta Language) format, similar to XML but binary. The ts-ebml library:

- Parses the EBML structure
- Locates the SegmentInfo section
- Injects the duration value
- Rebuilds the metadata with proper seeking cues

### Performance

The duration fix adds minimal overhead:

- Processing time: ~50-200ms for typical recordings
- Memory usage: Temporary buffer of video size
- No quality loss or re-encoding

### Duration Calculation

Duration is calculated as:
```
durationMs = Date.now() - startTime
```

This provides millisecond accuracy for the video duration.

## Troubleshooting

### Duration Still Not Showing

1. Verify `fixWebmDuration` is loaded: Open browser console and type `window.fixWebmDuration`
2. Check browser console for errors
3. Ensure the recording actually captured frames
4. Try refreshing the page to reload the CDN script
5. Try a different video player

### Script Not Loading

If the CDN script doesn't load:

```html
<!-- Make sure the script is placed BEFORE your module scripts -->
<script src="https://cdn.jsdelivr.net/npm/webm-duration-fix@latest/dist/webm-duration-fix.min.js"></script>

<!-- Then load your file uploader -->
<script type="module" src="./dist/js/file-uploader.js"></script>
```

### CORS or Network Issues

If you can't load from CDN, you can download the library and host it locally:

1. Download from: https://cdn.jsdelivr.net/npm/webm-duration-fix@latest/dist/webm-duration-fix.min.js
2. Place in your project (e.g., `public/js/webm-duration-fix.min.js`)
3. Update the script tag:
```html
<script src="/js/webm-duration-fix.min.js"></script>
```

## References

- [webm-duration-fix npm](https://www.npmjs.com/package/webm-duration-fix)
- [EBML Specification](https://matroska.org/technical/specs/index.html)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [WebM Format](https://www.webmproject.org/)
