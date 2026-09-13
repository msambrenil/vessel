import { describe, it, expect } from "vitest";
import { ChatMessage } from "@/types/vessel";

describe("Album Revocation Logic", () => {
  const createMockMessages = (): Record<string, ChatMessage[]> => ({
    "user-alpha": [
      {
        id: "msg-1",
        senderId: "me",
        text: "Mirá mis fotos",
        mediaAttachment: {
          url: "https://example.com/cover1.jpg",
          mediaType: "photo",
          mode: "permanent",
          sharedAlbumId: "album-001",
          albumTitle: "Galería Pública",
          albumPhotoCount: 3,
        },
        timestamp: "10:00",
      },
      {
        id: "msg-2",
        senderId: "user-alpha",
        text: "¡Genial!",
        timestamp: "10:01",
      },
    ],
    "user-beta": [
      {
        id: "msg-3",
        senderId: "me",
        text: "Te paso la galería",
        mediaAttachment: {
          url: "https://example.com/cover1.jpg",
          mediaType: "photo",
          mode: "permanent",
          sharedAlbumId: "album-001",
          albumTitle: "Galería Pública",
          albumPhotoCount: 3,
        },
        timestamp: "10:05",
      },
      {
        id: "msg-4",
        senderId: "me",
        text: "Y este otro privado",
        mediaAttachment: {
          url: "https://example.com/vault.jpg",
          mediaType: "photo",
          mode: "permanent",
          sharedAlbumId: "album-002",
          albumTitle: "Bóveda VIP",
          albumPhotoCount: 5,
        },
        timestamp: "10:06",
      },
    ],
  });

  it("revoca el acceso a un álbum en un chat individual sin alterar otros chats", () => {
    const chatMessages = createMockMessages();
    const targetProfileId = "user-alpha";
    const albumToRevoke = "album-001";

    // Simular revocación en 1 chat específico
    const updatedThread = chatMessages[targetProfileId].map((m) => {
      if (m.mediaAttachment?.sharedAlbumId === albumToRevoke) {
        return {
          ...m,
          isRevoked: true,
          revokedAt: "2026-09-06T23:45:00.000Z",
          mediaAttachment: {
            ...m.mediaAttachment,
            isRevoked: true,
            revokedAt: "2026-09-06T23:45:00.000Z",
          },
        };
      }
      return m;
    });

    const result: Record<string, ChatMessage[]> = {
      ...chatMessages,
      [targetProfileId]: updatedThread,
    };

    // user-alpha debe tener el álbum revocado
    expect(result["user-alpha"][0].isRevoked).toBe(true);
    expect(result["user-alpha"][0].mediaAttachment?.isRevoked).toBe(true);

    // user-beta debe mantener el álbum activo e intacto
    expect(result["user-beta"][0].isRevoked).toBeFalsy();
    expect(result["user-beta"][0].mediaAttachment?.isRevoked).toBeFalsy();
  });

  it("permite re-compartir (unrevoke) un álbum previamente revocado en un chat", () => {
    const chatMessages = createMockMessages();
    const targetProfileId = "user-alpha";

    // 1. Primero se revoca
    const revokedThread = chatMessages[targetProfileId].map((m) =>
      m.id === "msg-1"
        ? {
            ...m,
            isRevoked: true,
            mediaAttachment: { ...m.mediaAttachment!, isRevoked: true },
          }
        : m
    );
    expect(revokedThread[0].isRevoked).toBe(true);

    // 2. Luego se restaura (unrevoke)
    const restoredThread = revokedThread.map((m) =>
      m.id === "msg-1"
        ? {
            ...m,
            isRevoked: false,
            revokedAt: undefined,
            mediaAttachment: {
              ...m.mediaAttachment!,
              isRevoked: false,
              revokedAt: undefined,
            },
          }
        : m
    );

    expect(restoredThread[0].isRevoked).toBe(false);
    expect(restoredThread[0].mediaAttachment?.isRevoked).toBe(false);
    expect(restoredThread[0].revokedAt).toBeUndefined();
  });

  it("revoca el acceso a un álbum globalmente en todos los chats donde fue compartido", () => {
    const chatMessages = createMockMessages();
    const albumToRevoke = "album-001";

    const nextMessages: Record<string, ChatMessage[]> = {};
    Object.entries(chatMessages).forEach(([profId, thread]) => {
      nextMessages[profId] = thread.map((m) => {
        if (m.mediaAttachment?.sharedAlbumId === albumToRevoke) {
          return {
            ...m,
            isRevoked: true,
            mediaAttachment: { ...m.mediaAttachment, isRevoked: true },
          };
        }
        return m;
      });
    });

    // album-001 debe estar revocado en user-alpha y user-beta
    expect(nextMessages["user-alpha"][0].isRevoked).toBe(true);
    expect(nextMessages["user-beta"][0].isRevoked).toBe(true);

    // El otro álbum (album-002) en user-beta NO debe verse afectado
    expect(nextMessages["user-beta"][1].isRevoked).toBeFalsy();
    expect(nextMessages["user-beta"][1].mediaAttachment?.isRevoked).toBeFalsy();
    expect(nextMessages["user-beta"][1].mediaAttachment?.sharedAlbumId).toBe("album-002");
  });

  it("calcula correctamente los chats activos que tienen acceso a un álbum", () => {
    const chatMessages = createMockMessages();

    const getSharedChatIds = (messages: Record<string, ChatMessage[]>, albumId: string) => {
      const activeIds = new Set<string>();
      Object.entries(messages).forEach(([profId, thread]) => {
        const hasActive = thread.some(
          (m) =>
            m.mediaAttachment?.sharedAlbumId === albumId &&
            !m.isRevoked &&
            !m.mediaAttachment?.isRevoked
        );
        if (hasActive) activeIds.add(profId);
      });
      return Array.from(activeIds);
    };

    // Inicialmente album-001 está en user-alpha y user-beta
    expect(getSharedChatIds(chatMessages, "album-001")).toEqual(["user-alpha", "user-beta"]);
    // album-002 solo está en user-beta
    expect(getSharedChatIds(chatMessages, "album-002")).toEqual(["user-beta"]);

    // Si revocamos en user-alpha
    chatMessages["user-alpha"][0].isRevoked = true;
    chatMessages["user-alpha"][0].mediaAttachment!.isRevoked = true;

    // Ahora solo user-beta tiene acceso activo a album-001
    expect(getSharedChatIds(chatMessages, "album-001")).toEqual(["user-beta"]);
  });
});
