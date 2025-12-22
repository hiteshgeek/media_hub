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

  /**
   * Get the CSS class for button size
   * @returns {string} Size class or empty string for default (md)
   */
  getButtonSizeClass() {
    const size = this.uploader.options.buttons.buttonSize;
    if (size && size !== "md") {
      return `media-hub-capture-btn-${size}`;
    }
    return "";
  }

  // ============================================================
  // MAIN BUTTON CREATION
  // ============================================================

  /**
   * Create all capture buttons
   */
  createCaptureButtons() {
    this.uploader.captureButtonContainer = document.createElement("div");
    this.uploader.captureButtonContainer.className = "media-hub-capture-container";

    // Create individual buttons
    this.createFullPageCaptureButton();
    this.createRegionCaptureButton();
    this.createScreenshotButton();
    this.createVideoRecordButton();
    this.createAudioRecordButton();

    // Append capture buttons to action container
    if (this.uploader.captureButtonContainer.children.length > 0) {
      if (this.uploader.options.buttons.collapsibleCaptureButtons) {
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
    if (!this.uploader.options.mediaCapture.enableFullPageCapture || !PageCapture.isSupported()) {
      return;
    }

    this.uploader.fullPageCaptureBtn = document.createElement("button");
    this.uploader.fullPageCaptureBtn.type = "button";
    const fullPageSizeClass = this.getButtonSizeClass();
    this.uploader.fullPageCaptureBtn.className = `media-hub-capture-btn${fullPageSizeClass ? ` ${fullPageSizeClass}` : ""} has-tooltip`;
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
    if (!this.uploader.options.mediaCapture.enableRegionCapture || !PageCapture.isSupported()) {
      return;
    }

    this.uploader.regionCaptureBtn = document.createElement("button");
    this.uploader.regionCaptureBtn.type = "button";
    const regionSizeClass = this.getButtonSizeClass();
    this.uploader.regionCaptureBtn.className = `media-hub-capture-btn${regionSizeClass ? ` ${regionSizeClass}` : ""} has-tooltip`;
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
    if (!this.uploader.options.mediaCapture.enableScreenCapture || !ScreenCapture.isSupported()) {
      return;
    }

    this.uploader.screenshotBtn = document.createElement("button");
    this.uploader.screenshotBtn.type = "button";
    const screenshotSizeClass = this.getButtonSizeClass();
    this.uploader.screenshotBtn.className = `media-hub-capture-btn${screenshotSizeClass ? ` ${screenshotSizeClass}` : ""} has-tooltip`;
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
    if (!this.uploader.options.mediaCapture.enableVideoRecording || !VideoRecorder.isSupported()) {
      return;
    }

    this.uploader.videoRecordBtn = document.createElement("button");
    this.uploader.videoRecordBtn.type = "button";
    const videoSizeClass = this.getButtonSizeClass();
    this.uploader.videoRecordBtn.className = `media-hub-capture-btn${videoSizeClass ? ` ${videoSizeClass}` : ""} has-tooltip`;
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
    if (!this.uploader.options.mediaCapture.enableAudioRecording || !AudioWorkletRecorder.isSupported()) {
      return;
    }

    this.uploader.audioRecordBtn = document.createElement("button");
    this.uploader.audioRecordBtn.type = "button";
    const audioSizeClass = this.getButtonSizeClass();
    this.uploader.audioRecordBtn.className = `media-hub-capture-btn${audioSizeClass ? ` ${audioSizeClass}` : ""} has-tooltip`;
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
    const timerSize = options.timerSize;
    const timerSizeClass = timerSize && timerSize !== "md" ? ` timer-${timerSize}` : "";
    this.uploader.recordingIndicator.className = `media-hub-recording-indicator${timerSizeClass}`;
    this.uploader.recordingIndicator.style.display = "none";

    let innerHTML = '<span class="media-hub-recording-dot"></span>';
    if (showTime) {
      innerHTML += `<span class="media-hub-recording-time" data-timer-format="${timerFormat}">${timeDisplay}</span>`;
    }
    if (showSize) {
      innerHTML += '<span class="media-hub-recording-size">~0 B</span>';
    }
    this.uploader.recordingIndicator.innerHTML = innerHTML;

    this.uploader.recordingIndicator.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Make time element clickable to toggle time display format (if enabled and limit is shown)
    const timeElement = this.uploader.recordingIndicator.querySelector(".media-hub-recording-time");
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
    this.uploader.captureExpandable.className = "media-hub-capture-expandable";

    this.uploader.captureToggleBtn = document.createElement("button");
    this.uploader.captureToggleBtn.type = "button";
    const toggleSizeClass = this.getButtonSizeClass();
    this.uploader.captureToggleBtn.className = `media-hub-capture-toggle${toggleSizeClass ? ` ${toggleSizeClass.replace("capture-btn", "capture-toggle")}` : ""} has-tooltip`;
    this.uploader.captureToggleBtn.setAttribute("data-tooltip", "Media Capture");
    this.uploader.captureToggleBtn.setAttribute("data-tooltip-position", "top");
    this.uploader.captureToggleBtn.innerHTML = `<span class="toggle-chevron">${getIcon("chevron_right")}</span>`;
    this.uploader.captureToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.captureManager.toggleCaptureButtons();
    });

    const buttonsWrapper = document.createElement("div");
    buttonsWrapper.className = "media-hub-capture-buttons-wrapper";
    buttonsWrapper.appendChild(this.uploader.captureButtonContainer);

    this.uploader.captureExpandable.appendChild(this.uploader.captureToggleBtn);
    this.uploader.captureExpandable.appendChild(buttonsWrapper);
    this.uploader.actionContainer.appendChild(this.uploader.captureExpandable);
  }
}
