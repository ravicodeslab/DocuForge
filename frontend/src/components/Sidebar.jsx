import React from "react";
import { NavLink } from "react-router-dom";
import {
  FileText,
  Zap,
  FileCode2,
  ImageIcon,
  Home,
  X,
  Menu,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ isOpen, onToggle }) {
  const navItems = [
    { to: "/", icon: Home, label: "Home", end: true },
  ];

  const toolItems = [
    {
      to: "/pdf",
      icon: FileText,
      label: "PDF Tools",
      activeClass: "bg-pdf-100 dark:bg-pdf-700/20 text-pdf-700 dark:text-pdf-300",
      dotColor: "bg-pdf-500",
    },
    {
      to: "/word",
      icon: FileCode2,
      label: "Word Tools",
      activeClass: "bg-word-100 dark:bg-word-700/20 text-word-700 dark:text-word-300",
      dotColor: "bg-word-500",
    },
    {
      to: "/image",
      icon: ImageIcon,
      label: "Image Tools",
      activeClass: "bg-img-100 dark:bg-img-700/20 text-img-700 dark:text-img-300",
      dotColor: "bg-img-500",
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <button
          id="sidebar-mobile-toggle"
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu size={22} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">DocuForge</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-[280px] h-screen bg-white dark:bg-surface-950
          border-r border-gray-200 dark:border-gray-800/60
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                DocuForge
              </h1>
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                File Tools
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Home */}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => isOpen && onToggle()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Tools Section */}
          <div className="pt-4 pb-2 px-4 mt-2">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
              Tools
            </p>
          </div>

          {toolItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => isOpen && onToggle()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? `${item.activeClass} shadow-sm`
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                    {isActive && (
                      <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${item.dotColor} rounded-full`} />
                    )}
                  </div>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">
                100% Local
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
