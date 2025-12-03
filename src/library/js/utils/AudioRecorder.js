/**
 * AudioRecorder Class
 * Handles audio-only recording with microphone and/or system audio
 */

import { fixWebmDuration } from "@fix-webm-duration/fix";

export default class AudioRecorder {
  constructor(options = {}) {
    this.options = {
      enableMicrophoneAudio: options.enableMicrophoneAudio ?? true,
      enableSystemAudio: options.enableSystemAudio ?? false,
      maxRecordingDuration: options.maxRecordingDuration || 300, // 5 minutes default
      ...options,
    };

    this.mediaRecorder = null;
    this.microphoneStream = null;
    this.systemAudioStream = null;
    this.audioContext = null;
    this.mixedStream = null;
    this.recordedChunks = [];
    this.startTime = null;
    this.pausedDuration = 0;
    this.pauseStartTime = null;
    this.isRecording = false;
    this.isPaused = false;
    this.microphoneEnabled = true;
    this.systemAudioEnabled = true;
  }

  /**
   * Start audio recording
   * @returns {Promise<void>}
   */
  async startRecording() {
    try {
      this.recordedChunks = [];

      // Request microphone if enabled
      if (this.options.enableMicrophoneAudio) {
        try {
          this.microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (error) {
          console.warn("Microphone access failed:", error);
          this.microphoneStream = null;
        }
      }

      // Request system audio if enabled (getDisplayMedia for audio only)
      if (this.options.enableSystemAudio) {
        try {
          // Note: For audio-only recording, we need to request display media with audio
          // Some browsers may show a screen selection dialog even for audio-only
          this.systemAudioStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: { ideal: 1 },
              height: { ideal: 1 },
            },
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          });

          // Remove video track if present (we only want audio)
          const videoTracks = this.systemAudioStream.getVideoTracks();
          videoTracks.forEach(track => track.stop());

          // Check if stream has audio tracks
          const audioTracks = this.systemAudioStream.getAudioTracks();
          if (audioTracks.length === 0) {
            console.warn("System audio stream has no audio tracks");
            this.systemAudioStream = null;
          }
        } catch (error) {
          console.warn("System audio access failed:", error);
          this.systemAudioStream = null;
        }
      }

      // Mix audio streams if we have both
      let finalStream;
      if (this.microphoneStream && this.systemAudioStream) {
        finalStream = await this.mixAudioStreams(this.microphoneStream, this.systemAudioStream);
      } else {
        finalStream = this.microphoneStream || this.systemAudioStream;
      }

      if (!finalStream) {
        throw new Error("No audio source available. Please grant microphone or system audio access.");
      }

      // Create MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.startTime = Date.now();

