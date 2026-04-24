import React from "react";
import { ChevronRight } from "lucide-react";

export default function ToolCard({
  icon: Icon,
  title,
  description,
  onClick,
  badge = null,
  isActive = false,
  accentColor = "primary", // "pdf", "word", "img", "primary"
}) {
  const accentMap = {
    primary: {
      iconBg: "bg-primary-100 dark:bg-primary-900/40",
      iconColor: "text-primary-600 dark:text-primary-400",
      activeBorder: "border-primary-500",
      activeBg: "bg-primary-50 dark:bg-primary-950/30",
      hoverBorder: "hover:border-primary-300 dark:hover:border-primary-700",
    },
    pdf: {
      iconBg: "bg-pdf-100 dark:bg-pdf-700/20",
      iconColor: "text-pdf-600 dark:text-pdf-400",
      activeBorder: "border-pdf-500",
      activeBg: "bg-pdf-50 dark:bg-pdf-700/10",
      hoverBorder: "hover:border-pdf-300 dark:hover:border-pdf-700",
    },
    word: {
      iconBg: "bg-word-100 dark:bg-word-700/20",
      iconColor: "text-word-600 dark:text-word-400",
      activeBorder: "border-word-500",
      activeBg: "bg-word-50 dark:bg-word-700/10",
      hoverBorder: "hover:border-word-300 dark:hover:border-word-700",
    },
    img: {
      iconBg: "bg-img-100 dark:bg-img-700/20",
      iconColor: "text-img-600 dark:text-img-400",
      activeBorder: "border-img-500",
      activeBg: "bg-img-50 dark:bg-img-700/10",
      hoverBorder: "hover:border-img-300 dark:hover:border-img-700",
    },
  };

  const accent = accentMap[accentColor] || accentMap.primary;

  return (
    <button
      onClick={onClick}
      className={`w-full group relative overflow-hidden rounded-2xl p-6 text-left
        transition-all duration-300 border ${
          isActive
            ? `${accent.activeBorder} ${accent.activeBg} shadow-lg`
            : `border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-900 ${accent.hoverBorder} hover:shadow-lg`
        }`}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-gray-800/20" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-3 ${accent.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`w-6 h-6 ${accent.iconColor}`} />
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                {badge}
              </span>
            )}
            <ChevronRight
              className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 group-hover:translate-x-1 transition-all duration-300"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}
