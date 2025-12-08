/**
 * CaptureManager.js
 *
 * Manages screen capture and recording functionality for the FileUploader.
 * Handles screenshot, video recording, and audio recording operations.
 *
 * @module CaptureManager
 */

import { getIcon } from "../../shared/icons.js";
import ScreenCapture from "../../media-capture/capture/ScreenCapture.js";
import VideoRecorder from "../../media-capture/recording/VideoRecorder.js";
import AudioWorkletRecorder from "../../media-capture/recording/AudioWorkletRecorder.js";
import PageCapture from "../../utils/PageCapture.js";
import { getFileType } from "../utils/helpers.js";
import { CaptureButtonBuilder } from "./CaptureButtonBuilder.js";

// ============================================================
// CAPTURE MANAGER CLASS
// ============================================================

export class CaptureManager {
  /**
   * Create a CaptureManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
    this.screenCapture = null;
    this.videoRecorder = null;
    this.audioRecorder = null;
    this.pageCapture = null;
    this.buttonBuilder = new CaptureButtonBuilder(uploader, this);
    // Track auto-stop reason for alert messaging
    this._autoStopReason = null;
  }

  // ============================================================
  // BUTTON CREATION (DELEGATED)
  // ============================================================

  /**
   * Create capture buttons (delegated to CaptureButtonBuilder)
   */
  createCaptureButtons() {
    this.buttonBuilder.createCaptureButtons();
  }

  /**
   * Toggle capture buttons expanded/collapsed state
   */
  toggleCaptureButtons() {
    if (!this.uploader.captureExpandable) return;
    this.uploader.captureExpandable.classList.toggle("expanded");
  }

  // ============================================================
  // SCREENSHOT CAPTURE
  // ============================================================

  /**
   * Capture screenshot from screen share
   */
  async captureScreenshot() {
    try {
      if (this.uploader.screenshotBtn) {
        this.uploader.screenshotBtn.disabled = true;
      }

      if (!this.screenCapture) {
        this.screenCapture = new ScreenCapture();
      }

      const file = await this.screenCapture.capture();
      this.uploader.handleCapturedFile(file, "screenshot");
    } catch (error) {
      this.uploader.showError(error.message);
    } finally {
      if (this.uploader.screenshotBtn) {
        this.uploader.screenshotBtn.disabled = false;
      }
    }
  }

  /**
   * Capture full page screenshot
   */
  async captureFullPage() {
    try {
      if (this.uploader.fullPageCaptureBtn) {
        this.uploader.fullPageCaptureBtn.disabled = true;
      }

      if (!this.pageCapture) {
        this.pageCapture = new PageCapture({
          onCaptureError: (error) => {
            this.uploader.showError(error.message);
          },
        });
      }

      const blob = await this.pageCapture.captureFullPage();
      const file = this.pageCapture.blobToFile(blob, "fullpage");
      this.uploader.handleCapturedFile(file, "fullpage-screenshot");
    } catch (error) {
      this.uploader.showError(error.message);
    } finally {
      if (this.uploader.fullPageCaptureBtn) {
        this.uploader.fullPageCaptureBtn.disabled = false;
      }
    }
  }

  /**
   * Capture region screenshot
   */
  async captureRegion() {
    try {
      if (this.uploader.regionCaptureBtn) {
        this.uploader.regionCaptureBtn.disabled = true;
      }

      if (!this.pageCapture) {
        this.pageCapture = new PageCapture({
          showDimensions: this.uploader.options.mediaCapture.regionCaptureShowDimensions,
          dimensionsPosition: this.uploader.options.mediaCapture.regionCaptureDimensionsPosition,
          immediateCapture: this.uploader.options.mediaCapture.regionCaptureImmediateCapture,
          onCaptureError: (error) => {
            this.uploader.showError(error.message);
          },
        });
      }

      const blob = await this.pageCapture.captureRegion();
      const file = this.pageCapture.blobToFile(blob, "region");
      this.uploader.handleCapturedFile(file, "region-screenshot");
    } catch (error) {
      if (error.message !== "Selection cancelled") {
        this.uploader.showError(error.message);
      }
    } finally {
      if (this.uploader.regionCaptureBtn) {
        this.uploader.regionCaptureBtn.disabled = false;
      }
    }
  }

  // ============================================================
  // VIDEO RECORDING
  // ============================================================

