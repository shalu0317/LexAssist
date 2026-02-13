import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

/**
 * Guest input component for adding and managing event attendees
 *
 * Features:
 * - Single email input with validation
 * - Paste support for bulk email adding (semicolon, comma, newline separated)
 * - Guest chip display with remove functionality
 * - Real-time error feedback
 *
 * @param {Object} props
 * @param {string} props.guestInput - Current input value
 * @param {Function} props.setGuestInput - Input value setter
 * @param {string} props.guestError - Current error message
 * @param {string[]} props.attendees - Array of attendee emails
 * @param {Function} props.onGuestPaste - Paste event handler
 * @param {Function} props.onAddGuest - Add guest handler
 * @param {Function} props.onRemoveGuest - Remove guest handler
 */
export default function GuestInput({
  guestInput,
  setGuestInput,
  guestError,
  attendees,
  onGuestPaste,
  onAddGuest,
  onRemoveGuest,
}) {
  return (
    <div>
      <Label htmlFor="guests" className="text-sm font-medium">
        Guests
      </Label>
      <Input
        id="guests"
        value={guestInput}
        onChange={(e) => setGuestInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const email = guestInput.trim();
            if (!email) return;
            const added = onAddGuest(email);
            if (added) setGuestInput("");
          }
        }}
        onPaste={onGuestPaste}
        placeholder="Type email and press Enter or paste multiple emails"
        className={`h-10 mt-2 text-sm ${guestError ? "border-red-500" : ""}`}
      />

      {/* Guest chips */}
      {Array.isArray(attendees) && attendees.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {attendees.map((email) => (
            <div
              key={email}
              className="inline-flex items-center gap-2 bg-muted/80 px-3 py-1 rounded-full text-sm shadow-sm"
            >
              <span className="text-sm text-foreground">{email}</span>
              <button
                type="button"
                onClick={() => onRemoveGuest(email)}
                aria-label={`Remove ${email}`}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {guestError && <p className="text-sm text-red-600 mt-2">{guestError}</p>}
    </div>
  );
}
