import React, { useState, useRef } from 'react';
import { Upload, Plus } from 'lucide-react';

export default function FileDropZone({
  onFilesAccepted,
  accept,
  multiple = true,
  icon: Icon = Upload,
  hint = null,
  compact = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesAccepted(files);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesAccepted(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  if (compact) {
    return (
      <button
        onClick={() => inputRef.current?.click()}
        className="btn btn-outline btn-sm gap-2"
      >
        <Plus size={16} />
        Add More Files
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </button>
    );
  }

  return (
    <div
      id="file-drop-zone"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`dropzone ${isDragging ? 'active' : ''}`}
    >
      <div className={`p-4 rounded-2xl transition-all duration-300 ${
        isDragging
          ? 'bg-primary-100 dark:bg-primary-900/30 scale-110'
          : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        <Icon
          size={40}
          className={`transition-colors duration-300 ${
            isDragging
              ? 'text-primary-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        />
      </div>

      <div className="space-y-1">
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {isDragging ? 'Drop your files here' : 'Drag and drop your files here'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          or click to browse from your computer
        </p>
      </div>

      {hint && (
        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
          💡 {hint}
        </p>
      )}

      <label className="btn btn-primary btn-sm mt-2 cursor-pointer">
        <Upload size={14} />
        Choose Files
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
}
