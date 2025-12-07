/**
 * AudioWorkletRecorder Class
 * High-quality audio recording using Web Audio API with AudioWorklet
 * Provides better audio quality and control compared to MediaRecorder
 * Note: This recorder outputs WAV format which has proper duration metadata,
 * so it doesn't require the fix-webm-duration library.
 */

export default class AudioWorkletRecorder {
  constructor(options = {}) {
    this.options = {
      enableMicrophoneAudio: options.enableMicrophoneAudio ?? true,
      enableSystemAudio: options.enableSystemAudio ?? false,
      maxRecordingDuration: options.maxRecordingDuration || 300, // 5 minutes default
      sampleRate: options.sampleRate || 48000, // 48kHz default
      bitDepth: options.bitDepth || 16, // 16-bit default
      numberOfChannels: options.numberOfChannels || 2, // Stereo default
      maxFileSize: options.maxFileSize || null, // Max file size in bytes (null = no limit)
      warningThreshold: options.warningThreshold || 0.8, // 80% warning
      stopThreshold: options.stopThreshold || 0.95, // 95% auto-stop
      onAutoStop: null, // Callback when recording auto-stops due to max duration
      onSizeLimitReached: null, // Callback when file size limit is reached
      ...options,
    };

    this.audioContext = null;
    this.microphoneStream = null;
    this.systemAudioStream = null;
    this.microphoneSource = null;
    this.systemAudioSource = null;
    this.workletNode = null;
    this.mixerNode = null;
    this.audioChunks = [];
    this.startTime = null;
    this.pausedDuration = 0;
    this.pauseStartTime = null;
    this.isRecording = false;
    this.isPaused = false;
    this.microphoneEnabled = true;
    this.systemAudioEnabled = true;
    this.micGainNode = null;
    this.systemGainNode = null;
    this.totalSamples = 0; // Track total samples for size estimation
    this.warningTriggered = false; // Track if warning was triggered
    this.sizeLimitTriggered = false; // Track if size limit stop was triggered (prevent multiple calls)
    this.sizeCheckInterval = null; // Interval for checking file size
  }

  /**
   * Start audio recording
   * @returns {Promise<void>}
   */
  async startRecording() {
    try {
      this.audioChunks = [];

      // Create AudioContext with specified sample rate
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.options.sampleRate,
      });

