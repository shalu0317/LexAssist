import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  googleCalendarService,
  GOOGLE_CONFIG,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/lib/calendar";

/**
 * Custom hook to manage Google Calendar integration
 * Handles authentication, event fetching, and event creation
 */
export function useGoogleCalendar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const tokenClientRef = useRef(null);

  /**
   * Handle authentication callback
   */
  const handleAuthCallback = (response) => {
    if (response.error) {
      console.error("Google auth error:", response.error);
      toast.error(ERROR_MESSAGES.AUTH_FAILED);
      return;
    }

    setAccessToken(response.access_token);
    setIsSignedIn(true);
    googleCalendarService.setAccessToken(response.access_token);
    toast.success(SUCCESS_MESSAGES.GOOGLE_CONNECTED);

    // Auto-load events after successful sign-in
    loadEvents(response.access_token);
  };

  /**
   * Initialize Google Identity Services
   */
  useEffect(() => {
    const initializeGoogleClient = async () => {
      try {
        await googleCalendarService.initialize(handleAuthCallback);
        tokenClientRef.current = googleCalendarService.tokenClient;
      } catch (error) {
        console.error("Failed to initialize Google Calendar:", error);
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

  /**
   * Sign in to Google Calendar
   */
  const signIn = () => {
    try {
      googleCalendarService.signIn();
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error(ERROR_MESSAGES.GOOGLE_NOT_INITIALIZED);
    }
  };

  /**
   * Load events from Google Calendar
   */
  const loadEvents = async (token = accessToken) => {
    if (!token) {
      toast.error(ERROR_MESSAGES.GOOGLE_SIGN_IN_REQUIRED);
      return;
    }

    setIsLoading(true);
    try {
      const formattedEvents = await googleCalendarService.fetchEvents(token);
      setEvents(formattedEvents);
      toast.success(SUCCESS_MESSAGES.EVENTS_LOADED(formattedEvents.length, "Google Calendar"));
    } catch (error) {
      console.error("Error loading Google Calendar events:", error);
      toast.error(ERROR_MESSAGES.FETCH_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add event to Google Calendar
   */
  const addEvent = async (eventData) => {
    if (!accessToken) {
      toast.error(ERROR_MESSAGES.GOOGLE_SIGN_IN_REQUIRED);
      return false;
    }

    setIsLoading(true);
    try {
      await googleCalendarService.addEvent(eventData, accessToken);
      await loadEvents(); // Refresh events
      toast.success(SUCCESS_MESSAGES.EVENT_ADDED_GOOGLE);
      return true;
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
      toast.error(ERROR_MESSAGES.ADD_EVENT_FAILED);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out from Google Calendar
   */
  const signOut = () => {
    googleCalendarService.signOut();
    setAccessToken(null);
    setIsSignedIn(false);
    setEvents([]);
  };

  return {
    isSignedIn,
    events,
    isLoading,
    signIn,
    loadEvents,
    addEvent,
    signOut,
  };
}
