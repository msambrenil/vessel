"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { VoiceSnippet } from "@/types/vessel";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

export const VoiceVibeRecorderModal: React.FC = () => {
  const {
    isVoiceRecorderOpen,
    closeVoiceRecorder,
    myVoiceVibe,
    saveMyVoiceVibe,
    deleteMyVoiceVibe,
    playVoiceVibe,
    activePlayingVoiceId,
    t,
  } = useVessel();

  const {
    status,
    isSupported,
    secondsElapsed,
    maxSeconds,
    waveformLevels,
    recordedResult,
    errorCode,
    startRecording,
    stopRecording,
    discardRecording,
  } = useAudioRecorder({ maxDurationMs: 5000 });

  const [recordedSnippet, setRecordedSnippet] = useState<VoiceSnippet | null>(myVoiceVibe);

  useEffect(() => {
    if (status === 'recorded' && recordedResult) {
      const newSnippet: VoiceSnippet = {
        id: `vv-${Date.now()}`,
        audioUrl: recordedResult.dataUri,
        durationSeconds: Math.ceil(recordedResult.durationSeconds || 5),
        waveform: recordedResult.waveform || [],
        recordedAt: new Date().toISOString(),
        label: "Voz // Perfil verificado",
      };
      setRecordedSnippet(newSnippet);
    }
  }, [status, recordedResult]);

  useEffect(() => {
    if (status === 'idle') {
      setRecordedSnippet(myVoiceVibe);
    }
  }, [myVoiceVibe, status]);

  if (!isVoiceRecorderOpen) return null;

  const handleSave = () => {
    if (recordedSnippet) {
      saveMyVoiceVibe(recordedSnippet);
    }
    closeVoiceRecorder();
  };

  const handleDelete = () => {
    deleteMyVoiceVibe();
    setRecordedSnippet(null);
    discardRecording();
  };

  const isRecording = status === "recording" || status === "requesting";
  const secondsLeft = maxSeconds - secondsElapsed;
  const isPlaying = recordedSnippet ? activePlayingVoiceId === recordedSnippet.id : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎙️</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-neutral-100">
                {t.tacticalSuite.voiceVibe.title}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Audio de 5 segundos para transmitir tono, confianza y presencia real
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeVoiceRecorder}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all"
          >
            ✕
          </button>
        </div>

        {/* Grabador / Visualizador */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-5">
          {!isSupported ? (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl">
              <p className="text-red-400 font-mono text-xs">{t.tacticalSuite.voiceVibe.micNotSupported}</p>
            </div>
          ) : (
            <>
              {/* Círculo de grabación táctico */}
              <div className="relative">
                <button
                  type="button"
                  disabled={isRecording}
                  onClick={startRecording}
                  className={`w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    isRecording
                      ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-lg shadow-red-500/30"
                      : "bg-neutral-900 border-electricViolet/50 hover:border-electricViolet text-electricViolet-glow shadow-violet-soft active:scale-95"
                  }`}
                >
                  <span className="text-2xl">{isRecording ? "⏺" : "🎙️"}</span>
                  <span className="font-mono text-xs font-bold mt-1">
                    {isRecording ? `${secondsLeft}s` : "GRABAR"}
                  </span>
                </button>
                {isRecording && (
                  <div className="absolute -inset-2 rounded-full border border-red-500/40 animate-ping pointer-events-none" />
                )}
              </div>

              {/* Estado o Instrucción */}
              <div>
                {status === "error" ? (
                  <p className="font-mono text-xs text-red-400 font-bold">
                    {errorCode === "not_allowed"
                      ? t.tacticalSuite.voiceVibe.micPermissionDenied
                      : errorCode === "no_device"
                      ? t.tacticalSuite.voiceVibe.micUnavailable
                      : t.tacticalSuite.voiceVibe.recordingFailed}
                  </p>
                ) : (
                  <p className="font-mono text-xs text-neutral-300 font-bold">
                    {isRecording
                      ? "HABLA AHORA — GRABANDO TONO DE VOZ..."
                      : recordedSnippet
                      ? "¡AUDIO CAPTURADO CON ÉXITO!"
                      : "Toca para iniciar la grabación de 5 segundos"}
                  </p>
                )}
                <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                  Di tu apodo, en qué zona andás o qué pinta para hoy.
                </p>
              </div>

              {/* Visualizador de onda */}
              <div className="w-full flex items-end justify-center gap-1.5 h-12 px-4 py-2 bg-neutral-950 border border-neutral-900 rounded-xl">
                {(isRecording ? waveformLevels : recordedSnippet?.waveform || [20, 30, 40, 30, 20]).map((h, i) => (
                  <span
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isRecording
                        ? "bg-red-500"
                        : isPlaying
                        ? "bg-electricViolet animate-pulse"
                        : "bg-purple-500/60"
                    }`}
                    style={{ height: `${Math.max(15, h)}%` }}
                  />
                ))}
              </div>

              {/* Escuchar Preview */}
              {recordedSnippet && !isRecording && (
                <div className="flex items-center gap-3 w-full justify-center">
                  <button
                    type="button"
                    onClick={() => playVoiceVibe(recordedSnippet)}
                    className="px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-mono text-xs flex items-center gap-2 transition-all"
                  >
                    <span>{isPlaying ? "⏸" : "▶"}</span>
                    <span>{isPlaying ? "Reproduciendo..." : "Escuchar Preview"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 rounded-lg border border-red-900/40 bg-red-950/20 hover:bg-red-900/40 text-red-400 font-mono text-xs transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeVoiceRecorder}
            className="px-3 py-1.5 rounded font-mono text-xs text-neutral-400 hover:text-neutral-200"
          >
            {t.common.cancel}
          </button>
          {recordedSnippet && !isRecording && (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-violet-soft active:scale-95 transition-all"
            >
              Guardar en Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
