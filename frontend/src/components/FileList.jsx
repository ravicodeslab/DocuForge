import React, { useState } from 'react';
import { GripVertical, X, FileText, Image as ImageIcon, File, FileCode2 } from 'lucide-react';

export default function FileList({ files, onReorder, onRemove, showOrder = false }) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const getFileIcon = (file) => {
    const name = (file.name || '').toLowerCase();
    const type = file.type || '';
    if (name.endsWith('.pdf') || type.includes('pdf'))
      return <FileText size={20} className="text-pdf-500" />;
    if (name.endsWith('.docx') || name.endsWith('.doc') || type.includes('word'))
      return <FileCode2 size={20} className="text-word-500" />;
    if (type.startsWith('image/'))
      return <ImageIcon size={20} className="text-img-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0) + ' ' + sizes[i];
  };

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    onReorder(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        No files selected yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showOrder && (
        <p className="text-xs font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-3">
          <GripVertical size={14} />
          Drag to reorder files before processing
        </p>
      )}

      {files.map((file, index) => (
        <div
          key={`${file.name}-${file.size}-${index}`}
          draggable={showOrder && onReorder}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`file-item ${
            showOrder ? 'cursor-grab active:cursor-grabbing' : ''
          } ${
            draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''
          } ${
            dragOverIndex === index && draggedIndex !== index
              ? 'border-primary-400 dark:border-primary-500'
              : ''
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {showOrder && onReorder && (
              <GripVertical
                size={16}
                className="text-gray-300 dark:text-gray-600 flex-shrink-0"
              />
            )}

            {showOrder && (
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-lg">
                {index + 1}
              </span>
            )}

            <div className="flex-shrink-0">{getFileIcon(file)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatFileSize(file.size)}
                {showOrder && (
                  <span className="ml-2 text-primary-500 dark:text-primary-400">
                    {getOrdinal(index + 1)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => onRemove(index)}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 dark:text-gray-600
                       hover:text-red-500 dark:hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-950/30
                       opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label={`Remove ${file.name}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
