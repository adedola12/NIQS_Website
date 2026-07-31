/**
 * Minimal fixed-window rate limiter, in process memory.
 *
 * Deliberately not a dependency: the only thing it guards is a handful of public
 * read endpoints, and the failure it prevents is someone walking the member
 * directory through our proxy a page at a time. It is a speed bump, not a
 * security boundary.
 *
 * Caveat worth knowing before relying on it: the counter is per task. The ECS
 * service runs more than one, so the effective ceiling is `max` × task count, and
 * a deploy resets every window. If this ever needs to be exact, it belongs in
 * Redis or at the ALB, not here.
 */

function rateLimit({ windowMs = 60_000, max = 60, key } = {}) {
  const hits = new Map(); // key -> { count, resetAt }

  // Bounded cleanup so a long-lived task cannot accumulate a map entry per IP.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }, windowMs);
  sweep.unref();

  return (req, res, next) => {
    // Behind the ALB, req.ip resolves via trust proxy (set in server.js).
    const id = key ? key(req) : req.ip || 'unknown';
    const now = Date.now();

    let entry = hits.get(id);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(id, entry);
    }
    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(remaining));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        message: 'Too many requests. Please wait a moment and try again.',
        retryAfter,
      });
    }

    next();
  };
}

module.exports = rateLimit;
