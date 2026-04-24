import React from "react";
import { Loader2 } from "lucide-react";

export default function ProcessingProgress({
  isProcessing,
  progress = 0,
  message = "Processing your files...",
}) {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-glass p-8 max-w-sm mx-4 w-full animate-scale-in">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated spinner */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
            <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-500 animate-pulse" />
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This may take a moment...
            </p>
          </div>

          {progress > 0 && (
            <div className="w-full space-y-2">
              <div className="progress-track">
                <div
                  className="progress-fill progress-shimmer"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs font-bold text-primary-600 dark:text-primary-400">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
