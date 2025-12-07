/**
 * RecordingUI.js
 *
 * Manages all video and audio recording UI components and interactions.
 * Provides toolbar, timer, pause/resume controls, and audio toggles.
 *
 * @module RecordingUI
 */

import { getIcon } from "../../shared/icons.js";
import TooltipManager from "../../utils/TooltipManager.js";

export default class RecordingUI {
  constructor(fileUploader) {
    this.uploader = fileUploader;
    this.recordingToolbar = null;
    this.recordingToolbarButtons = null;
    this.recordingTimerInterval = null;
    this.recordingType = null; // 'video' or 'audio'
    this.externalContainerButtons = null; // Original buttons in external container to hide during recording
    this.externalRecordingIndicator = null; // Recording indicator for external container
  }

  /**
   * Get the container for recording toolbar
   * Uses external container if specified, otherwise internal captureButtonContainer
   * @returns {HTMLElement|null}
   */
  getToolbarContainer() {
    const externalContainer = this.uploader.options.externalRecordingToolbarContainer;
    if (externalContainer) {
      // Support both string selector and element reference
      if (typeof externalContainer === 'string') {
        const el = document.querySelector(externalContainer);
        if (el) return el;
      } else if (externalContainer instanceof HTMLElement && document.body.contains(externalContainer)) {
        // Verify element is still in DOM
        return externalContainer;
      }
    }
    return this.uploader.captureButtonContainer;
  }

  /**
   * Check if using external container
   * @returns {boolean}
   */
  isUsingExternalContainer() {
    return !!this.uploader.options.externalRecordingToolbarContainer;
  }

  /**
   * Hide original buttons in the container before showing recording toolbar
   * @param {HTMLElement} container - The toolbar container
   */
  hideOriginalButtons(container) {
    if (this.isUsingExternalContainer() && container) {
      // Find all capture buttons in the external container and hide them
      const captureButtons = container.querySelectorAll('.file-uploader-capture-btn');
      this.externalContainerButtons = Array.from(captureButtons);

      // Also find and hide the modal trigger button (sibling of the container)
      const parent = container.parentElement;
      if (parent) {
        const modalBtn = parent.querySelector('.fu-config-builder-modal-btn');
        if (modalBtn) {
          this.externalContainerButtons.push(modalBtn);
        }
      }

      this.externalContainerButtons.forEach(btn => {
        btn.style.display = 'none';
      });
    }
  }

  /**
   * Show original buttons in the container after recording stops
   */
  showOriginalButtons() {
    if (this.externalContainerButtons) {
      this.externalContainerButtons.forEach(btn => {
        btn.style.display = '';
      });
      this.externalContainerButtons = null;
    }
  }

