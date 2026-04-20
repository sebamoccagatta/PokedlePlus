const METRICS_STORAGE_KEY = "pokedleplus:metrics:v1";
const METRICS_UPDATED_EVENT = "pokedleplus:metrics:updated";
const MAX_STORED_EVENTS = 200;

const ALLOWED_EVENT_TYPES = new Set([
  "game_started",
  "game_finished",
  "share_clicked",
  "mode_changed",
]);

function isObject(value) {
  return typeof value === "object" && value !== null;
}

function sanitizeMetadata(meta) {
  if (!isObject(meta)) return {};

  const next = {};
  for (const [key, value] of Object.entries(meta)) {
    const kind = typeof value;
    if (
      kind === "string" ||
      kind === "number" ||
      kind === "boolean" ||
      value === null
    ) {
      next[key] = value;
    }
  }
  return next;
}

function normalizeEvent(raw) {
  if (!isObject(raw) || !ALLOWED_EVENT_TYPES.has(raw.type)) return null;

  const ts = Number(raw.ts);
  const isTimestampValid = Number.isFinite(ts) && ts > 0;

  return {
    type: raw.type,
    ts: isTimestampValid ? ts : Date.now(),
    mode: typeof raw.mode === "string" && raw.mode ? raw.mode : "unknown",
    dayKey: typeof raw.dayKey === "string" && raw.dayKey ? raw.dayKey : "unknown",
    meta: sanitizeMetadata(raw.meta),
  };
}

function emitMetricsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(METRICS_UPDATED_EVENT));
}

function loadRawPayload() {
  try {
    const raw = localStorage.getItem(METRICS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const events = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.events)
        ? parsed.events
        : [];

    return events
      .map((entry) => normalizeEvent(entry))
      .filter(Boolean)
      .slice(-MAX_STORED_EVENTS);
  } catch {
    return [];
  }
}

function saveEvents(events) {
  try {
    localStorage.setItem(
      METRICS_STORAGE_KEY,
      JSON.stringify({ version: 1, events: events.slice(-MAX_STORED_EVENTS) }),
    );
  } catch {
    // noop
  }
}

function pushEvent(event) {
  const normalized = normalizeEvent(event);
  if (!normalized) return false;

  const events = loadRawPayload();
  events.push(normalized);
  saveEvents(events);
  emitMetricsUpdated();
  return true;
}

export function getTrackedEvents() {
  return loadRawPayload();
}

export function trackLocalMetricEvent(event) {
  return pushEvent(event);
}

export function trackLocalMetricEventOnce(event) {
  const normalized = normalizeEvent(event);
  if (!normalized) return false;

  const events = loadRawPayload();
  const exists = events.some(
    (entry) =>
      entry.type === normalized.type &&
      entry.mode === normalized.mode &&
      entry.dayKey === normalized.dayKey,
  );

  if (exists) return false;

  events.push(normalized);
  saveEvents(events);
  emitMetricsUpdated();
  return true;
}

export function computeLocalMetrics(events) {
  const safeEvents = Array.isArray(events) ? events : [];
  const started = safeEvents.filter((e) => e.type === "game_started").length;
  const finished = safeEvents.filter((e) => e.type === "game_finished").length;
  const shareClicks = safeEvents.filter((e) => e.type === "share_clicked").length;
  const modeChanges = safeEvents.filter((e) => e.type === "mode_changed").length;

  return {
    started,
    finished,
    shareClicks,
    modeChanges,
    completionRate: started > 0 ? Math.round((finished / started) * 100) : 0,
    shareRate: finished > 0 ? Math.round((shareClicks / finished) * 100) : 0,
  };
}

export function getRecentTrackedEvents(limit = 5) {
  return loadRawPayload().slice(-limit).reverse();
}

export { METRICS_STORAGE_KEY, METRICS_UPDATED_EVENT, MAX_STORED_EVENTS };
