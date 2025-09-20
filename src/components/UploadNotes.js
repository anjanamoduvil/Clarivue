import React, { useState } from "react";
import api from "../api";

export default function UploadNotes({ setNotes, setIsLoading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/simplify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNotes(response.data.simplifiedText);
      setFileName("");
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      const message = err.response?.data?.error || "Failed to process file. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.type === "text/plain") {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError(null);
      } else {
        setError("Please select a PDF or TXT file");
        setFile(null);
        setFileName("");
      }
    }
  };

  return (
    <div className="upload-section">
      <div className="file-input-wrapper">
        <label className="file-input-label">
          {fileName || "Choose File"}
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <button
        className="button button-primary"
        onClick={handleUpload}
        disabled={!file}
      >
        Process Notes
      </button>

      {error && (
        <div style={{ 
          color: "var(--danger-color)", 
          marginTop: "1rem",
          padding: "0.5rem",
          borderRadius: "4px",
          backgroundColor: "rgba(244, 67, 54, 0.1)"
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