  /**
   * Toggle video recording on/off
   */
  async toggleVideoRecording() {
    if (this.videoRecorder && this.videoRecorder.getRecordingStatus().isRecording) {
      await this.stopVideoRecording();
    } else {
      await this.startVideoRecording();
    }
  }

  /**
   * Start video recording
   */
  async startVideoRecording() {
    try {
      if (this.uploader.videoRecordBtn) {
        this.uploader.videoRecordBtn.disabled = true;
      }

      const maxRecordingSize = this.calculateEffectiveMaxRecordingSize("video");
      this.videoRecorder = new VideoRecorder({
        maxDuration: this.uploader.options.mediaCapture.maxVideoRecordingDuration * 1000,
        systemAudioConstraints: this.uploader.options.mediaCapture.enableSystemAudio,
        microphoneAudioConstraints: this.uploader.options.mediaCapture.enableMicrophoneAudio,
        videoBitsPerSecond: this.uploader.options.mediaCapture.videoBitsPerSecond,
        audioBitsPerSecond: this.uploader.options.mediaCapture.audioBitsPerSecond,
        maxFileSize: maxRecordingSize,
        onAutoStop: (file) => this.handleVideoAutoStop(file),
        onSizeLimitReached: (status) => this.handleRecordingSizeLimitReached(status, "video"),
      });

      this.uploader.recordingUI.recordingType = "video";
      await this.videoRecorder.startRecording();
      this.uploader.recordingUI.setupStreamEndedHandler();

      this.hideCaptureButtons();
      this.uploader.recordingUI.createRecordingToolbar();
      if (this.uploader.videoRecordBtn) {
        this.uploader.videoRecordBtn.style.display = "none";
      }
      this.uploader.recordingUI.showRecordingIndicator();
    } catch (error) {
      this.uploader.showError(error.message);
      this.showCaptureButtons();
      if (this.uploader.videoRecordBtn) {
        this.uploader.videoRecordBtn.disabled = false;
      }
    }
  }

  /**
   * Stop video recording
   */
  async stopVideoRecording() {
    try {
      if (this.uploader.videoRecordBtn) {
        this.uploader.videoRecordBtn.disabled = true;
        this.uploader.videoRecordBtn.innerHTML = getIcon("video");
      }

      this.uploader.recordingUI.cleanup();
      const file = await this.videoRecorder.stopRecording();
      this.uploader.handleCapturedFile(file, "recording");

      this.showCaptureButtons();
      if (this.uploader.videoRecordBtn) {
        this.uploader.videoRecordBtn.classList.remove("recording");
        this.uploader.videoRecordBtn.title = "Record Video";
        this.uploader.videoRecordBtn.disabled = false;
      }
    } catch (error) {
      this.uploader.showError(error.message);
      this.uploader.recordingUI.cleanup();
      this.showCaptureButtons();
    }
  }

  /**
   * Handle video auto-stop (max duration or size limit reached)
   * @param {File} file - The recorded video file
   */
  handleVideoAutoStop(file) {
    this.uploader.recordingUI.cleanup();
    this.uploader.handleCapturedFile(file, "recording");
    this.showCaptureButtons();
    if (this.uploader.videoRecordBtn) {
      this.uploader.videoRecordBtn.classList.remove("recording");
      this.uploader.videoRecordBtn.title = "Record Video";
      this.uploader.videoRecordBtn.disabled = false;
    }

    // Show alert based on stop reason
    if (this._autoStopReason && this._autoStopReason.type === "size") {
      this.uploader.showInfo(`Recording stopped: file size limit reached (${this._autoStopReason.formattedSize})`);
    } else {
      // Max duration reached
      const maxDuration = this.uploader.options.mediaCapture.maxVideoRecordingDuration;
      const mins = Math.floor(maxDuration / 60);
      const secs = maxDuration % 60;
      const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      this.uploader.showInfo(`Recording stopped: maximum duration reached (${durationStr})`);
    }
    // Reset reason
    this._autoStopReason = null;
  }

  // ============================================================
  // AUDIO RECORDING
  // ============================================================

  /**
   * Toggle audio recording on/off
   */
  async toggleAudioRecording() {
    if (this.audioRecorder && this.audioRecorder.getRecordingStatus().isRecording) {
      await this.stopAudioRecording();
    } else {
      await this.startAudioRecording();
    }
  }

