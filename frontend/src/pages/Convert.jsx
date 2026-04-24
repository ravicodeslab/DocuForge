import React, { useState } from "react";
import DropZone from "../components/DropZone";
import { convertAPI } from "../api/client";
import { FileDown, AlertCircle, CheckCircle } from "lucide-react";

export default function Convert() {
  const [file, setFile] = useState(null);
  const [targetType, setTargetType] = useState("word");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error' | 'success', msg: '' }

  const handleFiles = (files) => {
    // only take the first for general conversion (unless image-to-pdf which needs multiple)
    setFile(files[0]);
    setStatus(null);
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);

    try {
      let response;
      let filename = "converted";

      if (targetType === "word") {
        response = await convertAPI.pdfToWord(file);
        filename += ".docx";
      } else if (targetType === "pptx") {
        response = await convertAPI.pdfToPptx(file);
        filename += ".pptx";
      } else if (targetType === "excel") {
        response = await convertAPI.pdfToExcel(file);
        filename += ".xlsx";
      } else if (targetType === "images") {
        response = await convertAPI.pdfToImage(file);
        filename += response.data.type === "application/zip" ? ".zip" : ".jpg";
      }

      downloadBlob(response.data, filename);
      setStatus({ type: "success", msg: "File successfully converted and downloaded." });
    } catch (err) {
      setStatus({ type: "error", msg: err.message || "An error occurred during conversion." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">File Conversions</h1>
        <p className="page-subtitle">Convert PDFs to Word, PowerPoint, Excel, and images.</p>
      </div>

      <div className="card">
        {!file ? (
          <DropZone onFilesAccepted={handleFiles} accept=".pdf" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "var(--bg-color)", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <FileDown size={24} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              <button className="btn btn-outline" onClick={() => { setFile(null); setStatus(null); }}>
                Change
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="target-type">Convert to</label>
              <select 
                id="target-type" 
                className="form-select" 
                value={targetType} 
                onChange={(e) => setTargetType(e.target.value)}
              >
                <option value="word">Word (DOCX)</option>
                <option value="pptx">PowerPoint (PPTX)</option>
                <option value="excel">Excel (XLSX)</option>
                <option value="images">Images (JPG/ZIP)</option>
              </select>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleConvert} 
              disabled={loading}
              style={{ width: "100%", padding: "1rem" }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div> Processing...
                </>
              ) : (
                "Convert File"
              )}
            </button>
          </div>
        )}

        {status && (
          <div className={status.type === "error" ? "status-box status-error" : "status-box status-success"}>
            {status.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}
