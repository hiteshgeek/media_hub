/**
 * VideoRecorder Class
 * Records screen video using MediaDevices API (getDisplayMedia)
 * Features: Pause/Resume, Mic Audio, System Audio, Duration Control
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
      systemAudioConstraints: false, // System audio (screen audio)
      microphoneAudioConstraints: false, // Microphone audio
      selectedMicrophoneId: null, // Selected microphone device ID
      mimeType: "video/webm", // Default video format
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      maxDuration: 300000, // 5 minutes max (in milliseconds)
      ...options,
    };

    this.stream = null; // Display stream (screen)
    this.microphoneStream = null; // Microphone stream
    this.combinedStream = null; // Combined audio + video stream
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0; // Total time spent paused
    this.pauseStartTime = null; // When pause started
    this.recordingTimer = null;
    this.systemAudioEnabled = true; // System audio state
    this.microphoneEnabled = true; // Microphone state
  }

  /**
   * Get available microphone devices
   * @returns {Promise<Array>}
   */
  async getAvailableMicrophones() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "audioinput");
    } catch (error) {
      console.error("Failed to enumerate devices:", error);
      return [];
    }
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
      // Request screen capture with system audio if enabled
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: this.options.videoConstraints,
        audio: this.options.systemAudioConstraints,
      });

      // Get microphone stream if enabled
      if (this.options.microphoneAudioConstraints) {
        try {
          const constraints = {
            audio: this.options.selectedMicrophoneId
              ? { deviceId: { exact: this.options.selectedMicrophoneId } }
              : true,
          };
          this.microphoneStream = await navigator.mediaDevices.getUserMedia(
            constraints
          );
        } catch (micError) {
          // If microphone fails, continue without it
          console.warn("Microphone access denied or unavailable:", micError);
          this.microphoneStream = null;
        }
      }

      // Initialize audio states based on available streams
      const systemAudioTracks = this.stream.getAudioTracks();
      this.systemAudioEnabled = systemAudioTracks.length > 0 && systemAudioTracks[0].enabled;

      if (this.microphoneStream) {
        const micTracks = this.microphoneStream.getAudioTracks();
        this.microphoneEnabled = micTracks.length > 0 && micTracks[0].enabled;
      }

      // Combine streams
      this.combinedStream = this.combineStreams();

      // Determine supported MIME type
      const mimeType = this.getSupportedMimeType();

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.combinedStream, {
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
      this.isPaused = false;
      this.startTime = Date.now();
      this.pausedTime = 0;

      // Auto-stop after max duration
      this.recordingTimer = setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.options.maxDuration);
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
   * Pause recording
   */
  pauseRecording() {
    if (!this.isRecording || this.isPaused) {
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  /**
   * Resume recording
   */
  resumeRecording() {
    if (!this.isRecording || !this.isPaused) {
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
      this.isPaused = false;

      // Add pause duration to total paused time
      if (this.pauseStartTime) {
        this.pausedTime += Date.now() - this.pauseStartTime;
        this.pauseStartTime = null;
      }
    }
  }

  /**
   * Toggle system audio (mute/unmute)
   */
  toggleSystemAudio() {
    if (!this.stream) return;

    const audioTracks = this.stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    this.systemAudioEnabled = audioTracks.length > 0 ? audioTracks[0].enabled : false;
    return this.systemAudioEnabled;
  }

  /**
   * Toggle microphone audio (mute/unmute)
   */
  toggleMicrophoneAudio() {
    if (!this.microphoneStream) return;

    const audioTracks = this.microphoneStream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    this.microphoneEnabled = audioTracks.length > 0 ? audioTracks[0].enabled : false;
    return this.microphoneEnabled;
  }

  /**
   * Combine video and audio streams
   * @returns {MediaStream}
   */
  combineStreams() {
    const tracks = [];

    // Add video track from display stream
    if (this.stream) {
      const videoTracks = this.stream.getVideoTracks();
      tracks.push(...videoTracks);
    }

    // Handle audio tracks
    const systemAudioTracks = this.stream ? this.stream.getAudioTracks() : [];
    const micAudioTracks = this.microphoneStream ? this.microphoneStream.getAudioTracks() : [];

    // If we have both system and microphone audio, mix them using Web Audio API
    if (systemAudioTracks.length > 0 && micAudioTracks.length > 0) {
      try {
        const mixedAudioTrack = this.mixAudioTracks(systemAudioTracks[0], micAudioTracks[0]);
        tracks.push(mixedAudioTrack);
      } catch (error) {
        console.error("Failed to mix audio tracks:", error);
        // Fallback: just use system audio
        tracks.push(...systemAudioTracks);
      }
    } else if (systemAudioTracks.length > 0) {
      // Only system audio
      tracks.push(...systemAudioTracks);
    } else if (micAudioTracks.length > 0) {
      // Only microphone audio
      tracks.push(...micAudioTracks);
    }

    return new MediaStream(tracks);
  }

  /**
   * Mix two audio tracks together using Web Audio API
   * @param {MediaStreamTrack} track1 - First audio track (system audio)
   * @param {MediaStreamTrack} track2 - Second audio track (microphone)
   * @returns {MediaStreamTrack} - Mixed audio track
   */
  mixAudioTracks(track1, track2) {
    // Create audio context
    const audioContext = new AudioContext();

    // Create media stream sources
    const source1 = audioContext.createMediaStreamSource(new MediaStream([track1]));
    const source2 = audioContext.createMediaStreamSource(new MediaStream([track2]));

    // Create destination for mixing
    const destination = audioContext.createMediaStreamDestination();

    // Connect both sources to destination
    source1.connect(destination);
    source2.connect(destination);

    // Store audio context for cleanup
    this.audioContext = audioContext;

    // Return the mixed audio track
    return destination.stream.getAudioTracks()[0];
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
          // Calculate actual recording duration (excluding paused time)
          const totalElapsed = this.startTime ? Date.now() - this.startTime : 0;
          const durationMs = totalElapsed - this.pausedTime;

          // Create blob from recorded chunks
          const mimeType = this.mediaRecorder.mimeType;
          let blob = new Blob(this.recordedChunks, { type: mimeType });

          console.log("Recording stopped:", { mimeType, durationMs });

          // Helper to find a fixer function (works for global CDN or ESM import)
          const getFixer = () => {
            if (
              typeof window !== "undefined" &&
              typeof window.fixWebmDuration === "function"
            ) {
              return window.fixWebmDuration;
            }
            // If you used an ESM import, you can reference it directly in scope
            if (typeof fixWebmDuration === "function") return fixWebmDuration;
            return null;
          };

          const fixer = getFixer();

          if (mimeType.includes("webm") && fixer && durationMs > 0) {
            try {
              // fixWebmDuration expects (blob, durationMs, options)
              const fixed = await fixer(blob, durationMs, {
                logger: console.debug,
              });
              if (fixed instanceof Blob) {
                blob = fixed;
                console.log("✅ WebM duration fixed:", durationMs + "ms");
              } else {
                console.warn("⚠️ fixer returned non-blob, skipping.");
              }
            } catch (err) {
              console.error("❌ Failed to fix WebM duration:", err);
              // Fall back to original blob
            }
          } else {
            console.warn("⚠️ WebM duration fix skipped:", {
              reason: !mimeType.includes("webm")
                ? "Not WebM format"
                : !fixer
                ? "fixer not available"
                : !(durationMs > 0)
                ? "No duration recorded"
                : "Unknown",
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
      this.isPaused = false;
    });
  }

  /**
   * Get recording duration in seconds (excluding paused time)
   * @returns {number}
   */
  getRecordingDuration() {
    if (!this.startTime) return 0;

    const totalElapsed = Date.now() - this.startTime;
    let currentPausedTime = this.pausedTime;

    // Add current pause duration if paused
    if (this.isPaused && this.pauseStartTime) {
      currentPausedTime += Date.now() - this.pauseStartTime;
    }

    const actualDuration = totalElapsed - currentPausedTime;
    return Math.floor(actualDuration / 1000);
  }

  /**
   * Get remaining recording duration in seconds
   * @returns {number}
   */
  getRemainingDuration() {
    const elapsed = this.getRecordingDuration();
    const maxSeconds = Math.floor(this.options.maxDuration / 1000);
    return Math.max(0, maxSeconds - elapsed);
  }

  /**
   * Get recording status
   * @returns {object}
   */
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      duration: this.getRecordingDuration(),
      remaining: this.getRemainingDuration(),
      systemAudioEnabled: this.systemAudioEnabled,
      microphoneEnabled: this.microphoneEnabled,
    };
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

    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }

    if (this.combinedStream) {
      this.combinedStream.getTracks().forEach((track) => track.stop());
      this.combinedStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }

    this.recordedChunks = [];
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.pauseStartTime = null;
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