  /**
   * Start audio recording
   */
  async startAudioRecording() {
    try {
      if (this.uploader.audioRecordBtn) {
        this.uploader.audioRecordBtn.disabled = true;
      }

      const enableMic = this.uploader.options.mediaCapture.enableMicrophoneAudio ||
        (!this.uploader.options.mediaCapture.enableMicrophoneAudio && !this.uploader.options.mediaCapture.enableSystemAudio);

      const maxAudioRecordingSize = this.calculateEffectiveMaxRecordingSize("audio");
      this.audioRecorder = new AudioWorkletRecorder({
        enableMicrophoneAudio: enableMic,
        enableSystemAudio: this.uploader.options.mediaCapture.enableSystemAudio,
        maxRecordingDuration: this.uploader.options.mediaCapture.maxAudioRecordingDuration,
        sampleRate: 48000,
        bitDepth: 16,
        numberOfChannels: 2,
        maxFileSize: maxAudioRecordingSize,
        onAutoStop: (file) => this.handleAudioAutoStop(file),
        onSizeLimitReached: (status) => this.handleRecordingSizeLimitReached(status, "audio"),
      });

      this.uploader.recordingUI.recordingType = "audio";
      await this.audioRecorder.startRecording();
      this.uploader.recordingUI.setupStreamEndedHandler();

      this.hideCaptureButtons();
      this.uploader.recordingUI.createAudioRecordingToolbar();
      if (this.uploader.audioRecordBtn) {
        this.uploader.audioRecordBtn.style.display = "none";
      }
      this.uploader.recordingUI.showRecordingIndicator();
    } catch (error) {
      this.uploader.showError(error.message);
      this.showCaptureButtons();
      if (this.uploader.audioRecordBtn) {
        this.uploader.audioRecordBtn.disabled = false;
      }
    }
  }

  /**
   * Stop audio recording
   */
  async stopAudioRecording() {
    try {
      if (this.uploader.audioRecordBtn) {
        this.uploader.audioRecordBtn.disabled = true;
        this.uploader.audioRecordBtn.innerHTML = getIcon("audio");
      }

      this.uploader.recordingUI.cleanup();
      const file = await this.audioRecorder.stopRecording();
      this.uploader.handleCapturedFile(file, "audio_recording");

      this.showCaptureButtons();
      if (this.uploader.audioRecordBtn) {
        this.uploader.audioRecordBtn.classList.remove("recording");
        this.uploader.audioRecordBtn.title = "Record Audio";
        this.uploader.audioRecordBtn.disabled = false;
      }
    } catch (error) {
      this.uploader.showError(error.message);
      this.uploader.recordingUI.cleanup();
      this.showCaptureButtons();
    }
  }

  /**
   * Handle audio auto-stop (max duration or size limit reached)
   * @param {File} file - The recorded audio file
   */
  handleAudioAutoStop(file) {
    this.uploader.recordingUI.cleanup();
    this.uploader.handleCapturedFile(file, "audio_recording");
    this.showCaptureButtons();
    if (this.uploader.audioRecordBtn) {
      this.uploader.audioRecordBtn.classList.remove("recording");
      this.uploader.audioRecordBtn.title = "Record Audio";
      this.uploader.audioRecordBtn.disabled = false;
    }

    // Show alert based on stop reason
    if (this._autoStopReason && this._autoStopReason.type === "size") {
      this.uploader.showInfo(`Recording stopped: file size limit reached (${this._autoStopReason.formattedSize})`);
    } else {
      // Max duration reached
      const maxDuration = this.uploader.options.mediaCapture.maxAudioRecordingDuration;
      const mins = Math.floor(maxDuration / 60);
      const secs = maxDuration % 60;
      const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      this.uploader.showInfo(`Recording stopped: maximum duration reached (${durationStr})`);
    }
    // Reset reason
    this._autoStopReason = null;
  }

  /**
   * Handle recording size limit reached
   * @param {Object} status - Recording status
   * @param {string} type - Recording type (video/audio)
   */
  handleRecordingSizeLimitReached(status, type) {
    // Set reason so auto-stop handler knows it was due to size limit
    this._autoStopReason = {
      type: "size",
      formattedSize: status.formattedSize,
      recordingType: type
    };
  }

  // ============================================================
  // SIZE CALCULATIONS
  // ============================================================

