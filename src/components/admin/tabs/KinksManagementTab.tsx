"use client";

import React, { useState, useEffect, useMemo } from "react";
import { StaffMember } from "@/types/admin";
import { KinkItemDefinition } from "@/data/energyCatalog";
import {
  getAllKinks,
  saveKinksCatalog,
  addCustomKink,
  toggleKinkActiveStatus,
  deleteKink,
  resetKinksToDefault,
} from "@/lib/kinks/kinkAdminService";
import { logAdminAction } from "@/lib/admin/adminService";
import {
  Flame,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  Filter,
  Eye,
  EyeOff,
  Layers,
  X,
} from "lucide-react";

interface KinksManagementTabProps {
  currentStaff: StaffMember;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  bdsm: { label: "BDSM & Poder", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  sensual: { label: "Sensual & Tacto", color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
  roleplay: { label: "Roleplay & Fantasías", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  dynamics: { label: "Dinámicas & Cruising", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  safety: { label: "Salud & Cuidados", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  gear: { label: "Gear & Indumentaria", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  bodily: { label: "Corporal & Scent", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
};

export const KinksManagementTab: React.FC<KinksManagementTabProps> = ({ currentStaff }) => {
  const [kinks, setKinks] = useState<KinkItemDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulario de creación
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🔥");
  const [newCategory, setNewCategory] = useState<KinkItemDefinition["category"]>("dynamics");
  const [newDescription, setNewDescription] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);

  const loadKinks = () => {
    setKinks(getAllKinks());
  };

  useEffect(() => {
    loadKinks();
  }, []);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleToggleStatus = (id: string, name: string) => {
    const nextState = toggleKinkActiveStatus(id);
    loadKinks();
    logAdminAction({
      operatorId: currentStaff.id,
      operatorName: currentStaff.name,
      operatorRole: currentStaff.role,
      action: "KINK_TOGGLED",
      details: `${nextState ? "Activó" : "Desactivó"} el morbo/fetiche '${name}' (ID: ${id})`,
    });
    showToast(`Morbo '${name}' ${nextState ? "activado" : "desactivado"} en la app.`);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar definitivamente el morbo '${name}'?`)) return;
    deleteKink(id);
    loadKinks();
    logAdminAction({
      operatorId: currentStaff.id,
      operatorName: currentStaff.name,
      operatorRole: currentStaff.role,
      action: "KINK_DELETED",
      details: `Eliminó el morbo/fetiche personalizado '${name}' (ID: ${id})`,
    });
    showToast(`Morbo '${name}' eliminado del catálogo.`);
  };

  const handleResetDefaults = () => {
    if (!confirm("¿Restablecer el catálogo a los 35 morbos predeterminados de VESSEL?")) return;
    resetKinksToDefault();
    loadKinks();
    logAdminAction({
      operatorId: currentStaff.id,
      operatorName: currentStaff.name,
      operatorRole: currentStaff.role,
      action: "KINK_UPDATED",
      details: "Restableció el catálogo maestro de morbos a la configuración original de 35 ítems.",
    });
    showToast("Catálogo restablecido a valores predeterminados.");
  };

  const handleCreateKink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = addCustomKink({
      name: newName.trim(),
      emoji: newEmoji.trim() || "🔥",
      category: newCategory,
      description: newDescription.trim() || "Fetiche personalizado configurado por el administrador.",
      isActive: newIsActive,
    });

    logAdminAction({
      operatorId: currentStaff.id,
      operatorName: currentStaff.name,
      operatorRole: currentStaff.role,
      action: "KINK_CREATED",
      details: `Creó el morbo/fetiche '${created.name}' en la categoría '${created.category}'`,
    });

    showToast(`¡Morbo '${created.name}' agregado con éxito!`);
    setNewName("");
    setNewDescription("");
    setNewEmoji("🔥");
    setIsCreateModalOpen(false);
    loadKinks();
  };

  // Filtrado reactivo
  const filteredKinks = useMemo(() => {
    return kinks.filter((k) => {
      const matchSearch =
        k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === "all" || k.category === selectedCategory;

      const isAct = k.isActive !== false;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isAct) ||
        (statusFilter === "inactive" && !isAct);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [kinks, searchQuery, selectedCategory, statusFilter]);

  const activeCount = kinks.filter((k) => k.isActive !== false).length;
  const inactiveCount = kinks.length - activeCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-electricViolet text-white font-bold font-mono text-xs px-4 py-2 rounded-full shadow-violet-soft animate-in fade-in zoom-in-95">
          {feedbackMsg}
        </div>
      )}

      {/* METRICAS DEL CATÁLOGO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-1 shadow-card-elevation">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-electricViolet" />
            Total Morbos / Fetiches
          </div>
          <div className="text-3xl font-black text-white font-mono">{kinks.length}</div>
          <div className="text-[11px] text-neutral-500 font-mono">Disponibles en el sistema</div>
        </div>

        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-1 shadow-card-elevation">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Morbos Activos en App
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{activeCount}</div>
          <div className="text-[11px] text-emerald-500/80 font-mono">Visibles para los usuarios</div>
        </div>

        <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-1 shadow-card-elevation">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <XCircle className="w-4 h-4 text-neutral-400" />
            Morbos Desactivados
          </div>
          <div className="text-3xl font-black text-neutral-400 font-mono">{inactiveCount}</div>
          <div className="text-[11px] text-neutral-500 font-mono">Ocultos de la app</div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS & BÚSQUEDA */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl p-4 space-y-4 shadow-card-elevation">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, palabra clave o descripción..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-electricViolet"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-electricViolet hover:bg-electricViolet-hover text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-violet-soft cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nuevo Morbo
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="Restablecer predeterminados"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FILTROS DE CATEGORÍA Y ESTADO */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-mono text-neutral-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Categoría:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              selectedCategory === "all"
                ? "bg-white text-black font-bold"
                : "bg-white/5 text-neutral-400 hover:text-white"
            }`}
          >
            Todas ({kinks.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, catMeta]) => {
            const count = kinks.filter((k) => k.category === catKey).length;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedCategory === catKey
                    ? "bg-electricViolet text-white font-bold"
                    : "bg-white/5 text-neutral-400 hover:text-white"
                }`}
              >
                {catMeta.label} ({count})
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2 py-1 rounded text-[11px] font-mono ${
                statusFilter === "all" ? "bg-white/20 text-white font-bold" : "text-neutral-400"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-2 py-1 rounded text-[11px] font-mono ${
                statusFilter === "active" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-neutral-400"
              }`}
            >
              Activos ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-2 py-1 rounded text-[11px] font-mono ${
                statusFilter === "inactive" ? "bg-red-500/20 text-red-400 font-bold" : "text-neutral-400"
              }`}
            >
              Inactivos ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* GRILLA DE MORBOS / FETICHES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredKinks.map((kink) => {
          const isActive = kink.isActive !== false;
          const catMeta = CATEGORY_LABELS[kink.category] || {
            label: kink.category,
            color: "text-neutral-400 bg-white/5 border-white/10",
          };

          return (
            <div
              key={kink.id}
              className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3 ${
                isActive
                  ? "bg-obsidian-surface border-white/10 hover:border-electricViolet/50"
                  : "bg-obsidian-deep/60 border-white/5 opacity-60 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-white/5 border border-white/10">
                      {kink.emoji}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        {kink.name}
                        {kink.isCustom && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-electricViolet/20 text-electricViolet-glow uppercase">
                            Admin
                          </span>
                        )}
                      </h4>
                      <span
                        className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-mono border ${catMeta.color}`}
                      >
                        {catMeta.label}
                      </span>
                    </div>
                  </div>

                  {/* Switch Activo/Inactivo */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(kink.id, kink.name)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? "bg-emerald-500" : "bg-neutral-700"
                    }`}
                    title={isActive ? "Desactivar de la app" : "Activar en la app"}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-neutral-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {kink.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                <span className="flex items-center gap-1">
                  {isActive ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Activo en App
                    </span>
                  ) : (
                    <span className="text-neutral-500 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Desactivado
                    </span>
                  )}
                </span>

                {kink.isCustom && (
                  <button
                    type="button"
                    onClick={() => handleDelete(kink.id, kink.name)}
                    className="text-neutral-500 hover:text-bloodNeon transition-colors p-1"
                    title="Eliminar este morbo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredKinks.length === 0 && (
        <div className="p-8 text-center bg-obsidian-surface border border-white/10 rounded-2xl text-neutral-400 font-mono text-sm">
          No se encontraron morbos que coincidan con los filtros seleccionados.
        </div>
      )}

      {/* MODAL CREAR NUEVO MORBO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-obsidian border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <Plus className="w-5 h-5 text-electricViolet" />
                Agregar Nuevo Morbo / Fetiche
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKink} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  Nombre del Morbo / Fetiche *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Axilas / Pits, Musk, Jockstrap, Cuero..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    Emoji Representativo
                  </label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    placeholder="🔥"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-center text-white focus:outline-none focus:border-electricViolet"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as KinkItemDefinition["category"])
                    }
                    className="w-full px-3 py-2 bg-obsidian-surface border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-electricViolet"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, meta]) => (
                      <option key={k} value={k}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">
                  Descripción Corta para el Usuario
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explicación del morbo o fetiche para guiar la sintonía..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-electricViolet"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-mono text-white">Activar de inmediato en la app</span>
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="w-4 h-4 accent-electricViolet rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-electricViolet hover:bg-electricViolet-hover text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-violet-soft"
                >
                  Guardar y Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
