/**
 * ModalController - Handles modal operations for file carousel
 * Adapted from mix_carousel for file_uploader integration
 */

export class ModalController {
  constructor(options, preloader, renderer) {
    this.options = options;
    this.preloader = preloader;
    this.renderer = renderer;
    this.currentIndex = 0;
    this.files = [];
    this.isPreloading = false;

    this.RADIUS = 15;
    this.CIRCUMFERENCE = 2 * Math.PI * this.RADIUS;
  }

  attachEventListeners() {
    const container = this.options.container;
    const modal = container.querySelector("[data-fc-modal]");

    if (!modal) return;

    // Close button
    const closeBtn = modal.querySelector("[data-fc-close]");
    closeBtn?.addEventListener("click", () => this.close());

    // Download button
    const downloadBtn = modal.querySelector("[data-fc-download]");
    downloadBtn?.addEventListener("click", () => this.downloadCurrent());

    // Preload toggle button
    const preloadToggleBtn = modal.querySelector("[data-fc-preload-toggle]");
    preloadToggleBtn?.addEventListener("click", () => this.togglePreload());

    // Navigation buttons
    const prevBtn = modal.querySelector("[data-fc-prev]");
    const nextBtn = modal.querySelector("[data-fc-next]");

    prevBtn?.addEventListener("click", () => this.prev());
    nextBtn?.addEventListener("click", () => this.next());

    // Click outside to close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    // Thumbnail strip clicks
    const thumbnailStrip = modal.querySelector("[data-fc-thumbnail-strip]");
    thumbnailStrip?.addEventListener("click", (e) => {
      const thumb = e.target.closest("[data-fc-strip-index]");
      if (thumb) {
        const index = parseInt(thumb.dataset.fcStripIndex);
        this.open(index, this.files);
      }
    });

    // Progress updates
    this.preloader.onProgress((index, progress) => {
      this.updateThumbnailProgress(index, progress);
    });
  }

  togglePreload() {
    if (this.isPreloading) {
      this.stopPreload();
    } else {
      this.startPreload();
    }
  }

  startPreload() {
    this.isPreloading = true;
    this.updatePreloadButton();

    const currentFile = this.files[this.currentIndex];
    const contentEl = this.options.container.querySelector("[data-fc-modal-content]");
    const currentProgress = this.preloader.getProgress(this.currentIndex);

    if (this.renderer.canPreview(currentFile.carouselType) && currentProgress < 100) {
      this.renderer.renderLoading(
        currentFile.carouselType,
        currentProgress,
        contentEl,
        this.currentIndex
      );
    }

    const preloadableFiles = this.files.filter(
      (file) =>
        this.options.visibleTypes.includes(file.carouselType) &&
        this.options.previewableTypes.includes(file.carouselType)
    );

    this.preloader.preloadAll(preloadableFiles);
  }

  stopPreload() {
    this.isPreloading = false;
    this.preloader.stop();
    this.renderer.clearLoadingInterval();
    this.updatePreloadButton();

    const currentFile = this.files[this.currentIndex];
    const contentEl = this.options.container.querySelector("[data-fc-modal-content]");

    if (this.renderer.canPreview(currentFile.carouselType)) {
      setTimeout(() => {
        this.renderer.render(currentFile, this.currentIndex, contentEl);
      }, 100);
    }
  }

  updatePreloadButton() {
    const modal = this.options.container.querySelector("[data-fc-modal]");
    const btn = modal.querySelector("[data-fc-preload-toggle]");

    if (!btn) return;

    if (this.isPreloading) {
      btn.classList.add("fc-preloading");
      btn.title = "Click to Stop Loading";
      btn.innerHTML = `
        <svg class="fc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 10h6v4H9z"></path>
        </svg>
        <span class="fc-btn-text">Stop</span>
      `;
    } else {
      btn.classList.remove("fc-preloading");
      btn.title = "Click to Load All Files";
      btn.innerHTML = `
        <svg class="fc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <span class="fc-btn-text">Load All</span>
      `;
    }
  }

