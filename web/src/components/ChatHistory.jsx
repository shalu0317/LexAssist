import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import PdfModalViewer from "./PdfModalViewer";

export function ChatHistory({ sources, isOpen, onToggle }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* History Panel */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full bg-sidebar-background border-l border-sidebar-border z-50 flex flex-col transition-smooth relative overflow-hidden",
          isOpen ? "w-80" : "w-0 lg:w-0",
        )}
      >
        {/* Subtle highlight gradient at top */}
        <div
          className="absolute top-0 left-0 right-0 h-48 pointer-events-none opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at top, hsl(240 65% 60% / 0.15) 0%, transparent 60%)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Source Pdfs Attached</span>
            <span className="text-s text-muted-foreground">
              ({sources.length}) files
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* History Items */}
        <ScrollArea className="flex-1 p-3 relative z-10">
          <div className="space-y-2">
            {sources.map((item, index) => {
              const isObject = typeof item === "object";
              const filename = isObject
                ? item.path || item.filename || item
                : item;
              const pages = isObject ? item.pages : index === 0 ? 24 : 112;
              const lastModified = isObject
                ? item.lastModified || item.date
                : index === 0
                  ? "JAN 22, 2024"
                  : "JAN 15, 2024";
              const description = isObject
                ? item.description
                : "Income Tax Appellate Tribunal Order";

              return (
                <div key={index} className="space-y-3">
                  <PdfModalViewer
                    filename={filename}
                    pages={pages}
                    lastModified={lastModified}
                    description={description}
                    isSidebar={true}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Clear History */}
        {/* <div className="p-4 border-t border-sidebar-border relative z-10">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear history
          </Button>
        </div> */}
      </aside>
    </>
  );
}
