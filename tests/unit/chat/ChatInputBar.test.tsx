import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInputBar } from "@/components/chat/ChatInputBar";

import { TRANSLATIONS } from "@/lib/i18n/translations";

describe("ChatInputBar — Microinteracciones y Morphing de Estados", () => {
  const mockProps = {
    activeBoundary: null,
    isVoiceRecording: false,
    setIsVoiceRecording: vi.fn(),
    isBurnMode: false,
    setIsBurnMode: vi.fn(),
    inputMessage: "",
    setInputMessage: vi.fn(),
    isInputFocused: false,
    setIsInputFocused: vi.fn(),
    isSendingMessage: false,
    language: "es" as const,
    t: TRANSLATIONS.es,
    onSend: vi.fn(),
    onSendVoiceMessage: vi.fn(),
    onOpenSendMedia: vi.fn(),
    onOpenBoundaryModal: vi.fn(),
    onOpenActionHub: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe mostrar el botón de micrófono cuando el input está vacío", () => {
    render(<ChatInputBar {...mockProps} inputMessage="" />);
    const micBtn = screen.getByRole("button", { name: /grabar.*voz/i });
    expect(micBtn).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /enviar mensaje/i })).not.toBeInTheDocument();
  });

  it("debe mutar al botón de enviar (Send) cuando hay texto escrito", () => {
    render(<ChatInputBar {...mockProps} inputMessage="Hola, estás cerca?" />);
    const sendBtn = screen.getByRole("button", { name: /enviar mensaje/i });
    expect(sendBtn).toBeInTheDocument();
    expect(sendBtn).toHaveAttribute("type", "submit");
    expect(screen.queryByRole("button", { name: /grabar.*voz/i })).not.toBeInTheDocument();
  });

  it("debe permitir conmutar el modo efímero (isBurnMode) y disparar el callback", () => {
    render(<ChatInputBar {...mockProps} isBurnMode={false} />);
    const burnBtn = screen.getByRole("button", { name: /activar modo efímero/i });
    expect(burnBtn).toBeInTheDocument();

    fireEvent.click(burnBtn);
    expect(mockProps.setIsBurnMode).toHaveBeenCalledWith(true);
  });
});
