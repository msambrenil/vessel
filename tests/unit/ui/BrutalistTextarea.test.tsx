import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistTextarea } from "@/components/ui/BrutalistTextarea";

describe("BrutalistTextarea — Primitiva Táctica Multilínea Impeccable", () => {
  it("debe renderizar con label y placeholder", () => {
    render(
      <BrutalistTextarea
        label="Reseña táctica"
        placeholder="Escribí tu experiencia..."
      />
    );

    const label = screen.getByText("Reseña táctica");
    const textarea = screen.getByPlaceholderText("Escribí tu experiencia...");

    expect(label).toBeInTheDocument();
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("debe reflejar cambios de valor y permitir escritura", () => {
    const handleChange = vi.fn();
    render(
      <BrutalistTextarea
        placeholder="Notas..."
        onChange={handleChange}
      />
    );

    const textarea = screen.getByPlaceholderText("Notas...");
    fireEvent.change(textarea, { target: { value: "Encuentro validado en Saavedra" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((textarea as HTMLTextAreaElement).value).toBe("Encuentro validado en Saavedra");
  });

  it("debe mostrar contador de caracteres cuando showCount y maxLength están activos", () => {
    render(
      <BrutalistTextarea
        label="Bio"
        value="Hola VESSEL"
        maxLength={100}
        showCount
        readOnly
      />
    );

    expect(screen.getByText("11/100")).toBeInTheDocument();
  });

  it("debe mostrar mensaje de error y aplicar bordes de alerta", () => {
    render(
      <BrutalistTextarea
        label="Observación"
        error="Campo requerido"
        placeholder="Detalles"
      />
    );

    const errorMsg = screen.getByText("Campo requerido");
    const textarea = screen.getByPlaceholderText("Detalles");

    expect(errorMsg).toBeInTheDocument();
    expect(textarea.className).toContain("border-bloodNeon");
  });

  it("debe deshabilitar la interacción cuando disabled es true", () => {
    render(<BrutalistTextarea placeholder="Deshabilitado" disabled />);

    const textarea = screen.getByPlaceholderText("Deshabilitado");
    expect(textarea).toBeDisabled();
    expect(textarea.className).toContain("disabled:opacity-40");
  });
});
