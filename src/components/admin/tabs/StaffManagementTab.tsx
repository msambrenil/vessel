"use client";

import React, { useState } from "react";
import { StaffMember, StaffRole } from "@/types/admin";
import {
  UserCog,
  UserPlus,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
} from "lucide-react";

interface StaffManagementTabProps {
  staffList: StaffMember[];
  currentStaff: StaffMember;
  onSaveStaffList: (list: StaffMember[]) => void;
  onLogAction: (action: string, details: string) => void;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({
  staffList,
  currentStaff,
  onSaveStaffList,
  onLogAction,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<StaffRole>("moderator");
  const [newNotes, setNewNotes] = useState("");

  const handleAddStaff = () => {
    if (!newName.trim() || !newEmail.trim()) return;

    const newMember: StaffMember = {
      id: `staff-${Date.now().toString().slice(-4)}`,
      name: newName.toUpperCase(),
      email: newEmail.toLowerCase(),
      role: newRole,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: "Nunca",
      notes: newNotes,
    };

    const updated = [...staffList, newMember];
    onSaveStaffList(updated);
    onLogAction(
      "STAFF_CREATED",
      `Nuevo empleado creado: ${newMember.name} con rol ${newMember.role.toUpperCase()}`
    );

    setIsAddModalOpen(false);
    setNewName("");
    setNewEmail("");
    setNewRole("moderator");
    setNewNotes("");
  };

  const handleToggleStatus = (id: string) => {
    const updated = staffList.map((m) => {
      if (m.id === id) {
        return { ...m, isActive: !m.isActive };
      }
      return m;
    });
    onSaveStaffList(updated);
    onLogAction(
      "STAFF_ROLE_CHANGED",
      `Estado de activación modificado para el operador ID ${id}`
    );
  };

  const handleChangeRole = (id: string, role: StaffRole) => {
    const updated = staffList.map((m) => {
      if (m.id === id) {
        return { ...m, role };
      }
      return m;
    });
    onSaveStaffList(updated);
    onLogAction("STAFF_ROLE_CHANGED", `Rol del operador ID ${id} actualizado a ${role.toUpperCase()}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-mono text-xs">
      {/* CABECERA & BOTÓN AGREGAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UserCog className="w-5 h-5 text-electricViolet-glow" />
            Gestión del Equipo Operativo & Permisos (RBAC)
          </h2>
          <p className="text-neutral-400 mt-0.5">
            Administración de cuentas de personal, niveles de autorización y control de acceso.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-electricViolet text-white font-bold hover:bg-electricViolet-glow transition-colors cursor-pointer shadow-violet-soft"
        >
          <UserPlus className="w-4 h-4" />
          <span>Alta de Empleado</span>
        </button>
      </div>

      {/* GUÍA DE ROLES & PERMISOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-electricViolet/30 space-y-2">
          <div className="text-xs font-bold text-electricViolet-glow flex items-center gap-2">
            <Key className="w-4 h-4" />
            SUPERADMIN (ROOT)
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Acceso absoluto e irrestricto. Configuración de cuotas maestras, métricas financieras, altas/bajas de personal y auditoría general.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-blue-500/30 space-y-2">
          <div className="text-xs font-bold text-blue-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            MODERATOR (TRUST & SAFETY)
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Verificación biométrica de identidades, resolución de reportes, sanciones disciplinarias, ajuste de Respect Karma y forzado de Modo Niebla.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/30 space-y-2">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            SUPPORT (CARE & OPS)
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Atención al usuario, consulta de perfiles 360°, resolución de problemas con cuentas y concesión de membresías VESSEL UNLIMITED de cortesía.
          </p>
        </div>
      </div>

      {/* TABLA DE PERSONAL */}
      <div className="bg-obsidian-surface border border-white/10 rounded-2xl overflow-hidden shadow-card-elevation">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-obsidian-deep/90 border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Nivel / Rol</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Último Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffList.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  {/* Operador */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-white/20">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-electricViolet-glow">
                            {member.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{member.name}</div>
                        <div className="text-[10px] text-neutral-500">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 text-neutral-300">{member.email}</td>

                  {/* Selector de Rol */}
                  <td className="py-3 px-4">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value as StaffRole)}
                      disabled={member.id === currentStaff.id}
                      className="bg-obsidian-deep border border-white/10 rounded-lg px-2 py-1 text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-electricViolet disabled:opacity-50"
                    >
                      <option value="superadmin">Superadmin</option>
                      <option value="moderator">Moderator</option>
                      <option value="support">Support</option>
                    </select>
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-4">
                    {member.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactivo
                      </span>
                    )}
                  </td>

                  {/* Último Acceso */}
                  <td className="py-3 px-4 text-neutral-400">{member.lastLoginAt}</td>

                  {/* Acciones */}
                  <td className="py-3 px-4 text-right">
                    {member.id !== currentStaff.id && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(member.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          member.isActive
                            ? "bg-bloodNeon/10 text-bloodNeon border-bloodNeon/30 hover:bg-bloodNeon/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        }`}
                      >
                        {member.isActive ? "Desactivar" : "Activar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE ALTA DE EMPLEADO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-obsidian-surface border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-electricViolet-glow" />
              Nuevo Miembro del Equipo Operativo
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-neutral-400 uppercase">Nombre & Codename</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: FRAN // SAFETY_OPS"
                  className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-electricViolet"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 uppercase">Email Corporativo</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ejemplo@vessel.network"
                  className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-electricViolet"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 uppercase">Rol Asignado</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as StaffRole)}
                  className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-electricViolet"
                >
                  <option value="moderator">Moderator (Trust & Safety)</option>
                  <option value="support">Support (Care & Ops)</option>
                  <option value="superadmin">Superadmin (Root)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 uppercase">Notas & Responsabilidades</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ej: Encargado de verificación nocturna..."
                  className="w-full bg-obsidian-deep border border-white/10 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-electricViolet"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-neutral-400 hover:bg-white/10 font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddStaff}
                disabled={!newName.trim() || !newEmail.trim()}
                className="flex-1 py-2 rounded-xl bg-electricViolet disabled:opacity-40 text-white font-bold hover:bg-electricViolet-glow transition-colors cursor-pointer shadow-violet-soft"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
