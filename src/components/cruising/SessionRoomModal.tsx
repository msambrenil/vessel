"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { SessionRoomCategory } from "@/types/vessel";

export const SessionRoomModal: React.FC = () => {
  const {
    isSessionRoomModalOpen,
    closeSessionRoomModal,
    sessionRooms,
    createSessionRoom,
    joinSessionRoom,
    leaveSessionRoom,
    currentUserUid,
    t,
  } = useVessel();

  const [mode, setMode] = useState<"browse" | "create">("browse");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SessionRoomCategory>("trio");
  const [capacity, setCapacity] = useState<number>(3);
  const [locationName, setLocationName] = useState("Palermo Soho");

  if (!isSessionRoomModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createSessionRoom({
      title,
      description,
      category,
      capacity,
      locationName,
    });
    setMode("browse");
    setTitle("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔥</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100">
                {t.tacticalSuite.cruising.sessionRooms}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Encuentros grupales, tríos y dinámicas con aforo privado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSessionRoomModal}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-950 border-b border-neutral-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setMode("browse")}
            className={`py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              mode === "browse" ? "bg-neutral-800 text-electricViolet-glow font-bold shadow-sm" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Explorar Salas ({sessionRooms.length})
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              mode === "create" ? "bg-electricViolet text-white font-bold shadow-violet-soft" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            + Abrir Sala
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
          {mode === "browse" ? (
            sessionRooms.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 font-mono">
                No hay salas activas en este momento. Abre la primera.
              </div>
            ) : (
              sessionRooms.map((room) => {
                const isMember = room.guestIds.includes(currentUserUid);
                const isFull = room.guestIds.length >= room.capacity;

                return (
                  <div
                    key={room.id}
                    className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-neutral-100">
                            {room.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/40 text-electricViolet-glow border border-electricViolet/30 font-mono text-[9px] uppercase font-bold">
                            {room.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{room.description}</p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs text-neutral-200 font-bold">
                          {room.guestIds.length} / {room.capacity}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">lugares</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500">
                      <span>Anfitrión: <strong className="text-neutral-300 font-mono">{room.hostCodename}</strong> • {room.locationName}</span>
                      {isMember ? (
                        <button
                          type="button"
                          onClick={() => leaveSessionRoom(room.id)}
                          className="px-2.5 py-1 rounded bg-red-950/40 border border-red-800/60 text-red-300 font-mono text-[10px] hover:bg-red-900/60 transition-all"
                        >
                          Salir de la sala
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isFull}
                          onClick={() => joinSessionRoom(room.id)}
                          className={`px-3 py-1 rounded font-mono text-[10px] uppercase font-bold transition-all ${
                            isFull
                              ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                              : "bg-electricViolet hover:bg-electricViolet-glow text-white shadow-violet-soft"
                          }`}
                        >
                          {isFull ? "Sala Completa" : "Pedir Acceso"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Crear Sala */
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                  Título de la Sala / Propuesta:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Trío chill con pileta // Colegiales"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                  Descripción & Morbo:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Qué se busca, ambiente, música, límites acordados..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                    Tipo de Dinámica:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SessionRoomCategory)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-electricViolet font-mono"
                  >
                    <option value="trio">Trío (3 personas)</option>
                    <option value="group_session">Sesión Grupal</option>
                    <option value="kink_lab">Laboratorio Fetiche</option>
                    <option value="chill_hangout">Chill & Relax</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                    Capacidad Máxima:
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={10}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-electricViolet font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider block mb-1">
                  Zona / Ubicación Aproximada:
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Ej: Palermo Soho"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-electricViolet"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-violet-soft active:scale-95 transition-all mt-2"
              >
                Publicar Sala en Radar 🔥
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