      // Request microphone if enabled
      if (this.options.enableMicrophoneAudio) {
        try {
          this.microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: this.options.sampleRate,
            },
          });

          // Check if stream has audio tracks
          const audioTracks = this.microphoneStream.getAudioTracks();
          if (audioTracks.length === 0) {
            console.warn("Microphone stream has no audio tracks");
            this.microphoneStream = null;
          } else {
            // Create audio source from microphone stream
            this.microphoneSource = this.audioContext.createMediaStreamSource(
              this.microphoneStream
            );

            // Create gain node for volume control
            this.micGainNode = this.audioContext.createGain();
            this.micGainNode.gain.value = 1.0;

            // Connect microphone source to gain node
            this.microphoneSource.connect(this.micGainNode);
          }
        } catch (error) {
          console.warn("Microphone access failed:", error);
          this.microphoneStream = null;
        }
      }

      // Request system audio if enabled
      if (this.options.enableSystemAudio) {
        try {
          // Request display media with audio
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

          // Remove video track
          const videoTracks = this.systemAudioStream.getVideoTracks();
          videoTracks.forEach((track) => track.stop());

          // Check if stream has audio tracks
          const audioTracks = this.systemAudioStream.getAudioTracks();
          if (audioTracks.length === 0) {
            console.warn("System audio stream has no audio tracks");
            this.systemAudioStream = null;
          } else {
            // Create audio source from system audio stream
            this.systemAudioSource = this.audioContext.createMediaStreamSource(
              this.systemAudioStream
            );

            // Create gain node for volume control
            this.systemGainNode = this.audioContext.createGain();
            this.systemGainNode.gain.value = 1.0;

            // Connect system audio source to gain node
            this.systemAudioSource.connect(this.systemGainNode);
          }
        } catch (error) {
          console.warn("System audio access failed:", error);
          this.systemAudioStream = null;
        }
      }

      // Check if we have at least one audio source
      if (!this.microphoneStream && !this.systemAudioStream) {
        throw new Error(
          "No audio source available. Please grant microphone or system audio access."
        );
      }

      // Load and initialize AudioWorklet processor
      await this.initializeWorklet();

      this.isRecording = true;
      this.startTime = Date.now();
      this.warningTriggered = false;

      // Start file size monitoring if limit is set
      if (this.options.maxFileSize) {
        this.startSizeMonitoring();
      }

      // Auto-stop at max duration
      this.recordingTimer = setTimeout(async () => {
        if (this.isRecording) {
          try {
            const file = await this.stopRecording();
            // Call the onAutoStop callback with the file
            if (this.options.onAutoStop && typeof this.options.onAutoStop === 'function') {
              this.options.onAutoStop(file);
            }
          } catch (error) {
            console.error("Auto-stop audio recording failed:", error);
          }
        }
      }, this.options.maxRecordingDuration * 1000);
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  /**
   * Start monitoring file size and auto-stop if limit is reached
   */
  startSizeMonitoring() {
    // Check every 500ms
    this.sizeCheckInterval = setInterval(async () => {
      // Skip if not recording, no limit set, or already stopping due to limit
      if (!this.isRecording || !this.options.maxFileSize || this.sizeLimitTriggered) return;

      const status = this.getSizeStatus();
      const percentage = status.accumulatedSize / this.options.maxFileSize;

      // Check if we've reached the stop threshold
      if (percentage >= this.options.stopThreshold) {
        // Mark as triggered to prevent multiple calls
        this.sizeLimitTriggered = true;

        // Stop recording due to file size limit
        try {
          const file = await this.stopRecording();
          if (this.options.onSizeLimitReached) {
            this.options.onSizeLimitReached(status);
          }
          if (this.options.onAutoStop && typeof this.options.onAutoStop === 'function') {
            this.options.onAutoStop(file);
          }
        } catch (error) {
          console.error("Auto-stop audio recording (size limit) failed:", error);
        }
      }
    }, 500);
  }

  /**
   * Initialize AudioWorklet processor
   * @returns {Promise<void>}
   */
  async initializeWorklet() {
    // Create inline worklet processor code
    const processorCode = `
      class RecorderProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.isRecording = true;
          this.port.onmessage = (e) => {
            if (e.data === 'pause') {
              this.isRecording = false;
            } else if (e.data === 'resume') {
              this.isRecording = true;
            }
          };
        }

        process(inputs, outputs, parameters) {
          const input = inputs[0];
          if (input && input.length > 0 && this.isRecording) {
            // Send audio data to main thread
            this.port.postMessage({
              audio: input.map(channel => channel.slice()),
              timestamp: currentTime
            });
          }
          return true;
        }
      }
      registerProcessor('recorder-processor', RecorderProcessor);
    `;

    // Create blob URL for worklet
    const blob = new Blob([processorCode], { type: "application/javascript" });
    const workletUrl = URL.createObjectURL(blob);

    try {
      // Add worklet module
      await this.audioContext.audioWorklet.addModule(workletUrl);

      // Create worklet node
      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        "recorder-processor",
        {
          numberOfInputs: 1,
          numberOfOutputs: 0,
          outputChannelCount: [],
        }
      );

      // Listen for audio data
      this.workletNode.port.onmessage = (e) => {
        if (e.data.audio) {
          this.audioChunks.push(e.data.audio);
          // Track total samples for size estimation
          if (e.data.audio[0]) {
            this.totalSamples += e.data.audio[0].length;
          }
        }
      };

      // Connect audio sources to worklet
      // If we have both mic and system audio, we need a mixer node
      if (this.micGainNode && this.systemGainNode) {
        // Create a gain node to act as a mixer
        const mixerNode = this.audioContext.createGain();
        mixerNode.gain.value = 1.0;

        // Connect both sources to mixer
        this.micGainNode.connect(mixerNode);
        this.systemGainNode.connect(mixerNode);

        // Connect mixer to worklet
        mixerNode.connect(this.workletNode);

        // Store mixer reference for cleanup
        this.mixerNode = mixerNode;
      } else if (this.micGainNode) {
        // Only microphone - connect directly
        this.micGainNode.connect(this.workletNode);
      } else if (this.systemGainNode) {
        // Only system audio - connect directly
        this.systemGainNode.connect(this.workletNode);
      }
    } finally {
      // Clean up blob URL
      URL.revokeObjectURL(workletUrl);
    }
  }

  /**
   * Pause recording
   */
  pauseRecording() {
    if (this.workletNode && this.isRecording && !this.isPaused) {
      this.workletNode.port.postMessage("pause");
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  /**
   * Resume recording
   */
  resumeRecording() {
    if (this.workletNode && this.isRecording && this.isPaused) {
      this.workletNode.port.postMessage("resume");
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
    if (!this.micGainNode) return false;

    this.microphoneEnabled = !this.microphoneEnabled;
    this.micGainNode.gain.value = this.microphoneEnabled ? 1.0 : 0.0;

    return this.microphoneEnabled;
  }

  /**
   * Toggle system audio
   * @returns {boolean} - New enabled state
   */
  toggleSystemAudio() {
    if (!this.systemGainNode) return false;

    this.systemAudioEnabled = !this.systemAudioEnabled;
    this.systemGainNode.gain.value = this.systemAudioEnabled ? 1.0 : 0.0;

    return this.systemAudioEnabled;
  }

  /**
   * Stop recording and return file
   * @returns {Promise<File>}
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.isRecording) {
        reject(new Error("No active recording"));
        return;
      }

      try {
        this.isRecording = false;

        // Calculate actual recording duration (excluding paused time)
        const durationMs = this.getRecordingDuration() * 1000;

        // Convert audio chunks to WAV format
        const wavBlob = this.encodeToWav(this.audioChunks);

        console.log("Audio recording stopped:", {
          format: "WAV",
          durationMs,
          sampleRate: this.options.sampleRate,
          bitDepth: this.options.bitDepth,
          channels: this.options.numberOfChannels,
        });

        // Create file
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `audio-recording-${timestamp}.wav`;
        const file = new File([wavBlob], filename, { type: "audio/wav" });

        this.cleanup();
        resolve(file);
      } catch (error) {
        this.cleanup();
        reject(new Error(`Failed to create audio file: ${error.message}`));
      }
    });
  }

  /**
   * Encode audio chunks to WAV format
   * @param {Array} audioChunks - Array of audio channel data
   * @returns {Blob}
   */
  encodeToWav(audioChunks) {
    const numberOfChannels = this.options.numberOfChannels;
    const sampleRate = this.options.sampleRate;
    const bitDepth = this.options.bitDepth;

    // Merge all chunks into continuous buffers
    let leftChannel = [];
    let rightChannel = [];

    audioChunks.forEach((chunk) => {
      if (chunk[0]) leftChannel.push(...chunk[0]);
      if (chunk[1]) rightChannel.push(...chunk[1]);
    });

    // If mono, use only left channel
    if (numberOfChannels === 1) {
      rightChannel = [];
    }

    // Create interleaved buffer
    const interleaved = this.interleave(leftChannel, rightChannel);

    // Create WAV file
    const dataLength = interleaved.length * (bitDepth / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV Header
    // "RIFF" chunk descriptor
    this.writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    this.writeString(view, 8, "WAVE");

    // "fmt " sub-chunk
    this.writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * (bitDepth / 8), true); // ByteRate
    view.setUint16(32, numberOfChannels * (bitDepth / 8), true); // BlockAlign
    view.setUint16(34, bitDepth, true);

    // "data" sub-chunk
    this.writeString(view, 36, "data");
    view.setUint32(40, dataLength, true);

    // Write PCM samples
    if (bitDepth === 16) {
      this.floatTo16BitPCM(view, 44, interleaved);
    } else if (bitDepth === 8) {
      this.floatTo8BitPCM(view, 44, interleaved);
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  /**
   * Interleave left and right channels
   * @param {Array} left - Left channel samples
   * @param {Array} right - Right channel samples
   * @returns {Float32Array}
   */
  interleave(left, right) {
    const length = left.length + right.length;
    const result = new Float32Array(length);

    let inputIndex = 0;

    if (right.length > 0) {
      // Stereo
      for (let i = 0; i < length; ) {
        result[i++] = left[inputIndex];
        result[i++] = right[inputIndex];
        inputIndex++;
      }
    } else {
      // Mono
      result.set(left);
    }

    return result;
  }

  /**
   * Write string to DataView
   * @param {DataView} view
   * @param {number} offset
   * @param {string} string
   */
  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Convert float samples to 16-bit PCM
   * @param {DataView} view
   * @param {number} offset
   * @param {Float32Array} input
   */
  floatTo16BitPCM(view, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  /**
   * Convert float samples to 8-bit PCM
   * @param {DataView} view
   * @param {number} offset
   * @param {Float32Array} input
   */
  floatTo8BitPCM(view, offset, input) {
    for (let i = 0; i < input.length; i++, offset++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      const val = s < 0 ? s * 0x80 : s * 0x7f;
      view.setInt8(offset, val + 0x80);
    }
  }

  /**
   * Get recording duration in seconds
   * @returns {number}
   */
  getRecordingDuration() {
    if (!this.startTime) return 0;

    const currentPausedDuration =
      this.isPaused && this.pauseStartTime
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
   * Get current size tracking status for the recording
   * Calculates estimated WAV file size based on accumulated samples
   * @returns {Object} Size status with formatted values
   */
  getSizeStatus() {
    // Calculate estimated WAV file size
    // WAV size = 44 bytes header + (samples * channels * bytesPerSample)
    const bytesPerSample = this.options.bitDepth / 8;
    const channels = this.options.numberOfChannels;
    const headerSize = 44;

    // Total data size = samples * channels * bytesPerSample
    const dataSize = this.totalSamples * channels * bytesPerSample;
    const estimatedSize = headerSize + dataSize;

    // Calculate warning/danger states based on file size limit
    let isWarning = false;
    let isNearLimit = false;
    let percentage = 0;

    if (this.options.maxFileSize) {
      percentage = (estimatedSize / this.options.maxFileSize) * 100;
      isWarning = percentage >= this.options.warningThreshold * 100;
      isNearLimit = percentage >= this.options.stopThreshold * 100;
    }

    return {
      accumulatedSize: estimatedSize,
      formattedSize: this.formatBytes(estimatedSize),
      duration: this.getRecordingDuration(),
      percentage: Math.min(100, percentage),
      maxFileSize: this.options.maxFileSize,
      formattedMaxSize: this.options.maxFileSize ? this.formatBytes(this.options.maxFileSize) : null,
      isWarning: isWarning,
      isNearLimit: isNearLimit,
    };
  }

  /**
   * Format bytes to human-readable string
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.sizeCheckInterval) {
      clearInterval(this.sizeCheckInterval);
      this.sizeCheckInterval = null;
    }

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.mixerNode) {
      this.mixerNode.disconnect();
      this.mixerNode = null;
    }

    if (this.microphoneSource) {
      this.microphoneSource.disconnect();
      this.microphoneSource = null;
    }

    if (this.systemAudioSource) {
      this.systemAudioSource.disconnect();
      this.systemAudioSource = null;
    }

    if (this.micGainNode) {
      this.micGainNode.disconnect();
      this.micGainNode = null;
    }

    if (this.systemGainNode) {
      this.systemGainNode.disconnect();
      this.systemGainNode = null;
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

    this.audioChunks = [];
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedDuration = 0;
    this.pauseStartTime = null;
    this.totalSamples = 0;
    this.warningTriggered = false;
    this.sizeLimitTriggered = false;
  }

  /**
   * Cancel recording without returning a file (cleanup only)
   * Used when recording needs to be stopped due to config changes
   */
  cancelRecording() {
    this.isRecording = false;
    this.cleanup();
  }

  /**
   * Check if audio recording is supported
   * @returns {boolean}
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (window.AudioContext || window.webkitAudioContext) &&
      window.AudioWorkletNode
    );
  }
}
