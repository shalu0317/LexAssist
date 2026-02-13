import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";

export default function EventModal({ open, onOpenChange, event }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event?.title || "Event details"}</DialogTitle>
          <DialogDescription>
            {event?.source === "google" &&
              "This event is from Google Calendar."}
            {event?.source === "outlook" &&
              "This event is from Outlook Calendar."}
            {event?.source === "local" && "This is a local event."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">When</Label>
            <div className="text-sm text-muted-foreground mt-1">
              {event?.start
                ? `${event.start.toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}${
                    event.end
                      ? " — " +
                        event.end.toLocaleString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""
                  }`
                : "No date/time"}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Description</Label>
            <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {event?.description || "No description"}
            </div>
          </div>

          {event?.attendees &&
            Array.isArray(event.attendees) &&
            event.attendees.length > 0 && (
              <div>
                <Label className="text-sm font-semibold">Attendees</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.attendees.map((email, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 text-sm rounded-md bg-secondary text-secondary-foreground"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {event?.link && (
            <div>
              <Label className="text-sm font-semibold">Calendar Link</Label>
              <div className="mt-1">
                <a
                  href={event.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline inline-flex items-center gap-1 text-sm"
                >
                  Open in {event.source === "google" ? "Google" : "Outlook"}{" "}
                  Calendar
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
