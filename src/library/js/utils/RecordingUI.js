/**
 * RecordingUI Class
 * Manages all video and audio recording UI components and interactions
 */

import { getIcon } from "./icons.js";
import Tooltip from "../components/tooltip/index.js";

export default class RecordingUI {
  constructor(fileUploader) {
    this.uploader = fileUploader;
    this.recordingToolbar = null;
    this.recordingToolbarButtons = null;
    this.recordingTimerInterval = null;
    this.recordingType = null; // 'video' or 'audio'
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

    const captureContainer = this.uploader.captureButtonContainer;
    if (!captureContainer) return;

    this.recordingType = 'video';

    // Create pause button
    const pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "file-uploader-capture-btn";
    pauseBtn.setAttribute("data-action", "pause");
    pauseBtn.setAttribute("data-tooltip-text", "Pause Recording");
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
        systemAudioBtn.setAttribute("data-tooltip-text", "No System Audio Available");
        systemAudioBtn.setAttribute("data-tooltip-position", "top");
        systemAudioBtn.innerHTML = getIcon("system_sound_mute");
      } else {
        systemAudioBtn.setAttribute("data-tooltip-text", "Toggle System Audio");
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
        micBtn.setAttribute("data-tooltip-text", "No Microphone Available");
        micBtn.setAttribute("data-tooltip-position", "top");
        micBtn.innerHTML = getIcon("mic_mute");
      } else {
        micBtn.setAttribute("data-tooltip-text", "Toggle Microphone");
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
    stopBtn.setAttribute("data-tooltip-text", "Stop Recording");
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
    Tooltip.initAll(captureContainer);
  }

  /**
   * Create and show audio recording toolbar
   */
  createAudioRecordingToolbar() {
    if (this.recordingToolbar) {
      this.recordingToolbar.remove();
    }

    const captureContainer = this.uploader.captureButtonContainer;
    if (!captureContainer) return;

    this.recordingType = 'audio';

    // Create pause button
    const pauseBtn = document.createElement("button");
    pauseBtn.type = "button";
    pauseBtn.className = "file-uploader-capture-btn";
    pauseBtn.setAttribute("data-action", "pause");
    pauseBtn.setAttribute("data-tooltip-text", "Pause Recording");
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
        systemAudioBtn.setAttribute("data-tooltip-text", "No System Audio Available");
        systemAudioBtn.setAttribute("data-tooltip-position", "top");
        systemAudioBtn.innerHTML = getIcon("system_sound_mute");
      } else {
        systemAudioBtn.setAttribute("data-tooltip-text", "Toggle System Audio");
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
    stopBtn.setAttribute("data-tooltip-text", "Stop Recording");
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
    Tooltip.initAll(captureContainer);
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
    this.recordingType = null;
  }

