"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";

export const CalculatorCoverScreen: React.FC = () => {
  const { isCoverScreenActive, setCoverScreenActive } = useVessel();

  const [noteContent, setNoteContent] = useState<string>(
    `// SYS-SCRATCHPAD v2.4 [LOCAL-DEV]
// Last modified: 02-SEP-2026 14:32:10

[RUTINA GYM // SEMANA 34]
- Pecho / Tríceps: Press banca 4x8 (90kg), Fondos en paralelas 3x12, Press militar con mancuernas.
- Espalda / Bíceps: Remo con barra 4x10, Dominadas lastradas +15kg.
- Piernas: Sentadilla profunda 4x8 (120kg), Peso muerto rumano 3x10.

[TODO & RECORDATORIOS]
- Pasar a buscar llaves de repuesto.
- Cargar combustible antes del viaje.
- Comprar café de especialidad y creatina monohidrato.`
  );

  const [tripleTapCount, setTripleTapCount] = useState<number>(0);

  if (!isCoverScreenActive) return null;

  const handleTitleTap = () => {
    const nextCount = tripleTapCount + 1;
    setTripleTapCount(nextCount);
    if (nextCount >= 3) {
      setCoverScreenActive(false);
      setTripleTapCount(0);
    } else {
      setTimeout(() => setTripleTapCount(0), 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteContent(text);
    // Escape command
    if (text.endsWith(":exit") || text.endsWith(":vessel")) {
      setCoverScreenActive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d0d0d] text-neutral-300 font-mono flex flex-col select-none">
      {/* Top OS Bar */}
      <div className="h-10 bg-[#141414] border-b border-neutral-800 px-4 flex items-center justify-between text-xs">
        <div
          onClick={handleTitleTap}
          className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
          title="SYS_NOTES"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 inline-block" />
          <span className="font-bold tracking-wider uppercase text-neutral-400">
            SCRATCHPAD.TXT // MONO-KERNEL
          </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-500 text-[11px]">
          <span>UTF-8</span>
          <span>LN: {noteContent.split("\n").length}</span>
          <span>CHARS: {noteContent.length}</span>
          <button
            type="button"
            onClick={() => setCoverScreenActive(false)}
            className="w-4 h-4 text-neutral-600 hover:text-neutral-400"
            title="Minimizar"
          >
            _
          </button>
        </div>
      </div>

      {/* Toolbar minimalista */}
      <div className="h-7 bg-[#111111] border-b border-neutral-800/60 px-4 flex items-center gap-4 text-[11px] text-neutral-500">
        <span className="cursor-pointer hover:text-neutral-300">File</span>
        <span className="cursor-pointer hover:text-neutral-300">Edit</span>
        <span className="cursor-pointer hover:text-neutral-300">Format</span>
        <span className="cursor-pointer hover:text-neutral-300">View</span>
        <span className="cursor-pointer hover:text-neutral-300">Help</span>
      </div>

      {/* Editor de texto real y funcional */}
      <textarea
        value={noteContent}
        onChange={handleChange}
        autoFocus
        spellCheck={false}
        className="flex-1 w-full p-4 bg-[#0a0a0a] text-neutral-300 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-0 border-none select-text"
      />

      {/* Footer bar */}
      <div className="h-6 bg-[#141414] border-t border-neutral-800 px-4 flex items-center justify-between text-[10px] text-neutral-500">
        <span>READY // INS</span>
        <span className="text-neutral-600">Tip: Tip tap on logo or type &apos;:exit&apos; to return</span>
      </div>
    </div>
  );
};
