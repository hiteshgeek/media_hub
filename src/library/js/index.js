import { FileUploader } from "./components/FileUploader.js";
import { FileCarousel } from "./components/carousel/index.js";
// import { icons } from "./icons.js";

export { FileUploader, FileCarousel };

// Expose classes globally for IIFE build
if (typeof window !== "undefined") {
  window.FileUploader = FileUploader;
  window.FileCarousel = FileCarousel;
}
