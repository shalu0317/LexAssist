import { useState, useEffect } from "react";
import {
  toDateInputValue,
  toTimeInputValue,
  combineDateTime,
} from "@/lib/calendar/dateUtils.js";
import { validateDateRange } from "@/lib/calendar/validation.js";

/**
 * Custom hook to manage event date/time state with validation and synchronization
 * Handles all-day events, time selection, date range validation, and provisional calendar selections
 */
export function useEventDateTime(newEvent, setNewEvent) {
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeError, setTimeError] = useState("");
  const [openRangeCalendar, setOpenRangeCalendar] = useState(false);
  const [tempRange, setTempRange] = useState({
    from: undefined,
    to: undefined,
  });

  // Reset tempRange when popover opens to allow fresh selection
  useEffect(() => {
    if (openRangeCalendar) {
      setTempRange({ from: undefined, to: undefined });
    }
  }, [openRangeCalendar]);

  // While the calendar popover is open, reflect the temporary selection
  // in the dialog inputs so users see their provisional start/end dates immediately
  useEffect(() => {
    if (!openRangeCalendar) return;

    const f = tempRange.from;
    const t = tempRange.to || tempRange.from;
    if (f) {
      setStartDate(toDateInputValue(f));
    }
    if (t) {
      setEndDate(toDateInputValue(t));
    }
  }, [tempRange, openRangeCalendar]);

  // Keep local inputs in sync with passed newEvent
  useEffect(() => {
    const sd = toDateInputValue(newEvent.start);
    const ed = toDateInputValue(newEvent.end || newEvent.start);
    setStartDate(sd);
    setEndDate(ed);

    setStartTime(toTimeInputValue(newEvent.start));
    setEndTime(toTimeInputValue(newEvent.end || newEvent.start));

    // if start includes time and end is empty, set end same as start
    if (
      typeof newEvent.start === "string" &&
      newEvent.start.includes("T") &&
      !newEvent.end
    ) {
      setEndDate(sd);
      setEndTime(toTimeInputValue(newEvent.start));
    }
  }, [newEvent]);

  // When the local date/time inputs change, update the parent newEvent state
  useEffect(() => {
    if (allDay) {
      // all day: store date-only strings
      setNewEvent((prev) => ({
        ...prev,
        start: startDate || prev.start,
        end: endDate || prev.end,
      }));
      return;
    }

    // combine date + time into datetime-local strings for submission
    const s = combineDateTime(startDate, startTime) || newEvent.start;
    const e = combineDateTime(endDate, endTime) || newEvent.end;
    setNewEvent((prev) => ({ ...prev, start: s, end: e }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, startTime, endTime, allDay]);

  // When allDay toggles on, clear time parts so inputs reflect date-only
  useEffect(() => {
    if (allDay) {
      setStartTime("");
      setEndTime("");
      setNewEvent((prev) => ({
        ...prev,
        start: startDate || prev.start,
        end: endDate || prev.end,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDay]);

  // Validate date/time: ensure end >= start
  useEffect(() => {
    setTimeError("");

    if (!startDate) return;

    const validation = validateDateRange(
      allDay ? startDate : combineDateTime(startDate, startTime),
      allDay ? endDate : combineDateTime(endDate || startDate, endTime || startTime),
      allDay
    );

    if (!validation.isValid) {
      setTimeError(validation.error);
    }
  }, [startDate, endDate, startTime, endTime, allDay]);

  return {
    allDay,
    setAllDay,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    timeError,
    setTimeError,
    openRangeCalendar,
    setOpenRangeCalendar,
    tempRange,
    setTempRange,
  };
}
