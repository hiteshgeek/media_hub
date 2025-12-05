/**
 * MediaPreloader - Handles file preloading and caching for carousel preview
 * Adapted from mix_carousel for file_uploader integration
 */

export class MediaPreloader {
  constructor(options) {
    this.options = options;
    this.preloadedMedia = {};
    this.loadingProgress = {};
    this.onProgressCallbacks = [];
    this.activeRequests = {};
    this.isPaused = false;
  }

  onProgress(callback) {
    this.onProgressCallbacks.push(callback);
  }

  notifyProgress(index, progress) {
    this.onProgressCallbacks.forEach((cb) => cb(index, progress));
  }

  preloadAll(files) {
    this.isPaused = false;
    files.forEach((file, index) => {
      const originalIndex = this.options.files.indexOf(file);
      if (originalIndex !== -1) {
        this.preloadFile(file, originalIndex);
      }
    });
  }

  stop() {
    this.isPaused = true;
    Object.keys(this.activeRequests).forEach((index) => {
      const xhr = this.activeRequests[index];
      if (xhr) {
        xhr.abort();
        delete this.activeRequests[index];
      }
    });
    Object.keys(this.loadingProgress).forEach((index) => {
      if (this.loadingProgress[index] < 100) {
        this.loadingProgress[index] = 0;
        this.notifyProgress(index, 0);
      }
    });
  }

  shouldPreloadFile(file) {
    const autoPreload = this.options.autoPreload;

    if (autoPreload === true) {
      return (
        this.options.visibleTypes.includes(file.carouselType) &&
        this.options.previewableTypes.includes(file.carouselType)
      );
    }

    if (Array.isArray(autoPreload)) {
      return (
        this.options.visibleTypes.includes(file.carouselType) &&
        this.options.previewableTypes.includes(file.carouselType) &&
        autoPreload.includes(file.carouselType)
      );
    }

    return false;
  }

  isFileAutoPreloaded(file) {
    if (this.options.autoPreload === true) {
      return true;
    }
    if (Array.isArray(this.options.autoPreload)) {
      return this.options.autoPreload.includes(file.carouselType);
    }
    return false;
  }

  /**
   * Get response type based on file type for XHR request
   */
  getResponseType(carouselType) {
    switch (carouselType) {
      case "excel":
        return "arraybuffer";
      case "image":
      case "video":
      case "audio":
      case "pdf":
        return "blob";
      default:
        return "text";
    }
  }

  preloadFile(file, index) {
    if (this.preloadedMedia[index] && this.loadingProgress[index] === 100) {
      return Promise.resolve(this.preloadedMedia[index]);
    }

    if (this.isPaused) {
      return Promise.resolve(null);
    }

    const shouldPreload =
      this.options.visibleTypes.includes(file.carouselType) &&
      this.options.previewableTypes.includes(file.carouselType);

    if (!shouldPreload) {
      return Promise.resolve(null);
    }

    if (this.loadingProgress[index] === undefined) {
      this.loadingProgress[index] = 0;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      this.activeRequests[index] = xhr;

      xhr.open("GET", file.url, true);
      xhr.responseType = this.getResponseType(file.carouselType);

      xhr.onprogress = (e) => {
        if (this.isPaused) {
          xhr.abort();
          return;
        }

        if (e.lengthComputable) {
          this.loadingProgress[index] = Math.min(
            (e.loaded / e.total) * 100,
            99
          );
        } else if (this.loadingProgress[index] < 90) {
          this.loadingProgress[index] += 5;
        }
        this.notifyProgress(index, this.loadingProgress[index]);
      };

      xhr.onload = () => {
        delete this.activeRequests[index];

        if (xhr.status === 200) {
          if (["image", "video", "audio", "pdf"].includes(file.carouselType)) {
            this.preloadedMedia[index] = URL.createObjectURL(xhr.response);
          } else {
            this.preloadedMedia[index] = xhr.response;
          }
          this.loadingProgress[index] = 100;
          this.notifyProgress(index, 100);
          resolve(this.preloadedMedia[index]);
        } else {
          this.loadingProgress[index] = 100;
          this.notifyProgress(index, 100);
          reject(new Error(`Failed to load: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        delete this.activeRequests[index];
        this.loadingProgress[index] = 100;
        this.notifyProgress(index, 100);
        reject(new Error("Network error"));
      };

      xhr.onabort = () => {
        delete this.activeRequests[index];
        resolve(null);
      };

      xhr.send();
    });
  }

  getPreloadedMedia(index) {
    return this.preloadedMedia[index];
  }

  getProgress(index) {
    return this.loadingProgress[index] || 0;
  }

  isLoaded(index) {
    return this.loadingProgress[index] === 100;
  }

  isLoading(index) {
    const progress = this.loadingProgress[index] || 0;
    return progress > 0 && progress < 100;
  }

  cleanup() {
    this.stop();

    Object.values(this.preloadedMedia).forEach((url) => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    this.preloadedMedia = {};
    this.loadingProgress = {};
  }
}

export default MediaPreloader;