  isOpen() {
    const modal = this.options.container.querySelector("[data-fc-modal]");
    return modal?.classList.contains("fc-active");
  }

  open(index, files) {
    this.currentIndex = index;
    this.files = files;

    const modal = this.options.container.querySelector("[data-fc-modal]");
    modal.classList.add("fc-active");
    document.body.style.overflow = "hidden";

    this.updatePreloadButton();
    this.renderContent();
    this.renderThumbnailStrip();
    this.updateNavButtons();
  }

  close() {
    const modal = this.options.container.querySelector("[data-fc-modal]");
    const video = modal.querySelector("video");
    const audio = modal.querySelector("audio");
    if (video) video.pause();
    if (audio) audio.pause();

    modal.classList.remove("fc-active");
    document.body.style.overflow = "";
  }

  prev() {
    if (this.currentIndex > 0) {
      this.open(this.currentIndex - 1, this.files);
    }
  }

  next() {
    if (this.currentIndex < this.files.length - 1) {
      this.open(this.currentIndex + 1, this.files);
    }
  }

  renderContent() {
    const file = this.files[this.currentIndex];
    const modal = this.options.container.querySelector("[data-fc-modal]");

    const fileNameEl = modal.querySelector("[data-fc-modal-filename]");
    const fileTypeEl = modal.querySelector("[data-fc-modal-filetype]");
    const contentEl = modal.querySelector("[data-fc-modal-content]");

    fileNameEl.textContent = file.name;
    fileTypeEl.textContent = file.carouselType.toUpperCase();

    this.renderer.render(file, this.currentIndex, contentEl);
  }

  renderThumbnailStrip() {
    const modal = this.options.container.querySelector("[data-fc-modal]");
    const strip = modal.querySelector("[data-fc-thumbnail-strip]");

    if (strip.childElementCount > 0) {
      this.updateActiveThumbnail();
      return;
    }

    const visibleFiles = this.files.filter((file) =>
      this.options.visibleTypes.includes(file.carouselType)
    );

    strip.innerHTML = visibleFiles
      .map((file) => {
        const originalIndex = this.files.indexOf(file);
        const activeClass = originalIndex === this.currentIndex ? " fc-active" : "";
        const progress = this.preloader.getProgress(originalIndex);
        const isActivelyLoading = progress > 0 && progress < 100;
        const loadedClass = !isActivelyLoading ? " fc-loaded" : "";

        // Get thumbnail based on file type
        const thumbnail = this.getFileThumbnail(file);

        return `
        <div class="fc-strip-thumbnail${activeClass}${loadedClass}" data-fc-strip-index="${originalIndex}">
          <div class="fc-thumb-wrapper">
            ${thumbnail}
          </div>
          ${isActivelyLoading ? this.renderProgressIndicator(originalIndex) : ""}
        </div>
      `;
      })
      .join("");

    setTimeout(() => {
      strip.querySelectorAll(".fc-strip-thumbnail").forEach((thumb) => {
        const progress = this.preloader.getProgress(
          parseInt(thumb.dataset.fcStripIndex)
        );
        if (progress === 0 || progress === 100) {
          thumb.classList.add("fc-loaded");
        }
      });
    }, 0);

    this.updateActiveThumbnail();
  }

  getFileThumbnail(file) {
    // For images and videos with thumbnails, use img tag
    if (file.thumbnail) {
      const isVideo = file.carouselType === "video";
      const videoIcon = isVideo
        ? '<div class="fc-video-icon-wrapper"><svg class="fc-video-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>'
        : "";
      return `${videoIcon}<img src="${file.thumbnail}" class="fc-thumbnail-image" />`;
    }

    // For other file types, show icon based on type
    return this.getFileTypeIcon(file.carouselType);
  }

