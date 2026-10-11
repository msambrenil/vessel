import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatQuickActionBar } from "@/components/chat/ChatQuickActionBar";

const mockAudioEngine = vi.hoisted(() => ({
  playPulse: vi.fn(),
}));

vi.mock("@/lib/audio/SubBassAudioEngine", () => ({
  audioEngine: mockAudioEngine,
}));

describe("ChatQuickActionBar — Barra Táctica de Respuestas Rápidas y Salidas Anti-Ghost", () => {
  const quickReplies = ["⚡ Dale, coordinamos", "📍 Pasame tu ubicación", "🔥 Estoy cerca"];
  const kindClosureMessages = [
    { id: "kc-1", emoji: "✌️", title: "Cierre tranqui", text: "Buena onda pero hoy paso, ¡éxitos!" },
  ];

  const onChangeQuickBarMode = vi.fn();
  const onQuickReply = vi.fn();
  const onSendKindClosure = vi.fn();
  const onOpenKindClosureInfo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza chips de respuestas rápidas y permite enviar en un toque", () => {
    render(
      <ChatQuickActionBar
        quickBarMode="quick"
        onChangeQuickBarMode={onChangeQuickBarMode}
        quickReplies={quickReplies}
        kindClosureMessages={kindClosureMessages}
        isInputFocused={false}
        language="es"
        onQuickReply={onQuickReply}
        onSendKindClosure={onSendKindClosure}
        onOpenKindClosureInfo={onOpenKindClosureInfo}
      />
    );

    const daleChip = screen.getByText("⚡ Dale, coordinamos");
    fireEvent.click(daleChip);
    expect(onQuickReply).toHaveBeenCalledWith("⚡ Dale, coordinamos");

    const switchBtn = screen.getByText(/SALIDA CON ONDA \(\+5\)|CERO-PLANTONES \(\+5\)/);
    fireEvent.click(switchBtn);
    expect(onChangeQuickBarMode).toHaveBeenCalledWith("antiGhost");
  });

  it("renderiza chips anti-ghost cuando el modo es antiGhost", () => {
    render(
      <ChatQuickActionBar
        quickBarMode="antiGhost"
        onChangeQuickBarMode={onChangeQuickBarMode}
        quickReplies={quickReplies}
        kindClosureMessages={kindClosureMessages}
        isInputFocused={false}
        language="es"
        onQuickReply={onQuickReply}
        onSendKindClosure={onSendKindClosure}
        onOpenKindClosureInfo={onOpenKindClosureInfo}
      />
    );

    expect(screen.getByText("Cierre tranqui")).toBeInTheDocument();
    const antiGhostChip = screen.getByTitle('Enviar: "Buena onda pero hoy paso, ¡éxitos!" (+5 Respect Karma)');
    fireEvent.click(antiGhostChip);
    expect(onSendKindClosure).toHaveBeenCalledWith("Buena onda pero hoy paso, ¡éxitos!");
  });
});
