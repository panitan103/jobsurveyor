import type { NextRequest } from "next/server";

/**
 * Build a redirect target that survives a reverse proxy.
 *
 * Inside the container `request.url` is the internal bind address
 * (http://0.0.0.0:3100), so redirecting with it leaks that origin to the
 * browser. Prefer the forwarded headers set by the proxy, then PUBLIC_URL.
 */
export function publicUrl(request: NextRequest, path: string): URL {
  const configured = process.env.PUBLIC_URL?.replace(/\/+$/, "");
  if (configured) return new URL(path, configured);

  const forwardedHost = firstHeader(request.headers.get("x-forwarded-host"));
  const host = forwardedHost || firstHeader(request.headers.get("host")) || request.nextUrl.host;
  const proto =
    firstHeader(request.headers.get("x-forwarded-proto")) ||
    (request.nextUrl.protocol ? request.nextUrl.protocol.replace(":", "") : "http");

  const safeHost = host && !/^(0\.0\.0\.0|127\.0\.0\.1|\[::\])(:\d+)?$/.test(host) ? host : request.nextUrl.host;

  return new URL(path, `${proto}://${safeHost}`);
}

function firstHeader(value: string | null): string {
  return (value ?? "").split(",")[0].trim();
}
