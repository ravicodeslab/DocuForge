import React, { useState } from "react";
import DropZone from "../components/DropZone";
import { aiAPI } from "../api/client";
import { FileText, AlignLeft, AlertCircle } from "lucide-react";

export default function AISummary() {
  const [inputType, setInputType] = useState("file"); // 'file' or 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [sentences, setSentences] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFiles = (files) => {
    setFile(files[0]);
    setError(null);
    setResult(null);
  };

  const handleSummarize = async () => {
    if (inputType === "file" && !file) return;
    if (inputType === "text" && !text.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      if (inputType === "file") {
        response = await aiAPI.summarizeFile(file, sentences);
      } else {
        response = await aiAPI.summarizeText(text, sentences);
      }
      setResult(response.data);
    } catch (err) {
      setError(err.message || "Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Summarization</h1>
        <p className="page-subtitle">Extract key insights from long PDFs or text using a local LSA model.</p>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          className={`btn ${inputType === "file" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setInputType("file")}
        >
          <FileText size={16} /> Document
        </button>
        <button
          className={`btn ${inputType === "text" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setInputType("text")}
        >
          <AlignLeft size={16} /> Raw Text
        </button>
      </div>

      <div className="card">
        {inputType === "file" && !file ? (
          <DropZone onFilesAccepted={handleFiles} accept=".pdf" />
        ) : inputType === "text" && text === "" && !result && !loading ? (
           <textarea
             className="form-input"
             style={{ width: "100%", minHeight: "200px", resize: "vertical" }}
             placeholder="Paste your text here..."
             value={text}
             onChange={e => setText(e.target.value)}
           />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {inputType === "file" && file && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "var(--bg-color)", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
                <span style={{ fontWeight: 500 }}>{file.name}</span>
                <button className="btn btn-outline" onClick={() => { setFile(null); setResult(null); }}>Change</button>
              </div>
            )}
            
            {inputType === "text" && text && !result && (
              <textarea
                className="form-input"
                style={{ width: "100%", minHeight: "150px" }}
                value={text}
                onChange={e => setText(e.target.value)}
              />
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="sentences">Summary Length (Sentences)</label>
              <input 
                id="sentences" 
                type="number" 
                className="form-input" 
                value={sentences} 
                onChange={e => setSentences(Number(e.target.value))} 
                min="1" 
                max="20"
              />
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleSummarize} 
              disabled={loading}
              style={{ padding: "1rem" }}
            >
              {loading ? <><div className="spinner"></div> Processing locally...</> : "Generate Summary"}
            </button>
          </div>
        )}

        {error && (
          <div className="status-box status-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </div>

      {result && (
        <div className="card" style={{ marginTop: "2rem", backgroundColor: "var(--bg-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Summary Result</h2>
            <div style={{ fontSize: "0.875rem", color: "var(--success)" }}>
              {result.compression_ratio * 100}% reduction
            </div>
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Key Points</h3>
            <ul style={{ paddingLeft: "1.5rem", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {result.key_points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Full Summary</h3>
            <p style={{ color: "var(--text-primary)" }}>{result.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
