import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isPrivateLanHost(hostname: string) {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  const match = hostname.match(/^172\.(\d{1,2})\.\d{1,3}\.\d{1,3}$/);
  if (match) {
    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}

function isInternalConnection(request: NextRequest): boolean {
  // Les connexions internes viennent des conteneurs Docker (hostname ou IP interne)
  const host = request.headers.get("host");
  if (!host) return false;

  const hostname = host.split(":")[0];

  // Docker internal hostnames (service names)
  if (hostname === "back" || hostname === "front" || hostname === "db" || hostname === "realtime") {
    return true;
  }

  // Private network IPs
  return isPrivateLanHost(hostname);
}

function isAllowedOrigin(origin: string | null) {
  if (origin === null) {
    return false;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.port === "3000" && isPrivateLanHost(parsedOrigin.hostname);
  } catch {
    return false;
  }
}

function buildCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = isAllowedOrigin(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : allowedOrigins[0] ?? "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

export function middleware(request: NextRequest) {
  // Forcer HTTPS pour les connexions externes (navigateurs, scripts, API)
  // Permettre HTTP pour les connexions internes (conteneurs Docker)
  if (!isInternalConnection(request)) {
    const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.slice(0, -1);
    if (proto === "http") {
      const url = new URL(request.url);
      url.protocol = "https:";
      return NextResponse.redirect(url, { status: 301 });
    }
  }

  const origin = request.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/:path*",
};
