import { useState, useRef, useCallback } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileChip } from "./FileChip";
import { cn } from "@/lib/utils";

export function ChatInput({
  onSend,
  disabled,
  conversationId,
  placeholder = "Ask about tax law...",
}) {
  const [message, setMessage] = useState("");
  const [filesWithProgress, setFilesWithProgress] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const isAnyFileUploading = filesWithProgress.some((f) => f.isUploading);

  // Simulated S3 upload
  const uploadFileToS3 = async (fileWithProgress, index) => {
    console.log("---fileWithProgress---", fileWithProgress["file"]);
    if (fileWithProgress) {
      const file = fileWithProgress["file"];
      const protocol = location.protocol === "https:" ? "https" : "http";
      const url = `${protocol}://${location.host}/secure/chat/get-presigned-url-for-upload?filetype=${file["type"]}&filename=${file["name"]}&conversation_id=${conversationId}`;
      console.log("--url is----", url);
      const response = await fetch(url, {
        credentials: "include", // send cookie
      });

      const data = await response.json();

      await uploadFileWithProgress(data.uploadURL, file, (percent) => {
        setFilesWithProgress((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, progress: percent, isUploading: percent < 100 }
              : f,
          ),
        );
      });

      // 3. Upload complete
      setFilesWithProgress((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, progress: 100, isUploading: false, uploaded: true }
            : f,
        ),
      );
    }
  };

  function uploadFileWithProgress(uploadURL, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("PUT", uploadURL);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && typeof onProgress === "function") {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent); // ← THIS must be defined
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error("Upload failed: " + xhr.status));
      };

      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(file);
    });
  }

  const handleFileSelect = useCallback(
    async (selectedFiles) => {
      if (selectedFiles) {
        const newFiles = Array.from(selectedFiles).map((file) => ({
          file,
          progress: 0,
          isUploading: true,
          uploaded: false,
        }));

        const startIndex = filesWithProgress.length;
        setFilesWithProgress((prev) => [...prev, ...newFiles]);

        newFiles.forEach((fileWithProgress, i) => {
          uploadFileToS3(fileWithProgress, startIndex + i);
        });
      }
    },
    [filesWithProgress.length],
  );

  const handleRemoveFile = useCallback((index) => {
    setFilesWithProgress((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClearAllFiles = useCallback(() => {
    setFilesWithProgress([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const uploadedFiles = filesWithProgress
      .filter((f) => f.uploaded)
      .map((f) => f.file);
    if (message.trim() || uploadedFiles.length > 0) {
      onSend(message, uploadedFiles);
      setMessage("");
      setFilesWithProgress([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [message, filesWithProgress, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card space-y-3 transition-all duration-200",
        isDragging && "dropzone-active ring-2 ring-primary",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* File Preview */}
      {filesWithProgress.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {filesWithProgress.length} file
              {filesWithProgress.length !== 1 ? "s" : ""} attached
              {isAnyFileUploading && " (uploading...)"}
            </span>

            {!isAnyFileUploading && (
              <button
                type="button"
                onClick={handleClearAllFiles}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {filesWithProgress.map((fileWithProgress, index) => (
              <FileChip
                key={`${fileWithProgress.file.name}-${index}`}
                file={fileWithProgress.file}
                onRemove={() => handleRemoveFile(index)}
                uploadProgress={fileWithProgress.progress}
                isUploading={fileWithProgress.isUploading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Paperclip className="w-5 h-5" />
          <span className="sr-only">Attach files</span>
        </Button>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-3"
        />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={
            disabled ||
            isAnyFileUploading ||
            (!message.trim() &&
              filesWithProgress.filter((f) => f.uploaded).length === 0)
          }
          size="icon"
          className="shrink-0 rounded-xl"
        >
          <Send className="w-4 h-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-accent/80 backdrop-blur-sm rounded-2xl flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <Paperclip className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse-soft" />
            <p className="text-sm font-medium text-foreground">
              Drop files here
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
