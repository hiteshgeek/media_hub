if (typeof window !== "undefined" && typeof window.FileUploader !== "undefined") {
  // Initialize uploaders
  const imagesUploader = new window.FileUploader("#projectImages", {
    multiple: true,
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    configUrl: "/file_uploader/get-config.php",
    onUploadSuccess: (fileObj, result) => {
      console.log("Image uploaded:", result);
    },
  });

  const videosUploader = new window.FileUploader("#projectVideos", {
    multiple: true,
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    configUrl: "/file_uploader/get-config.php",
    onUploadSuccess: (fileObj, result) => {
      console.log("Video uploaded:", result);
    },
  });

  const filesUploader = new window.FileUploader("#additionalFiles", {
    multiple: true,
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    configUrl: "/file_uploader/get-config.php",
    onUploadSuccess: (fileObj, result) => {
      console.log("File uploaded:", result);
    },
  });

  // Handle form submission
  document
    .getElementById("submissionForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = {
        projectName: document.getElementById("projectName").value,
        description: document.getElementById("description").value,
        images: imagesUploader.getUploadedFiles(),
        videos: videosUploader.getUploadedFiles(),
        files: filesUploader.getUploadedFiles(),
      };

      console.log("Form submitted with data:", formData);

      alert("Project submitted successfully! Check console for details.");
    });

  function resetForm() {
    if (
      confirm(
        "Are you sure you want to reset the form and clear all uploaded files?"
      )
    ) {
      document.getElementById("submissionForm").reset();
      imagesUploader.clear();
      videosUploader.clear();
      filesUploader.clear();
    }
  }
}
