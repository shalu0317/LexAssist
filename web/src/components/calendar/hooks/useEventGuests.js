import { useState } from "react";
import { isValidEmail, parseEmailInput } from "@/lib/calendar/validation.js";

/**
 * Custom hook to manage event guest list with validation and paste support
 * Handles email validation and supports bulk paste from various formats
 */
export function useEventGuests(newEvent, setNewEvent) {
  const [guestInput, setGuestInput] = useState("");
  const [guestError, setGuestError] = useState("");

  /**
   * Handle paste event - parses multiple emails from clipboard
   */
  const handleGuestPaste = (e) => {
    const clipboard = e.clipboardData.getData("text") || "";
    if (!clipboard) return;
    e.preventDefault();

    const emails = parseEmailInput(clipboard);
    if (emails.length === 0) return;

    const current = newEvent?.attendees?.slice()
    const invalid = [];

    emails.forEach((email) => {
      if (isValidEmail(email)) {
        if (!current.includes(email)) {
          current.push(email);
        }
      } else {
        invalid.push(email);
      }
    });

    if (current.length > (newEvent.attendees?.length || 0)) {
      setNewEvent({ ...newEvent, attendees: current });
      setGuestInput("");
    }

    if (invalid.length > 0) {
      setGuestError(`Invalid email(s): ${invalid.join(", ")}`);
      setTimeout(() => setGuestError(""), 4000);
    }
  };

  /**
   * Try to add a single guest email
   */
  const tryAddGuest = (email) => {
    const trimmedEmail = (email || guestInput || "").trim();
    if (!trimmedEmail) return false;

    if (!isValidEmail(trimmedEmail)) {
      setGuestError("Please enter a valid email address");
      setTimeout(() => setGuestError(""), 3000);
      return false;
    }

    const current = Array.isArray(newEvent.attendees)
      ? newEvent.attendees
      : [];

    if (current.includes(trimmedEmail)) {
      setGuestError("Email already added");
      setTimeout(() => setGuestError(""), 3000);
      return false;
    }

    setNewEvent({ ...newEvent, attendees: [...current, trimmedEmail] });
    setGuestInput("");
    setGuestError("");
    return true;
  };

  /**
   * Remove a guest email from the list
   */
  const removeGuest = (email) => {
    const filtered = (newEvent.attendees || []).filter((a) => a !== email);
    setNewEvent({ ...newEvent, attendees: filtered });
  };

  return {
    guestInput,
    setGuestInput,
    guestError,
    setGuestError,
    handleGuestPaste,
    tryAddGuest,
    removeGuest,
  };
}
