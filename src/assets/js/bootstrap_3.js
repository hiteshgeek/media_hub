if (typeof window !== "undefined" && typeof window.FileUploader !== "undefined") {
  //bootstrap 3 example

  // Initialize profile picture uploader (single image only)
  const profileUploader = new window.FileUploader("#profilePicture", {
    multiple: false,
    onUploadSuccess: (fileObj, result) => {
      console.log("Profile picture uploaded:", result);
    },
  });

  // Initialize documents uploader (multiple files)
  const documentsUploader = new window.FileUploader("#documents", {
    multiple: true,
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
