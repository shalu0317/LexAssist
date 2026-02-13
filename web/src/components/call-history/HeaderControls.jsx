import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, SlidersHorizontal, Search } from "lucide-react";

const HeaderControls = React.memo(({ searchQuery, setSearchQuery, onExport }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone number"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search calls"
        />
      </div>
      <Button variant="outline" onClick={onExport} aria-label="Export calls">
        <Upload className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" aria-label="Open filters">
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>
  );
});

HeaderControls.displayName = "HeaderControls";
export default HeaderControls;
