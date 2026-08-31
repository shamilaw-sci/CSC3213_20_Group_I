import "server-only";

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function enforceRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "local";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return { allowed: true, retryAfter: 0 }; }
  entry.count += 1;
  return { allowed: entry.count <= limit, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}
