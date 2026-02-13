import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useEventGuests } from "./hooks/useEventGuests.js";
import { useEventDateTime } from "./hooks/useEventDateTime.js";
import GuestInput from "./GuestInput.jsx";
import DateTimeSection from "./DateTimeSection.jsx";

export default function AddEventDialog({
  isOpen,
  setIsOpen,
  newEvent,
  setNewEvent,
  onSubmit,
  isGoogleSignedIn,
  isOutlookSignedIn,
}) {
  // Custom hooks for managing complex state
  const guestManager = useEventGuests(newEvent, setNewEvent);
  const dateTimeManager = useEventDateTime(newEvent, setNewEvent);

  const handleSubmit = (ev) => {
    if (dateTimeManager.timeError) {
      ev.preventDefault();
      return;
    }
    if (guestManager.guestError) {
      ev.preventDefault();
      return;
    }
    // forward to parent-provided onSubmit
    if (typeof onSubmit === "function") onSubmit(ev);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg bg-popover">
        <DialogHeader>
          <div className="space-y-1 pb-3 border-b border-muted/30">
            <DialogTitle className="text-lg font-semibold">
              Add event
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isGoogleSignedIn
                ? "This will be added to your Google Calendar"
                : isOutlookSignedIn
                ? "This will be added to your Outlook Calendar"
                : "This will be stored locally (connect a calendar to sync)"}
            </DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              placeholder="Add a title"
              required
              className="text-sm mt-2 font-semibold h-10"
            />
          </div>

          <GuestInput
            guestInput={guestManager.guestInput}
            setGuestInput={guestManager.setGuestInput}
            guestError={guestManager.guestError}
            attendees={newEvent.attendees}
            onGuestPaste={guestManager.handleGuestPaste}
            onAddGuest={guestManager.tryAddGuest}
            onRemoveGuest={guestManager.removeGuest}
          />

          <DateTimeSection
            startDate={dateTimeManager.startDate}
            endDate={dateTimeManager.endDate}
            startTime={dateTimeManager.startTime}
            endTime={dateTimeManager.endTime}
            allDay={dateTimeManager.allDay}
            setAllDay={dateTimeManager.setAllDay}
            timeError={dateTimeManager.timeError}
            openRangeCalendar={dateTimeManager.openRangeCalendar}
            setOpenRangeCalendar={dateTimeManager.setOpenRangeCalendar}
            tempRange={dateTimeManager.tempRange}
            setTempRange={dateTimeManager.setTempRange}
            setStartDate={dateTimeManager.setStartDate}
            setEndDate={dateTimeManager.setEndDate}
            setStartTime={dateTimeManager.setStartTime}
            setEndTime={dateTimeManager.setEndTime}
            setTimeError={dateTimeManager.setTimeError}
          />

          <div>
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              placeholder="Enter event description"
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Only show color selection if not syncing with calendar */}
          {!isGoogleSignedIn && !isOutlookSignedIn && (
            <div>
              <Label htmlFor="color">Color</Label>
              <Select
                value={newEvent.color}
                onValueChange={(value) =>
                  setNewEvent({ ...newEvent, color: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#3b82f6">Blue</SelectItem>
                  <SelectItem value="#22c55e">Green</SelectItem>
                  <SelectItem value="#f59e0b">Orange</SelectItem>
                  <SelectItem value="#ef4444">Red</SelectItem>
                  <SelectItem value="#8b5cf6">Purple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="h-9 px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 px-4"
              disabled={
                !!(dateTimeManager.timeError || guestManager.guestError)
              }
              title={
                dateTimeManager.timeError ||
                guestManager.guestError ||
                "Add event"
              }
            >
              Add event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