  /**
   * Calculate effective max recording size based on all limits
   * @param {string} recordingType - Type of recording (video/audio)
   * @returns {number|null} Maximum recording size in bytes
   */
  calculateEffectiveMaxRecordingSize(recordingType) {
    const limits = [];

    if (recordingType === "video" && this.uploader.options.mediaCapture.maxVideoRecordingFileSize) {
      limits.push(this.uploader.options.mediaCapture.maxVideoRecordingFileSize);
    } else if (recordingType === "audio" && this.uploader.options.mediaCapture.maxAudioRecordingFileSize) {
      limits.push(this.uploader.options.mediaCapture.maxAudioRecordingFileSize);
    }

    if (this.uploader.options.limits.perFileMaxSize) {
      limits.push(this.uploader.options.limits.perFileMaxSize);
    }

    if (this.uploader.options.perTypeLimits.perFileMaxSizePerType) {
      const perTypeLimit = this.uploader.options.perTypeLimits.perFileMaxSizePerType[recordingType];
      if (perTypeLimit) {
        limits.push(perTypeLimit);
      }
    }

    if (this.uploader.options.limits.totalMaxSize) {
      const currentTotalSize = this.getCurrentTotalSize();
      const remainingTotal = this.uploader.options.limits.totalMaxSize - currentTotalSize;
      if (remainingTotal > 0) {
        limits.push(remainingTotal);
      } else {
        return 0;
      }
    }

    if (this.uploader.options.perTypeLimits.perTypeMaxTotalSize) {
      const perTypeTotalLimit = this.uploader.options.perTypeLimits.perTypeMaxTotalSize[recordingType];
      if (perTypeTotalLimit) {
        const currentTypeSize = this.getCurrentTypeTotalSize(recordingType);
        const remainingTypeTotal = perTypeTotalLimit - currentTypeSize;
        if (remainingTypeTotal > 0) {
          limits.push(remainingTypeTotal);
        } else {
          return 0;
        }
      }
    }

    if (limits.length === 0) {
      return null;
    }

    return Math.min(...limits);
  }

  /**
   * Get current total size of all files
   * @returns {number} Total size in bytes
   */
  getCurrentTotalSize() {
    let totalSize = 0;
    this.uploader.files.forEach((file) => {
      totalSize += file.size || 0;
    });
    return totalSize;
  }

  /**
   * Get current total size for a specific file type
   * @param {string} type - File type
   * @returns {number} Total size in bytes
   */
  getCurrentTypeTotalSize(type) {
    let totalSize = 0;
    this.uploader.files.forEach((file) => {
      const fileType = getFileType(file.extension, this.uploader.options);
      if (fileType === type) {
        totalSize += file.size || 0;
      }
    });
    return totalSize;
  }

  // ============================================================
  // VISIBILITY HELPERS
  // ============================================================

  /**
   * Hide all capture buttons
   */
  hideCaptureButtons() {
    if (this.uploader.screenshotBtn) this.uploader.screenshotBtn.style.display = "none";
    if (this.uploader.audioRecordBtn) this.uploader.audioRecordBtn.style.display = "none";
    if (this.uploader.videoRecordBtn) this.uploader.videoRecordBtn.style.display = "none";
    if (this.uploader.fullPageCaptureBtn) this.uploader.fullPageCaptureBtn.style.display = "none";
    if (this.uploader.regionCaptureBtn) this.uploader.regionCaptureBtn.style.display = "none";
    // Hide the collapsible toggle button when recording
    if (this.uploader.captureToggleBtn) this.uploader.captureToggleBtn.style.display = "none";
    // Add recording state class to expandable container for CSS handling
    if (this.uploader.captureExpandable) this.uploader.captureExpandable.classList.add("recording");
  }

  /**
   * Show all capture buttons
   */
  showCaptureButtons() {
    if (this.uploader.screenshotBtn) this.uploader.screenshotBtn.style.display = "";
    if (this.uploader.audioRecordBtn) this.uploader.audioRecordBtn.style.display = "";
    if (this.uploader.videoRecordBtn) this.uploader.videoRecordBtn.style.display = "";
    if (this.uploader.fullPageCaptureBtn) this.uploader.fullPageCaptureBtn.style.display = "";
    if (this.uploader.regionCaptureBtn) this.uploader.regionCaptureBtn.style.display = "";
    // Show the collapsible toggle button when recording stops
    if (this.uploader.captureToggleBtn) this.uploader.captureToggleBtn.style.display = "";
    // Remove recording state class from expandable container
    if (this.uploader.captureExpandable) this.uploader.captureExpandable.classList.remove("recording");
  }
}
