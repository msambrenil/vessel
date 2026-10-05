"use client";

import React, { useState, useEffect, useMemo } from "react";
import { BetaFeedbackReport, BetaReportStatus } from "@/types/vessel";
import {
  subscribeToBetaReports,
  updateBetaReportStatus,
  fetchBetaTesters,
  toggleUserBetaTesterStatus,
} from "@/lib/firebase/betaFeedbackService";
import { createVipInviteCode } from "@/lib/firebase/inviteService";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  Bug,
  Sparkles,
  Zap,
  Activity,
  Search,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Smartphone,
  Copy,
  Plus,
  RefreshCw,
  Filter,
  Check,
  AlertCircle,
  Wrench,
} from "lucide-react";

export const BetaManagementTab: React.FC = () => {
  const [reports, setReports] = useState<BetaFeedbackReport[]>([]);
  const [testers, setTesters] = useState<
    { uid: string; codename: string; avatarUrl?: string; lastActiveAt?: number; isVerified?: boolean }[]
  >([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeneratingVip, setIsGeneratingVip] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<{ [reportId: string]: string }>({});

  useEffect(() => {
    const unsub = subscribeToBetaReports((data) => {
      setReports(data);
    });
    fetchBetaTesters().then(setTesters);
    return () => unsub();
  }, []);

  const handleCreateBetaVip = async () => {
    setIsGeneratingVip(true);
    try {
      audioEngine.playSubBass(60);
      const code = `VESSEL-BETA-${Math.floor(100 + Math.random() * 900)}`;
      await createVipInviteCode({
        code,
        maxUses: 10,
        note: "Pase Oficial para Beta Tester",
      });

      const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/?vip=${code}` : code;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
      }

      setCopiedCode(code);
      audioEngine.playVesselCrescendoAlert();
      setTimeout(() => setCopiedCode(null), 4000);
    } catch (err) {
      console.error("Error al crear código VIP Beta:", err);
    } finally {
      setIsGeneratingVip(false);
    }
  };

  const handleStatusChange = async (reportId: string, status: BetaReportStatus) => {
    audioEngine.playPulse();
    const note = adminNoteInput[reportId] || "";
    await updateBetaReportStatus(reportId, status, note);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (activeFilter !== "all" && r.status !== activeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.userCodename.toLowerCase().includes(q) ||
        r.currentPath.toLowerCase().includes(q)
      );
    });
  }, [reports, activeFilter, searchQuery]);

  const kpis = useMemo(() => {
    const total = reports.length;
    const newCount = reports.filter((r) => r.status === "new").length;
    const investigating = reports.filter((r) => r.status === "investigating").length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    return { total, newCount, investigating, resolved, testersCount: testers.length };
  }, [reports, testers]);

  return (
    <div className="space-y-6">
      {/* Cabecera & Métricas de Testers */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">Total Reportes</span>
          <div className="text-xl font-mono font-black text-white">{kpis.total}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <span className="text-[10px] font-mono text-amber-400 uppercase">Nuevos / Pendientes</span>
          <div className="text-xl font-mono font-black text-amber-300">{kpis.newCount}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-electricViolet/10 border border-electricViolet/30 space-y-1">
          <span className="text-[10px] font-mono text-electricViolet-glow uppercase">En Análisis</span>
          <div className="text-xl font-mono font-black text-white">{kpis.investigating}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase">Resueltos</span>
          <div className="text-xl font-mono font-black text-emerald-300">{kpis.resolved}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-mintNeon/10 border border-mintNeon/30 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono text-mintNeon uppercase">Testers Activos</span>
          <div className="text-xl font-mono font-black text-mintNeon">{kpis.testersCount}</div>
        </div>
      </div>

      {/* Barra de Acciones: Generador de Invitación VIP Beta */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-electricViolet/15 via-black/40 to-black/60 border border-electricViolet/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card-elevation">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-white uppercase tracking-wider">
              GESTIÓN DE PASES VIP BETA
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-electricViolet text-white font-bold">
              1-CLICK VIP LINK
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Generá un link de acceso directo que asigna automáticamente el rol de Beta Tester al nuevo usuario.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateBetaVip}
          disabled={isGeneratingVip}
          className="px-4 py-2.5 min-h-[44px] rounded-xl bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-violet-soft cursor-pointer disabled:opacity-50 touch-manipulation flex-shrink-0"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 text-mintNeon" />
              <span>Pase Copiado: {copiedCode}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Generar Pase VIP Beta</span>
            </>
          )}
        </button>
      </div>

      {/* Filtros & Búsqueda de Reportes */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 w-full sm:w-auto">
          {[
            { id: "all", label: "Todos" },
            { id: "new", label: "Nuevos" },
            { id: "investigating", label: "En Análisis" },
            { id: "resolved", label: "Resueltos" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer touch-manipulation ${
                activeFilter === tab.id
                  ? "bg-electricViolet text-white shadow-violet-soft"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscá por usuario, ruta o palabra..."
            className="w-full min-h-[44px] bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 font-mono focus:outline-none focus:border-electricViolet"
          />
        </div>
      </div>

      {/* Lista de Reportes Tácticos */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-black/30 border border-white/10 space-y-2">
          <Bug className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="font-mono text-xs text-neutral-400 uppercase">No hay reportes de testers en este estado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                report.status === "new"
                  ? "bg-amber-950/15 border-amber-500/40"
                  : report.status === "investigating"
                  ? "bg-electricViolet/10 border-electricViolet/30"
                  : "bg-black/40 border-white/10 opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      report.type === "bug"
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : report.type === "ui_ux"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : report.type === "performance"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    }`}
                  >
                    {report.type.toUpperCase()}
                  </span>
                  <h3 className="font-mono font-bold text-xs text-white uppercase">{report.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                  <span>{new Date(report.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span className="text-white font-bold">{report.userCodename}</span>
                  <span className="text-neutral-500">({report.currentPath})</span>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">{report.description}</p>

              {/* Telemetría capturada */}
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] font-mono text-neutral-400">
                <div>
                  <span className="text-neutral-500">Resolución: </span>
                  <span className="text-white">{report.deviceInfo.screenResolution}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Batería: </span>
                  <span className="text-white">
                    {report.deviceInfo.batteryLevel ? `${Math.round(report.deviceInfo.batteryLevel * 100)}%` : "N/A"}
                  </span>
                </div>
                <div className="truncate col-span-2">
                  <span className="text-neutral-500">Dispositivo: </span>
                  <span className="text-white">{report.deviceInfo.userAgent}</span>
                </div>
              </div>

              {/* Controles de Estado y Notas de Admin */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nota técnica interna (opcional)..."
                    value={adminNoteInput[report.id] ?? report.adminNotes ?? ""}
                    onChange={(e) =>
                      setAdminNoteInput((prev) => ({ ...prev, [report.id]: e.target.value }))
                    }
                    className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-electricViolet w-64"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Estado:</span>
                  <div className="flex items-center gap-1">
                    {(["new", "investigating", "resolved"] as BetaReportStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(report.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          report.status === st
                            ? st === "resolved"
                              ? "bg-emerald-500 text-obsidian-deep shadow-mint-glow"
                              : st === "investigating"
                              ? "bg-electricViolet text-white shadow-violet-soft"
                              : "bg-amber-500 text-obsidian-deep"
                            : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                        }`}
                      >
                        {st === "new" ? "Nuevo" : st === "investigating" ? "Analizando" : "Resuelto"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
