import React, { useState, useMemo, useCallback } from "react";
import HeaderControls from "@/components/call-history/HeaderControls";
import CallTable from "@/components/call-history/CallTable";
import mockCallsData from "@/components/call-history/mockCalls";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 12;

const CallSummary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCalls, setSelectedCalls] = useState(() => mockCallsData.filter((c) => c.selected).map((c) => c.id));

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return mockCallsData;
    return mockCallsData.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleToggleCall = useCallback((id, checked) => {
    const isChecked = Boolean(checked);
    setSelectedCalls((prev) => (isChecked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)));
  }, []);

  const handleToggleAll = useCallback((checked) => {
    const isChecked = Boolean(checked);
    if (isChecked) setSelectedCalls(filtered.map((c) => c.id));
    else setSelectedCalls([]);
  }, [filtered]);

  const exportToCSV = useCallback(() => {
    const headers = ["User Name", "Phone Number", "Call Type", "Duration", "Date and Time"];
    const rows = filtered.map((call) => [call.name, call.phone, call.type, call.duration, call.dateTime]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "call-history.csv";
    link.click();
  }, [filtered]);

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Call History</h1>
            <span className="text-sm text-muted-foreground">(7951 Users)</span>
          </div>

          <HeaderControls searchQuery={searchQuery} setSearchQuery={setSearchQuery} onExport={exportToCSV} />
        </div>

        <CallTable calls={pageItems} selectedCalls={selectedCalls} onToggleCall={handleToggleCall} onToggleAll={handleToggleAll} />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Showing {currentPage} of {pageCount} pages</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Simple page buttons: show first few and last */}
            {[1, 2, 3].map((p) => (
              <Button key={p} variant={currentPage === p ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount} aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallSummary;
