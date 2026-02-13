"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AttachmentCard } from "@/components/AttachmentCard";
import { Maximize2, Minimize2 } from "lucide-react";
import { X, FileText, Image, FileArchive, File, Loader2 } from "lucide-react";

export default function PdfModalViewer({
  filename,
  filesize,
  pdfUrl,
  preview,
  isSidebar = false,
  pages,
  lastModified,
  description,
}) {
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [open, setOpen] = useState(false);

  const iframeRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const loadPdf = async () => {
    try {
      // Fetch existing PDF
      console.log("---pdf url is ---", pdfUrl);
      const existingPdfBytes = await fetch(pdfUrl).then((res) =>
        res.arrayBuffer(),
      );

      // Load into pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // (Optional) Add watermark or text
      // const pages = pdfDoc.getPages();
      // pages[0].drawText("AI Generated", { x: 50, y: 50, size: 20 });

      // Save and create Blob URL
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setPdfDataUrl(url);
    } catch (err) {
      console.error("Error loading PDF:", err);
    }
  };

  const handleOpenChange = async (isOpen) => {
    // Split the string by '/'
    const parts = filename.split("/");

    // Convert the first part to lowercase
    parts[0] = parts[0].toLowerCase();

    // Join it back
    const result = parts.join("/");
    setOpen(isOpen);
    const protocol = location.protocol === "https:" ? "https" : "http";
    const url = `${protocol}://${location.host}/secure/chat/get-presigned-url?filename=bench/${result}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching presigned URL: ${response.statusText}`);
    }

    const data = await response.json();

    // const data = await response.json();
    console.log("--data iis ---", data);
    pdfUrl = data.url;

    if (isOpen) loadPdf();
    else setPdfDataUrl(null);
  };

  // 🔹 Toggle fullscreen for iframe
  const toggleFullScreen = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (!document.fullscreenElement) {
      iframe.requestFullscreen?.();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };
  const fileOnly = filename?.split("/").pop() || "Document.pdf";

  const cleanTitle = fileOnly.replace(".pdf", "").replace(/[-_]/g, " ");

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger className="w-full text-left">
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-subtle hover:bg-muted/40 transition-smooth">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-destructive" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">
                {description}
              </p>

              {(cleanTitle || pages) && (
                <p className="truncate text-xs text-muted-foreground">
                  {cleanTitle || "PDF document"}
                  {pages ? ` • ${pages} pages` : ""}
                </p>
              )}

              {lastModified && (
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Last updated: {lastModified}
                </p>
              )}
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="flex-row items-center justify-between p-2 border-b">
            <DialogTitle className="text-base font-medium">
              {cleanTitle}
            </DialogTitle>

            {/* <div className="flex gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={toggleFullScreen}
                                title={isFullScreen ? "Exit Full Screen" : "View Full Screen"}
                            >
                                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </Button>

                        </div> */}
          </DialogHeader>

          {pdfDataUrl ? (
            <iframe
              ref={iframeRef}
              src={pdfDataUrl}
              className="w-full h-[80vh] border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-[80vh]">
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
