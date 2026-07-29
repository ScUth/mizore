"use client";
import { useState } from "react";
import PDFViewer from "@embedpdf/react-pdf-viewer";

export default function ViewerPage() {
  const [pdfSrc, setPdfSrc] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      // Create a URL for the selected file
      const fileUrl = URL.createObjectURL(file);
      console.log("", fileUrl);
      setPdfSrc(fileUrl);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
        />
      </div>
      {pdfSrc ? (
        <>
          <p>{pdfSrc}</p>
          <PDFViewer
            config={{
              src: pdfSrc,
            }}
          />
        </>
      ) : (
        <p>Please upload a PDF file to view</p>
      )}
    </div>
  );
}
