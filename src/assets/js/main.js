if (typeof window !== "undefined") {
  const uploader = new FileUploader("#fileUploader", {
    preventDuplicates: true,
    duplicateCheckBy: "name-size",
    enableScreenCapture: true,
    enableVideoRecording: true,
    multiple: true,
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
