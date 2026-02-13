import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

const CalendarView = React.forwardRef(function CalendarView(
  { events = [], onDateClick, onEventClick },
  ref
) {
  return (
    <FullCalendar
      ref={ref}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
      }}
      events={events}
      dateClick={onDateClick}
      eventClick={onEventClick}
      editable={false}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      height="auto"
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        meridiem: "short",
      }}
    />
  );
});

export default CalendarView;
