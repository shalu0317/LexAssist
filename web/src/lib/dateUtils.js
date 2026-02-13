// Date/time helper utilities used by calendar components
export function toDateInputValue(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d)) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return "";
  }
}

export function toTimeInputValue(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d)) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch (e) {
    return "";
  }
}

export function combineDateTime(date, time) {
  if (!date) return "";
  if (!time) return `${date}T00:00`;
  return `${date}T${time}`;
}

export function formatDateForDisplay(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return val;
  }
}
