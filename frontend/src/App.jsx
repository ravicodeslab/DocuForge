import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import PDFTools from "./pages/PDFTools";
import WordTools from "./pages/WordTools";
import ImageTools from "./pages/ImageTools";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-surface-50 dark:bg-surface-950">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-auto pt-14 lg:pt-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pdf" element={<PDFTools />} />
            <Route path="/word" element={<WordTools />} />
            <Route path="/image" element={<ImageTools />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
