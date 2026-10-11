import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Rate limiting en memoria para mitigación básica de ataques de fuerza bruta (P0)
const failedAttemptsMap = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILED_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = failedAttemptsMap.get(ip);
  if (!record) return false;
  if (now > record.resetAt) {
    failedAttemptsMap.delete(ip);
    return false;
  }
  return record.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = failedAttemptsMap.get(ip);
  if (!record || now > record.resetAt) {
    failedAttemptsMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count += 1;
  }
}

function clearRateLimit(ip: string): void {
  failedAttemptsMap.delete(ip);
}

/**
 * Endpoint seguro para verificación de clave maestra administrativa (P0).
 * Protege la credencial en el entorno del servidor y previene su filtración en bundles JS del cliente.
 */
export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-client";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { authorized: false, error: "Too many failed attempts. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const passcode = typeof body?.passcode === "string" ? body.passcode.trim() : "";

    // La variable de servidor privada ADMIN_MASTER_PASSCODE es la única autoridad de servidor (P0).
    const masterPasscode = (process.env.ADMIN_MASTER_PASSCODE || "").trim();

    if (!masterPasscode) {
      return NextResponse.json(
        { authorized: false, error: "Master passcode not configured on server" },
        { status: 500 }
      );
    }

    if (!passcode) {
      return NextResponse.json(
        { authorized: false, error: "Passcode required" },
        { status: 400 }
      );
    }

    // Comparación segura en tiempo constante contra Timing Attacks
    const passcodeBuffer = Buffer.from(passcode, "utf8");
    const masterBuffer = Buffer.from(masterPasscode, "utf8");

    const isAuthorized =
      passcodeBuffer.length === masterBuffer.length &&
      timingSafeEqual(passcodeBuffer, masterBuffer);

    if (!isAuthorized) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { authorized: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    clearRateLimit(clientIp);

    return NextResponse.json(
      { authorized: true, timestamp: Date.now() },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { authorized: false, error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
