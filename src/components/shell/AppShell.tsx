"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  useRadarMatrix,
  useLogistics,
  useSettings,
  useAuth,
} from "@/context/VesselContext";
import { BrutalistHeader } from "@/components/brand/BrutalistHeader";
import { BrutalistNav } from "@/components/navigation/BrutalistNav";
import { ProfileGridSkeleton } from "@/components/matrix/ProfileGridSkeleton";
import { ModalHost } from "@/components/modals/ModalHost";
import { BetaVipGateScreen } from "@/components/auth/BetaVipGateScreen";
import { getLocalVipVerification } from "@/lib/firebase/inviteService";

import { usePathname } from "next/navigation";
import { ActiveNavView } from "@/types/vessel";

// Banner táctico de telemetría de trayecto y próxima cita agendada
const EnRouteBanner = dynamic(
  () => import("@/components/radar/EnRouteBanner").then((m) => m.EnRouteBanner),
  { ssr: false }
);
const UpcomingEncounterBanner = dynamic(
  () => import("@/components/radar/UpcomingEncounterBanner").then((m) => m.UpcomingEncounterBanner),
  { ssr: false }
);

interface AppShellProps {
  children: React.ReactNode;
  activeViewOverride?: "grid" | "pulses" | "chat" | "diary" | "account";
}

export function AppShell({ children, activeViewOverride }: AppShellProps) {
  const pathname = usePathname();
  const { activeView, setActiveView } = useRadarMatrix();
  const { enRouteState } = useLogistics();
  const { appMode } = useSettings();
  const { isAuthenticated, authUser } = useAuth();

  const [vipGateUnlocked, setVipGateUnlocked] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentView: ActiveNavView = useMemo(() => {
    if (pathname === "/pulses") return "pulses";
    if (pathname === "/chat") return "chat";
    if (pathname === "/diary") return "diary";
    if (pathname === "/account") return "account";
    if (pathname === "/radar" || pathname === "/") return "grid";
    return activeViewOverride || activeView;
  }, [pathname, activeViewOverride, activeView]);

  useEffect(() => {
    if (currentView !== activeView) {
      setActiveView(currentView);
    }
  }, [currentView, activeView, setActiveView]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 35);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (appMode === "real") {
      const check = getLocalVipVerification(authUser?.uid);
      setVipGateUnlocked(check.verified && isAuthenticated);
    }
  }, [appMode, isAuthenticated, authUser]);

  // Si estamos en la consola de administración (/admin) o rutas api, omitir el shell móvil
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/api")) {
    return <>{children}</>;
  }

  // La pantalla de bloqueo VIP se evalúa exclusivamente tras el montaje del cliente para garantizar simetría SSR
  if (isMounted && appMode === "real" && (!isAuthenticated || !vipGateUnlocked)) {
    return <BetaVipGateScreen onVipUnlocked={() => setVipGateUnlocked(true)} />;
  }

  return (
    <div className="flex flex-col flex-1 relative bg-obsidian text-white min-h-screen w-full selection:bg-electricViolet selection:text-white">
      {/* Contenedor Responsivo Centralizado */}
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 relative min-h-screen">
        {/* Cabecera Brutalista Esbelta (App Shell 2.0 - Máxima Área Vertical para Perfiles) */}
        <header className="sticky top-0 z-50 bg-obsidian-deep/95 backdrop-blur-md border-b border-white/10 select-none shadow-sm transition-all duration-200">
          <BrutalistHeader isCompact={currentView === "grid" && isScrolled} />
        </header>

        {/* Banner Táctico de Modo "En Camino" con Telemetría */}
        {enRouteState.isActive && <EnRouteBanner />}

        {/* Recordatorio Táctico de Próxima Cita Agendada (1-Tap Chat & Confirmación) */}
        {currentView === "grid" && <UpcomingEncounterBanner />}

        {/* Contenido de la vista */}
        <main className="flex-1 flex flex-col view-transition-container">
          {children}
        </main>

        {/* Barra de Navegación Monolítica */}
        <BrutalistNav />

        {/* Orquestador Desacoplado de Modales & Overlays */}
        <ModalHost />
      </div>
    </div>
  );
}
