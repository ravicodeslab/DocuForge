import React, { useState } from 'react';
import {
  FileText, Zap, FileArchive, Download, Scissors, ArrowUpDown,
  Layers, Image as ImageIcon, FileUp,
} from 'lucide-react';
import FileDropZone from '../components/FileDropZone';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import AlertBox from '../components/AlertBox';

const API = 'http://localhost:8000/api';

export default function PDFTools() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState(null);

  // Compress options
  const [compressLevel, setCompressLevel] = useState('medium');
  const [targetSize, setTargetSize] = useState('');

  // Convert options
  const [convertFormat, setConvertFormat] = useState('docx');

  // Split options
  const [splitStart, setSplitStart] = useState('');
  const [splitEnd, setSplitEnd] = useState('');

  const handleFilesAdded = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setAlert(null);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorder = (reorderedFiles) => {
    setFiles(reorderedFiles);
  };

  const clearFiles = () => {
    setFiles([]);
    setAlert(null);
    setProgress(0);
  };

  // ── Download helper ───────────────────────────────────────────────────
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const downloadFromUrl = (downloadUrl, filename) => {
    const a = document.createElement('a');
    a.href = `http://localhost:8000${downloadUrl}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── Simulated progress ────────────────────────────────────────────────
  const startProgress = () => {
    setProgress(0);
    return setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 25, 90));
    }, 300);
  };

  const finishProgress = (interval) => {
    clearInterval(interval);
    setProgress(100);
    setTimeout(() => setProgress(0), 1500);
  };

  // ── MERGE ─────────────────────────────────────────────────────────────
  const handleMerge = async () => {
    if (files.length < 2) {
      setAlert({ type: 'error', title: 'Error', message: 'Please add at least 2 PDF files to merge' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const res = await fetch(`${API}/pdf/merge`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to merge PDFs');

      const data = await res.json();
      downloadFromUrl(data.download_url, 'merged.pdf');

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: 'PDFs merged successfully!' });
      setFiles([]);
    } catch (err) {
      clearInterval(interval);
      setAlert({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── SPLIT ─────────────────────────────────────────────────────────────
  const handleSplit = async () => {
    if (files.length === 0) {
      setAlert({ type: 'error', title: 'Error', message: 'Please add a PDF to split' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      if (splitStart) formData.append('start_page', splitStart);
      if (splitEnd) formData.append('end_page', splitEnd);

      const res = await fetch(`${API}/pdf/split`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to split PDF');

      const data = await res.json();
      downloadFromUrl(data.download_url, 'split.pdf');

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: 'PDF split successfully!' });
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
      setAlert({ type: 'error', title: 'Error', message: 'Please add a PDF to compress' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('level', compressLevel);
      if (targetSize) formData.append('target_size', targetSize);

      const res = await fetch(`${API}/pdf/compress`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to compress PDF');

      const data = await res.json();
      const savedPct = (((data.original_size - data.compressed_size) / data.original_size) * 100).toFixed(1);
      downloadFromUrl(data.download_url, `compressed-${files[0].name}`);

      finishProgress(interval);
      setAlert({
        type: 'success',
        title: 'Compressed!',
        message: `${(data.original_size / 1024 / 1024).toFixed(2)} MB → ${(data.compressed_size / 1024 / 1024).toFixed(2)} MB (${savedPct}% saved)`,
      });
      setFiles([]);
    } catch (err) {
      clearInterval(interval);
      setAlert({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── CONVERT ───────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (files.length === 0) {
      setAlert({ type: 'error', title: 'Error', message: 'Please add a file to convert' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      let endpoint = '';
      let filename = '';

      if (convertFormat === 'docx') {
        endpoint = `${API}/pdf/to-docx`;
        filename = 'converted.docx';
      } else if (convertFormat === 'images') {
        endpoint = `${API}/pdf/to-image`;
        filename = 'pages.zip';
      } else if (convertFormat === 'image-to-pdf') {
        endpoint = `${API}/image/to-pdf`;
        filename = 'converted.pdf';
      }

      const res = await fetch(endpoint, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to convert');

      const data = await res.json();
      downloadFromUrl(data.download_url, filename);

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: 'File converted successfully!' });
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
    { id: 'merge', label: 'Merge', icon: Layers },
    { id: 'split', label: 'Split', icon: Scissors },
    { id: 'compress', label: 'Compress', icon: FileArchive },
    { id: 'convert', label: 'Convert', icon: Zap },
  ];

  const tabAcceptMap = {
    merge: '.pdf',
    split: '.pdf',
    compress: '.pdf',
    convert: convertFormat === 'image-to-pdf' ? 'image/*' : '.pdf',
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-pdf-100 dark:bg-pdf-700/20 rounded-xl">
              <FileText className="w-6 h-6 text-pdf-600 dark:text-pdf-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              PDF Tools
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-14">
            Merge, split, compress, and convert PDF files
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`pdf-tab-${tab.id}`}
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
          {/* ── MERGE TAB ────────────────────────────────────────── */}
          {activeTab === 'merge' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Merge PDFs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Combine multiple PDF files into one. Drag to reorder before merging.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone
                  onFilesAccepted={handleFilesAdded}
                  accept=".pdf"
                  multiple
                  icon={Layers}
                  hint="Drag files to reorder before merging"
                />
              ) : (
                <div className="space-y-6">
                  <FileList
                    files={files}
                    onRemove={handleRemoveFile}
                    onReorder={handleReorder}
                    showOrder
                  />

                  <FileDropZone
                    onFilesAccepted={handleFilesAdded}
                    accept=".pdf"
                    multiple
                    compact
                  />

                  <div className="flex gap-3">
                    <button
                      id="merge-pdf-btn"
                      onClick={handleMerge}
                      disabled={loading || files.length < 2}
                      className="btn btn-primary flex-1"
                    >
                      <Download size={16} />
                      {loading ? 'Merging...' : `Merge ${files.length} PDFs`}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SPLIT TAB ────────────────────────────────────────── */}
          {activeTab === 'split' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Split PDF</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Extract specific pages from a PDF document.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone
                  onFilesAccepted={handleFilesAdded}
                  accept=".pdf"
                  multiple={false}
                  icon={Scissors}
                />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Start Page</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={splitStart}
                        onChange={(e) => setSplitStart(e.target.value)}
                        className="input"
                        id="split-start-page"
                      />
                    </div>
                    <div>
                      <label className="label">End Page</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Last page"
                        value={splitEnd}
                        onChange={(e) => setSplitEnd(e.target.value)}
                        className="input"
                        id="split-end-page"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      id="split-pdf-btn"
                      onClick={handleSplit}
                      disabled={loading || files.length === 0}
                      className="btn btn-primary flex-1"
                    >
                      <Scissors size={16} />
                      {loading ? 'Splitting...' : 'Split PDF'}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── COMPRESS TAB ─────────────────────────────────────── */}
          {activeTab === 'compress' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Compress PDF</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reduce PDF file size while maintaining quality.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone
                  onFilesAccepted={handleFilesAdded}
                  accept=".pdf"
                  multiple={false}
                  icon={FileArchive}
                />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />

                  {/* Compression Level */}
                  <div>
                    <label className="label">Compression Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'low', label: 'Low', sub: 'High Quality' },
                        { id: 'medium', label: 'Medium', sub: 'Balanced' },
                        { id: 'high', label: 'High', sub: 'Small Size' },
                      ].map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setCompressLevel(level.id)}
                          className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            compressLevel === level.id
                              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                              : 'bg-gray-100 dark:bg-surface-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {level.label}
                          <span className={`block text-xs mt-0.5 ${
                            compressLevel === level.id ? 'text-primary-200' : 'text-gray-400'
                          }`}>
                            {level.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Size */}
                  <div>
                    <label className="label">Target File Size (Optional, in KB)</label>
                    <input
                      type="number"
                      placeholder="e.g., 500"
                      value={targetSize}
                      onChange={(e) => setTargetSize(e.target.value)}
                      className="input"
                      id="compress-target-size"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Leave empty to use compression level</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      id="compress-pdf-btn"
                      onClick={handleCompress}
                      disabled={loading || files.length === 0}
                      className="btn btn-primary flex-1"
                    >
                      <FileArchive size={16} />
                      {loading ? 'Compressing...' : 'Compress PDF'}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CONVERT TAB ──────────────────────────────────────── */}
          {activeTab === 'convert' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Convert</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Convert between PDF and other formats.
                </p>
              </div>

              {/* Format Selector */}
              <div>
                <label className="label">Conversion Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'docx', label: 'PDF → Word', sub: 'DOCX format', icon: FileText },
                    { id: 'images', label: 'PDF → Images', sub: 'ZIP of pages', icon: ImageIcon },
                    { id: 'image-to-pdf', label: 'Image → PDF', sub: 'JPG/PNG to PDF', icon: FileUp },
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => { setConvertFormat(fmt.id); setFiles([]); }}
                        className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm text-left transition-all duration-200 ${
                          convertFormat === fmt.id
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                            : 'bg-gray-100 dark:bg-surface-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Icon size={18} />
                        <div>
                          <div className="font-semibold">{fmt.label}</div>
                          <div className={`text-xs ${convertFormat === fmt.id ? 'text-primary-200' : 'text-gray-400'}`}>
                            {fmt.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {files.length === 0 ? (
                <FileDropZone
                  onFilesAccepted={handleFilesAdded}
                  accept={tabAcceptMap.convert}
                  multiple={false}
                  icon={Zap}
                />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />

                  <div className="flex gap-3">
                    <button
                      id="convert-pdf-btn"
                      onClick={handleConvert}
                      disabled={loading || files.length === 0}
                      className="btn btn-primary flex-1"
                    >
                      <Zap size={16} />
                      {loading ? 'Converting...' : 'Convert'}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Progress Bar */}
          {loading && progress > 0 && (
            <ProgressBar progress={progress} label="Processing..." />
          )}
        </div>
      </div>
    </div>
  );
}
