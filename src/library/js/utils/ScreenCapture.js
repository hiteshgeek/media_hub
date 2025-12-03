/**
 * ScreenCapture Class
 * Captures screenshots using MediaDevices API (getDisplayMedia)
 */

export default class ScreenCapture {
  constructor(options = {}) {
    this.options = {
      videoConstraints: {
        cursor: "always",
        ...options.videoConstraints,
      },
      captureDelay: 100, // Delay before capturing frame (ms)
      imageFormat: "image/png",
      imageQuality: 0.95,
      ...options,
    };

    this.stream = null;
    this.videoElement = null;
  }

  /**
   * Start screen capture and return captured image as File
   * @returns {Promise<File>} - Captured screenshot as File object
   */
  async capture() {
    try {
      // Request screen capture permission
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: this.options.videoConstraints,
        audio: false,
      });

      // Create video element to display stream
      this.videoElement = document.createElement("video");
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.muted = true;

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
        this.videoElement.onerror = reject;
      });

      // Small delay to ensure video is fully loaded
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.captureDelay)
      );

      // Capture frame from video
      const canvas = document.createElement("canvas");
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

      // Stop the stream
      this.stopStream();

      // Convert canvas to blob and then to File
      const blob = await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          this.options.imageFormat,
          this.options.imageQuality
        );
      });

      // Create File object with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const extension = this.options.imageFormat.split("/")[1];
      const filename = `screenshot-${timestamp}.${extension}`;

      const file = new File([blob], filename, {
        type: this.options.imageFormat,
        lastModified: Date.now(),
      });

      return file;
    } catch (error) {
      this.stopStream();

      // Handle user cancellation gracefully
      if (error.name === "NotAllowedError") {
        throw new Error("Screen capture permission denied");
      } else if (error.name === "NotFoundError") {
        throw new Error("No screen available for capture");
      } else {
        throw new Error(`Screen capture failed: ${error.message}`);
      }
    }
  }

  /**
   * Stop the media stream and cleanup
   */
  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  /**
   * Check if screen capture is supported
   * @returns {boolean}
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia
    );
  }
}
