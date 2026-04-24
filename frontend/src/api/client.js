import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 second timeout for large file uploads
});

// Add request interceptor for logging
client.interceptors.request.use(
  (config) => {
    console.log(`[DocuForge] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// PDF API
// ══════════════════════════════════════════════════════════════════════════════
export const pdfAPI = {
  merge: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return client.post("/pdf/merge", formData);
  },

  compress: (file, level = "medium", targetSize = null) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("level", level);
    if (targetSize) formData.append("target_size", targetSize);
    return client.post("/pdf/compress", formData);
  },

  toDOCX: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post("/pdf/to-docx", formData);
  },

  toImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post("/pdf/to-image", formData);
  },

  split: (file, startPage, endPage) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_page", startPage);
    if (endPage) formData.append("end_page", endPage);
    return client.post("/pdf/split", formData);
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// DOCX (Word) API
// ══════════════════════════════════════════════════════════════════════════════
export const docxAPI = {
  merge: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return client.post("/docx/merge", formData);
  },

  compress: (file, level = "medium") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("level", level);
    return client.post("/docx/compress", formData);
  },

  toPDF: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post("/docx/to-pdf", formData);
  },

  toTXT: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post("/docx/to-txt", formData);
  },

  split: (file, sections = 2) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sections", sections);
    return client.post("/docx/split", formData);
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// Image API
// ══════════════════════════════════════════════════════════════════════════════
export const imageAPI = {
  convert: (file, format = "png") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);
    return client.post("/image/convert", formData);
  },

  compress: (file, quality = 80, targetSize = null) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("quality", quality);
    if (targetSize) formData.append("target_size", targetSize);
    return client.post("/image/compress", formData);
  },

  resize: (file, width, height) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("width", width);
    formData.append("height", height);
    return client.post("/image/resize", formData);
  },

  toPDF: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post("/image/to-pdf", formData);
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// Default export
// ══════════════════════════════════════════════════════════════════════════════
export default client;
