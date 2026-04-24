import React, { useState } from "react";
import { X, GripVertical, FileText, FileCode2, Image as ImageIcon, File } from "lucide-react";

export default function FileListWithReorder({
  files,
  onRemoveFile,
  onReorderFiles,
  showOrderNumbers = true,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0) + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.pdf')) return <FileText size={18} className="text-pdf-500" />;
    if (name.endsWith('.docx') || name.endsWith('.doc')) return <FileCode2 size={18} className="text-word-500" />;
    if (file.type?.startsWith('image/')) return <ImageIcon size={18} className="text-img-500" />;
    return <File size={18} className="text-gray-400" />;
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = Array.from(files);
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    onReorderFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Selected Files ({files.length})
        </h3>
        {showOrderNumbers && (
          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
            <GripVertical size={12} />
            Drag to reorder
          </p>
        )}
      </div>

      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${index}`}
            draggable={showOrderNumbers}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 bg-white dark:bg-surface-900
              rounded-xl border transition-all duration-200
              ${showOrderNumbers ? 'cursor-grab active:cursor-grabbing' : ''}
              ${draggedIndex === index ? 'opacity-50 scale-[0.98] border-primary-400' : 'border-gray-100 dark:border-gray-800'}
              ${dragOverIndex === index && draggedIndex !== index
                ? 'border-primary-400 dark:border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                : ''
              }
              hover:shadow-sm hover:border-gray-200 dark:hover:border-gray-700
            `}
          >
            {showOrderNumbers && (
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-lg">
                {index + 1}
              </span>
            )}

            <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {showOrderNumbers ? <GripVertical size={16} /> : getFileIcon(file)}
            </div>

            <div className="flex-shrink-0">{getFileIcon(file)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>

            <button
              onClick={() => onRemoveFile(index)}
              className="flex-shrink-0 p-1.5 text-gray-300 dark:text-gray-600
                         hover:text-red-500 dark:hover:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-950/20
                         rounded-lg transition-all duration-200"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
