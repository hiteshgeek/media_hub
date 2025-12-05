if (typeof window !== "undefined" && typeof window.FileUploader !== "undefined") {
  // Initialize uploaders
  const resumeUploader = new window.FileUploader("#resume", {
    multiple: false, // Only one resume
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    configUrl: "/file_uploader/get-config.php",
    onUploadSuccess: (fileObj, result) => {
      console.log("Resume uploaded:", result);
    },
  });

  const coverLetterUploader = new window.FileUploader("#coverLetter", {
    multiple: false, // Only one cover letter
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    configUrl: "/file_uploader/get-config.php",
    onUploadSuccess: (fileObj, result) => {
      console.log("Cover letter uploaded:", result);
    },
  });

  const portfolioUploader = new window.FileUploader("#portfolio", {
    multiple: true, // Multiple portfolio items
    uploadUrl: "/file_uploader/upload.php",
    deleteUrl: "/file_uploader/delete.php",
    downloadAllUrl: "/file_uploader/download-all.php",
    cleanupZipUrl: "/file_uploader/cleanup-zip.php",
    configUrl: "/file_uploader/get-config.php",
    onUploadSuccess: (fileObj, result) => {
      console.log("Portfolio item uploaded:", result);
    },
  });

  // Bootstrap 5 form validation
  const form = document.getElementById("applicationForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (form.checkValidity()) {
      // Prepare form data for backend
      const formData = {
        fullName: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        position: document.getElementById("position").value,
        // Just send server filenames for database storage
        resumeFiles: resumeUploader.getUploadedFileNames(),
        coverLetterFiles: coverLetterUploader.getUploadedFileNames(),
        portfolioFiles: portfolioUploader.getUploadedFileNames(),
        terms: document.getElementById("terms").checked,
      };

      console.log("Form data to send to backend:", formData);
      console.log("Resume filenames:", formData.resumeFiles);
      console.log("Portfolio filenames:", formData.portfolioFiles);

      // Example: Send to backend
      // fetch('/api/submit-application', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(formData)
      // });

      // Show success message
      const alert = document.createElement("div");
      alert.className = "alert alert-success alert-dismissible fade show mt-3";
      alert.innerHTML = `
                    <strong>Success!</strong> Your application has been submitted.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
      form.insertAdjacentElement("beforebegin", alert);

      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    form.classList.add("was-validated");
  });

  function resetForm() {
    if (
      confirm(
        "Are you sure you want to reset the form and clear all uploaded files?"
      )
    ) {
      form.reset();
      form.classList.remove("was-validated");
      resumeUploader.clear();
      coverLetterUploader.clear();
      portfolioUploader.clear();

      // Remove any success alerts
      const alerts = form.querySelectorAll(".alert-success");
      alerts.forEach((alert) => alert.remove());
    }
  }
}
