if (
  typeof window !== "undefined" &&
  typeof window.FileUploader !== "undefined"
) {
  const uploader = new window.FileUploader("#fileUploader", {
    showLimits: true, // Show limits section (default: true)
    showLimitsToggle: true, // Show toggle button in dropzone (default: true)
    defaultLimitsVisible: true, // Start with limits visible (default: true)
    allowLimitsViewToggle: true, // Allow concise/detailed toggle (default: true)
    defaultLimitsView: "concise", // Default view mode for limits section (detailed/concise)

    preventDuplicates: true,
    duplicateCheckBy: "name-size",
    enableScreenCapture: true,
    enableVideoRecording: true,
    enableAudioRecording: true,
    enableMicrophoneAudio: true, // Enable microphone audio recording
    enableSystemAudio: true, // Enable system audio recording (allows recording tab audio)
    showFileTypeCount: true, // Show file type counts (deprecated, use showTypeGroupCount instead)
    showProgressBar: true, // Show progress bars for Total Size and Files
    showPerFileLimit: true, // Show per file size limit in type groups
    showTypeGroupSize: true, // Show total uploaded size per type group
    showTypeGroupCount: true, // Show file count per type group
    multiple: true,
    // defaultLimitsView: "detailed",
    // allowLimitsViewToggle: true, // Duplicate removed - already set on line 6

    carouselAutoPreload: true,
    carouselEnableManualLoading: false,

    onUploadSuccess: (fileObj, result) => {
      console.log("Upload success:", fileObj, result);
    },
    onUploadError: (fileObj, error) => {
      console.error("Upload error:", fileObj, error);
    },
    onDeleteSuccess: (fileObj, result) => {
      console.log("Delete success:", fileObj, result);
    },
  });

  window.uploader = uploader;

  // Expose functions to global scope
  window.getUploadedFiles = function getUploadedFiles() {
    const files = uploader.getUploadedFiles();
    document.getElementById("fileInfo").textContent =
      "Uploaded Files:\n" +
      JSON.stringify(
        files.map((f) => ({
          name: f.name,
          serverFilename: f.serverFilename,
          size: f.size,
          type: f.type,
        })),
        null,
        2
      );
  };

  window.getAllFiles = function getAllFiles() {
    const files = uploader.getFiles();
    document.getElementById("fileInfo").textContent =
      "All Files:\n" +
      JSON.stringify(
        files.map((f) => ({
          name: f.name,
          uploaded: f.uploaded,
          uploading: f.uploading,
          size: f.size,
          type: f.type,
        })),
        null,
        2
      );
  };
}
