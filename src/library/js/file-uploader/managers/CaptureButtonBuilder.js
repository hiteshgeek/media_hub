/**
 * CaptureButtonBuilder.js
 *
 * Handles creation of capture buttons for the FileUploader.
 * Creates screenshot, video recording, and audio recording buttons.
 *
 * @module CaptureButtonBuilder
 */

import { getIcon } from "../../shared/icons.js";
import ScreenCapture from "../../media-capture/capture/ScreenCapture.js";
import VideoRecorder from "../../media-capture/recording/VideoRecorder.js";
import AudioWorkletRecorder from "../../media-capture/recording/AudioWorkletRecorder.js";
import PageCapture from "../../utils/PageCapture.js";

// ============================================================
// CAPTURE BUTTON BUILDER CLASS
// ============================================================

export class CaptureButtonBuilder {
  /**
   * Create a CaptureButtonBuilder instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   * @param {CaptureManager} captureManager - The capture manager instance
   */
  constructor(uploader, captureManager) {
    this.uploader = uploader;
    this.captureManager = captureManager;
  }

  // ============================================================
  // MAIN BUTTON CREATION
  // ============================================================

  /**
   * Create all capture buttons
   */
  createCaptureButtons() {
    this.uploader.captureButtonContainer = document.createElement("div");
    this.uploader.captureButtonContainer.className = "file-uploader-capture-container";

    // Create individual buttons
    this.createFullPageCaptureButton();
    this.createRegionCaptureButton();
    this.createScreenshotButton();
    this.createVideoRecordButton();
    this.createAudioRecordButton();

    // Append capture buttons to action container
    if (this.uploader.captureButtonContainer.children.length > 0) {
      if (this.uploader.options.collapsibleCaptureButtons) {
        this.createCollapsibleContainer();
      } else {
        this.uploader.actionContainer.appendChild(this.uploader.captureButtonContainer);
      }
    }
  }

  // ============================================================
  // INDIVIDUAL BUTTON CREATION
  // ============================================================

