if (
  typeof window !== "undefined" &&
  typeof window.FileUploader !== "undefined"
) {
  //bootstrap 3 example

  // Initialize profile picture uploader (single image only)
  // Uses separate config with uploadDir: "profile_pictures"
  const profileUploader = new window.FileUploader("#profilePicture", {
    multiple: false,
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    copyFileUrl: "/file_uploader/copy-file.php",
    configUrl: "/file_uploader/get-config-profile.php",
    confirmBeforeDelete: true,
    onUploadSuccess: (fileObj, result) => {
      console.log("Profile picture uploaded:", result);
    },
  });

  // Initialize documents uploader (multiple files)
  // Uses separate config with uploadDir: "documents"
  const documentsUploader = new window.FileUploader("#documents", {
    multiple: true,
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    copyFileUrl: "/file_uploader/copy-file.php",
    configUrl: "/file_uploader/get-config-documents.php",
    confirmBeforeDelete: true,
    onUploadSuccess: (fileObj, result) => {
      console.log("Document uploaded:", result);
    },
  });

  // Handle form submission
  document
    .getElementById("registrationForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        profilePicture: profileUploader.getUploadedFiles(),
        documents: documentsUploader.getUploadedFiles(),
      };

      console.log("Form submitted with data:", formData);

      alert("Form submitted successfully! Check console for details.");
    });
}
