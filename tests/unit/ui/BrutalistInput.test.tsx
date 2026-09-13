import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistInput } from "@/components/ui/BrutalistInput";

describe("BrutalistInput — Campo Táctico Impeccable (44px & 5 Estados)", () => {
  it("debe renderizar con label y altura táctil mínima de 44px", () => {
    render(<BrutalistInput label="Codename" placeholder="Ingresá alias" />);

    const label = screen.getByText("Codename");
    const input = screen.getByPlaceholderText("Ingresá alias");

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input.className).toContain("min-h-[44px]");
  });

  it("debe reflejar cambios de valor y permitir escritura", () => {
    const handleChange = vi.fn();
    render(<BrutalistInput placeholder="Buscar..." onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.change(input, { target: { value: "Palermo" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toBe("Palermo");
  });

  it("debe mostrar mensaje de error y aplicar bordes de alerta", () => {
    render(
      <BrutalistInput
        label="PIN"
        error="El código PIN debe tener 4 dígitos"
        placeholder="••••"
      />
    );

    const errorMsg = screen.getByText("El código PIN debe tener 4 dígitos");
    const input = screen.getByPlaceholderText("••••");

    expect(errorMsg).toBeInTheDocument();
    expect(input.className).toContain("border-bloodNeon");
  });

  it("debe deshabilitar la interacción cuando disabled es true", () => {
    render(<BrutalistInput placeholder="Bloqueado" disabled />);

    const input = screen.getByPlaceholderText("Bloqueado");
    expect(input).toBeDisabled();
    expect(input.className).toContain("disabled:opacity-40");
  });
});
