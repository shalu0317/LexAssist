import { useState } from "react";
import { toast } from "sonner";
import { EVENT_COLORS, SUCCESS_MESSAGES } from "@/lib/calendar";

/**
 * Custom hook to manage local calendar events
 * Handles creation, storage, and management of client-side events
 */
export function useLocalEvents() {
  const [events, setEvents] = useState([]);

  /**
   * Add a new local event
   */
  const addEvent = (eventData) => {
    const localEvent = {
      id: `local-${Date.now()}`,
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      backgroundColor: eventData.color || EVENT_COLORS.local,
      borderColor: eventData.color || EVENT_COLORS.local,
      extendedProps: {
        description: eventData.description || "",
        attendees: eventData.attendees || [],
        source: "local",
      },
    };

    setEvents((prev) => [...prev, localEvent]);
    toast.success(SUCCESS_MESSAGES.EVENT_ADDED_LOCAL);
    return true;
  };

  /**
   * Update an existing event
   */
  const updateEvent = (eventId, eventData) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
            ...event,
            title: eventData.title,
            start: eventData.start,
            end: eventData.end,
            backgroundColor: eventData.color || event.backgroundColor,
            borderColor: eventData.color || event.borderColor,
            extendedProps: {
              ...event.extendedProps,
              description: eventData.description || "",
              attendees: eventData.attendees || [],
            },
          }
          : event
      )
    );
    toast.success("Event updated successfully");
    return true;
  };

  /**
   * Delete an event
   */
  const deleteEvent = (eventId) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
    toast.success("Event deleted successfully");
    return true;
  };

  /**
   * Clear all local events
   */
  const clearAllEvents = () => {
    setEvents([]);
    toast.success("All local events cleared");
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    clearAllEvents,
  };
}
