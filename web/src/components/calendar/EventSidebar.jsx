import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EventSidebar({
  open,
  onOpenChange,
  selectedDate,
  events = [],
  onEventClick,
  onAddEventClick,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {selectedDate && (
              <>
                <CalendarIcon className="inline h-5 w-5 mr-2" />
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </>
            )}
          </SheetTitle>
          <SheetDescription>
            {events.length === 0
              ? "No events scheduled for this day"
              : `${events.length} event${
                  events.length > 1 ? "s" : ""
                } scheduled`}
          </SheetDescription>
        </SheetHeader>

        {/* Add Event Button */}
        <div className="mt-4">
          <Button
            onClick={onAddEventClick}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event for This Day
          </Button>
        </div>

        <div className="mt-6 space-y-3">
          {events.map((event) => {
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : null;
            const source = event.extendedProps?.source || "local";

            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: event.backgroundColor,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1">
                      {event.title}
                    </h4>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {eventStart.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {eventEnd && (
                        <>
                          {" — "}
                          {eventEnd.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </div>
                    {event.extendedProps?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.extendedProps.description}
                      </p>
                    )}
                    {event.extendedProps?.attendees &&
                      Array.isArray(event.extendedProps.attendees) &&
                      event.extendedProps.attendees.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Attendees:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {event.extendedProps.attendees.map((email, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                              >
                                {email}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="ml-3">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${event.backgroundColor}20`,
                        color: event.backgroundColor,
                      }}
                    >
                      {source === "google"
                        ? "Google"
                        : source === "outlook"
                        ? "Outlook"
                        : "Local"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
