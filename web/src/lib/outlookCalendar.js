// Minimal Outlook / Microsoft Graph helper for calendar operations
// This mirrors the shape used in the page-level code and centralizes Graph calls.
const OUTLOOK_AUTH_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";

export function buildAuthUrl({ clientId, redirectUri, scopes = "openid profile email User.Read Calendars.ReadWrite", state }) {
  const authUrl = new URL(OUTLOOK_AUTH_ENDPOINT);
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_mode", "query");
  authUrl.searchParams.append("scope", scopes);
  if (state) authUrl.searchParams.append("state", state);
  return authUrl.toString();
}

export async function listEvents(accessToken, { timeMin, timeMax } = {}) {
  if (!accessToken) throw new Error("accessToken required");

  const now = new Date();
  const _timeMin = timeMin || new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const _timeMax = timeMax || new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();

  const url = `https://graph.microsoft.com/v1.0/me/events` +
    `?$select=id,subject,bodyPreview,body,start,end,webLink` +
    `&$orderby=start/dateTime` +
    `&$filter=start/dateTime ge '${_timeMin}' and end/dateTime le '${_timeMax}'`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const err = new Error(`Graph listEvents failed: ${res.status} ${res.statusText} ${txt}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const items = data.value || [];
  return items.map((event) => ({
    id: event.id,
    title: event.subject || "Untitled Event",
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    description: event.bodyPreview || event.body?.content || "",
    backgroundColor: "#0078D4",
    borderColor: "#0078D4",
    extendedProps: {
      source: "outlook",
      webLink: event.webLink,
    },
  }));
}

// TODO: add createEvent, updateEvent helpers if needed. For security, prefer server-side creation.

export default { buildAuthUrl, listEvents };
