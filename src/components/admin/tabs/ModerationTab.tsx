"use client";

import React, { useState } from "react";
import { ModerationReport, StaffMember, ManagedUserProfile } from "@/types/admin";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  Flame,
  MessageSquare,
  Clock,
  ExternalLink,
  Filter,
} from "lucide-react";

interface ModerationTabProps {
  reports: ModerationReport[];
  currentStaff: StaffMember;
  users: ManagedUserProfile[];
  onResolveReport: (
    reportId: string,
    newStatus: ModerationReport["status"],
    actionTaken: string,
    notes: string
  ) => void;
  onSelectUserForInspection: (user: ManagedUserProfile) => void;
}

export const ModerationTab: React.FC<ModerationTabProps> = ({
  reports,
  currentStaff,
  users,
  onResolveReport,
  onSelectUserForInspection,
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    "all" | "pending" | "investigating" | "resolved" | "dismissed"
  >("pending");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  const filteredReports = reports.filter((r) => {
    if (activeStatusFilter === "all") return true;
    return r.status === activeStatusFilter;
  });

  const getReasonLabel = (reason: ModerationReport["reason"]) => {
    switch (reason) {
      case "catfish_fake_photos":
        return "Foto Falsa / Suplantación / Catfish";
      case "harassment_darkroom":
        return "Acoso en Darkroom Chat";
      case "ghosting_abuse":
        return "Incumplimiento de Protocolo Anti-Ghost";
      case "non_consensual_content":
        return "Contenido No Consentido en Bóveda";
      case "underage_suspicion":
        return "Sospecha de Menor de Edad";
      case "commercial_spam":
        return "Spam Comercial o Cobro de Servicios";
      case "safety_concern":
        return "Riesgo de Seguridad Personal";
      default:
        return "Infracción General de Normas";
    }
  };

  const getStatusBadge = (status: ModerationReport["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-0.5 rounded bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 font-bold text-[10px]">
            PENDIENTE
          </span>
        );
      case "investigating":
        return (
          <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold text-[10px]">
            EN REVISIÓN
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
            RESUELTO
          </span>
        );
      case "dismissed":
        return (
          <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300 border border-white/10 font-bold text-[10px]">
            DESESTIMADO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono">
      {/* CABECERA Y FILTROS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-bloodNeon" />
            Cola de Moderación & Denuncias Comunitarias
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gestión de incidentes, protección anti-catfish y cumplimiento de consentimiento.
          </p>
        </div>

        {/* Selector de Estado de Reporte */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(
            [
              { id: "pending", label: "Pendientes" },
              { id: "investigating", label: "En Revisión" },
              { id: "resolved", label: "Resueltos" },
              { id: "dismissed", label: "Desestimados" },
              { id: "all", label: "Todos" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeStatusFilter === tab.id
                  ? "bg-bloodNeon text-white shadow-lg shadow-bloodNeon/20"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE REPORTES */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-12 text-center text-neutral-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/50 mb-3" />
            <div className="text-sm font-bold text-white">Cola de moderación al día</div>
            <p className="text-xs text-neutral-400 mt-1">
              No hay reportes con estado '{activeStatusFilter}' en este momento.
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const reportedUser = users.find((u) => u.id === report.reportedUserId);
            const notes = resolutionNotes[report.id] || "";

            return (
              <div
                key={report.id}
                className="bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-card-elevation"
              >
                {/* Encabezado del Reporte */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white font-mono">{report.id}</span>
                    <span className="text-xs font-bold text-bloodNeon">
                      [{getReasonLabel(report.reason)}]
                    </span>
                    {getStatusBadge(report.status)}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{report.createdAt}</span>
                  </div>
                </div>

                {/* Partes Involucradas: Denunciante vs Denunciado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Denunciante */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                      Usuario Denunciante
                    </span>
                    <div className="flex items-center gap-2.5">
                      {report.reporterAvatar && (
                        <img
                          src={report.reporterAvatar}
                          alt={report.reporterCodename}
                          className="w-7 h-7 rounded-full object-cover border border-white/20"
                        />
                      )}
                      <div>
                        <div className="font-bold text-white">{report.reporterCodename}</div>
                        <div className="text-[10px] text-neutral-500">ID: {report.reporterId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Denunciado */}
                  <div className="p-3 rounded-xl bg-bloodNeon/[0.05] border border-bloodNeon/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-bloodNeon uppercase tracking-wider font-bold">
                        Usuario Denunciado
                      </span>
                      {reportedUser && (
                        <button
                          type="button"
                          onClick={() => onSelectUserForInspection(reportedUser)}
                          className="text-[10px] text-electricViolet-glow hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          Ver Perfil 360° <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      {report.reportedUserAvatar && (
                        <img
                          src={report.reportedUserAvatar}
                          alt={report.reportedUserCodename}
                          className="w-7 h-7 rounded-full object-cover border border-bloodNeon/40"
                        />
                      )}
                      <div>
                        <div className="font-bold text-white">{report.reportedUserCodename}</div>
                        <div className="text-[10px] text-neutral-500">ID: {report.reportedUserId}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalle de la Denuncia */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                  <span className="text-[10px] text-neutral-400 uppercase">
                    Declaración del Denunciante:
                  </span>
                  <p className="text-neutral-200 leading-relaxed">{report.details}</p>

                  {report.chatSnippet && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-neutral-400 italic">
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-electricViolet-glow" />
                      Snippet de Darkroom Chat: {report.chatSnippet}
                    </div>
                  )}
                </div>

                {/* Acciones de Resolución (Si el reporte está activo) */}
                {report.status !== "resolved" && report.status !== "dismissed" ? (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) =>
                        setResolutionNotes({ ...resolutionNotes, [report.id]: e.target.value })
                      }
                      placeholder="Notas de resolución del operador (se guardarán en el expediente)..."
                      className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-bloodNeon"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onResolveReport(
                            report.id,
                            "resolved",
                            "Penalización de Karma (-25 pts)",
                            notes || "Sanción de respeto aplicada"
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Penalizar -25 Karma
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onResolveReport(
                            report.id,
                            "resolved",
                            "Suspensión preventiva de 48h",
                            notes || "Suspensión de cuenta por queja reiterada"
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 hover:bg-bloodNeon/30 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Suspender 48h
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onResolveReport(
                            report.id,
                            "resolved",
                            "Baneo definitivo de cuenta",
                            notes || "Violación grave de términos de servicio"
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-bloodNeon text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Baneo Definitivo
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onResolveReport(
                            report.id,
                            "dismissed",
                            "Reporte desestimado por falta de mérito",
                            notes || "Sin evidencia suficiente"
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer ml-auto"
                      >
                        Desestimar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neutral-400 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-400 font-bold">Resuelto por:</span>{" "}
                      {report.resolvedByStaffName || "Operador"} ({report.resolvedAt})
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Acción: {report.actionTaken} · Notas: {report.resolutionNotes}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
