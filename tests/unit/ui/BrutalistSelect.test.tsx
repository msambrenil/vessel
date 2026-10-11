import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistSelect } from "@/components/ui/BrutalistSelect";

describe("BrutalistSelect — Selector Táctico Estandarizado (44px & 5 Estados)", () => {
  const options = [
    { value: "activo", label: "Activo" },
    { value: "pasivo", label: "Pasivo" },
    { value: "versatil", label: "Versátil" },
  ];

  it("debe renderizar label, placeholder y opciones correctamente con min-h 44px", () => {
    const handleChange = vi.fn();
    render(
      <BrutalistSelect
        label="Rol en el encuentro"
        value=""
        onChange={handleChange}
        options={options}
        placeholder="Seleccioná un rol"
      />
    );

    expect(screen.getByText("Rol en el encuentro")).toBeInTheDocument();
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select.className).toContain("min-h-[44px]");
    expect(screen.getByText("Seleccioná un rol")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("debe disparar onChange al seleccionar una opción", () => {
    const handleChange = vi.fn();
    render(
      <BrutalistSelect
        label="Rol"
        value="activo"
        onChange={handleChange}
        options={options}
      />
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "versatil" } });

    expect(handleChange).toHaveBeenCalledWith("versatil");
  });

  it("debe mostrar mensaje de error cuando se le pasa prop error", () => {
    render(
      <BrutalistSelect
        label="Rol"
        value=""
        onChange={vi.fn()}
        options={options}
        error="Campo requerido para continuar"
      />
    );

    expect(screen.getByText(/campo requerido para continuar/i)).toBeInTheDocument();
    const select = screen.getByRole("combobox");
    expect(select.className).toContain("border-bloodNeon");
  });

  it("debe deshabilitar interacción cuando disabled es true", () => {
    render(
      <BrutalistSelect
        label="Rol"
        value="activo"
        onChange={vi.fn()}
        options={options}
        disabled={true}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    expect(select.className).toContain("disabled:opacity-40");
  });
});
