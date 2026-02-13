/**
 * Date/time utility functions for calendar operations
 * Enhanced with better error handling and edge case support
 */

/**
 * Convert a date value to YYYY-MM-DD format for input fields
 */
export function toDateInputValue(val) {
  if (!val) return "";

  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    console.error("Error converting date to input value:", e);
    return "";
  }
}

/**
 * Convert a date value to HH:mm format for time input fields
 */
export function toTimeInputValue(val) {
  if (!val) return "";

  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  } catch (e) {
    console.error("Error converting time to input value:", e);
    return "";
  }
}

/**
 * Combine date (YYYY-MM-DD) and time (HH:mm) into datetime-local format
 */
export function combineDateTime(date, time) {
  if (!date) return "";
  if (!time) return `${date}T00:00`;
  return `${date}T${time}`;
}

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export function formatDateForDisplay(val, options = {}) {
  if (!val) return "";

  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";

    const defaultOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    return d.toLocaleDateString(undefined, { ...defaultOptions, ...options });
  } catch (e) {
    console.error("Error formatting date for display:", e);
    return String(val);
  }
}

/**
 * Format time for display (e.g., "02:30 PM")
 */
export function formatTimeForDisplay(val, options = {}) {
  if (!val) return "";

  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";

    const defaultOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    return d.toLocaleTimeString(undefined, { ...defaultOptions, ...options });
  } catch (e) {
    console.error("Error formatting time for display:", e);
    return String(val);
  }
}

/**
 * Format date and time for display (e.g., "Jan 15, 2024 at 02:30 PM")
 */
export function formatDateTimeForDisplay(val) {
  if (!val) return "";

  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting datetime for display:", e);
    return String(val);
  }
}

/**
 * Check if a date is today
 */
export function isToday(date) {
  if (!date) return false;

  try {
    const d = new Date(date);
    const today = new Date();

    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  } catch (e) {
    return false;
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date) {
  if (!date) return false;

  try {
    const d = new Date(date);
    const now = new Date();
    return d < now;
  } catch (e) {
    return false;
  }
}

/**
 * Get start of day (00:00:00)
 */
export function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59)
 */
export function getEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get events for a specific day
 */
export function getEventsForDay(events, date) {
  const dayStart = getStartOfDay(date);
  const dayEnd = getEndOfDay(date);

  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      return eventStart >= dayStart && eventStart <= dayEnd;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));
}

/**
 * Calculate duration between two dates in minutes
 */
export function calculateDuration(start, end) {
  if (!start || !end) return 0;

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

    return Math.floor((endDate - startDate) / (1000 * 60));
  } catch (e) {
    return 0;
  }
}

/**
 * Format duration in human-readable format (e.g., "1h 30m")
 */
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get current timezone
 */
export function getCurrentTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Add days to a date
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(date, hours) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}
