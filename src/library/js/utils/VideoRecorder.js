/**
 * VideoRecorder Class
 * Records screen video using MediaDevices API (getDisplayMedia)
 *
 * Note: For duration metadata fix, use one of these methods:
 * 1. NPM: npm install @fix-webm-duration/fix
 * 2. CDN: <script src="https://unpkg.com/fix-webm-duration@1.0.5/fix-webm-duration.js"></script>
 */

import { fixWebmDuration } from "@fix-webm-duration/fix";

export default class VideoRecorder {
  constructor(options = {}) {
    this.options = {
      videoConstraints: {
        cursor: "always",
        ...options.videoConstraints,
      },
      audioConstraints: false, // Can be set to true to record audio
      mimeType: "video/webm", // Default video format
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      maxDuration: 300000, // 5 minutes max (in milliseconds)
      ...options,
    };

    this.stream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
    this.recordingTimer = null;
  }

  /**
   * Start video recording
   * @returns {Promise<void>}
   */
  async startRecording() {
    if (this.isRecording) {
      throw new Error("Recording is already in progress");
    }

    try {
      // Request screen capture permission with audio option
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: this.options.videoConstraints,
        audio: this.options.audioConstraints,
      });

      // Determine supported MIME type
      const mimeType = this.getSupportedMimeType();

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType,
        videoBitsPerSecond: this.options.videoBitsPerSecond,
      });

      this.recordedChunks = [];

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.startTime = Date.now();

      // Auto-stop after max duration
      this.recordingTimer = setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.options.maxDuration);

      // Handle stream ending (user stops sharing)
      this.stream.getTracks().forEach((track) => {
        track.onended = () => {
          if (this.isRecording) {
            this.stopRecording();
          }
        };
      });
    } catch (error) {
      this.cleanup();

      // Handle user cancellation gracefully
      if (error.name === "NotAllowedError") {
        throw new Error("Screen recording permission denied");
      } else if (error.name === "NotFoundError") {
        throw new Error("No screen available for recording");
      } else {
        throw new Error(`Video recording failed: ${error.message}`);
      }
    }
  }

  /**
   * Stop video recording and return recorded video as File
   * @returns {Promise<File>} - Recorded video as File object
   */
  async stopRecording() {
    if (!this.isRecording) {
      throw new Error("No recording in progress");
    }

    return new Promise((resolve, reject) => {
      // Handle stop event
      this.mediaRecorder.onstop = async () => {
        try {
          // Calculate actual recording duration
          const durationMs = this.startTime ? Date.now() - this.startTime : 0;

          // Create blob from recorded chunks
          const mimeType = this.mediaRecorder.mimeType;
          let blob = new Blob(this.recordedChunks, { type: mimeType });

          console.log('Recording stopped:', { mimeType, durationMs });

          // Helper to find a fixer function (works for global CDN or ESM import)
          const getFixer = () => {
            if (typeof window !== 'undefined' && typeof window.fixWebmDuration === 'function') {
              return window.fixWebmDuration;
            }
            // If you used an ESM import, you can reference it directly in scope
            if (typeof fixWebmDuration === 'function') return fixWebmDuration;
            return null;
          };

          const fixer = getFixer();

          if (mimeType.includes('webm') && fixer && durationMs > 0) {
            try {
              // fixWebmDuration expects (blob, durationMs, options)
              const fixed = await fixer(blob, durationMs, { logger: console.debug });
              if (fixed instanceof Blob) {
                blob = fixed;
                console.log('✅ WebM duration fixed:', durationMs + 'ms');
              } else {
                console.warn('⚠️ fixer returned non-blob, skipping.');
              }
            } catch (err) {
              console.error('❌ Failed to fix WebM duration:', err);
              // Fall back to original blob
            }
          } else {
            console.warn('⚠️ WebM duration fix skipped:', {
              reason:
                !mimeType.includes('webm') ? 'Not WebM format' :
                !fixer ? 'fixer not available' :
                !(durationMs > 0) ? 'No duration recorded' : 'Unknown'
            });
          }

          // Create File object with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const extension = this.getExtensionFromMimeType(mimeType);
          const filename = `recording-${timestamp}.${extension}`;

          const file = new File([blob], filename, {
            type: mimeType,
            lastModified: Date.now(),
          });

          this.cleanup();
          resolve(file);
        } catch (error) {
          this.cleanup();
          reject(new Error(`Failed to create video file: ${error.message}`));
        }
      };

      this.mediaRecorder.onerror = (error) => {
        this.cleanup();
        reject(new Error(`Recording error: ${error.message}`));
      };

      // Stop the recorder
      if (this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }

      this.isRecording = false;
    });
  }

  /**
   * Get recording duration in seconds
   * @returns {number}
   */
  getRecordingDuration() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get recording status
   * @returns {boolean}
   */
  getRecordingStatus() {
    return this.isRecording;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }

    this.recordedChunks = [];
    this.isRecording = false;
    this.startTime = null;
  }

  /**
   * Get supported MIME type for recording
   * @returns {string}
   */
  getSupportedMimeType() {
    const types = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return ""; // Browser will choose default
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType
   * @returns {string}
   */
  getExtensionFromMimeType(mimeType) {
    const match = mimeType.match(/video\/([a-z0-9]+)/i);
    if (match && match[1]) {
      return match[1] === "quicktime" ? "mov" : match[1];
    }
    return "webm"; // Default
  }

  /**
   * Check if video recording is supported
   * @returns {boolean}
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia &&
      window.MediaRecorder
    );
  }
}
