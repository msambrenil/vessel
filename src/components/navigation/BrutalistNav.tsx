"use client";

import React, { useMemo } from "react";
import { useVessel } from "@/context/VesselContext";
import { LayoutGrid, Activity, MessageCircle, UserCheck, User } from "lucide-react";
import { ActiveNavView } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export const BrutalistNav: React.FC = () => {
  const { activeView, setActiveView, chatMessages, diaryEntries, unreadPulsesCount, t } = useVessel();

  const unreadMessagesCount = useMemo(() => {
    return Object.values(chatMessages).reduce(
      (acc, msgs) =>
        acc + msgs.filter((m) => m.senderId !== "me" && m.senderId !== "system" && !m.isRead).length,
      0
    );
  }, [chatMessages]);

  const upcomingDatesCount = useMemo(() => {
    return diaryEntries.filter((e) => e.isUpcoming).length;
  }, [diaryEntries]);

  const tabs: {
    id: ActiveNavView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = useMemo(
    () => [
      {
        id: "grid",
        label: t.nav.grid,
        icon: LayoutGrid,
      },
      {
        id: "pulses",
        label: t.nav.pulses,
        icon: Activity,
      },
      {
        id: "chat",
        label: t.nav.chat,
        icon: MessageCircle,
      },
      {
        id: "diary",
        label: t.nav.diary,
        icon: UserCheck,
      },
      {
        id: "account",
        label: t.nav.account,
        icon: User,
      },
    ],
    [t.nav.account, t.nav.chat, t.nav.diary, t.nav.grid, t.nav.pulses]
  );

  return (
    <nav
      role="navigation"
      aria-label="Navegación Principal de VESSEL"
      className="fixed bottom-0 left-0 right-0 z-40 bg-obsidian-deep border-t border-white/10 select-none shadow-[0_-8px_30px_rgba(0,0,0,0.9)] pb-[max(env(safe-area-inset-bottom,0px),8px)]"
    >
      <div className="w-full max-w-4xl mx-auto px-1 sm:px-2">
        <div className="grid grid-cols-5 pt-1 pb-1">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;
            const IconComp = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (!isActive) audioEngine.playPulse();
                  setActiveView(tab.id);
                }}
                className={`relative flex flex-col items-center justify-center w-full py-1 h-[50px] sm:h-[52px] rounded-xl transition-all duration-150 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet/70 active:scale-90 ${
                  isActive
                    ? "text-electricViolet-glow bg-electricViolet/[0.06]"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]"
                }`}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Indicador Micro-Pill Superior Activa con Resplandor Violeta */}
                <span
                  className={`absolute -top-1 w-7 h-0.5 rounded-full transition-all duration-200 pointer-events-none ${
                    isActive
                      ? "bg-electricViolet shadow-violet-glow opacity-100 scale-100"
                      : "opacity-0 scale-50"
                  }`}
                />

                <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <IconComp
                    className={`w-5 h-5 transition-all duration-150 ${
                      isActive
                        ? "text-electricViolet-glow stroke-[2.4] scale-105 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                        : "stroke-[1.8] text-neutral-400 group-hover:text-neutral-200"
                    }`}
                  />
                  
                  {/* Badge de Pulsos no leídos */}
                  {tab.id === "pulses" && unreadPulsesCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-bloodNeon text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(255,30,56,0.8)] animate-pulse pointer-events-none">
                      {unreadPulsesCount > 9 ? "9+" : unreadPulsesCount}
                    </span>
                  )}

                  {/* Badge de Mensajes no leídos */}
                  {tab.id === "chat" && unreadMessagesCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-bloodNeon text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(255,30,56,0.8)] animate-pulse pointer-events-none">
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}

                  {/* Pulso de Cita Próxima en Diario */}
                  {tab.id === "diary" && upcomingDatesCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-mintNeon rounded-full shadow-mint-glow animate-pulse pointer-events-none" />
                  )}
                </div>

                <span
                  className={`text-[8.5px] sm:text-[9px] font-mono uppercase tracking-wider mt-1 truncate transition-colors ${
                    isActive ? "text-electricViolet-glow font-black" : "text-neutral-400 font-bold group-hover:text-neutral-200"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