  /**
   * Create full page capture button
   */
  createFullPageCaptureButton() {
    if (!this.uploader.options.enableFullPageCapture || !PageCapture.isSupported()) {
      return;
    }

    this.uploader.fullPageCaptureBtn = document.createElement("button");
    this.uploader.fullPageCaptureBtn.type = "button";
    this.uploader.fullPageCaptureBtn.className = "file-uploader-capture-btn has-tooltip";
    this.uploader.fullPageCaptureBtn.setAttribute("data-tooltip", "Capture Full Page");
    this.uploader.fullPageCaptureBtn.setAttribute("data-tooltip-position", "top");
    this.uploader.fullPageCaptureBtn.innerHTML = getIcon("fullpage_capture");
    this.uploader.fullPageCaptureBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.captureManager.captureFullPage();
    });
    this.uploader.captureButtonContainer.appendChild(this.uploader.fullPageCaptureBtn);
  }

  /**
   * Create region capture button
   */
  createRegionCaptureButton() {
    if (!this.uploader.options.enableRegionCapture || !PageCapture.isSupported()) {
      return;
    }

    this.uploader.regionCaptureBtn = document.createElement("button");
    this.uploader.regionCaptureBtn.type = "button";
    this.uploader.regionCaptureBtn.className = "file-uploader-capture-btn has-tooltip";
    this.uploader.regionCaptureBtn.setAttribute("data-tooltip", "Capture Region");
    this.uploader.regionCaptureBtn.setAttribute("data-tooltip-position", "top");
    this.uploader.regionCaptureBtn.innerHTML = getIcon("region_capture");
    this.uploader.regionCaptureBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.captureManager.captureRegion();
    });
    this.uploader.captureButtonContainer.appendChild(this.uploader.regionCaptureBtn);
  }

  /**
   * Create screenshot button
   */
  createScreenshotButton() {
    if (!this.uploader.options.enableScreenCapture || !ScreenCapture.isSupported()) {
      return;
    }

    this.uploader.screenshotBtn = document.createElement("button");
    this.uploader.screenshotBtn.type = "button";
    this.uploader.screenshotBtn.className = "file-uploader-capture-btn has-tooltip";
    this.uploader.screenshotBtn.setAttribute("data-tooltip", "Capture Screenshot");
    this.uploader.screenshotBtn.setAttribute("data-tooltip-position", "top");
    this.uploader.screenshotBtn.innerHTML = getIcon("camera");
    this.uploader.screenshotBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.captureManager.captureScreenshot();
    });
    this.uploader.captureButtonContainer.appendChild(this.uploader.screenshotBtn);
  }

  /**
   * Create video record button
   */
  createVideoRecordButton() {
    if (!this.uploader.options.enableVideoRecording || !VideoRecorder.isSupported()) {
      return;
    }

    this.uploader.videoRecordBtn = document.createElement("button");
    this.uploader.videoRecordBtn.type = "button";
    this.uploader.videoRecordBtn.className = "file-uploader-capture-btn has-tooltip";
    this.uploader.videoRecordBtn.setAttribute("data-tooltip", "Record Screen");
    this.uploader.videoRecordBtn.setAttribute("data-tooltip-position", "top");
    this.uploader.videoRecordBtn.innerHTML = getIcon("video");
    this.uploader.videoRecordBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.captureManager.toggleVideoRecording();
    });
    this.uploader.captureButtonContainer.appendChild(this.uploader.videoRecordBtn);

    this.createRecordingIndicator();
  }

  /**
   * Create audio record button
   */
  createAudioRecordButton() {
    if (!this.uploader.options.enableAudioRecording || !AudioWorkletRecorder.isSupported()) {
      return;
    }

    this.uploader.audioRecordBtn = document.createElement("button");
    this.uploader.audioRecordBtn.type = "button";
    this.uploader.audioRecordBtn.className = "file-uploader-capture-btn has-tooltip";
    this.uploader.audioRecordBtn.setAttribute("data-tooltip", "Record Audio");
    this.uploader.audioRecordBtn.setAttribute("data-tooltip-position", "top");
    this.uploader.audioRecordBtn.innerHTML = getIcon("audio");
    this.uploader.audioRecordBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.captureManager.toggleAudioRecording();
    });
    this.uploader.captureButtonContainer.appendChild(this.uploader.audioRecordBtn);

    if (!this.uploader.recordingIndicator) {
      this.createRecordingIndicator();
    }
  }

  // ============================================================
  // SUPPORTING ELEMENTS
  // ============================================================

  /**
   * Create recording indicator element
   */
  createRecordingIndicator() {
    const options = this.uploader.options;
    const showTime = options.showRecordingTime !== false;
    const showLimit = options.showRecordingLimit !== false;
    const showSize = options.showRecordingSize !== false;
    const enableToggle = options.recordingTimeClickToggle !== false;
    const defaultView = options.recordingTimeDefaultView || "elapsed";

    // Calculate max duration for display
    const maxVideoSec = Math.floor(options.maxVideoRecordingDuration || 300);
    const maxMins = Math.floor(maxVideoSec / 60);
    const maxSecs = maxVideoSec % 60;
    const maxTimeStr = `${String(maxMins).padStart(2, "0")}:${String(maxSecs).padStart(2, "0")}`;

    // Determine timer format for CSS width
    let timerFormat = "elapsed"; // default: just elapsed time
    if (showTime && showLimit && maxVideoSec > 0) {
      timerFormat = defaultView === "remaining" ? "remaining-limit" : "elapsed-limit";
    }

    // Build initial time display
    let timeDisplay = "";
    if (showTime) {
      if (defaultView === "remaining" && showLimit && maxVideoSec > 0) {
        timeDisplay = `-${maxTimeStr} / ${maxTimeStr}`;
      } else if (showLimit && maxVideoSec > 0) {
        timeDisplay = `00:00 / ${maxTimeStr}`;
      } else {
        timeDisplay = "00:00";
      }
    }

    this.uploader.recordingIndicator = document.createElement("div");
    this.uploader.recordingIndicator.className = "file-uploader-recording-indicator";
    this.uploader.recordingIndicator.style.display = "none";

    let innerHTML = '<span class="file-uploader-recording-dot"></span>';
    if (showTime) {
      innerHTML += `<span class="file-uploader-recording-time" data-timer-format="${timerFormat}">${timeDisplay}</span>`;
    }
    if (showSize) {
      innerHTML += '<span class="file-uploader-recording-size">~0 B</span>';
    }
    this.uploader.recordingIndicator.innerHTML = innerHTML;

    this.uploader.recordingIndicator.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Make time element clickable to toggle time display format (if enabled and limit is shown)
    const timeElement = this.uploader.recordingIndicator.querySelector(".file-uploader-recording-time");
    if (timeElement && enableToggle && showLimit && maxVideoSec > 0) {
      timeElement.style.cursor = "pointer";
      timeElement.classList.add("has-tooltip");
      timeElement.setAttribute("data-tooltip", "Click to toggle time display");
      timeElement.setAttribute("data-tooltip-position", "top");
      timeElement.dataset.showRemaining = defaultView === "remaining" ? "true" : "false";
      timeElement.addEventListener("click", (e) => {
        e.stopPropagation();
        const isRemaining = timeElement.dataset.showRemaining === "false";
        timeElement.dataset.showRemaining = isRemaining ? "true" : "false";
        // Update timer format for CSS width
        timeElement.dataset.timerFormat = isRemaining ? "remaining-limit" : "elapsed-limit";
      });
    } else if (timeElement) {
      timeElement.dataset.showRemaining = defaultView === "remaining" ? "true" : "false";
    }

    this.uploader.captureButtonContainer.appendChild(this.uploader.recordingIndicator);
  }

  /**
   * Create collapsible container for capture buttons
   */
  createCollapsibleContainer() {
    this.uploader.captureExpandable = document.createElement("div");
    this.uploader.captureExpandable.className = "file-uploader-capture-expandable";

    this.uploader.captureToggleBtn = document.createElement("button");
    this.uploader.captureToggleBtn.type = "button";
    this.uploader.captureToggleBtn.className = "file-uploader-capture-toggle has-tooltip";
    this.uploader.captureToggleBtn.setAttribute("data-tooltip", "Media Capture");
    this.uploader.captureToggleBtn.setAttribute("data-tooltip-position", "top");
    this.uploader.captureToggleBtn.innerHTML = `<span class="toggle-chevron">${getIcon("chevron_right")}</span>`;
    this.uploader.captureToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.captureManager.toggleCaptureButtons();
    });

    const buttonsWrapper = document.createElement("div");
    buttonsWrapper.className = "file-uploader-capture-buttons-wrapper";
    buttonsWrapper.appendChild(this.uploader.captureButtonContainer);

    this.uploader.captureExpandable.appendChild(this.uploader.captureToggleBtn);
    this.uploader.captureExpandable.appendChild(buttonsWrapper);
    this.uploader.actionContainer.appendChild(this.uploader.captureExpandable);
  }
}
