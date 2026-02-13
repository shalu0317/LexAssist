import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Simple TimeSelect component (hours + 5-minute increments)
export default function TimeSelect({ value, onChange, disabled, ariaLabel }) {
  const [hh, mm] = (value || "").split(":");
  const selectedHour = hh || "00";
  const selectedMinute = mm || "00";

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0")
  );

  const setPart = (part, v) => {
    const newHour = part === "hour" ? v : selectedHour || "00";
    const newMin = part === "minute" ? v : selectedMinute || "00";
    onChange && onChange(`${newHour}:${newMin}`);
  };

  return (
    <div className="flex gap-2">
      <Select
        value={selectedHour}
        onValueChange={(val) => setPart("hour", val)}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-20 text-sm">
          <SelectValue aria-label={ariaLabel ? `${ariaLabel} hour` : "Hour"} />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMinute}
        onValueChange={(val) => setPart("minute", val)}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-20 text-sm">
          <SelectValue
            aria-label={ariaLabel ? `${ariaLabel} minute` : "Minute"}
          />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
