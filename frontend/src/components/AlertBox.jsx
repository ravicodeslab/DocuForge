import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function AlertBox({ type = 'info', title, message, onClose, autoDismiss = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && type === 'success') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, type, onClose]);

  const typeConfig = {
    success: {
      className: 'alert-success',
      icon: <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />,
    },
    error: {
      className: 'alert-error',
      icon: <XCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />,
    },
    info: {
      className: 'alert-info',
      icon: <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`${config.className} ${
        isVisible ? 'animate-slide-down' : 'opacity-0 -translate-y-2 transition-all duration-300'
      }`}
    >
      {config.icon}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm">{title}</p>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
