/**
 * Google Calendar Service
 * Handles all Google Calendar API interactions
 */

import { GOOGLE_CONFIG, EVENT_FETCH_RANGE } from "./constants";

class GoogleCalendarService {
  constructor() {
    this.tokenClient = null;
    this.accessToken = null;
  }

  /**
   * Initialize Google Identity Services
   */
  initialize(onAuthCallback) {
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          scope: GOOGLE_CONFIG.SCOPES,
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            this.accessToken = response.access_token;
            onAuthCallback(response);
            resolve(response);
          },
        });
        resolve(this.tokenClient);
      } else {
        reject(new Error("Google Identity Services not loaded"));
      }
    });
  }

  /**
   * Request access token
   */
  signIn() {
    if (!this.tokenClient) {
      throw new Error("Token client not initialized");
    }
    this.tokenClient.requestAccessToken();
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return !!this.accessToken;
  }

  /**
   * Get access token
   */
  getAccessToken() {
    return this.accessToken;
  }

  /**
   * Set access token (for restoring session)
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Calculate time range for fetching events
   */
  getTimeRange() {
    const now = new Date();
    const timeMin = new Date(
      now.getFullYear(),
      now.getMonth() - EVENT_FETCH_RANGE.monthsBefore,
      1
    ).toISOString();
    const timeMax = new Date(
      now.getFullYear(),
      now.getMonth() + EVENT_FETCH_RANGE.monthsAfter,
      0
    ).toISOString();
    return { timeMin, timeMax };
  }

  /**
   * Fetch events from Google Calendar
   */
  async fetchEvents(accessToken = this.accessToken) {
    if (!accessToken) {
      throw new Error("No access token available");
    }

    const { timeMin, timeMax } = this.getTimeRange();
    const url = `${GOOGLE_CONFIG.API_BASE_URL}/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.formatEvents(data.items);
  }

  /**
   * Format Google Calendar events to internal format
   */
  formatEvents(items) {
    return items.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled Event",
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      backgroundColor: "#ea4335",
      borderColor: "#ea4335",
      extendedProps: {
        description: event.description || "",
        attendees: event.attendees?.map((a) => a.email) || [],
        source: "google",
        htmlLink: event.htmlLink,
      },
    }));
  }

  /**
   * Add event to Google Calendar
   */
  async addEvent(eventData, accessToken = this.accessToken) {
    if (!accessToken) {
      throw new Error("No access token available");
    }

    const eventPayload = this.buildEventPayload(eventData);
    const url = `${GOOGLE_CONFIG.API_BASE_URL}/calendars/primary/events`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Build Google Calendar event payload
   */
  buildEventPayload(eventData) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const payload = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: new Date(eventData.start).toISOString(),
        timeZone,
      },
      end: {
        dateTime: new Date(eventData.end).toISOString(),
        timeZone,
      },
    };

    // Add attendees if provided
    const attendees = this.parseAttendees(eventData.attendees);
    if (attendees.length > 0) {
      payload.attendees = attendees;
      payload.sendUpdates = "all"; // Send email notifications
    }

    return payload;
  }

  /**
   * Parse attendees from various formats
   */
  parseAttendees(attendees) {
    if (!attendees) return [];

    if (Array.isArray(attendees)) {
      return attendees.map((email) =>
        typeof email === "string" ? { email } : email
      );
    }

    if (typeof attendees === "string") {
      return attendees
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
        .map((email) => ({ email }));
    }

    return [];
  }

  /**
   * Sign out
   */
  signOut() {
    this.accessToken = null;
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;
