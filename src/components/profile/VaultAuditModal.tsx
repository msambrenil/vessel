"use client";

import React from "react";
import { useVessel } from "@/context/VesselContext";

export const VaultAuditModal: React.FC = () => {
  const {
    isVaultAuditModalOpen,
    closeVaultAuditModal,
    vaultAuditLogs,
    t,
  } = useVessel();

  if (!isVaultAuditModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">👁️</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100">
                {t.tacticalSuite.unlimited.vaultAudit}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Auditoría en tiempo real de apertura de fotos íntimas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeVaultAuditModal}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Lista de accesos */}
        <div className="p-4 overflow-y-auto space-y-2.5 text-xs flex-1">
          {vaultAuditLogs.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 font-mono">
              Aún no se registran aperturas recientes de tus bóvedas privadas.
            </div>
          ) : (
            vaultAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/40 flex items-center justify-between hover:border-neutral-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-electricViolet/40 flex items-center justify-center font-mono font-bold text-purple-200 text-xs shadow-violet-soft">
                    {log.viewerCodename.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-neutral-200">
                        {log.viewerCodename}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        desbloqueó
                      </span>
                    </div>
                    <p className="text-[11px] text-electricViolet-glow font-mono truncate max-w-[180px]">
                      {log.vaultTitle}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono block">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} hs • Visualizado por {log.durationSeconds}s
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Llave de acceso revocada para ${log.viewerCodename}`)}
                  className="px-2.5 py-1 rounded bg-red-950/30 border border-red-800/50 hover:bg-red-900/50 text-red-400 font-mono text-[10px] uppercase transition-all"
                >
                  Revocar Llave
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>Control Criptográfico Granular</span>
          <button
            type="button"
            onClick={closeVaultAuditModal}
            className="px-3 py-1 rounded font-mono text-xs text-neutral-300 hover:text-white"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
};
