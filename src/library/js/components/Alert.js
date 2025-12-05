/**
 * Alert Notification System
 * Displays toast-like notifications at the top center of the page
 * with support for various animations (fade, shake, bounce, slideDown)
 */

class Alert {
  static instance = null;
  static container = null;
  static defaultOptions = {
    duration: 5000, // Auto-dismiss after 5 seconds (0 = no auto-dismiss)
    animation: "fade", // fade, shake, bounce, slideDown
    type: "error", // error, success, warning, info
    dismissible: true, // Show close button
    maxAlerts: 5, // Maximum alerts visible at once
  };

  /**
   * Initialize the alert container
   */
  static init() {
    if (Alert.container) return;

    Alert.container = document.createElement("div");
    Alert.container.className = "file-uploader-alert-container";
    document.body.appendChild(Alert.container);
  }

  /**
   * Show an alert notification
   * @param {string} message - The message to display
   * @param {Object} options - Alert options
   * @returns {HTMLElement} - The alert element
   */
  static show(message, options = {}) {
    Alert.init();

    const config = { ...Alert.defaultOptions, ...options };

    // Limit number of visible alerts
    const existingAlerts = Alert.container.querySelectorAll(
      ".file-uploader-alert"
    );
    if (existingAlerts.length >= config.maxAlerts) {
      // Remove oldest alert
      const oldest = existingAlerts[0];
      Alert.dismiss(oldest);
    }

    // Create alert element
    const alert = document.createElement("div");
    alert.className = `file-uploader-alert file-uploader-alert-${config.type}`;
    alert.setAttribute("role", "alert");

    // Icon based on type
    const icon = Alert.getIcon(config.type);

    // Build alert HTML
    alert.innerHTML = `
      <div class="file-uploader-alert-icon">${icon}</div>
      <div class="file-uploader-alert-content">
        <span class="file-uploader-alert-message">${message}</span>
      </div>
      ${
        config.dismissible
          ? `<button type="button" class="file-uploader-alert-close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>`
          : ""
      }
    `;

    // Add to container
    Alert.container.appendChild(alert);

    // Trigger animation
    requestAnimationFrame(() => {
      alert.classList.add(
        "file-uploader-alert-show",
        `file-uploader-alert-${config.animation}`
      );
    });

    // Setup close button
    if (config.dismissible) {
      const closeBtn = alert.querySelector(".file-uploader-alert-close");
      closeBtn.addEventListener("click", () => Alert.dismiss(alert));
    }

    // Auto-dismiss
    if (config.duration > 0) {
      alert._timeout = setTimeout(() => {
        Alert.dismiss(alert);
      }, config.duration);
    }

    return alert;
  }

  /**
   * Dismiss an alert
   * @param {HTMLElement} alert - The alert element to dismiss
   */
  static dismiss(alert) {
    if (!alert || alert._dismissing) return;

    alert._dismissing = true;

    // Clear timeout if exists
    if (alert._timeout) {
      clearTimeout(alert._timeout);
    }

    // Add exit animation
    alert.classList.add("file-uploader-alert-hide");

    // Remove after animation
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 300);
  }

  /**
   * Dismiss all alerts
   */
  static dismissAll() {
    if (!Alert.container) return;

    const alerts = Alert.container.querySelectorAll(".file-uploader-alert");
    alerts.forEach((alert) => Alert.dismiss(alert));
  }

  /**
   * Show error alert
   */
  static error(message, options = {}) {
    return Alert.show(message, { ...options, type: "error" });
  }

  /**
   * Show success alert
   */
  static success(message, options = {}) {
    return Alert.show(message, { ...options, type: "success" });
  }

  /**
   * Show warning alert
   */
  static warning(message, options = {}) {
    return Alert.show(message, { ...options, type: "warning" });
  }

  /**
   * Show info alert
   */
  static info(message, options = {}) {
    return Alert.show(message, { ...options, type: "info" });
  }

  /**
   * Get icon SVG based on type
   */
  static getIcon(type) {
    const icons = {
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </svg>`,
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <path d="M12 9v4M12 17h.01"/>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>`,
    };
    return icons[type] || icons.info;
  }
}

export default Alert;
