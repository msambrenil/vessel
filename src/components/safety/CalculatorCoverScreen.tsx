"use client";

import React, { useState } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import { verifyPin } from "@/lib/security/cryptoUtils";

export const CalculatorCoverScreen: React.FC = () => {
  const {
    isCoverScreenActive,
    setCoverScreenActive,
    appDisguise,
    language,
    safetyBeacon,
    triggerSafetyDuress,
  } = useVessel();

  // Estados del Bloc de Notas
  const [noteContent, setNoteContent] = useState<string>(
    `// NOTAS_DEL_SISTEMA v2.4 [MEMORIA LOCAL]
// Última modificación: 02-SEP-2026 14:32:10

[RUTINA GYM // SEMANA 34]
- Pecho / Tríceps: Press banca 4x8 (90kg), Fondos en paralelas 3x12, Press militar con mancuernas.
- Espalda / Bíceps: Remo con barra 4x10, Dominadas lastradas +15kg.
- Piernas: Sentadilla profunda 4x8 (120kg), Peso muerto rumano 3x10.

[RECORDATORIOS & TAREAS]
- Pasar a buscar llaves de repuesto.
- Cargar combustible antes del viaje.
- Comprar café de especialidad y creatina monohidrato.`
  );

  // Estados de la Calculadora Real
  const [calcDisplay, setCalcDisplay] = useState<string>("0");
  const [calcPrevValue, setCalcPrevValue] = useState<number | null>(null);
  const [calcOperation, setCalcOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [calcSecretBuffer, setCalcSecretBuffer] = useState<string>("");

  const [tripleTapCount, setTripleTapCount] = useState<number>(0);

  if (!isCoverScreenActive) return null;

  const handleTitleTap = () => {
    audioEngine.triggerTacticalPulse();
    const nextCount = tripleTapCount + 1;
    setTripleTapCount(nextCount);
    if (nextCount >= 3) {
      setCoverScreenActive(false);
      setTripleTapCount(0);
    } else {
      setTimeout(() => setTripleTapCount(0), 1000);
    }
  };

  // Lógica del Bloc de Notas
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteContent(text);
    if (text.endsWith(":salir") || text.endsWith(":exit") || text.endsWith(":vessel")) {
      setCoverScreenActive(false);
    }
  };

  // Lógica de la Calculadora Funcional
  const handleCalcDigit = (digit: string) => {
    audioEngine.triggerTacticalPulse();
    setCalcSecretBuffer((prev) => (prev + digit).slice(-6));

    if (waitingForOperand) {
      setCalcDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setCalcDisplay(calcDisplay === "0" ? digit : calcDisplay + digit);
    }
  };

  const handleCalcDecimal = () => {
    audioEngine.triggerTacticalPulse();
    if (waitingForOperand) {
      setCalcDisplay("0.");
      setWaitingForOperand(false);
    } else if (!calcDisplay.includes(".")) {
      setCalcDisplay(calcDisplay + ".");
    }
  };

  const handleCalcClear = () => {
    audioEngine.triggerTacticalPulse();
    setCalcDisplay("0");
    setCalcPrevValue(null);
    setCalcOperation(null);
    setWaitingForOperand(false);
    setCalcSecretBuffer("");
  };

  const handleCalcToggleSign = () => {
    audioEngine.triggerTacticalPulse();
    const val = parseFloat(calcDisplay);
    if (val !== 0) {
      setCalcDisplay(String(-val));
    }
  };

  const handleCalcPercent = () => {
    audioEngine.triggerTacticalPulse();
    const val = parseFloat(calcDisplay);
    setCalcDisplay(String(val / 100));
  };

  const handleCalcOperator = (nextOp: string) => {
    audioEngine.triggerTacticalPulse();
    const inputValue = parseFloat(calcDisplay);

    if (calcPrevValue === null) {
      setCalcPrevValue(inputValue);
    } else if (calcOperation) {
      const current = calcPrevValue || 0;
      let result = current;
      if (calcOperation === "+") result = current + inputValue;
      else if (calcOperation === "-") result = current - inputValue;
      else if (calcOperation === "×") result = current * inputValue;
      else if (calcOperation === "÷") result = inputValue !== 0 ? current / inputValue : 0;

      setCalcDisplay(String(result));
      setCalcPrevValue(result);
    }

    setWaitingForOperand(true);
    setCalcOperation(nextOp);
  };

  const handleCalcEquals = () => {
    audioEngine.triggerTacticalPulse();

    // 1. Verificación segura contra PIN de coacción configurado por el usuario
    if (safetyBeacon?.duressCode) {
      if (
        verifyPin(calcSecretBuffer, safetyBeacon.duressCode) ||
        verifyPin(calcDisplay, safetyBeacon.duressCode)
      ) {
        triggerSafetyDuress();
        return;
      }
    }

    // 2. Verificación segura contra PIN legítimo de desactivación / desbloqueo
    if (safetyBeacon?.pinCode) {
      if (
        verifyPin(calcSecretBuffer, safetyBeacon.pinCode) ||
        verifyPin(calcDisplay, safetyBeacon.pinCode)
      ) {
        setCoverScreenActive(false);
        return;
      }
    }

    // 3. Fallback de emergencia cuando aún no se ha configurado un PIN personalizado
    if (!safetyBeacon?.pinCode && !safetyBeacon?.duressCode) {
      if (
        calcSecretBuffer.includes("0000") ||
        calcSecretBuffer.includes("1234") ||
        calcDisplay === "0000" ||
        calcDisplay === "1234"
      ) {
        setCoverScreenActive(false);
        return;
      }
    }

    const inputValue = parseFloat(calcDisplay);
    if (calcPrevValue !== null && calcOperation) {
      const current = calcPrevValue;
      let result = current;
      if (calcOperation === "+") result = current + inputValue;
      else if (calcOperation === "-") result = current - inputValue;
      else if (calcOperation === "×") result = current * inputValue;
      else if (calcOperation === "÷") result = inputValue !== 0 ? current / inputValue : 0;

      setCalcDisplay(String(result));
      setCalcPrevValue(null);
      setCalcOperation(null);
      setWaitingForOperand(true);
    }
  };

  const isCalculatorMode = appDisguise?.mode === "calculator";

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d0d0d] text-neutral-300 font-mono flex flex-col select-none animate-in fade-in">
      {/* Top Bar de Camuflaje del Sistema Operativo */}
      <div className="h-10 bg-[#141414] border-b border-neutral-800 px-4 flex items-center justify-between text-xs">
        <div
          onClick={handleTitleTap}
          className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
          title={language === "es" ? "Tocá 3 veces para volver a VESSEL" : "Tap 3 times to return to VESSEL"}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 inline-block" />
          <span className="font-bold tracking-wider uppercase text-neutral-400">
            {isCalculatorMode ? "CALCULADORA.SYS // BÁSICA" : "NOTAS_DEL_SISTEMA.TXT // MEMORIA LOCAL"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
          {isCalculatorMode ? (
            <span>DEG // RAD</span>
          ) : (
            <>
              <span>UTF-8</span>
              <span>LÍNEAS: {noteContent.split("\n").length}</span>
            </>
          )}
          <button
            type="button"
            onClick={() => setCoverScreenActive(false)}
            className="w-5 h-5 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-200 flex items-center justify-center font-bold cursor-pointer"
            title={language === "es" ? "Volver a VESSEL" : "Return to VESSEL"}
          >
            ✕
          </button>
        </div>
      </div>

      {isCalculatorMode ? (
        /* VISTA 1: CALCULADORA REAL Y FUNCIONAL */
        <div className="flex-1 max-w-sm w-full mx-auto p-4 sm:p-6 flex flex-col justify-end space-y-4">
          {/* Display Numérico Digital */}
          <div
            onClick={handleTitleTap}
            className="bg-[#050505] border border-neutral-800/80 rounded-2xl p-5 text-right flex flex-col justify-end min-h-[120px] cursor-pointer"
            title={language === "es" ? "Tocá 3 veces para salir del camuflaje" : "Tap 3 times to exit disguise"}
          >
            <div className="text-neutral-500 text-xs font-mono h-4">
              {calcPrevValue !== null ? `${calcPrevValue} ${calcOperation || ""}` : ""}
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight truncate">
              {calcDisplay}
            </div>
          </div>

          {/* Teclado Táctil */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={handleCalcClear}
              className="h-14 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-amber-400 font-bold text-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              C
            </button>
            <button
              type="button"
              onClick={handleCalcToggleSign}
              className="h-14 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-neutral-200 font-bold text-base flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              ±
            </button>
            <button
              type="button"
              onClick={handleCalcPercent}
              className="h-14 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 text-neutral-200 font-bold text-base flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              %
            </button>
            <button
              type="button"
              onClick={() => handleCalcOperator("÷")}
              className="h-14 rounded-2xl bg-electricViolet/30 hover:bg-electricViolet/50 border border-electricViolet/40 text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              ÷
            </button>

            <button
              type="button"
              onClick={() => handleCalcDigit("7")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleCalcDigit("8")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleCalcDigit("9")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleCalcOperator("×")}
              className="h-14 rounded-2xl bg-electricViolet/30 hover:bg-electricViolet/50 border border-electricViolet/40 text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              ×
            </button>

            <button
              type="button"
              onClick={() => handleCalcDigit("4")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleCalcDigit("5")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleCalcDigit("6")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleCalcOperator("-")}
              className="h-14 rounded-2xl bg-electricViolet/30 hover:bg-electricViolet/50 border border-electricViolet/40 text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              −
            </button>

            <button
              type="button"
              onClick={() => handleCalcDigit("1")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleCalcDigit("2")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleCalcDigit("3")}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleCalcOperator("+")}
              className="h-14 rounded-2xl bg-electricViolet/30 hover:bg-electricViolet/50 border border-electricViolet/40 text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => handleCalcDigit("0")}
              className="col-span-2 h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center pl-7 cursor-pointer active:scale-95 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleCalcDecimal}
              className="h-14 rounded-2xl bg-[#181818] hover:bg-[#222222] text-white font-bold text-xl flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              .
            </button>
            <button
              type="button"
              onClick={handleCalcEquals}
              className="h-14 rounded-2xl bg-electricViolet hover:bg-electricViolet-glow text-white font-bold text-2xl flex items-center justify-center cursor-pointer active:scale-95 shadow-violet-soft transition-all"
            >
              =
            </button>
          </div>

          <div className="text-center text-[10px] text-neutral-600 font-mono pt-1">
            {language === "es"
              ? "Tocá 3 veces la pantalla superior o ingresá 0000= para volver"
              : "Tap 3 times on display or type 0000= to return"}
          </div>
        </div>
      ) : (
        /* VISTA 2: BLOC DE NOTAS 100% EN ESPAÑOL */
        <>
          {/* Barra de menú en español */}
          <div className="h-7 bg-[#111111] border-b border-neutral-800/60 px-4 flex items-center gap-4 text-[11px] text-neutral-400">
            <span className="cursor-pointer hover:text-white transition-colors">
              {language === "es" ? "Archivo" : "File"}
            </span>
            <span className="cursor-pointer hover:text-white transition-colors">
              {language === "es" ? "Edición" : "Edit"}
            </span>
            <span className="cursor-pointer hover:text-white transition-colors">
              {language === "es" ? "Formato" : "Format"}
            </span>
            <span className="cursor-pointer hover:text-white transition-colors">
              {language === "es" ? "Ver" : "View"}
            </span>
            <span className="cursor-pointer hover:text-white transition-colors">
              {language === "es" ? "Ayuda" : "Help"}
            </span>
          </div>

          {/* Editor de texto funcional */}
          <textarea
            value={noteContent}
            onChange={handleNoteChange}
            autoFocus
            spellCheck={false}
            className="flex-1 w-full p-4 bg-[#0a0a0a] text-neutral-300 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-0 border-none select-text"
          />

          {/* Pie de página en español */}
          <div className="h-6 bg-[#141414] border-t border-neutral-800 px-4 flex items-center justify-between text-[10px] text-neutral-500">
            <span>{language === "es" ? "LISTO // INSERTAR" : "READY // INS"}</span>
            <span className="text-neutral-500">
              {language === "es"
                ? "Tocá 3 veces el título o escribí :salir para volver"
                : "Tip: Tap 3 times on title or type :exit to return"}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
