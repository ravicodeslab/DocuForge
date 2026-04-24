import React from 'react';

export default function ProgressBar({ progress = 0, label = 'Processing...', showPercent = true }) {
  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {showPercent && (
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${progress < 100 ? 'progress-shimmer' : ''}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
