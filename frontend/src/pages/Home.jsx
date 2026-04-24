import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Copy,
  ImageIcon,
  Zap,
  ArrowRight,
  Sparkles,
  Shield,
  Gauge,
  Layers,
  RefreshCw,
  Maximize2,
  Lock,
} from 'lucide-react';

export default function Home() {
  const tools = [
    {
      icon: FileText,
      title: 'PDF Tools',
      description: 'Merge, split, compress, convert, and reorder PDF files with precision',
      link: '/pdf',
      gradient: 'from-pdf-500 to-pdf-700',
      bgGlow: 'bg-pdf-500/10',
    },
    {
      icon: Copy,
      title: 'Word Tools',
      description: 'Combine, split, compress, and convert DOCX files efficiently',
      link: '/word',
      gradient: 'from-word-500 to-word-700',
      bgGlow: 'bg-word-500/10',
    },
    {
      icon: ImageIcon,
      title: 'Image Tools',
      description: 'Convert, resize, and compress images with full quality control',
      link: '/image',
      gradient: 'from-img-500 to-img-700',
      bgGlow: 'bg-img-500/10',
    },
  ];

  const features = [
    {
      icon: Layers,
      title: 'Merge Files',
      description: 'Combine multiple files with drag-to-reorder before merging',
    },
    {
      icon: Gauge,
      title: 'Smart Compression',
      description: 'Reduce file sizes with customizable quality levels',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: '100% local processing — files never leave your machine',
    },
    {
      icon: RefreshCw,
      title: 'Format Conversion',
      description: 'Convert between PDF, DOCX, TXT, JPG, PNG, and more',
    },
    {
      icon: Maximize2,
      title: 'Image Resizing',
      description: 'Custom dimensions and preset sizes for any platform',
    },
    {
      icon: Lock,
      title: 'No Upload Limits',
      description: 'Process files of any size without restrictions',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-grid opacity-40" />

        <div className="relative px-4 py-20 sm:py-28 lg:py-36">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm animate-fade-in">
              <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                Professional File Processing Suite
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-[1.1] animate-fade-in-up">
              All-in-One File Tools{' '}
              <span className="text-gradient">Workspace</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Merge, split, compress, convert, and organize files easily.{' '}
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                100% local processing, lightning-fast results.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/pdf" className="btn btn-primary btn-lg shadow-lg shadow-primary-500/25">
                <Zap size={20} />
                Start Processing
                <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                Explore Features
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 sm:gap-12 py-10 border-y border-gray-200/60 dark:border-gray-800/60 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {[
                { value: '15+', label: 'File Operations' },
                { value: '100%', label: 'Local Processing' },
                { value: '∞', label: 'No Size Limits' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl sm:text-4xl font-black text-gradient">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TOOLS SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Powerful Tools for Every Task
            </h2>
            <p className="section-subtitle">
              Choose your tool and start processing files instantly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={index}
                  to={tool.link}
                  id={`tool-card-${tool.title.toLowerCase().replace(/\s/g, '-')}`}
                  className="group relative bg-white dark:bg-surface-900 rounded-2xl p-8
                             shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800
                             transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className={`absolute -inset-px ${tool.bgGlow} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tool.gradient} mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <Icon size={28} className="text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {tool.title}
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-semibold text-sm group-hover:gap-3 gap-2 transition-all duration-300">
                      Explore Tools
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="px-4 py-20 lg:py-28 bg-gray-50/50 dark:bg-surface-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">
              Why Choose DocuForge?
            </h2>
            <p className="section-subtitle">
              Everything you need for professional file management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex gap-4 p-6 rounded-2xl bg-white dark:bg-surface-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                      <Icon size={22} className="text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 rounded-3xl p-10 sm:p-14 text-white shadow-2xl shadow-primary-600/20">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                Ready to Process Your Files?
              </h2>
              <p className="text-lg mb-10 opacity-90 max-w-xl mx-auto">
                Choose a tool and start working with your files instantly — no sign-up, no uploads to external servers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {tools.map((tool, index) => (
                  <Link
                    key={index}
                    to={tool.link}
                    className="px-6 py-3 rounded-xl bg-white/15 backdrop-blur-sm text-white font-semibold
                               hover:bg-white/25 transition-all duration-200 border border-white/20
                               hover:scale-105 active:scale-[0.98]"
                  >
                    {tool.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