      // Auto-stop at max duration
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.options.maxRecordingDuration * 1000);

    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  /**
   * Mix multiple audio streams using Web Audio API
   * @param {MediaStream} stream1 - First audio stream (microphone)
   * @param {MediaStream} stream2 - Second audio stream (system audio)
   * @returns {Promise<MediaStream>}
   */
  async mixAudioStreams(stream1, stream2) {
    // Validate streams have audio tracks
    if (!stream1 || stream1.getAudioTracks().length === 0) {
      throw new Error("Stream 1 has no audio tracks");
    }
    if (!stream2 || stream2.getAudioTracks().length === 0) {
      throw new Error("Stream 2 has no audio tracks");
    }

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const source1 = this.audioContext.createMediaStreamSource(stream1);
    const source2 = this.audioContext.createMediaStreamSource(stream2);

    const destination = this.audioContext.createMediaStreamDestination();

    // Create gain nodes for volume control
    const gainNode1 = this.audioContext.createGain();
    const gainNode2 = this.audioContext.createGain();

    gainNode1.gain.value = 1.0;
    gainNode2.gain.value = 1.0;

    // Connect sources to gain nodes and then to destination
    source1.connect(gainNode1);
    source2.connect(gainNode2);
    gainNode1.connect(destination);
    gainNode2.connect(destination);

    // Store gain nodes for toggle functionality
    this.micGainNode = gainNode1;
    this.systemGainNode = gainNode2;

    this.mixedStream = destination.stream;
    return this.mixedStream;
  }

  /**
   * Get supported MIME type for recording
   * @returns {string}
   */
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return '';
  }

  /**
   * Pause recording
   */
  pauseRecording() {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  /**
   * Resume recording
   */
  resumeRecording() {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      if (this.pauseStartTime) {
        this.pausedDuration += Date.now() - this.pauseStartTime;
        this.pauseStartTime = null;
      }
    }
  }

  /**
   * Toggle microphone audio
   * @returns {boolean} - New enabled state
   */
  toggleMicrophoneAudio() {
    if (!this.microphoneStream && !this.micGainNode) return false;

    this.microphoneEnabled = !this.microphoneEnabled;

    if (this.micGainNode) {
      // Using mixed stream - adjust gain
      this.micGainNode.gain.value = this.microphoneEnabled ? 1.0 : 0.0;
    } else if (this.microphoneStream) {
      // Direct microphone stream - toggle tracks
      this.microphoneStream.getAudioTracks().forEach((track) => {
        track.enabled = this.microphoneEnabled;
      });
    }

    return this.microphoneEnabled;
  }

  /**
   * Toggle system audio
   * @returns {boolean} - New enabled state
   */
  toggleSystemAudio() {
    if (!this.systemAudioStream && !this.systemGainNode) return false;

    this.systemAudioEnabled = !this.systemAudioEnabled;

    if (this.systemGainNode) {
      // Using mixed stream - adjust gain
      this.systemGainNode.gain.value = this.systemAudioEnabled ? 1.0 : 0.0;
    } else if (this.systemAudioStream) {
      // Direct system audio stream - toggle tracks
      this.systemAudioStream.getAudioTracks().forEach((track) => {
        track.enabled = this.systemAudioEnabled;
      });
    }

    return this.systemAudioEnabled;
  }

  /**
   * Stop recording and return file
   * @returns {Promise<File>}
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("No active recording"));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Calculate actual recording duration (excluding paused time)
          const durationMs = this.getRecordingDuration() * 1000;

          const mimeType = this.mediaRecorder.mimeType;
          let blob = new Blob(this.recordedChunks, { type: mimeType });

          console.log("Audio recording stopped:", { mimeType, durationMs });

          // Fix WebM duration if needed
          if (mimeType.includes("webm") && fixWebmDuration && durationMs > 0) {
            try {
              const fixed = await fixWebmDuration(blob, durationMs, {
                logger: console.debug,
              });
              if (fixed instanceof Blob) {
                blob = fixed;
                console.log("✅ Audio WebM duration fixed:", durationMs + "ms");
              } else {
                console.warn("⚠️ fixer returned non-blob, skipping.");
              }
            } catch (err) {
              console.error("❌ Failed to fix audio WebM duration:", err);
              // Fall back to original blob
            }
          } else {
            console.warn("⚠️ Audio WebM duration fix skipped:", {
              reason: !mimeType.includes("webm")
                ? "Not WebM format"
                : !fixWebmDuration
                ? "fixWebmDuration not available"
                : !(durationMs > 0)
                ? "No duration recorded"
                : "Unknown",
            });
          }

          // Get file extension from MIME type
          const extension = this.getFileExtension(mimeType);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `audio-recording-${timestamp}.${extension}`;

          // Convert blob to File
          const file = new File([blob], filename, { type: mimeType });

          this.cleanup();
          resolve(file);
        } catch (error) {
          this.cleanup();
          reject(new Error(`Failed to create audio file: ${error.message}`));
        }
      };

      this.mediaRecorder.onerror = (error) => {
        this.cleanup();
        reject(error);
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - The MIME type
   * @returns {string}
   */
  getFileExtension(mimeType) {
    const mimeToExtension = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/ogg': 'ogg',
      'audio/ogg;codecs=opus': 'ogg',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
    };

    return mimeToExtension[mimeType] || 'webm';
  }

  /**
   * Get recording duration in seconds
   * @returns {number}
   */
  getRecordingDuration() {
    if (!this.startTime) return 0;

    const currentPausedDuration = this.isPaused && this.pauseStartTime
      ? Date.now() - this.pauseStartTime
      : 0;

    const totalPausedDuration = this.pausedDuration + currentPausedDuration;
    const elapsed = Date.now() - this.startTime - totalPausedDuration;

    return Math.floor(elapsed / 1000);
  }

  /**
   * Get recording status
   * @returns {Object}
   */
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused,
      duration: this.getRecordingDuration(),
      microphoneEnabled: this.microphoneEnabled,
      systemAudioEnabled: this.systemAudioEnabled,
    };
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }

    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }

    if (this.systemAudioStream) {
      this.systemAudioStream.getTracks().forEach((track) => track.stop());
      this.systemAudioStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mixedStream = null;
    this.micGainNode = null;
    this.systemGainNode = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedDuration = 0;
    this.pauseStartTime = null;
  }

  /**
   * Check if audio recording is supported
   * @returns {boolean}
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }
}
