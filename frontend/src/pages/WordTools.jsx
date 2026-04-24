import React, { useState } from 'react';
import {
  FileCode2, Layers, Scissors, FileArchive, Zap, Download, FileText, FileUp,
  Settings,
} from 'lucide-react';
import FileDropZone from '../components/FileDropZone';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import AlertBox from '../components/AlertBox';

const API = 'http://localhost:8000/api';

export default function WordTools() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alert, setAlert] = useState(null);

  // Compress options
  const [compressLevel, setCompressLevel] = useState('medium');

  // Convert
  const [convertFormat, setConvertFormat] = useState('pdf');

  // Split
  const [splitSections, setSplitSections] = useState('2');

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
      setAlert({ type: 'error', title: 'Error', message: 'At least 2 DOCX files required' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));

      const res = await fetch(`${API}/docx/merge`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to merge DOCX files');

      const data = await res.json();
      downloadFromUrl(data.download_url, 'merged.docx');

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: 'DOCX files merged successfully!' });
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
      setAlert({ type: 'error', title: 'Error', message: 'Please add a DOCX file' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('sections', splitSections || '2');

      const res = await fetch(`${API}/docx/split`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to split DOCX');

      const data = await res.json();
      data.files.forEach((f) => downloadFromUrl(f.download_url, f.filename));

      finishProgress(interval);
      setAlert({ type: 'success', title: 'Success', message: `Split into ${data.files.length} parts!` });
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
      setAlert({ type: 'error', title: 'Error', message: 'Please add a DOCX file' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('level', compressLevel);

      const res = await fetch(`${API}/docx/compress`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to compress DOCX');

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
      setAlert({ type: 'error', title: 'Error', message: 'Please add a DOCX file' });
      return;
    }
    setLoading(true);
    const interval = startProgress();

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const endpoint = convertFormat === 'pdf' ? `${API}/docx/to-pdf` : `${API}/docx/to-txt`;
      const filename = convertFormat === 'pdf' ? 'converted.pdf' : 'converted.txt';

      const res = await fetch(endpoint, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to convert DOCX');

      const data = await res.json();
      downloadFromUrl(data.download_url, filename);

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

  // ── Tabs ──────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'merge', label: 'Merge', icon: Layers },
    { id: 'split', label: 'Split', icon: Scissors },
    { id: 'compress', label: 'Compress', icon: FileArchive },
    { id: 'convert', label: 'Convert', icon: Zap },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-word-100 dark:bg-word-700/20 rounded-xl">
              <FileCode2 className="w-6 h-6 text-word-600 dark:text-word-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              Word Tools
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-14">
            Merge, split, compress, and convert DOCX files
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`word-tab-${tab.id}`}
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
          {/* ── MERGE ─────────────────────────────────────────── */}
          {activeTab === 'merge' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Merge DOCX Files</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Combine multiple Word documents. Drag to reorder.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone
                  onFilesAccepted={handleFilesAdded}
                  accept=".docx,.doc"
                  multiple
                  icon={Layers}
                  hint="Drag files to reorder before merging"
                />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} onReorder={handleReorder} showOrder />
                  <FileDropZone onFilesAccepted={handleFilesAdded} accept=".docx,.doc" multiple compact />
                  <div className="flex gap-3">
                    <button id="merge-docx-btn" onClick={handleMerge} disabled={loading || files.length < 2} className="btn btn-primary flex-1">
                      <Download size={16} />
                      {loading ? 'Merging...' : `Merge ${files.length} Files`}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">Clear</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── SPLIT ─────────────────────────────────────────── */}
          {activeTab === 'split' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Split DOCX</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Divide a Word document into multiple sections.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone onFilesAccepted={handleFilesAdded} accept=".docx,.doc" multiple={false} icon={Scissors} />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />
                  <div>
                    <label className="label">Number of Sections</label>
                    <input
                      type="number" min="2" max="20" placeholder="2"
                      value={splitSections} onChange={(e) => setSplitSections(e.target.value)}
                      className="input max-w-xs" id="split-sections-input"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button id="split-docx-btn" onClick={handleSplit} disabled={loading || files.length === 0} className="btn btn-primary flex-1">
                      <Scissors size={16} />
                      {loading ? 'Splitting...' : 'Split DOCX'}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">Clear</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── COMPRESS ──────────────────────────────────────── */}
          {activeTab === 'compress' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Compress DOCX</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reduce file size and optimize embedded images.
                </p>
              </div>

              {files.length === 0 ? (
                <FileDropZone onFilesAccepted={handleFilesAdded} accept=".docx,.doc" multiple={false} icon={FileArchive} />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />

                  <div>
                    <label className="label">Compression Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'low', label: 'Low', sub: 'Keep Images' },
                        { id: 'medium', label: 'Medium', sub: 'Optimize Images' },
                        { id: 'high', label: 'High', sub: 'Remove Images' },
                      ].map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setCompressLevel(level.id)}
                          className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            compressLevel === level.id
                              ? 'bg-word-600 text-white shadow-md shadow-word-500/25'
                              : 'bg-gray-100 dark:bg-surface-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {level.label}
                          <span className={`block text-xs mt-0.5 ${compressLevel === level.id ? 'text-word-200' : 'text-gray-400'}`}>
                            {level.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button id="compress-docx-btn" onClick={handleCompress} disabled={loading || files.length === 0} className="btn btn-primary flex-1">
                      <FileArchive size={16} />
                      {loading ? 'Compressing...' : 'Compress DOCX'}
                    </button>
                    <button onClick={clearFiles} disabled={loading} className="btn btn-outline">Clear</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── CONVERT ──────────────────────────────────────── */}
          {activeTab === 'convert' && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Convert DOCX</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Convert Word documents to other formats.
                </p>
              </div>

              <div>
                <label className="label">Convert To</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'pdf', label: 'DOCX → PDF', icon: FileText },
                    { id: 'txt', label: 'DOCX → TXT', icon: FileUp },
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setConvertFormat(fmt.id)}
                        className={`flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                          convertFormat === fmt.id
                            ? 'bg-word-600 text-white shadow-md shadow-word-500/25'
                            : 'bg-gray-100 dark:bg-surface-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-semibold">{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {files.length === 0 ? (
                <FileDropZone onFilesAccepted={handleFilesAdded} accept=".docx,.doc" multiple={false} icon={Zap} />
              ) : (
                <div className="space-y-6">
                  <FileList files={files} onRemove={handleRemoveFile} />
                  <div className="flex gap-3">
                    <button id="convert-docx-btn" onClick={handleConvert} disabled={loading || files.length === 0} className="btn btn-primary flex-1">
                      <Zap size={16} />
                      {loading ? 'Converting...' : `Convert to ${convertFormat.toUpperCase()}`}
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
