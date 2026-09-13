"use client";

import React, { useState, useMemo } from "react";
import { AdminAuditLogEntry, AuditActionType } from "@/types/admin";
import {
  FileText,
  Search,
  Download,
  Filter,
  Shield,
  Clock,
  User,
  CheckCircle2,
} from "lucide-react";

interface AuditLogsTabProps {
  logs: AdminAuditLogEntry[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        log.operatorName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.targetUserCodename && log.targetUserCodename.toLowerCase().includes(q)) ||
        (log.targetUserId && log.targetUserId.toLowerCase().includes(q)) ||
        log.details.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (selectedActionFilter !== "all" && log.action !== selectedActionFilter) {
        return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedActionFilter]);

  const handleExportLogs = () => {
    const json = JSON.stringify(logs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vessel-audit-log-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case "USER_BANNED":
        return (
          <span className="px-2 py-0.5 rounded bg-bloodNeon/20 text-bloodNeon border border-bloodNeon/40 font-bold text-[10px]">
            BAN
          </span>
        );
      case "USER_SUSPENDED":
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-[10px]">
            SUSPENSIÓN
          </span>
        );
      case "USER_WARNED":
        return (
          <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-bold text-[10px]">
            ADVERTENCIA
          </span>
        );
      case "USER_VERIFIED":
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
            ID VERIFICADO
          </span>
        );
      case "USER_VERIFICATION_REJECTED":
        return (
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-[10px]">
            ID RECHAZADO
          </span>
        );
      case "MEMBERSHIP_GRANTED":
        return (
          <span className="px-2 py-0.5 rounded bg-electricViolet/20 text-electricViolet-glow border border-electricViolet/40 font-bold text-[10px]">
            MEMBRESÍA ALTA
          </span>
        );
      case "MEMBERSHIP_REVOKED":
        return (
          <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300 border border-white/10 font-bold text-[10px]">
            MEMBRESÍA BAJA
          </span>
        );
      case "REPORT_RESOLVED":
        return (
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold text-[10px]">
            REPORTE RESUELTO
          </span>
        );
      case "DURESS_ALERT_CLEARED":
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
            DURESS RESET
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10 font-bold text-[10px]">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono text-xs">
      {/* CABECERA & ACCIONES */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-electricViolet-glow" />
            Registro de Auditoría Inmutable (Audit Trail)
          </h2>
          <p className="text-neutral-400 mt-0.5">
            Trazabilidad completa de operaciones, moderaciones y cambios de cuotas del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportLogs}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 font-bold transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar JSON</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA & FILTRO DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por operador, usuario afectado o detalle..."
            className="w-full bg-obsidian-surface border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-electricViolet"
          />
        </div>

        <select
          value={selectedActionFilter}
          onChange={(e) => setSelectedActionFilter(e.target.value)}
          className="w-full sm:w-auto bg-obsidian-surface border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-electricViolet"
        >
          <option value="all">Todas las acciones</option>
          <option value="USER_VERIFIED">Verificación de ID</option>
          <option value="USER_BANNED">Baneos</option>
          <option value="USER_SUSPENDED">Suspensiones</option>
          <option value="USER_WARNED">Advertencias</option>
          <option value="MEMBERSHIP_GRANTED">Membresías Concedidas</option>
          <option value="REPORT_RESOLVED">Reportes Resueltos</option>
          <option value="QUOTA_SETTINGS_UPDATED">Cuotas Modificadas</option>
          <option value="DURESS_ALERT_CLEARED">Alertas Duress Limpiadas</option>
        </select>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl overflow-hidden shadow-card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-obsidian-deep/90 border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Usuario Destino</th>
                <th className="py-3 px-4">Detalles de Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-neutral-500">
                    No se encontraron registros de auditoría que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{entry.timestamp}</span>
                      </div>
                    </td>

                    {/* Operador */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-white">{entry.operatorName}</div>
                      <div className="text-[10px] text-neutral-500 uppercase">
                        {entry.operatorRole}
                      </div>
                    </td>

                    {/* Acción */}
                    <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(entry.action)}</td>

                    {/* Usuario Afectado */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {entry.targetUserCodename ? (
                        <div>
                          <div className="font-bold text-neutral-200">
                            {entry.targetUserCodename}
                          </div>
                          <div className="text-[10px] text-neutral-500">ID: {entry.targetUserId}</div>
                        </div>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>

                    {/* Detalles */}
                    <td className="py-3 px-4 text-neutral-300 leading-relaxed max-w-md">
                      {entry.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
