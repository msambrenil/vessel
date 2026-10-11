import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrutalistNav } from "@/components/navigation/BrutalistNav";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

const mockSetActiveView = vi.fn();
let mockChatMessages: Record<string, any[]> = {};

vi.mock("@/context/VesselContext", () => ({
  useRadarMatrix: () => ({
    activeView: "grid",
    setActiveView: mockSetActiveView,
    unreadPulsesCount: 3,
  }),
  useSettings: () => ({
    language: "es",
    t: {
      nav: {
        grid: "Matrix",
        pulses: "Toques",
        chat: "Chats",
        diary: "Diario",
        account: "Perfil",
      },
    },
  }),
  useChat: () => {
    const unread = Object.values(mockChatMessages).reduce(
      (acc, msgs) =>
        acc + msgs.filter((m) => m.senderId !== "me" && m.senderId !== "system" && !m.isRead).length,
      0
    );
    return {
      chatMessages: mockChatMessages,
      unreadMessagesCount: unread,
    };
  },
  useDiary: () => ({
    diaryEntries: [],
  }),
}));

describe("BrutalistNav — Navegación Principal Microinteractiva", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatMessages = {};
  });

  it("debe renderizar los 5 tabs principales con sus etiquetas e iconos como enlaces semánticos", () => {
    render(<BrutalistNav />);
    expect(screen.getByRole("link", { name: /Matrix/i })).toHaveAttribute("href", "/radar");
    expect(screen.getByRole("link", { name: /Toques/i })).toHaveAttribute("href", "/pulses");
    expect(screen.getByRole("link", { name: /Chats/i })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: /Diario/i })).toHaveAttribute("href", "/diary");
    expect(screen.getByRole("link", { name: /Perfil/i })).toHaveAttribute("href", "/account");
  });

  it("debe disparar setActiveView y audioEngine.playPulse al presionar un tab inactivo", () => {
    const playPulseSpy = vi.spyOn(audioEngine, "playPulse");
    render(<BrutalistNav />);

    const chatTab = screen.getByRole("link", { name: /Chats/i });
    fireEvent.click(chatTab);

    expect(mockSetActiveView).toHaveBeenCalledWith("chat");
    expect(playPulseSpy).toHaveBeenCalledTimes(1);
  });

  it("debe mostrar el badge animado de toques entrantes cuando hay pulsos no leídos", () => {
    render(<BrutalistNav />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("debe mostrar el badge de mensajes sin leer cuando hay mensajes nuevos de otro usuario", () => {
    mockChatMessages = {
      user1: [
        { id: "m1", senderId: "user1", text: "Hola", isRead: false, createdAt: "2026-10-09" },
        { id: "m2", senderId: "user1", text: "¿Pinta hoy?", isRead: false, createdAt: "2026-10-09" },
      ],
    };
    render(<BrutalistNav />);
    expect(screen.getByTitle("2 mensajes sin leer")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