  /**
   * Toggle pause/resume video recording
   */
  togglePauseRecording() {
    if (!this.uploader.videoRecorder) return;

    const status = this.uploader.videoRecorder.getRecordingStatus();
    const pauseBtn = this.uploader.captureButtonContainer?.querySelector('[data-action="pause"]');

    if (status.isPaused) {
      this.uploader.videoRecorder.resumeRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("pause");
        pauseBtn.setAttribute("data-tooltip-text", "Pause Recording");
        pauseBtn.classList.remove("paused");
      }
    } else {
      this.uploader.videoRecorder.pauseRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("play");
        pauseBtn.setAttribute("data-tooltip-text", "Resume Recording");
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
    const pauseBtn = this.uploader.captureButtonContainer?.querySelector('[data-action="pause"]');

    if (status.isPaused) {
      this.uploader.audioRecorder.resumeRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("pause");
        pauseBtn.setAttribute("data-tooltip-text", "Pause Recording");
        pauseBtn.classList.remove("paused");
      }
    } else {
      this.uploader.audioRecorder.pauseRecording();
      if (pauseBtn) {
        pauseBtn.innerHTML = getIcon("play");
        pauseBtn.setAttribute("data-tooltip-text", "Resume Recording");
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
    const btn = this.uploader.captureButtonContainer?.querySelector('[data-action="system-audio"]');

    if (btn) {
      const iconName = enabled ? "system_sound" : "system_sound_mute";
      btn.innerHTML = getIcon(iconName);
      btn.classList.toggle("muted", !enabled);
      btn.setAttribute("data-tooltip-text", enabled ? "Mute System Audio" : "Unmute System Audio");
    }
  }

  /**
   * Toggle system audio for audio recording
   */
  toggleAudioSystemAudio() {
    if (!this.uploader.audioRecorder) return;

    const enabled = this.uploader.audioRecorder.toggleSystemAudio();
    const btn = this.uploader.captureButtonContainer?.querySelector('[data-action="system-audio"]');

    if (btn) {
      const iconName = enabled ? "system_sound" : "system_sound_mute";
      btn.innerHTML = getIcon(iconName);
      btn.classList.toggle("muted", !enabled);
      btn.setAttribute("data-tooltip-text", enabled ? "Mute System Audio" : "Unmute System Audio");
    }
  }

  /**
   * Toggle microphone for video recording
   */
  toggleMicrophone() {
    if (!this.uploader.videoRecorder) return;

    const enabled = this.uploader.videoRecorder.toggleMicrophoneAudio();
    const btn = this.uploader.captureButtonContainer?.querySelector('[data-action="microphone"]');

    if (btn) {
      const iconName = enabled ? "mic" : "mic_mute";
      btn.innerHTML = getIcon(iconName);
      btn.classList.toggle("muted", !enabled);
      btn.setAttribute("data-tooltip-text", enabled ? "Mute Microphone" : "Unmute Microphone");
    }
  }

  /**
   * Start recording timer display
   */
  startRecordingTimer() {
    this.recordingTimerInterval = setInterval(() => {
      const recorder = this.recordingType === 'audio' ? this.uploader.audioRecorder : this.uploader.videoRecorder;

      if (recorder) {
        const timeElement = this.uploader.recordingIndicator?.querySelector(
          ".file-uploader-recording-time"
        );
        if (timeElement) {
          const elapsed = recorder.getRecordingDuration();
          const maxSeconds = this.recordingType === 'audio'
            ? Math.floor(this.uploader.options.maxAudioRecordingDuration)
            : Math.floor(this.uploader.options.maxVideoRecordingDuration);

          // Check if we should show remaining time or elapsed/total
          const showRemaining = timeElement.dataset.showRemaining === "true";

          let timeText;
          if (showRemaining) {
            // Show remaining time with negative sign and total (e.g., -02:30/05:00)
            const remaining = maxSeconds - elapsed;
            const remainingMinutes = Math.floor(remaining / 60);
            const remainingSeconds = remaining % 60;
            const totalMinutes = Math.floor(maxSeconds / 60);
            const totalSeconds = maxSeconds % 60;
            timeText = `-${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")} / ${String(totalMinutes).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}`;
          } else {
            // Show elapsed / total format
            const elapsedMinutes = Math.floor(elapsed / 60);
            const elapsedSeconds = elapsed % 60;
            const totalMinutes = Math.floor(maxSeconds / 60);
            const totalSeconds = maxSeconds % 60;
            timeText = `${String(elapsedMinutes).padStart(2, "0")}:${String(elapsedSeconds).padStart(2, "0")} / ${String(totalMinutes).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}`;
          }

          timeElement.textContent = timeText;
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
   * Show recording indicator
   */
  showRecordingIndicator() {
    if (this.uploader.recordingIndicator) {
      this.uploader.recordingIndicator.style.display = "flex";
      this.startRecordingTimer();
    }
  }

  /**
   * Hide recording indicator
   */
  hideRecordingIndicator() {
    this.stopRecordingTimer();
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
