import React from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

// RangeDatePicker renders the Calendar and the Clear/Done controls.
// It is intentionally dumb and uses props to commit/clear selections.
export default function RangeDatePicker({
  tempRange,
  setTempRange,
  setStartDate,
  setEndDate,
  setTimeError,
  setOpenRangeCalendar,
}) {
  return (
    <PopoverContent className="w-[20rem] p-3">
      <Calendar
        className="w-[18rem]"
        mode="range"
        selected={
          tempRange.from || tempRange.to
            ? { from: tempRange.from, to: tempRange.to }
            : undefined
        }
        onSelect={(range) => {
          if (!range) return setTempRange({ from: undefined, to: undefined });

          const from = range?.from
            ? range.from
            : range instanceof Date
            ? range
            : undefined;
          const to = range?.to ? range.to : undefined;
          // update only temporary selection while picker is open
          setTempRange({ from, to });
        }}
        classNames={{
          cell: "h-9 w-9 text-center p-0 relative",
          day: "h-9 w-9 p-0 font-normal",
          day_selected: "bg-blue-600 text-white",
          day_range_middle: "bg-blue-600 text-white",
          day_range_start: "bg-blue-600 text-white rounded-l-md",
          day_range_end: "bg-blue-600 text-white rounded-r-md",
          day_today: "bg-yellow-200 text-yellow-800",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
        }}
      />

      <div className="flex justify-between items-center gap-2 mt-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTempRange({ from: undefined, to: undefined });
              setStartDate("");
              setEndDate("");
              setTimeError("");
            }}
          >
            Clear
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Pick start and end — click Done to apply
        </div>

        <div>
          <Button
            size="sm"
            onClick={() => {
              const f = tempRange.from;
              const t = tempRange.to;
              if (!f && !t) return; // nothing selected

              let start = f;
              let end = t || f; // if user picked only one date, use it for both

              if (start && end && end < start) {
                const tmp = start;
                start = end;
                end = tmp;
              }

              if (start) {
                const y1 = start.getFullYear();
                const m1 = String(start.getMonth() + 1).padStart(2, "0");
                const d1 = String(start.getDate()).padStart(2, "0");
                setStartDate(`${y1}-${m1}-${d1}`);
              }
              if (end) {
                const y2 = end.getFullYear();
                const m2 = String(end.getMonth() + 1).padStart(2, "0");
                const d2 = String(end.getDate()).padStart(2, "0");
                setEndDate(`${y2}-${m2}-${d2}`);
              }

              setTempRange({ from: start, to: end });
              setTimeError("");
              setOpenRangeCalendar(false);
            }}
          >
            Done
          </Button>
        </div>
      </div>
    </PopoverContent>
  );
}
