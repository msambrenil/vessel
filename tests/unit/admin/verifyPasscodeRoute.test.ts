import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/admin/verify-passcode/route";

describe("POST /api/admin/verify-passcode — Endpoint Seguro de Autenticación", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ADMIN_MASTER_PASSCODE = "VESSEL-SECURE-KEY-2026";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("debe autorizar cuando el passcode coincide con ADMIN_MASTER_PASSCODE", async () => {
    const req = new Request("http://localhost/api/admin/verify-passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "VESSEL-SECURE-KEY-2026" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.authorized).toBe(true);
  });

  it("debe rechazar con 401 si el passcode es incorrecto", async () => {
    const req = new Request("http://localhost/api/admin/verify-passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "WRONG-KEY" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.authorized).toBe(false);
  });

  it("debe retornar 400 si no se envía passcode", async () => {
    const req = new Request("http://localhost/api/admin/verify-passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.authorized).toBe(false);
  });

  it("debe retornar 500 si la clave de servidor no está configurada", async () => {
    delete process.env.ADMIN_MASTER_PASSCODE;
    delete process.env.NEXT_PUBLIC_ADMIN_PASSCODE;

    const req = new Request("http://localhost/api/admin/verify-passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: "SOME-KEY" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.authorized).toBe(false);
  });
});
