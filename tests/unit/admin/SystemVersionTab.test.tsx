import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SystemVersionTab } from "@/components/admin/tabs/SystemVersionTab";
import { StaffMember } from "@/types/admin";
import { CURRENT_SYSTEM_VERSION } from "@/lib/version/systemVersion";

const mockSuperadmin: StaffMember = {
  id: "staff-super-01",
  name: "Senior Architect",
  email: "admin@vessel.network",
  role: "superadmin",
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  lastLoginAt: "2026-10-06T19:00:00Z",
};

const mockModerator: StaffMember = {
  id: "staff-mod-02",
  name: "Moderator One",
  email: "mod@vessel.network",
  role: "moderator",
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  lastLoginAt: "2026-10-06T19:00:00Z",
};

describe("VESSEL // UI SystemVersionTab", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("debe mostrar la versión actual del sistema y la fecha de despliegue", () => {
    render(<SystemVersionTab currentStaff={mockSuperadmin} />);

    expect(screen.getByText(new RegExp(`BUILD ACTIVA: ${CURRENT_SYSTEM_VERSION}`, "i"))).toBeInTheDocument();
    expect(screen.getByText(/Fecha de Despliegue:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ART/i).length).toBeGreaterThan(0);
  });

  it("debe renderizar los botones de forzar recarga y forzar cierre de sesión", () => {
    render(<SystemVersionTab currentStaff={mockSuperadmin} />);

    expect(
      screen.getByRole("button", { name: /Forzar Recarga en Todos los Clientes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Forzar Cierre de Sesiones Activas/i })
    ).toBeInTheDocument();
  });

  it("debe deshabilitar los botones destructivos si el operador no es superadmin", () => {
    render(<SystemVersionTab currentStaff={mockModerator} />);

    const reloadBtn = screen.getByRole("button", { name: /Forzar Recarga en Todos los Clientes/i });
    const logoutBtn = screen.getByRole("button", { name: /Forzar Cierre de Sesiones Activas/i });

    expect(reloadBtn).toBeDisabled();
    expect(logoutBtn).toBeDisabled();
  });

  it("debe mostrar el listado del changelog y permitir filtrar por búsqueda", () => {
    render(<SystemVersionTab currentStaff={mockSuperadmin} />);

    expect(screen.getByText(CURRENT_SYSTEM_VERSION)).toBeInTheDocument();
    expect(screen.getByText(/Historial de Versiones & Changelog Oficial/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Buscar por versión/i);
    fireEvent.change(searchInput, { target: { value: "v2.5.0" } });

    expect(screen.getByText(CURRENT_SYSTEM_VERSION)).toBeInTheDocument();
  });

  it("debe abrir modal de confirmación al presionar Forzar Recarga", () => {
    render(<SystemVersionTab currentStaff={mockSuperadmin} />);

    const reloadBtn = screen.getByRole("button", { name: /Forzar Recarga en Todos los Clientes/i });
    fireEvent.click(reloadBtn);

    expect(screen.getByText(/¿Forzar Recarga en Todos los Clientes\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirmar & Forzar Recarga/i })).toBeInTheDocument();
  });

  it("debe abrir modal de confirmación al presionar Forzar Cierre de Sesiones", () => {
    render(<SystemVersionTab currentStaff={mockSuperadmin} />);

    const logoutBtn = screen.getByRole("button", { name: /Forzar Cierre de Sesiones Activas/i });
    fireEvent.click(logoutBtn);

    expect(screen.getByText(/¿Forzar Cierre de Sesiones de Usuarios\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirmar & Cerrar Sesiones/i })).toBeInTheDocument();
  });
});
