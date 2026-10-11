"use client";

import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  useSettings,
  useChat,
  useDiary,
  useRadarMatrix,
} from "@/context/VesselContext";
import { LayoutGrid, Activity, MessageCircle, UserCheck, User } from "lucide-react";
import { ActiveNavView } from "@/types/vessel";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { safeStartViewTransition } from "@/lib/ui/viewTransitions";

const MotionLink = motion.create(Link);

const ROUTE_MAP: Record<ActiveNavView, string> = {
  grid: "/radar",
  pulses: "/pulses",
  chat: "/chat",
  diary: "/diary",
  account: "/account",
};

export const BrutalistNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeView, setActiveView, unreadPulsesCount } = useRadarMatrix();
  const { t, language } = useSettings();
  const { unreadMessagesCount } = useChat();
  const { diaryEntries } = useDiary();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentTab: ActiveNavView = useMemo(() => {
    if (pathname === "/pulses") return "pulses";
    if (pathname === "/chat") return "chat";
    if (pathname === "/diary") return "diary";
    if (pathname === "/account") return "account";
    if (pathname === "/radar" || pathname === "/") return "grid";
    return activeView;
  }, [pathname, activeView]);

  useEffect(() => {
    if (currentTab !== activeView) {
      setActiveView(currentTab);
    }
  }, [currentTab, activeView, setActiveView]);

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
        label: t.nav.pulses || (language === "es" ? "Toques" : "Taps"),
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
      <div className="w-full max-w-4xl mx-auto px-1.5 sm:px-3">
        <div className="grid grid-cols-5 pt-1 pb-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const IconComp = tab.icon;

            const targetPath = ROUTE_MAP[tab.id];

            return (
              <MotionLink
                key={tab.id}
                href={targetPath}
                prefetch
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  if (!isActive) audioEngine.playPulse();

                  setActiveView(tab.id);

                  if (pathname !== targetPath) {
                    e.preventDefault();
                    safeStartViewTransition(() => {
                      router.push(targetPath);
                    });
                  }
                }}
                className={`relative flex flex-col items-center justify-center w-full py-1 h-[54px] sm:h-[56px] rounded-2xl transition-colors duration-200 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet/70 select-none ${
                  isActive
                    ? "text-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Cápsula Activa Deslizante Gliding con Física de Resorte Fluida y Morphing (layoutId) */}
                {isActive && (
                  <motion.div
                    layoutId="brutalist-nav-pill"
                    className="absolute inset-1 rounded-2xl bg-gradient-to-b from-electricViolet/25 via-electricViolet/15 to-electricViolet/5 border border-electricViolet/50 shadow-[0_0_24px_rgba(139,92,246,0.35),inset_0_1px_4px_rgba(255,255,255,0.2)] pointer-events-none"
                    transition={{
                      type: "spring",
                      stiffness: 340,
                      damping: 28,
                      mass: 0.75,
                    }}
                  />
                )}

                {/* Contenedor del Icono con Elastic Pop, Halo Morfante y Badges */}
                <motion.div
                  className="relative z-10 w-7 h-7 flex items-center justify-center flex-shrink-0"
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 18,
                    mass: 0.6,
                  }}
                >
                  {/* Halo ambiental morphing detrás del ícono activo */}
                  {isActive && (
                    <motion.span
                      layoutId="brutalist-nav-icon-halo"
                      className="absolute inset-0 rounded-full bg-electricViolet/30 filter blur-xs pointer-events-none"
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 26,
                      }}
                    />
                  )}

                  <IconComp
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive
                        ? "text-electricViolet-glow stroke-[2.5] drop-shadow-[0_0_10px_rgba(167,139,250,0.95)]"
                        : "stroke-[1.8] text-neutral-400 group-hover:text-neutral-200"
                    }`}
                  />

                  {/* Badge Exclusivo de Pulsos Entrantes */}
                  {isMounted && tab.id === "pulses" && unreadPulsesCount > 0 && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-1 -right-2.5 z-20 min-w-[16px] h-[16px] text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center px-1 bg-electricViolet shadow-violet-soft animate-pulse pointer-events-none"
                      title={language === "es" ? `${unreadPulsesCount} toques entrantes` : `${unreadPulsesCount} incoming taps`}
                    >
                      {unreadPulsesCount > 9 ? "9+" : unreadPulsesCount}
                    </motion.span>
                  )}

                  {/* Badge Exclusivo de Mensajes No Leídos */}
                  {isMounted && tab.id === "chat" && unreadMessagesCount > 0 && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-1 -right-2.5 z-20 min-w-[16px] h-[16px] text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center px-1 bg-bloodNeon shadow-[0_0_10px_rgba(255,30,56,0.9)] animate-pulse pointer-events-none"
                      title={`${unreadMessagesCount} mensajes sin leer`}
                    >
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </motion.span>
                  )}

                  {/* Pulso de Cita Próxima en Diario */}
                  {isMounted && tab.id === "diary" && upcomingDatesCount > 0 && (
                    <span className="absolute -top-0.5 -right-1 z-20 w-2 h-2 bg-mintNeon rounded-full shadow-mint-glow animate-pulse pointer-events-none" />
                  )}
                </motion.div>

                {/* Etiqueta Tipográfica */}
                <motion.span
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                  }}
                  className={`relative z-10 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider mt-0.5 truncate transition-colors duration-200 ${
                    isActive
                      ? "text-electricViolet-glow font-black drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]"
                      : "text-neutral-400 font-bold group-hover:text-neutral-200"
                  }`}
                >
                  {tab.label}
                </motion.span>
              </MotionLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