  /**
   * Show countdown before recording starts
   * @param {number} duration - Countdown duration in seconds
   * @returns {Promise<void>}
   */
  async showCountdown(duration) {
    return new Promise((resolve) => {
      const countdown = document.createElement("div");
      countdown.className = "file-uploader-countdown-overlay";
      countdown.innerHTML = `
        <div class="file-uploader-countdown-content">
          <div class="file-uploader-countdown-number">${duration}</div>
          <div class="file-uploader-countdown-text">Get ready to record...</div>
        </div>
      `;
      document.body.appendChild(countdown);

      const numberElement = countdown.querySelector(".file-uploader-countdown-number");
      let remaining = duration;

      const interval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
          numberElement.textContent = remaining;
          numberElement.classList.remove("pulse");
          void numberElement.offsetWidth; // Force reflow
          numberElement.classList.add("pulse");
        } else {
          clearInterval(interval);
          countdown.remove();
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Create and show video recording toolbar
   */
  createRecordingToolbar() {
    if (this.recordingToolbar) {
      this.recordingToolbar.remove();
    }

    const captureContainer = this.getToolbarContainer();
    if (!captureContainer) return;

    // Hide original buttons in external container
    this.hideOriginalButtons(captureContainer);

    this.recordingType = 'video';

    // Create pause button
    const pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "file-uploader-capture-btn";
    pauseBtn.setAttribute("data-action", "pause");
    pauseBtn.setAttribute("data-tooltip", "Pause Recording");
    pauseBtn.setAttribute("data-tooltip-position", "top");
    pauseBtn.innerHTML = getIcon("pause");
    pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.togglePauseRecording();
    });

    // Create system audio button if enabled
    let systemAudioBtn = null;
    if (this.uploader.options.enableSystemAudio) {
      systemAudioBtn = document.createElement("button");
      systemAudioBtn.type = "button";
      systemAudioBtn.className = "file-uploader-capture-btn";
      systemAudioBtn.setAttribute("data-action", "system-audio");

      // Check if system audio is available
      const hasSystemAudio = this.uploader.videoRecorder && this.uploader.videoRecorder.systemAudioStream;
      if (!hasSystemAudio) {
        systemAudioBtn.disabled = true;
        systemAudioBtn.classList.add("muted");
        systemAudioBtn.setAttribute("data-tooltip", "No System Audio Available");
        systemAudioBtn.setAttribute("data-tooltip-position", "top");
        systemAudioBtn.innerHTML = getIcon("system_sound_mute");
      } else {
        systemAudioBtn.setAttribute("data-tooltip", "Toggle System Audio");
        systemAudioBtn.setAttribute("data-tooltip-position", "top");
        systemAudioBtn.innerHTML = getIcon("system_sound");
      }

      systemAudioBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleSystemAudio();
      });
    }

