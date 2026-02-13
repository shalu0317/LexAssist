/**
 * Calendar validation utilities
 */

import { VALIDATION, ERROR_MESSAGES } from "./constants";

/**
 * Validate email address
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return VALIDATION.EMAIL_REGEX.test(email.trim());
}

/**
 * Validate event data
 */
export function validateEvent(event) {
  const errors = [];

  // Required fields
  if (!event.title?.trim()) {
    errors.push({ field: "title", message: "Title is required" });
  }

  if (!event.start) {
    errors.push({ field: "start", message: "Start date/time is required" });
  }

  if (!event.end) {
    errors.push({ field: "end", message: "End date/time is required" });
  }

  // Date validation
  if (event.start && event.end) {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);

    if (isNaN(startDate.getTime())) {
      errors.push({ field: "start", message: "Invalid start date/time" });
    }

    if (isNaN(endDate.getTime())) {
      errors.push({ field: "end", message: "Invalid end date/time" });
    }

    if (
      !isNaN(startDate.getTime()) &&
      !isNaN(endDate.getTime()) &&
      endDate < startDate
    ) {
      errors.push({
        field: "end",
        message: ERROR_MESSAGES.INVALID_DATE_RANGE,
      });
    }
  }

  // Email validation
  if (event.attendees && Array.isArray(event.attendees)) {
    const invalidEmails = event.attendees.filter(
      (email) => !isValidEmail(email)
    );
    if (invalidEmails.length > 0) {
      errors.push({
        field: "attendees",
        message: `Invalid email(s): ${invalidEmails.join(", ")}`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parse email input (handles comma, semicolon, newline separated emails)
 */
export function parseEmailInput(input) {
  if (!input || typeof input !== "string") return [];

  return input
    .split(VALIDATION.EMAIL_SEPARATORS)
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate, allDay = false) {
  if (!startDate) {
    return { isValid: false, error: "Start date is required" };
  }

  if (!endDate) {
    return { isValid: false, error: "End date is required" };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return { isValid: false, error: "Invalid start date" };
  }

  if (isNaN(end.getTime())) {
    return { isValid: false, error: "Invalid end date" };
  }

  if (end < start) {
    return {
      isValid: false,
      error: allDay
        ? "End date must be the same or after the start date"
        : "End time must be the same or after the start time",
    };
  }

  return { isValid: true, error: null };
}

/**
 * Sanitize event data before submission
 */
export function sanitizeEventData(event) {
  return {
    title: event.title?.trim() || "",
    description: event.description?.trim() || "",
    start: event.start,
    end: event.end,
    attendees: Array.isArray(event.attendees)
      ? event.attendees.filter(isValidEmail)
      : [],
    color: event.color || "#3b82f6",
  };
}
