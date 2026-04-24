import React, { useState } from 'react';
import {
  ImageIcon, Zap, FileArchive, Maximize2, Download, Grid3x3, FileUp,
  Settings,
} from 'lucide-react';
import FileDropZone from '../components/FileDropZone';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import AlertBox from '../components/AlertBox';

const API = 'http://localhost:8000/api';

export default function ImageTools() {
  const [activeTab, setActiveTab] = useState('convert');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState(null);

  // Convert
  const [convertFormat, setConvertFormat] = useState('png');

  // Compress
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [targetImageSize, setTargetImageSize] = useState('');

  // Resize
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);

  const presets = [
    { name: 'Portrait', dims: '1080 × 1350', width: 1080, height: 1350, icon: '📱' },
    { name: 'Landscape', dims: '1920 × 1080', width: 1920, height: 1080, icon: '🖥️' },
    { name: 'Square', dims: '1000 × 1000', width: 1000, height: 1000, icon: '⬜' },
    { name: 'IG Story', dims: '1080 × 1920', width: 1080, height: 1920, icon: '📲' },
    { name: 'IG Post', dims: '1200 × 628', width: 1200, height: 628, icon: '📸' },
    { name: 'Twitter', dims: '1200 × 675', width: 1200, height: 675, icon: '🐦' },
  ];

  const handleFilesAdded = (newFiles) => {
    setFiles(newFiles);
    setAlert(null);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setAlert(null);
    setProgress(0);
  };

  const downloadFromUrl = (downloadUrl, filename) => {
    const a = document.createElement('a');
    a.href = `http://localhost:8000${downloadUrl}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const startProgress = () => {
    setProgress(0);
    return setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 30, 90));
    }, 250);
  };

  const finishProgress = (interval) => {
    clearInterval(interval);
    setProgress(100);
    setTimeout(() => setProgress(0), 1500);
  };

  // ── CONVERT ───────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (files.length === 0) {
      setAlert({ type: 'error', title: 'Error', message: 'Please add an image' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('format', convertFormat);

      const res = await fetch(`${API}/image/convert`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to convert image');

      const data = await res.json();
      downloadFromUrl(data.download_url, `converted.${convertFormat}`);

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: `Converted to ${convertFormat.toUpperCase()}!` });
      setFiles([]);
    } catch (err) {
      clearInterval(interval);
      setAlert({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── COMPRESS ──────────────────────────────────────────────────────────
  const handleCompress = async () => {
    if (files.length === 0) {
      setAlert({ type: 'error', title: 'Error', message: 'Please add an image' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('quality', compressionQuality);
      if (targetImageSize) formData.append('target_size', targetImageSize);

      const res = await fetch(`${API}/image/compress`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to compress image');

      const data = await res.json();
      const savedPct = (((data.original_size - data.compressed_size) / data.original_size) * 100).toFixed(1);
      downloadFromUrl(data.download_url, `compressed-${files[0].name}`);

      finishProgress(interval);
      setAlert({
        type: 'success',
        title: 'Compressed!',
        message: `${(data.original_size / 1024).toFixed(1)} KB → ${(data.compressed_size / 1024).toFixed(1)} KB (${savedPct}% saved)`,
      });
      setFiles([]);
    } catch (err) {
      clearInterval(interval);
      setAlert({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── RESIZE ────────────────────────────────────────────────────────────
  const handleResize = async () => {
    if (files.length === 0) {
      setAlert({ type: 'error', title: 'Error', message: 'Please add an image' });
      return;
    }

    const w = selectedPreset ? selectedPreset.width : parseInt(resizeWidth);
    const h = selectedPreset ? selectedPreset.height : parseInt(resizeHeight);

    if (!w || !h) {
      setAlert({ type: 'error', title: 'Error', message: 'Enter dimensions or select a preset' });
      return;
    }

    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('width', w);
      formData.append('height', h);

      const res = await fetch(`${API}/image/resize`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to resize image');

      const data = await res.json();
      downloadFromUrl(data.download_url, `resized-${w}x${h}-${files[0].name}`);

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: `Resized to ${w}×${h}!` });
      setFiles([]);
    } catch (err) {
      clearInterval(interval);
      setAlert({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── IMAGE → PDF ───────────────────────────────────────────────────────
  const handleImageToPDF = async () => {
    if (files.length === 0) {
      setAlert({ type: 'error', title: 'Error', message: 'Please add an image' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const res = await fetch(`${API}/image/to-pdf`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to convert to PDF');

      const data = await res.json();
      downloadFromUrl(data.download_url, 'converted.pdf');

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: 'Converted to PDF!' });
      setFiles([]);
    } catch (err) {
      clearInterval(interval);
      setAlert({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Tab definitions ───────────────────────────────────────────────────
  const tabs = [
    { id: 'convert', label: 'Convert', icon: Zap },
    { id: 'compress', label: 'Compress', icon: FileArchive },
    { id: 'resize', label: 'Resize', icon: Maximize2 },
    { id: 'to-pdf', label: 'Image → PDF', icon: FileUp },
  ];

  // ── Get quality label ─────────────────────────────────────────────────
  const getQualityLabel = () => {
    if (compressionQuality < 30) return 'Maximum compression, lowest quality';
    if (compressionQuality < 60) return 'High compression, reduced quality';
    if (compressionQuality < 80) return 'Balanced compression and quality';
    return 'High quality, minimal compression';
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-img-100 dark:bg-img-700/20 rounded-xl">
              <ImageIcon className="w-6 h-6 text-img-600 dark:text-img-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Image Tools
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-14">
            Convert, compress, and resize images
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`image-tab-${tab.id}`}
                onClick={() => { setActiveTab(tab.id); clearFiles(); }}
                className={`tab-item ${activeTab === tab.id ? 'tab-item-active' : ''}`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Alert */}
        {alert && (
          <AlertBox
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Content Card */}
        <div className="card space-y-6">
          {/* ── CONVERT ──────────────────────────────────────── */}
          {activeTab === 'convert' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Convert Format</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Convert between JPG, PNG, and WebP formats.
                </p>
              </div>

              <div>
                <label className="label">Target Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {['jpg', 'png', 'webp'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setConvertFormat(fmt)}
                      className={`py-3 px-4 rounded-xl font-bold text-sm uppercase transition-all duration-200 ${
                        convertFormat === fmt
                          ? 'bg-img-600 text-white shadow-md shadow-img-500/25'
                          : 'bg-gray-100 dark:bg-surface-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {files.length === 0 ? (
                <FileDropZone onFilesAccepted={handleFilesAdded} accept="image/*" multiple={false} icon={Zap} />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />
                  <div className="flex gap-3">
                    <button id="convert-image-btn" onClick={handleConvert} disabled={loading} className="btn btn-primary flex-1">
                      <Zap size={16} />
                      {loading ? 'Converting...' : `Convert to ${convertFormat.toUpperCase()}`}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">Clear</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── COMPRESS ─────────────────────────────────────── */}
          {activeTab === 'compress' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Compress Image</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reduce image file size with quality control.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone onFilesAccepted={handleFilesAdded} accept="image/*" multiple={false} icon={FileArchive} />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />

                  {/* Quality Slider */}
                  <div className="p-5 bg-gray-50 dark:bg-surface-900 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings size={16} />
                        Compression Settings
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Quality</span>
                        <span className="text-sm font-bold text-img-600 dark:text-img-400">{compressionQuality}%</span>
                      </div>
                      <input
                        type="range" min="10" max="100"
                        value={compressionQuality}
                        onChange={(e) => setCompressionQuality(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-img-500"
                        id="compression-quality-slider"
                      />
                      <p className="text-xs text-gray-400 mt-2">{getQualityLabel()}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                        Target File Size (optional, in KB)
                      </label>
                      <input
                        type="number" placeholder="e.g., 500"
                        value={targetImageSize}
                        onChange={(e) => setTargetImageSize(e.target.value)}
                        className="input" id="target-image-size"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button id="compress-image-btn" onClick={handleCompress} disabled={loading} className="btn btn-primary flex-1">
                      <FileArchive size={16} />
                      {loading ? 'Compressing...' : 'Compress Image'}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">Clear</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── RESIZE ───────────────────────────────────────── */}
          {activeTab === 'resize' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Resize Image</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Custom dimensions or choose from preset sizes.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone onFilesAccepted={handleFilesAdded} accept="image/*" multiple={false} icon={Maximize2} />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />

                  {/* Presets */}
                  <div className="p-5 bg-gray-50 dark:bg-surface-900 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Grid3x3 size={16} />
                      Preset Sizes
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            setSelectedPreset(preset);
                            setResizeWidth(String(preset.width));
                            setResizeHeight(String(preset.height));
                          }}
                          className={`p-3 rounded-xl text-left transition-all duration-200 ${
                            selectedPreset?.name === preset.name
                              ? 'bg-img-600 text-white shadow-md shadow-img-500/25'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <span className="text-lg">{preset.icon}</span>
                          <div className="text-sm font-semibold mt-1">{preset.name}</div>
                          <div className={`text-xs ${selectedPreset?.name === preset.name ? 'text-img-200' : 'text-gray-400'}`}>
                            {preset.dims}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Dimensions */}
                  <div className="p-5 bg-gray-50 dark:bg-surface-900 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-900 dark:text-white">
                        Custom Dimensions
                      </label>
                      {selectedPreset && (
                        <button
                          onClick={() => {
                            setSelectedPreset(null);
                            setResizeWidth('');
                            setResizeHeight('');
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                        >
                          Use custom instead
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Width (px)</label>
                        <input
                          type="number" placeholder="1920"
                          value={resizeWidth}
                          onChange={(e) => { setResizeWidth(e.target.value); setSelectedPreset(null); }}
                          className="input" id="resize-width"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Height (px)</label>
                        <input
                          type="number" placeholder="1080"
                          value={resizeHeight}
                          onChange={(e) => { setResizeHeight(e.target.value); setSelectedPreset(null); }}
                          className="input" id="resize-height"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button id="resize-image-btn" onClick={handleResize} disabled={loading} className="btn btn-primary flex-1">
                      <Maximize2 size={16} />
                      {loading ? 'Resizing...' : `Resize${resizeWidth && resizeHeight ? ` to ${resizeWidth}×${resizeHeight}` : ''}`}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">Clear</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── IMAGE → PDF ──────────────────────────────────── */}
          {activeTab === 'to-pdf' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Image to PDF</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Convert any image to a PDF document.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone onFilesAccepted={handleFilesAdded} accept="image/*" multiple={false} icon={FileUp} />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />
                  <div className="flex gap-3">
                    <button id="image-to-pdf-btn" onClick={handleImageToPDF} disabled={loading} className="btn btn-primary flex-1">
                      <FileUp size={16} />
                      {loading ? 'Converting...' : 'Convert to PDF'}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">Clear</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Progress */}
          {loading && progress > 0 && <ProgressBar progress={progress} label="Processing..." />}
        </div>
      </div>
    </div>
  );
}
