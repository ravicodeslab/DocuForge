import React, { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

export default function DropZone({ onFilesAccepted, accept, multiple = false }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesAccepted(Array.from(e.dataTransfer.files));
      }
    },
    [onFilesAccepted]
  );

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAccepted(Array.from(e.target.files));
    }
  };

  return (
    <div
      className={`dropzone ${isDragActive ? "active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadCloud className="dropzone-icon" />
      <div>
        <h3 style={{ marginBottom: "0.25rem" }}>
          Drag & drop files here
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          or click to browse
        </p>
      </div>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: "none" }}
        id="file-upload"
      />
      <label htmlFor="file-upload" className="btn btn-outline" style={{ marginTop: "1rem" }}>
        Select Files
      </label>
    </div>
  );
}
