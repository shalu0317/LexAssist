import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import RangeDatePicker from "./RangeDatePicker.jsx";
import TimeSelect from "@/components/ui/time-select.jsx";
import { formatDateForDisplay } from "@/lib/dateUtils.js";

/**
 * Date and time picker section with range calendar and time selects
 */
export default function DateTimeSection({
  startDate,
  endDate,
  startTime,
  endTime,
  allDay,
  setAllDay,
  timeError,
  openRangeCalendar,
  setOpenRangeCalendar,
  tempRange,
  setTempRange,
  setStartDate,
  setEndDate,
  setStartTime,
  setEndTime,
  setTimeError,
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div>
        <Label className="text-sm font-medium">When</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Popover open={openRangeCalendar} onOpenChange={setOpenRangeCalendar}>
            <PopoverTrigger asChild>
              <div className="flex w-full gap-4">
                {/* Start Date */}
                <div className="relative flex-1 w-full">
                  <Input
                    readOnly
                    value={formatDateForDisplay(startDate)}
                    placeholder="Start date"
                    aria-label="Start date"
                    className="h-10 text-sm cursor-pointer pr-9 pl-10 min-w-[14rem] w-full hover:shadow-sm focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-muted-foreground">
                    Start
                  </div>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setOpenRangeCalendar(true)}
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* End Date */}
                <div className="relative flex-1 w-full">
                  <Input
                    readOnly
                    value={formatDateForDisplay(endDate)}
                    placeholder="End date"
                    aria-label="End date"
                    className="h-10 text-sm cursor-pointer pr-9 pl-10 min-w-[14rem] w-full hover:shadow-sm focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-muted-foreground">
                    End
                  </div>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setOpenRangeCalendar(true)}
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </PopoverTrigger>
            <RangeDatePicker
              tempRange={tempRange}
              setTempRange={setTempRange}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setTimeError={setTimeError}
              setOpenRangeCalendar={setOpenRangeCalendar}
            />
          </Popover>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">
              Start time
            </label>
            <TimeSelect
              value={startTime}
              onChange={(val) => setStartTime(val)}
              ariaLabel="Start time"
              disabled={allDay}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">
              End time
            </label>
            <TimeSelect
              value={endTime}
              onChange={(val) => setEndTime(val)}
              ariaLabel="End time"
              disabled={allDay}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            <span className="text-sm">All day</span>
          </label>
        </div>

        {timeError && <p className="text-sm text-red-600 mt-2">{timeError}</p>}
      </div>
    </div>
  );
}
