import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ChatMessageStream } from "@/components/chat/ChatMessageStream";
import { ChatMessage, VesselProfile } from "@/types/vessel";
import { createFallbackProfile } from "@/context/VesselContext";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const mockProfile: VesselProfile = {
  ...createFallbackProfile("test-user-1"),
  codename: "CHONGO_TEST",
  age: 26,
  role: "Versatile",
  yoSoy: "Discreto / Perfil bajo",
  mobility: "Me muevo / voy",
  hivStatus: "Negativo en PrEP",
  bodyState: "open",
  distanceMeters: 120,
  respectScore: 98,
  isAntiGhost: true,
  verification: { isVerified: true, hasFacialPrivacy: false, badgeLabel: "VERIFICADO", trustScore: 95 },
  totalEncountersVerified: 3,
};

const mockMessages: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "test-user-1",
    text: "Hola che, ¿estás cerca?",
    timestamp: "21:05",
    isBurnOnView: false,
    isBurned: false,
  },
  {
    id: "msg-2",
    senderId: "me",
    text: "Sí, a 3 cuadras. ¿Tenés lugar?",
    timestamp: "21:06",
    isBurnOnView: false,
    isBurned: false,
  },
];

describe("ChatMessageStream — Optimización de Renderizado y Virtualización Nativa", () => {
  it("renderiza los mensajes aplicando content-visibility:auto para contención de renderizado", () => {
    const { container } = render(
      <ChatMessageStream
        messages={mockMessages}
        profile={mockProfile}
        language="es"
        t={TRANSLATIONS.es}
        quickReplies={["Dale", "Voy"]}
        activeRendezvous={null}
        revealedBlurredMediaIds={{}}
        archivedMediaIds={{}}
        messagesEndRef={{ current: null }}
        onQuickReply={vi.fn()}
        onBurn={vi.fn()}
        onRevealBlurredMedia={vi.fn()}
        onOpenViewerMedia={vi.fn()}
        onArchivePhoto={vi.fn()}
        onRevokeAlbumAccess={vi.fn()}
        onUnrevokeAlbumAccess={vi.fn()}
        onUpdateEncounterTicketStatus={vi.fn()}
        onConfirmH2Ticket={vi.fn()}
        onOpenRendezvousSheet={vi.fn()}
        onCancelRendezvousPin={vi.fn()}
        onUnlockPhase2Waypoint={vi.fn()}
      />
    );

    const messageWrappers = screen.getAllByTestId("chat-message-item-wrapper");
    expect(messageWrappers.length).toBe(2);
    expect(messageWrappers[0].className).toContain("[content-visibility:auto]");
    expect(screen.getByText("Hola che, ¿estás cerca?")).toBeInTheDocument();
    expect(screen.getByText("Sí, a 3 cuadras. ¿Tenés lugar?")).toBeInTheDocument();
  });

  it("renderiza el estado vacío con botones de respuestas rápidas usando el componente del sistema", () => {
    const handleQuickReply = vi.fn();
    render(
      <ChatMessageStream
        messages={[]}
        profile={mockProfile}
        language="es"
        t={TRANSLATIONS.es}
        quickReplies={["¿Dónde estás?", "Cerveza en mano"]}
        activeRendezvous={null}
        revealedBlurredMediaIds={{}}
        archivedMediaIds={{}}
        messagesEndRef={{ current: null }}
        onQuickReply={handleQuickReply}
        onBurn={vi.fn()}
        onRevealBlurredMedia={vi.fn()}
        onOpenViewerMedia={vi.fn()}
        onArchivePhoto={vi.fn()}
        onRevokeAlbumAccess={vi.fn()}
        onUnrevokeAlbumAccess={vi.fn()}
        onUpdateEncounterTicketStatus={vi.fn()}
        onConfirmH2Ticket={vi.fn()}
        onOpenRendezvousSheet={vi.fn()}
        onCancelRendezvousPin={vi.fn()}
        onUnlockPhase2Waypoint={vi.fn()}
      />
    );

    expect(screen.getByText("Canal Cifrado con CHONGO_TEST")).toBeInTheDocument();
    expect(screen.getByText("¿Dónde estás?")).toBeInTheDocument();
  });
});
