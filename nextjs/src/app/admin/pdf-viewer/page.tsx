"use client";

import * as React from "react";
import { Box, CssBaseline, Typography } from "@mui/material";
import PDFViewer from "@embedpdf/react-pdf-viewer";
import { useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import AdminGuard from "../components/adminGuard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function PdfViewerContent() {
  const searchParams = useSearchParams();
  const { request } = useAppContext();
  const filePath = searchParams.get("file") ?? "";
  const [pdfSrc, setPdfSrc] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // Keep latest `request` without re-triggering the effect
  const requestRef = React.useRef(request);
  React.useEffect(() => {
    requestRef.current = request;
  }, [request]);

  // Show file name in the browser tab instead of on the page
  React.useEffect(() => {
    document.title = filePath.split("/").pop() || "PDF viewer";
  }, [filePath]);

  React.useEffect(() => {
    if (!filePath) {
      setError("No PDF file was selected.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let objectUrl = "";
    setLoading(true);
    setError("");
    setPdfSrc("");

    const loadPdf = async () => {
      try {
        const response = await requestRef.current(
          `${API_BASE}/api/files/${encodeURIComponent(filePath)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Failed to load PDF (${response.status})`);
        }

        const pdfBlob = await response.blob();
        if (controller.signal.aborted) return;

        objectUrl = URL.createObjectURL(pdfBlob);
        setPdfSrc(objectUrl);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load PDF.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filePath]);

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Typography sx={{ p: 2 }}>Loading PDF...</Typography>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : (
          <PDFViewer
            key={pdfSrc} // remount when a new blob URL is created
            config={{ src: pdfSrc }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </Box>
    </>
  );
}

export default function PdfViewerPage() {
  return (
    <AdminGuard>
      <PdfViewerContent />
    </AdminGuard>
  );
}