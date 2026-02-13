import { X, FileText, Image, FileArchive, File, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const getFileIconAndColor = (file) => {
  const type = file.type;
  if(!type) return;
  if (type.startsWith("image/")) return { Icon: Image, color: "text-blue-500", bgColor: "bg-blue-500/10" };
  if (type.includes("pdf")) return { Icon: FileText, color: "text-red-500", bgColor: "bg-red-500/10" };
  if (type.includes("document") || type.includes("word") || type.includes("text")) return { Icon: FileText, color: "text-blue-400", bgColor: "bg-blue-400/10" };
  if (type.includes("zip") || type.includes("archive")) return { Icon: FileArchive, color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
  return { Icon: File, color: "text-muted-foreground", bgColor: "bg-muted/20" };
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${((bytes / 1024) / 1024).toFixed(1)} MB`;
};

export function FileChip({ file, onRemove, className, uploadProgress, isUploading, action }) {
  const { Icon, color, bgColor } = getFileIconAndColor(file);
  const isComplete = uploadProgress === 100;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-2xl bg-secondary/80 border border-border hover:border-border transition-all group relative shadow-sm",
        isUploading && !isComplete && "opacity-90",
        className
      )}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden", bgColor)}>
        {isUploading && !isComplete ? (
          <>
            <Icon className={cn("w-6 h-6 opacity-30", color)} />
            <div className="absolute inset-0 flex items-center justify-center bg-background/5">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
            </div>
          </>
        ) : (
          <Icon className={cn("w-6 h-6", color)} />
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="text-sm font-medium truncate text-foreground">
          {file.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {isUploading && !isComplete
            ? `Uploading ${uploadProgress ?? 0}%`
            : formatFileSize(file.size).toUpperCase()}
        </span>
      </div>

      {!isUploading && action !== "view" && (
        <button
          type="button"
          onClick={onRemove}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label={`Remove ${file.name}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