  getFileTypeIcon(type) {
    const icons = {
      audio: `<svg class="fc-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
      </svg>`,
      pdf: `<svg class="fc-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
      </svg>`,
      excel: `<svg class="fc-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
      </svg>`,
      csv: `<svg class="fc-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
      </svg>`,
      text: `<svg class="fc-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>`,
      default: `<svg class="fc-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
      </svg>`,
    };

    return `<div class="fc-type-icon-wrapper">${icons[type] || icons.default}</div>`;
  }

  renderProgressIndicator(index) {
    const progress = this.preloader.getProgress(index) || 0;
    const viewBoxSize = this.RADIUS * 2 + 5;
    const center = viewBoxSize / 2;
    const offset = this.CIRCUMFERENCE - (progress / 100) * this.CIRCUMFERENCE;
    const activeClass = progress > 0 && progress < 100 ? " fc-active" : "";

    return `
      <div class="fc-preload-indicator${activeClass}">
        <div class="fc-progress-circle">
          <svg viewBox="0 0 ${viewBoxSize} ${viewBoxSize}">
            <circle class="fc-circle-bg" cx="${center}" cy="${center}" r="${this.RADIUS}"></circle>
            <circle class="fc-circle-progress"
                    cx="${center}" cy="${center}" r="${this.RADIUS}"
                    stroke-dasharray="${this.CIRCUMFERENCE}"
                    stroke-dashoffset="${offset}">
            </circle>
          </svg>
          <span class="fc-progress-text">${Math.round(progress)}%</span>
        </div>
      </div>
    `;
  }

  updateThumbnailProgress(index, progress) {
    const modal = this.options.container.querySelector("[data-fc-modal]");
    const card = modal.querySelector(`[data-fc-strip-index="${index}"]`);

    if (!card) return;

    if (progress === 0 || progress === 100) {
      card.classList.add("fc-loaded");
      const indicator = card.querySelector(".fc-preload-indicator");
      if (indicator) {
        indicator.remove();
      }
      return;
    }

    if (progress > 0 && progress < 100) {
      card.classList.remove("fc-loaded");

      let indicator = card.querySelector(".fc-preload-indicator");

      if (!indicator) {
        const wrapper = card.querySelector(".fc-thumb-wrapper");
        wrapper.insertAdjacentHTML("beforeend", this.renderProgressIndicator(index));
        indicator = card.querySelector(".fc-preload-indicator");
      }

      if (indicator && !indicator.classList.contains("fc-active")) {
        indicator.classList.add("fc-active");
      }

      const progressText = indicator?.querySelector(".fc-progress-text");
      const progressCircle = indicator?.querySelector(".fc-circle-progress");
      const offset = this.CIRCUMFERENCE - (progress / 100) * this.CIRCUMFERENCE;

      if (progressCircle) progressCircle.style.strokeDashoffset = offset;
      if (progressText) progressText.textContent = `${Math.round(progress)}%`;
    }
  }

  updateActiveThumbnail() {
    const modal = this.options.container.querySelector("[data-fc-modal]");
    const strip = modal.querySelector("[data-fc-thumbnail-strip]");

    strip.querySelectorAll(".fc-strip-thumbnail").forEach((thumb) => {
      const thumbIndex = parseInt(thumb.dataset.fcStripIndex);
      if (thumbIndex === this.currentIndex) {
        thumb.classList.add("fc-active");
        thumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      } else {
        thumb.classList.remove("fc-active");
      }
    });
  }

  updateNavButtons() {
    const modal = this.options.container.querySelector("[data-fc-modal]");
    const prevBtn = modal.querySelector("[data-fc-prev]");
    const nextBtn = modal.querySelector("[data-fc-next]");

    prevBtn.disabled = this.currentIndex === 0;
    nextBtn.disabled = this.currentIndex === this.files.length - 1;
  }

  downloadCurrent() {
    const file = this.files[this.currentIndex];

    if (this.options.onFileDownload) {
      this.options.onFileDownload(file, this.currentIndex);
    } else {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  destroy() {
    if (this.isPreloading) {
      this.stopPreload();
    }
    this.renderer.cleanup();
  }
}

export default ModalController;
