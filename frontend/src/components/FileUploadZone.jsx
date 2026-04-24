import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";

export default function FileUploadZone({
  onFilesSelected,
  acceptedFormats = "*",
  maxFiles = null,
  currentFiles = [],
  multiple = true,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = '';
  };

  const processFiles = (files) => {
    if (maxFiles && currentFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
      return;
    }
    onFilesSelected(files);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`dropzone ${isDragging ? 'active' : ''}`}
      >
        <div className={`p-3 rounded-xl transition-all duration-300 ${
          isDragging ? 'bg-primary-100 dark:bg-primary-900/30 scale-110' : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          <Upload className={`h-10 w-10 transition-colors ${
            isDragging ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'
          }`} />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {isDragging ? 'Drop files here' : 'Drop files here or click to upload'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {acceptedFormats === "*" ? "All file types supported" : `Supported: ${acceptedFormats}`}
          </p>
        </div>
        {maxFiles && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Max {maxFiles} file{maxFiles > 1 ? 's' : ''} • {currentFiles.length} selected
          </p>
        )}
      </div>
    </div>
  );
}
