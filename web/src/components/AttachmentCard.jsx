import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AttachmentCard({ filename, filesize, type = "pdf", className }) {
  const getIcon = () => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-400" />;
      case "doc":
        return <FileText className="w-4 h-4 text-blue-400" />;
      case "image":
        return <FileText className="w-4 h-4 text-green-400" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-2xl bg-secondary/80 border border-border hover:border-border transition-all group relative shadow-sm0 opacity-90",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate pr-2 line-clamp-2">{filename}</p>
        <p className="text-xs text-muted-foregro und">{filesize}</p>
      </div>
      {/* <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-smooth"
      >
        <Download className="w-4 h-4" />
      </Button> */}
    </div>
  );
}
