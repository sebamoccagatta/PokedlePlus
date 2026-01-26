// netlify/functions/_lib/rateLimitRedis.js
// Rate limiting persistente usando Redis (Upstash)
// Reemplaza al rateLimit.js in-memory que se pierde entre invocaciones serverless

const { Redis } = require("@upstash/redis");

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto en milisegundos
const RATE_LIMIT_MAX_REQUESTS = 30; // Máximo 30 requests por minuto

// Clave para guardar el contador de requests por IP
function getRedisKey(ip) {
  return `ratelimit:${ip}`;
}

let redisClient;

function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({
    url,
    token,
  });

  return redisClient;
}

function getClientIp(event) {
  // Netlify proporciona client IP en varios headers
  return (
    event.headers["client-ip"] ||
    event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    event.headers["x-real-ip"] ||
    "unknown"
  );
}

async function getRateLimitInfo(ip) {
  const redis = getRedisClient();
  if (!redis) {
    return getFallbackRateLimitInfo(ip);
  }

  const now = Date.now();
  const key = getRedisKey(ip);

  try {
    // Pipeline para operaciones atómicas
    const pipeline = redis.pipeline();

    // Obtener valor actual y TTL
    pipeline.get(key);
    pipeline.ttl(key);

    const results = await pipeline.exec();

    const currentValue = results[0];
    const currentTtl = results[1];

    let count;
    let resetTime;

    if (currentValue === null) {
      // Nuevo usuario o expiró
      count = 1;
      resetTime = now + RATE_LIMIT_WINDOW;
      await redis.setex(
        key,
        Math.ceil(RATE_LIMIT_WINDOW / 1000),
        JSON.stringify({
          count,
          resetTime,
        }),
      );
    } else {
      const data = JSON.parse(currentValue);

      // Verificar si la ventana expiró (por seguridad, Redis TTL debería manejarlo)
      if (currentTtl === -2 || now >= data.resetTime) {
        count = 1;
        resetTime = now + RATE_LIMIT_WINDOW;
        await redis.setex(
          key,
          Math.ceil(RATE_LIMIT_WINDOW / 1000),
          JSON.stringify({
            count,
            resetTime,
          }),
        );
      } else {
        count = data.count + 1;

        if (count <= RATE_LIMIT_MAX_REQUESTS) {
          await redis.setex(
            key,
            Math.ceil((data.resetTime - now) / 1000),
            JSON.stringify({
              count,
              resetTime: data.resetTime,
            }),
          );
        }

        resetTime = data.resetTime;
      }
    }

    const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - count);

    return {
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining,
      reset: resetTime,
      exceeded: count > RATE_LIMIT_MAX_REQUESTS,
    };
  } catch (error) {
    console.error("Redis rate limit error, using fallback:", error.message);
    redisClient = null;
    return getFallbackRateLimitInfo(ip);
  }
}

// Fallback in-memory para cuando Redis no está disponible
const fallbackStore = new Map();

function getFallbackRateLimitInfo(ip) {
  const now = Date.now();

  // Limpiar entradas expiradas periódicamente
  if (fallbackStore.size > 1000) {
    for (const [key, data] of fallbackStore.entries()) {
      if (now >= data.resetTime) {
        fallbackStore.delete(key);
      }
    }
  }

  const existing = fallbackStore.get(ip);

  if (!existing || now >= existing.resetTime) {
    // Nueva ventana
    const data = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    fallbackStore.set(ip, data);
    return {
      limit: RATE_LIMIT_MAX_REQUESTS,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      reset: data.resetTime,
    };
  }

  // Ventana existente
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
  fallbackStore.set(ip, existing);

  return {
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining: RATE_LIMIT_MAX_REQUESTS - newCount,
    reset: existing.resetTime,
  };
}

async function resetRateLimit(ip) {
  const redis = getRedisClient();

  if (redis) {
    try {
      await redis.del(getRedisKey(ip));
    } catch (error) {
      console.error("Error resetting rate limit in Redis:", error);
      redisClient = null;
    }
  }

  // También limpiar fallback
  fallbackStore.delete(ip);
}

module.exports = { getClientIp, getRateLimitInfo, resetRateLimit };