    // Create microphone button if enabled
    let micBtn = null;
    if (this.uploader.options.enableMicrophoneAudio) {
      micBtn = document.createElement("button");
      micBtn.type = "button";
      micBtn.className = "file-uploader-capture-btn";
      micBtn.setAttribute("data-action", "microphone");

      // Check if microphone is available
      const hasMic = this.uploader.videoRecorder && this.uploader.videoRecorder.microphoneStream;
      if (!hasMic) {
        micBtn.disabled = true;
        micBtn.classList.add("muted");
        micBtn.setAttribute("data-tooltip", "No Microphone Available");
        micBtn.setAttribute("data-tooltip-position", "top");
        micBtn.innerHTML = getIcon("mic_mute");
      } else {
        micBtn.setAttribute("data-tooltip", "Toggle Microphone");
        micBtn.setAttribute("data-tooltip-position", "top");
        micBtn.innerHTML = getIcon("mic");
      }

      micBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleMicrophone();
      });
    }

    // Create stop button
    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "file-uploader-capture-btn file-uploader-capture-btn-stop";
    stopBtn.setAttribute("data-action", "stop");
    stopBtn.setAttribute("data-tooltip", "Stop Recording");
    stopBtn.setAttribute("data-tooltip-position", "top");
    stopBtn.innerHTML = getIcon("stop");
    stopBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.uploader.stopVideoRecording();
    });

    // Append buttons to capture button container in order
    captureContainer.appendChild(pauseBtn);
    if (systemAudioBtn) captureContainer.appendChild(systemAudioBtn);
    if (micBtn) captureContainer.appendChild(micBtn);
    captureContainer.appendChild(stopBtn);

    // Store references for cleanup
    this.recordingToolbarButtons = [pauseBtn, systemAudioBtn, micBtn, stopBtn].filter(Boolean);

    // Initialize tooltips for recording toolbar buttons
    TooltipManager.init(captureContainer);
  }

  /**
   * Create and show audio recording toolbar
   */
  createAudioRecordingToolbar() {
    if (this.recordingToolbar) {
      this.recordingToolbar.remove();
    }

    const captureContainer = this.getToolbarContainer();
    if (!captureContainer) return;

    // Hide original buttons in external container
    this.hideOriginalButtons(captureContainer);

    this.recordingType = 'audio';

    // Create pause button
    const pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "file-uploader-capture-btn";
    pauseBtn.setAttribute("data-action", "pause");
    pauseBtn.setAttribute("data-tooltip", "Pause Recording");
    pauseBtn.setAttribute("data-tooltip-position", "top");
    pauseBtn.innerHTML = getIcon("pause");
    pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.togglePauseAudioRecording();
    });

    // Create system audio button if enabled
    let systemAudioBtn = null;
    if (this.uploader.options.enableSystemAudio) {
      systemAudioBtn = document.createElement("button");
      systemAudioBtn.type = "button";
      systemAudioBtn.className = "file-uploader-capture-btn";
      systemAudioBtn.setAttribute("data-action", "system-audio");

      // Check if system audio is available
      const hasSystemAudio = this.uploader.audioRecorder && this.uploader.audioRecorder.systemAudioStream;
      if (!hasSystemAudio) {
        systemAudioBtn.disabled = true;
        systemAudioBtn.classList.add("muted");
        systemAudioBtn.setAttribute("data-tooltip", "No System Audio Available");
        systemAudioBtn.setAttribute("data-tooltip-position", "top");
        systemAudioBtn.innerHTML = getIcon("system_sound_mute");
      } else {
        systemAudioBtn.setAttribute("data-tooltip", "Toggle System Audio");
        systemAudioBtn.setAttribute("data-tooltip-position", "top");
        systemAudioBtn.innerHTML = getIcon("system_sound");
      }

      systemAudioBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleAudioSystemAudio();
      });
    }

    // Create stop button (red by default)
    const stopBtn = document.createElement("button");
    stopBtn.type = "button";
    stopBtn.className = "file-uploader-capture-btn file-uploader-capture-btn-stop";
    stopBtn.setAttribute("data-action", "stop");
    stopBtn.setAttribute("data-tooltip", "Stop Recording");
    stopBtn.setAttribute("data-tooltip-position", "top");
    stopBtn.innerHTML = getIcon("stop");
    stopBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.uploader.stopAudioRecording();
    });

    // Append buttons to capture button container in order
    captureContainer.appendChild(pauseBtn);
    if (systemAudioBtn) captureContainer.appendChild(systemAudioBtn);
    captureContainer.appendChild(stopBtn);

    // Store references for cleanup
    this.recordingToolbarButtons = [pauseBtn, systemAudioBtn, stopBtn].filter(Boolean);

    // Initialize tooltips for audio recording toolbar buttons
    TooltipManager.init(captureContainer);
  }

  /**
   * Remove recording toolbar
   */
  removeRecordingToolbar() {
    if (this.recordingToolbarButtons) {
      this.recordingToolbarButtons.forEach(btn => {
        if (btn) btn.remove();
      });
      this.recordingToolbarButtons = null;
    }
    // Restore original buttons in external container
    this.showOriginalButtons();
    this.recordingType = null;
  }

  /**
   * Toggle pause/resume video recording
   */
  togglePauseRecording() {
    if (!this.uploader.videoRecorder) return;

    const status = this.uploader.videoRecorder.getRecordingStatus();
    const pauseBtn = this.getToolbarContainer()?.querySelector('[data-action="pause"]');

    if (status.isPaused) {
      this.uploader.videoRecorder.resumeRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("pause");
        pauseBtn.setAttribute("data-tooltip", "Pause Recording");
        pauseBtn.classList.remove("paused");
      }
    } else {
      this.uploader.videoRecorder.pauseRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("play");
        pauseBtn.setAttribute("data-tooltip", "Resume Recording");
        pauseBtn.classList.add("paused");
      }
    }
  }

  /**
   * Toggle pause/resume audio recording
   */
  togglePauseAudioRecording() {
    if (!this.uploader.audioRecorder) return;

    const status = this.uploader.audioRecorder.getRecordingStatus();
    const pauseBtn = this.getToolbarContainer()?.querySelector('[data-action="pause"]');

    if (status.isPaused) {
      this.uploader.audioRecorder.resumeRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("pause");
        pauseBtn.setAttribute("data-tooltip", "Pause Recording");
        pauseBtn.classList.remove("paused");
      }
    } else {
      this.uploader.audioRecorder.pauseRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("play");
        pauseBtn.setAttribute("data-tooltip", "Resume Recording");
        pauseBtn.classList.add("paused");
      }
    }
  }

  /**
   * Toggle system audio for video recording
   */
  toggleSystemAudio() {
    if (!this.uploader.videoRecorder) return;

    const enabled = this.uploader.videoRecorder.toggleSystemAudio();
    const btn = this.getToolbarContainer()?.querySelector('[data-action="system-audio"]');

    if (btn) {
      const iconName = enabled ? "system_sound" : "system_sound_mute";
      btn.innerHTML = getIcon(iconName);
      btn.classList.toggle("muted", !enabled);
      btn.setAttribute("data-tooltip", enabled ? "Mute System Audio" : "Unmute System Audio");
    }
  }

  /**
   * Toggle system audio for audio recording
   */
  toggleAudioSystemAudio() {
    if (!this.uploader.audioRecorder) return;

    const enabled = this.uploader.audioRecorder.toggleSystemAudio();
    const btn = this.getToolbarContainer()?.querySelector('[data-action="system-audio"]');

    if (btn) {
      const iconName = enabled ? "system_sound" : "system_sound_mute";
      btn.innerHTML = getIcon(iconName);
      btn.classList.toggle("muted", !enabled);
      btn.setAttribute("data-tooltip", enabled ? "Mute System Audio" : "Unmute System Audio");
    }
  }

  /**
   * Toggle microphone for video recording
   */
  toggleMicrophone() {
    if (!this.uploader.videoRecorder) return;

    const enabled = this.uploader.videoRecorder.toggleMicrophoneAudio();
    const btn = this.getToolbarContainer()?.querySelector('[data-action="microphone"]');

    if (btn) {
      const iconName = enabled ? "mic" : "mic_mute";
      btn.innerHTML = getIcon(iconName);
      btn.classList.toggle("muted", !enabled);
      btn.setAttribute("data-tooltip", enabled ? "Mute Microphone" : "Unmute Microphone");
    }
  }

  /**
   * Format time as MM:SS
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  /**
   * Build time display text based on options
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} maxSeconds - Maximum recording time in seconds
   * @param {boolean} showRemaining - Whether to show remaining time
   * @returns {string} Formatted time display text
   */
  buildTimeDisplayText(elapsed, maxSeconds, showRemaining) {
    const options = this.uploader.options;
    const showTime = options.showRecordingTime !== false;
    const showLimit = options.showRecordingLimit !== false;

    if (!showTime) return "";

    if (showRemaining && showLimit && maxSeconds > 0) {
      // Show remaining time
      const remaining = Math.max(0, maxSeconds - elapsed);
      return `-${this.formatTime(remaining)} / ${this.formatTime(maxSeconds)}`;
    } else if (showLimit && maxSeconds > 0) {
      // Show elapsed / total format
      return `${this.formatTime(elapsed)} / ${this.formatTime(maxSeconds)}`;
    } else {
      // Just show elapsed time
      return this.formatTime(elapsed);
    }
  }

  /**
   * Start recording timer display
   */
  startRecordingTimer() {
    this.recordingTimerInterval = setInterval(() => {
      const recorder = this.recordingType === 'audio' ? this.uploader.audioRecorder : this.uploader.videoRecorder;

      if (recorder) {
        const elapsed = recorder.getRecordingDuration();
        const maxSeconds = this.recordingType === 'audio'
          ? Math.floor(this.uploader.options.maxAudioRecordingDuration)
          : Math.floor(this.uploader.options.maxVideoRecordingDuration);

        // Get size status if available
        let sizeStatus = null;
        if (typeof recorder.getSizeStatus === 'function') {
          sizeStatus = recorder.getSizeStatus();
        }

        // Update time on all recording indicators (internal and external)
        const timeElements = [];

        // Internal recording indicator
        const internalTimeEl = this.uploader.recordingIndicator?.querySelector(".file-uploader-recording-time");
        if (internalTimeEl) timeElements.push(internalTimeEl);

        // External recording indicator
        const externalTimeEl = this.externalRecordingIndicator?.querySelector(".file-uploader-recording-time");
        if (externalTimeEl) timeElements.push(externalTimeEl);

        timeElements.forEach(timeElement => {
          // Check if we should show remaining time or elapsed/total
          const showRemaining = timeElement.dataset.showRemaining === "true";
          const timeText = this.buildTimeDisplayText(elapsed, maxSeconds, showRemaining);
          timeElement.textContent = timeText;
        });

        // Update size display on all recording indicators
        if (sizeStatus && this.uploader.options.showRecordingSize !== false) {
          const sizeElements = [];

          // Internal size element
          const internalSizeEl = this.uploader.recordingIndicator?.querySelector(".file-uploader-recording-size");
          if (internalSizeEl) sizeElements.push(internalSizeEl);

          // External size element
          const externalSizeEl = this.externalRecordingIndicator?.querySelector(".file-uploader-recording-size");
          if (externalSizeEl) sizeElements.push(externalSizeEl);

          sizeElements.forEach(sizeElement => {
            // Add approximation symbol (~) to indicate estimated size
            sizeElement.textContent = `~${sizeStatus.formattedSize}`;
            // Add warning class if approaching limit
            if (sizeStatus.isWarning) {
              sizeElement.classList.add('warning');
            }
            if (sizeStatus.isNearLimit) {
              sizeElement.classList.add('danger');
            }
          });
        }
      }
    }, 1000);
  }

  /**
   * Stop recording timer display
   */
  stopRecordingTimer() {
    if (this.recordingTimerInterval) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
    }
  }

  /**
   * Setup handler for when user stops screen sharing from system button
   */
  setupStreamEndedHandler() {
    if (this.recordingType === 'video') {
      if (!this.uploader.videoRecorder || !this.uploader.videoRecorder.stream) return;

      // Listen for when user clicks "Stop sharing" from browser/system
      this.uploader.videoRecorder.stream.getTracks().forEach((track) => {
        track.onended = async () => {
          // Check if recording is still in progress before stopping
          if (this.uploader.videoRecorder && this.uploader.videoRecorder.isRecording) {
            // User stopped sharing from system button, gracefully stop recording
            try {
              await this.uploader.stopVideoRecording();
            } catch (error) {
              // Ignore "no recording in progress" errors
              if (!error.message.includes('No recording in progress')) {
                console.error('Error stopping video recording:', error);
              }
            }
          }
        };
      });
    } else if (this.recordingType === 'audio') {
      // For audio recording, setup handlers for both mic and system audio streams
      const audioRecorder = this.uploader.audioRecorder;
      if (!audioRecorder) return;

      const setupTrackEndHandler = (stream, stopFn) => {
        if (!stream) return;
        stream.getTracks().forEach((track) => {
          track.onended = async () => {
            // Check if recording is still in progress before stopping
            if (audioRecorder && audioRecorder.isRecording) {
              // User stopped sharing from system button, gracefully stop recording
              try {
                await stopFn();
              } catch (error) {
                // Ignore "no recording in progress" errors
                if (!error.message.includes('No recording in progress')) {
                  console.error('Error stopping audio recording:', error);
                }
              }
            }
          };
        });
      };

      if (audioRecorder.microphoneStream) {
        setupTrackEndHandler(audioRecorder.microphoneStream, () => this.uploader.stopAudioRecording());
      }
      if (audioRecorder.systemAudioStream) {
        setupTrackEndHandler(audioRecorder.systemAudioStream, () => this.uploader.stopAudioRecording());
      }
    }
  }

  /**
   * Create an external recording indicator for the external toolbar container
   * @param {HTMLElement} container - The external container
   */
  createExternalRecordingIndicator(container) {
    if (this.externalRecordingIndicator) {
      this.externalRecordingIndicator.remove();
    }

    const options = this.uploader.options;
    const showTime = options.showRecordingTime !== false;
    const showLimit = options.showRecordingLimit !== false;
    const showSize = options.showRecordingSize !== false;
    const enableToggle = options.recordingTimeClickToggle !== false;
    const defaultView = options.recordingTimeDefaultView || "elapsed";

    const maxSeconds = this.recordingType === 'audio'
      ? Math.floor(options.maxAudioRecordingDuration)
      : Math.floor(options.maxVideoRecordingDuration);

    // Determine timer format for CSS width
    let timerFormat = "elapsed"; // default: just elapsed time
    if (showTime && showLimit && maxSeconds > 0) {
      timerFormat = defaultView === "remaining" ? "remaining-limit" : "elapsed-limit";
    }

    // Build initial time display
    const initialTimeText = this.buildTimeDisplayText(0, maxSeconds, defaultView === "remaining");

    this.externalRecordingIndicator = document.createElement("div");
    this.externalRecordingIndicator.className = "file-uploader-recording-indicator";

    let innerHTML = '<span class="file-uploader-recording-dot"></span>';
    if (showTime) {
      innerHTML += `<span class="file-uploader-recording-time" data-timer-format="${timerFormat}">${initialTimeText}</span>`;
    }
    if (showSize) {
      innerHTML += '<span class="file-uploader-recording-size">~0 B</span>';
    }
    this.externalRecordingIndicator.innerHTML = innerHTML;

    // Prevent click propagation
    this.externalRecordingIndicator.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Make time element clickable to toggle time display format (if enabled and limit is shown)
    const timeElement = this.externalRecordingIndicator.querySelector(".file-uploader-recording-time");
    if (timeElement && enableToggle && showLimit && maxSeconds > 0) {
      timeElement.style.cursor = "pointer";
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

    // Insert at the beginning of the container (before toolbar buttons)
    container.insertBefore(this.externalRecordingIndicator, container.firstChild);
  }

  /**
   * Show recording indicator
   */
  showRecordingIndicator() {
    if (this.isUsingExternalContainer()) {
      const container = this.getToolbarContainer();
      if (container) {
        this.createExternalRecordingIndicator(container);
      }
    } else if (this.uploader.recordingIndicator) {
      this.uploader.recordingIndicator.style.display = "flex";
    }
    this.startRecordingTimer();
  }

  /**
   * Hide recording indicator
   */
  hideRecordingIndicator() {
    this.stopRecordingTimer();

    // Remove external recording indicator
    if (this.externalRecordingIndicator) {
      this.externalRecordingIndicator.remove();
      this.externalRecordingIndicator = null;
    }

    // Hide internal recording indicator
    if (this.uploader.recordingIndicator) {
      this.uploader.recordingIndicator.style.display = "none";

      // Reset timer display to initial state
      const timeElement = this.uploader.recordingIndicator.querySelector(
        ".file-uploader-recording-time"
      );
      if (timeElement) {
        // Reset to 00:00 / max duration format
        const maxSeconds = this.recordingType === 'audio'
          ? Math.floor(this.uploader.options.maxAudioRecordingDuration)
          : Math.floor(this.uploader.options.maxVideoRecordingDuration);

        const totalMinutes = Math.floor(maxSeconds / 60);
        const totalSeconds = maxSeconds % 60;
        timeElement.textContent = `00:00 / ${String(totalMinutes).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}`;

        // Reset the display mode preference
        timeElement.dataset.showRemaining = "false";
      }
    }
  }

  /**
   * Cleanup all UI elements
   */
  cleanup() {
    this.removeRecordingToolbar();
    this.hideRecordingIndicator();
  }
}
