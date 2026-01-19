// Simple in-memory rate limiter
// Stores request counts per IP

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 requests per minute

// In-memory store: { [ip: { count: number, resetTime: number }] }
const store = new Map();

function cleanupExpiredEntries(now) {
  for (const [ip, data] of store.entries()) {
    if (now >= data.resetTime) {
      store.delete(ip);
    }
  }
}

function getClientIp(event) {
  // Netlify provides client IP in various headers
  return (
    event.headers["client-ip"] ||
    event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    event.headers["x-real-ip"] ||
    "unknown"
  );
}

function getRateLimitInfo(ip) {
  const now = Date.now();

  // Clean up expired entries periodically
  if (store.size > 1000) {
    cleanupExpiredEntries(now);
  }

  const existing = store.get(ip);

  if (!existing || now >= existing.resetTime) {
    // New window
    const data = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    store.set(ip, data);
    return {
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      reset: data.resetTime,
    };
  }

  // Existing window
  const newCount = existing.count + 1;

  if (newCount > RATE_LIMIT_MAX_REQUESTS) {
    return {
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: 0,
      reset: existing.resetTime,
      exceeded: true,
    };
  }

  existing.count = newCount;
  store.set(ip, existing);

  return {
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: RATE_LIMIT_MAX_REQUESTS - newCount,
    reset: existing.resetTime,
  };
}

module.exports = { getClientIp, getRateLimitInfo };
