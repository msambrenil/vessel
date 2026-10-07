import { NextResponse } from "next/server";
import {
  CURRENT_SYSTEM_VERSION,
  SYSTEM_BUILD_TIMESTAMP,
  SYSTEM_BUILD_FORMATTED,
} from "@/lib/version/systemVersion";
import { getSystemControlState } from "@/lib/version/systemControlService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  let state = null;
  try {
    state = await getSystemControlState("real");
  } catch {
    // Fallback silencioso
  }

  const payload = {
    version: CURRENT_SYSTEM_VERSION,
    buildTimestamp: SYSTEM_BUILD_TIMESTAMP,
    formattedDate: SYSTEM_BUILD_FORMATTED,
    forceReloadTimestamp: state?.forceReloadTimestamp || 0,
    forceLogoutTimestamp: state?.forceLogoutTimestamp || 0,
    serverTime: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    },
  });
}
