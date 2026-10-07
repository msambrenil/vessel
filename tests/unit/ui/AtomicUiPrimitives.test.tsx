import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FilterPill,
  TelemetryPill,
  TacticalSearchInput,
  SortSegmentedControl,
} from "@/components/ui";

describe("Atomic UI Primitives — Biblioteca de Componentes UX", () => {
  describe("FilterPill", () => {
    it("renderiza etiqueta, estado activo y contador correctamente", () => {
      const handleClick = vi.fn();
      render(
        <FilterPill
          label="Favoritos"
          active={true}
          count={5}
          variant="amber"
          onClick={handleClick}
        />
      );

      const pill = screen.getByRole("button", { name: /favoritos/i });
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByText("5")).toBeInTheDocument();

      fireEvent.click(pill);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("permite limpiar el filtro cuando active es true y se provee onClear", () => {
      const handleClear = vi.fn();
      render(
        <FilterPill
          label="Con lugar"
          active={true}
          variant="emerald"
          onClear={handleClear}
        />
      );

      const clearBtn = screen.getByLabelText("Limpiar Con lugar");
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("TelemetryPill", () => {
    it("renderiza distancia y tag REMOTO en perfiles fuera de radio", () => {
      render(
        <TelemetryPill
          bodyState="open"
          distanceLabel="1.8km"
          isRemote={true}
          title="Señal Remota"
        />
      );

      expect(screen.getByText("1.8km")).toBeInTheDocument();
      expect(screen.getByText("REMOTO")).toBeInTheDocument();
      expect(screen.getByText("🛰️")).toBeInTheDocument();
    });

    it("renderiza correctamente perfiles locales sin tag REMOTO", () => {
      render(
        <TelemetryPill
          bodyState="occupied"
          distanceLabel="250m"
          isRemote={false}
        />
      );

      expect(screen.getByText("250m")).toBeInTheDocument();
      expect(screen.queryByText("REMOTO")).toBeNull();
    });
  });

  describe("TacticalSearchInput", () => {
    it("permite escribir y limpiar la búsqueda con el botón X", () => {
      const handleChange = vi.fn();
      const handleClear = vi.fn();

      render(
        <TacticalSearchInput
          testId="search-test-input"
          value="cruising"
          onChange={handleChange}
          onClear={handleClear}
          placeholder="Buscar..."
        />
      );

      const input = screen.getByTestId("search-test-input");
      expect(input).toHaveValue("cruising");

      const clearButton = screen.getByLabelText("Limpiar búsqueda");
      fireEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith("");
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("SortSegmentedControl", () => {
    it("renderiza opciones y llama a onChange con el nuevo valor", () => {
      const handleChange = vi.fn();
      const options = [
        { id: "dist", label: "Cerca", icon: "📍" },
        { id: "online", label: "Online", icon: "⚡" },
      ];

      render(
        <SortSegmentedControl
          value="dist"
          onChange={handleChange}
          options={options}
        />
      );

      const onlineRadio = screen.getByRole("radio", { name: /online/i });
      expect(onlineRadio).toHaveAttribute("aria-checked", "false");

      fireEvent.click(onlineRadio);
      expect(handleChange).toHaveBeenCalledWith("online");
    });
  });
});
