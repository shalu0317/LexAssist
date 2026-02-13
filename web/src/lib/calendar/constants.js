/**
 * Calendar-related constants and configuration
 */

// Google Calendar API configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID:
    "743695190259-e9ednmmrqqus0419886khkemfqpbqhc5.apps.googleusercontent.com",
  SCOPES:
    "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
  API_BASE_URL: "https://www.googleapis.com/calendar/v3",
  DISCOVERY_DOCS: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

// Outlook (Microsoft Graph) configuration
export const OUTLOOK_CONFIG = {
  CLIENT_ID: "YOUR_OUTLOOK_CLIENT_ID", // TODO: Replace with actual client ID
  REDIRECT_URI: `${window.location.origin}/outlook-callback`,
  AUTH_ENDPOINT:
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
  SCOPES: "openid profile email User.Read Calendars.ReadWrite",
  API_BASE_URL: "https://graph.microsoft.com/v1.0",
};

// Calendar event colors
export const EVENT_COLORS = {
  google: "#ea4335",
  outlook: "#0078D4",
  local: "#3b82f6",
};

// Default event configuration
export const DEFAULT_EVENT = {
  title: "",
  description: "",
  start: "",
  end: "",
  attendees: [],
  color: EVENT_COLORS.local,
};

// Time range for fetching events (months before/after current date)
export const EVENT_FETCH_RANGE = {
  monthsBefore: 1,
  monthsAfter: 2,
};

// Validation patterns
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_SEPARATORS: /[;,\s\n]+/,
};

// FullCalendar view options
export const CALENDAR_VIEWS = {
  MONTH: "dayGridMonth",
  WEEK: "timeGridWeek",
  DAY: "timeGridDay",
  LIST: "listWeek",
};

// Date/time formats
export const DATE_FORMATS = {
  INPUT: "YYYY-MM-DD",
  TIME: "HH:mm",
  DISPLAY_SHORT: { month: "short", day: "numeric", year: "numeric" },
  DISPLAY_LONG: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  TIME_WITH_MERIDIEM: {
    hour: "2-digit",
    minute: "2-digit",
    meridiem: "short",
  },
};

// Error messages
export const ERROR_MESSAGES = {
  MISSING_FIELDS: "Please fill in all required fields",
  INVALID_EMAIL: "Please enter a valid email address",
  AUTH_FAILED: "Authentication failed. Please try again.",
  FETCH_FAILED: "Failed to load calendar events",
  ADD_EVENT_FAILED: "Failed to add event",
  GOOGLE_NOT_INITIALIZED: "Google authentication not initialized",
  GOOGLE_SIGN_IN_REQUIRED: "Please sign in to Google Calendar first",
  OUTLOOK_CONNECT_REQUIRED: "Please connect Outlook Calendar first",
  INVALID_DATE_RANGE: "End date/time must be after start date/time",
};

// Success messages
export const SUCCESS_MESSAGES = {
  GOOGLE_CONNECTED: "Connected to Google Calendar",
  OUTLOOK_CONNECTED: "Connected to Outlook Calendar",
  EVENTS_LOADED: (count, source) => `Loaded ${count} events from ${source}`,
  EVENT_ADDED_LOCAL: "Event added locally",
  EVENT_ADDED_GOOGLE: "Event added to Google Calendar",
  EVENT_ADDED_OUTLOOK: "Event added to Outlook Calendar",
};
