"use client";

import React, { useState } from "react";
import { ModerationReport, StaffMember, ManagedUserProfile } from "@/types/admin";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Clock,
  ExternalLink,
  User,
  Check,
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
        return "Perfil trucho / Catfish / Fotos robadas";
      case "harassment_darkroom":
        return "Desubicado / Acoso en el chat";
      case "ghosting_abuse":
        return "Ghosteo reiterado / Dejó plantado";
      case "non_consensual_content":
        return "Fotos íntimas sin consentimiento";
      case "underage_suspicion":
        return "Sospecha de menor de edad";
      case "commercial_spam":
        return "Spam comercial o cobro de servicios";
      case "safety_concern":
        return "Riesgo de seguridad personal";
      default:
        return "Infracción general de normas";
    }
  };

  const getStatusBadge = (status: ModerationReport["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 font-bold text-[10px]">
            PENDIENTE
          </span>
        );
      case "investigating":
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">
            EN REVISIÓN
          </span>
        );
      case "resolved":
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
            RESUELTO
          </span>
        );
      case "dismissed":
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-white/10 font-bold text-[10px]">
            DESESTIMADO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono select-none">
      {/* CABECERA Y FILTROS DE ESTADO */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-bloodNeon" />
            Cola de Denuncias & Moderación Táctica
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gestión de incidentes, protección anti-catfish y cumplimiento de consentimiento mutuo.
          </p>
        </div>

        {/* Filtros de estado rioplatenses con min 40px touch targets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {(
            [
              { id: "pending", label: "Pendientes" },
              { id: "investigating", label: "En revisión" },
              { id: "resolved", label: "Resueltos" },
              { id: "dismissed", label: "Desestimados" },
              { id: "all", label: "Todos" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStatusFilter(tab.id)}
              className={`px-3 py-2 min-h-[40px] rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
                activeStatusFilter === tab.id
                  ? "bg-bloodNeon text-white shadow-lg shadow-bloodNeon/25 border border-bloodNeon"
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
                  <div className="flex items-center gap-2 flex-wrap">
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
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                      Usuario Denunciante
                    </span>
                    <div className="flex items-center gap-3">
                      {report.reporterAvatar ? (
                        <img
                          src={report.reporterAvatar}
                          alt={report.reporterCodename}
                          className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center text-xs font-bold text-neutral-400 flex-shrink-0">
                          {report.reporterCodename[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white">{report.reporterCodename}</div>
                        <div className="text-[10px] text-neutral-500">ID: {report.reporterId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Denunciado con acceso directo 1-clic a la Ficha 360° */}
                  <div className="p-3 rounded-xl bg-bloodNeon/[0.06] border border-bloodNeon/25 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-bloodNeon uppercase tracking-wider font-bold">
                        Usuario Denunciado
                      </span>
                      {reportedUser && (
                        <button
                          type="button"
                          onClick={() => onSelectUserForInspection(reportedUser)}
                          className="px-2.5 py-1 min-h-[36px] rounded-lg bg-electricViolet/20 hover:bg-electricViolet/30 text-electricViolet-glow hover:text-white border border-electricViolet/40 text-[11px] font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                          title={`Abrir ficha 360° de ${report.reportedUserCodename}`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Ficha 360°</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {report.reportedUserAvatar ? (
                        <img
                          src={report.reportedUserAvatar}
                          alt={report.reportedUserCodename}
                          className="w-8 h-8 rounded-full object-cover border border-bloodNeon/40 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-bloodNeon/40 flex items-center justify-center text-xs font-bold text-bloodNeon flex-shrink-0">
                          {report.reportedUserCodename[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white">{report.reportedUserCodename}</div>
                        <div className="text-[10px] text-neutral-400">ID: {report.reportedUserId}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalle de la Denuncia */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    Declaración del Denunciante:
                  </span>
                  <p className="text-neutral-200 leading-relaxed font-sans">{report.details}</p>

                  {report.chatSnippet && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-neutral-400 italic">
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-electricViolet-glow" />
                      Snippet de Darkroom Chat: "{report.chatSnippet}"
                    </div>
                  )}
                </div>

                {/* Acciones de Resolución Táctica */}
                {report.status !== "resolved" && report.status !== "dismissed" ? (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) =>
                        setResolutionNotes({ ...resolutionNotes, [report.id]: e.target.value })
                      }
                      placeholder="Escribí las notas de resolución del operador (se guardarán en el expediente)..."
                      className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-bloodNeon"
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
                        className="px-3.5 py-2 min-h-[44px] rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-colors cursor-pointer touch-manipulation flex items-center gap-1"
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
                        className="px-3.5 py-2 min-h-[44px] rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-xs font-bold transition-colors cursor-pointer touch-manipulation flex items-center gap-1"
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
                        className="px-3.5 py-2 min-h-[44px] rounded-xl bg-bloodNeon text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer touch-manipulation flex items-center gap-1 shadow-md shadow-bloodNeon/20"
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
                        className="px-3.5 py-2 min-h-[44px] rounded-xl bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer touch-manipulation ml-auto"
                      >
                        Desestimar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-neutral-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-emerald-400 font-bold">Resuelto por:</span>{" "}
                      {report.resolvedByStaffName || "Operador"} ({report.resolvedAt})
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        Acción tomada: <span className="text-white font-bold">{report.actionTaken}</span> · Notas: {report.resolutionNotes}
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
