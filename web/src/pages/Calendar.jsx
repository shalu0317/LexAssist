import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar as CalendarIcon, RefreshCw, LogIn } from "lucide-react";
import CalendarView from "@/components/calendar/CalendarView";
import EventSidebar from "@/components/calendar/EventSidebar";
import EventModal from "@/components/calendar/EventModal";
import AddEventDialog from "@/components/calendar/AddEventDialog";
import outlookCalendar from "@/lib/outlookCalendar";

// Google Calendar API configuration
// Using the same Client ID as configured in App.jsx for consistency
const GOOGLE_CLIENT_ID =
  "743695190259-e9ednmmrqqus0419886khkemfqpbqhc5.apps.googleusercontent.com";
// Note: API key is optional when using OAuth 2.0. If needed, get it from Google Cloud Console
const SCOPES =
  "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events";

// Outlook (Microsoft Graph) config (replace CLIENT_ID when available)
const OUTLOOK_CLIENT_ID = "YOUR_OUTLOOK_CLIENT_ID"; // TODO: replace with real client id
const OUTLOOK_REDIRECT_URI = `${window.location.origin}/outlook-callback`;
const OUTLOOK_AUTH_ENDPOINT =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const OUTLOOK_SCOPES = "openid profile email User.Read Calendars.ReadWrite";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState([]);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [outlookAccessToken, setOutlookAccessToken] = useState(null);
  const [isOutlookSignedIn, setIsOutlookSignedIn] = useState(false);
  const [outlookCalendarEvents, setOutlookEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    attendees: [], // array of email addresses
    color: "#3b82f6",
  });
  const calendarRef = useRef(null);
  const tokenClientRef = useRef(null);

  // Initialize Google Identity Services
  useEffect(() => {
    const initializeGoogleClient = () => {
      if (window.google) {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: handleGoogleAuthCallback,
        });
      }
    };

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleClient;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // On mount, check if Outlook access token exists in localStorage (set by Auth flow)
  useEffect(() => {
    try {
      const storedProvider = localStorage.getItem("provider");
      const storedTokenRaw = localStorage.getItem("access_token");
      const storedToken = storedTokenRaw ? JSON.parse(storedTokenRaw) : null;
      if (storedProvider === "outlook" && storedToken) {
        setOutlookAccessToken(storedToken);
        setIsOutlookSignedIn(true);
        loadOutlookCalendarEvents(storedToken);
        toast.success("Connected to Outlook Calendar");
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Build Outlook auth url and redirect (starts the OAuth flow handled in Auth.jsx)
  const handleOutlookConnect = () => {
    const url = outlookCalendar.buildAuthUrl({
      clientId: OUTLOOK_CLIENT_ID,
      redirectUri: OUTLOOK_REDIRECT_URI,
      scopes: OUTLOOK_SCOPES,
    });
    window.location.href = url;
  };

  // Load events from Outlook / Microsoft Graph
  const loadOutlookCalendarEvents = async (accessToken) => {
    try {
      const list = await outlookCalendar.listEvents(accessToken);
      setOutlookEvents(list);
      toast.success(`Loaded ${list.length} events from Outlook Calendar`);
    } catch (error) {
      console.error("Error loading Outlook Calendar events:", error);
      toast.error("Failed to load Outlook Calendar events");
    }
  };

  // Refresh Outlook events
  const handleRefreshOutlookEvents = () => {
    if (outlookAccessToken) {
      loadOutlookCalendarEvents(outlookAccessToken);
    } else {
      toast.error("Please connect Outlook Calendar first");
    }
  };

  // Handle Google authentication callback
  const handleGoogleAuthCallback = (response) => {
    if (response.error) {
      console.error("Google auth error:", response.error);
      toast.error("Failed to authenticate with Google");
      return;
    }

    setGoogleAccessToken(response.access_token);
    setIsGoogleSignedIn(true);
    toast.success("Connected to Google Calendar");
    loadGoogleCalendarEvents(response.access_token);
  };

  // Sign in to Google
  const handleGoogleSignIn = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    } else {
      toast.error("Google authentication not initialized");
    }
  };

  // Load events from Google Calendar
  const loadGoogleCalendarEvents = async (accessToken) => {
    try {
      const now = new Date();
      const timeMin = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).toISOString();
      const timeMax = new Date(
        now.getFullYear(),
        now.getMonth() + 2,
        0
      ).toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          `timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Google Calendar events");
      }

      const data = await response.json();
      const formattedEvents = data.items.map((event) => ({
        id: event.id,
        title: event.summary || "Untitled Event",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        description: event.description || "",
        backgroundColor: "#ea4335",
        borderColor: "#ea4335",
        extendedProps: {
          source: "google",
          htmlLink: event.htmlLink,
        },
      }));

      setGoogleCalendarEvents(formattedEvents);
      toast.success(
        `Loaded ${formattedEvents.length} events from Google Calendar`
      );
    } catch (error) {
      console.error("Error loading Google Calendar events:", error);
      toast.error("Failed to load Google Calendar events");
    }
  };

  // Refresh Google Calendar events
  const handleRefreshGoogleEvents = () => {
    if (googleAccessToken) {
      loadGoogleCalendarEvents(googleAccessToken);
    } else {
      toast.error("Please sign in to Google Calendar first");
    }
  };

  // Handle date click - check if date has events
  const handleDateClick = (arg) => {
    const clickedDate = new Date(arg.dateStr);

    // Get all events for that day
    const dayStart = new Date(clickedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(clickedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const eventsForDay = allEvents
      .filter((e) => {
        const eventStart = new Date(e.start);
        return eventStart >= dayStart && eventStart <= dayEnd;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    // If date has events, open sidebar to show them
    if (eventsForDay.length > 0) {
      setSelectedDate(clickedDate);
      setSelectedDayEvents(eventsForDay);
      setIsSidebarOpen(true);
    } else {
      // If no events, open "Add Event" dialog
      setNewEvent({
        ...newEvent,
        start: arg.dateStr,
        end: arg.dateStr,
      });
      setIsDialogOpen(true);
    }
  };

  // Handle event click - show sidebar with all events for that day
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const eventDate = new Date(event.start);

    // Get all events for that day
    const dayStart = new Date(eventDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(eventDate);
    dayEnd.setHours(23, 59, 59, 999);

    const eventsForDay = allEvents
      .filter((e) => {
        const eventStart = new Date(e.start);
        return eventStart >= dayStart && eventStart <= dayEnd;
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    // Open sidebar showing all events for that day
    setSelectedDate(eventDate);
    setSelectedDayEvents(eventsForDay);
    setIsSidebarOpen(true);
  };

  // Handle clicking an event in the sidebar to show full details
  const handleEventDetailClick = (event) => {
    const modalEvent = {
      id: event.id,
      title: event.title,
      start: event.start ? new Date(event.start) : null,
      end: event.end ? new Date(event.end) : null,
      description: event.extendedProps?.description || "",
      attendees: event.extendedProps?.attendees || [],
      source: event.extendedProps?.source || "local",
      link:
        event.extendedProps?.htmlLink || event.extendedProps?.webLink || null,
      backgroundColor: event.backgroundColor,
      raw: event,
    };

    setSelectedEvent(modalEvent);
    setIsSidebarOpen(false); // Close sidebar when opening event detail modal
    setIsEventDialogOpen(true);
  };

  // Handle adding event from sidebar
  const handleAddEventFromSidebar = () => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      setNewEvent({
        ...newEvent,
        start: dateStr,
        end: dateStr,
      });
      setIsSidebarOpen(false); // Close sidebar
      setIsDialogOpen(true); // Open add event dialog
    }
  };

  // Add new event to Google Calendar
  const addEventToGoogleCalendar = async (eventData) => {
    if (!googleAccessToken) {
      toast.error("Please sign in to Google Calendar first");
      return false;
    }

    try {
      // Parse attendees which may be an array or a comma-separated string
      let attendees = [];
      if (Array.isArray(eventData.attendees)) {
        attendees = eventData.attendees.map((email) => ({ email }));
      } else if (eventData.attendees) {
        attendees = eventData.attendees
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0)
          .map((email) => ({ email }));
      }

      const eventPayload = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: new Date(eventData.start).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(eventData.end).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      // Add attendees if provided (Google will auto-send invites)
      if (attendees.length > 0) {
        eventPayload.attendees = attendees;
        // Request Google to send email notifications
        eventPayload.sendUpdates = "all";
      }

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventPayload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add event to Google Calendar");
      }

      await loadGoogleCalendarEvents(googleAccessToken);
      return true;
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
      toast.error("Failed to add event to Google Calendar");
      return false;
    }
  };

  // Handle form submit
  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isGoogleSignedIn) {
      const success = await addEventToGoogleCalendar(newEvent);
      if (success) {
        toast.success("Event added to Google Calendar");
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      // Add to local events
      const localEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        backgroundColor: newEvent.color,
        borderColor: newEvent.color,
        extendedProps: {
          description: newEvent.description,
          attendees: newEvent.attendees,
          source: "local",
        },
      };

      setEvents([...events, localEvent]);
      toast.success("Event added locally");
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      start: "",
      end: "",
      attendees: [],
      color: "#3b82f6",
    });
  };

  // Combine local and Google Calendar events
  // Combine local, Google and Outlook events
  const allEvents = [
    ...events,
    ...googleCalendarEvents,
    ...outlookCalendarEvents,
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full p-4">
        <Card className="flex flex-col flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6" />
                  Tax Calendar
                </CardTitle>
                <CardDescription>
                  Manage your tax deadlines and important dates
                  {isGoogleSignedIn && (
                    <span className="ml-2 text-green-600">
                      • Connected to Google Calendar
                    </span>
                  )}
                  {isOutlookSignedIn && (
                    <span className="ml-2 text-blue-600">
                      • Connected to Outlook Calendar
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Google calendar connect / refresh */}
                {!isGoogleSignedIn ? (
                  <Button onClick={handleGoogleSignIn} variant="outline">
                    <LogIn className="h-4 w-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                ) : (
                  <Button onClick={handleRefreshGoogleEvents} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Google
                  </Button>
                )}

                {/* Outlook calendar connect / refresh */}
                {!isOutlookSignedIn ? (
                  <Button onClick={handleOutlookConnect} variant="outline">
                    <LogIn className="h-4 w-4 mr-2" />
                    Connect Outlook
                  </Button>
                ) : (
                  <Button
                    onClick={handleRefreshOutlookEvents}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Outlook
                  </Button>
                )}

                <AddEventDialog
                  isOpen={isDialogOpen}
                  setIsOpen={setIsDialogOpen}
                  newEvent={newEvent}
                  setNewEvent={setNewEvent}
                  onSubmit={handleAddEvent}
                  isGoogleSignedIn={isGoogleSignedIn}
                  isOutlookSignedIn={isOutlookSignedIn}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <div className="fullcalendar-wrapper flex-1 min-h-0 overflow-auto">
              <CalendarView
                ref={calendarRef}
                events={allEvents}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Sidebar and Modal - rendered at page level */}
        <EventSidebar
          open={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          selectedDate={selectedDate}
          events={selectedDayEvents}
          onEventClick={handleEventDetailClick}
          onAddEventClick={handleAddEventFromSidebar}
        />

        <EventModal
          open={isEventDialogOpen}
          onOpenChange={setIsEventDialogOpen}
          event={selectedEvent}
        />

        {/* Legend */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#ea4335]"></div>
                <span className="text-sm">Google Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#3b82f6]"></div>
                <span className="text-sm">Local Events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#0078D4]"></div>
                <span className="text-sm">Outlook Calendar</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
