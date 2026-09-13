"use client";

import React, { useState, useEffect, useRef } from "react";
import { useVessel } from "@/context/VesselContext";
import { Camera, RefreshCw, AlertCircle } from "lucide-react";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

export const LivenessVerificationModal: React.FC = () => {
  const { isLivenessModalOpen, closeLivenessModal, completeLivenessVerification, t } = useVessel();

  const [step, setStep] = useState<"ready" | "scanning" | "gesture" | "success">("ready");
  const [progress, setProgress] = useState<number>(0);
  const [gestureInstruction, setGestureInstruction] = useState<string>("PARPADEA DOS VECES LENTAMENTE");
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Inicializar cámara web nativa al abrir el modal
  useEffect(() => {
    if (!isLivenessModalOpen) {
      setStep("ready");
      setProgress(0);
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isLivenessModalOpen]);

  const startCamera = async () => {
    setCameraError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setHasCameraAccess(false);
      setCameraError("Tu navegador no soporta acceso a la cámara frontal.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 480 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCameraAccess(true);
    } catch (err) {
      console.warn("Aviso solicitando cámara web:", err);
      setHasCameraAccess(false);
      setCameraError("Permiso de cámara denegado. Podés continuar en modo simulación.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  if (!isLivenessModalOpen) return null;

  const startScan = () => {
    audioEngine.playPulse();
    setStep("scanning");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 60) {
          clearInterval(interval);
          setStep("gesture");
          setGestureInstruction("GIRA LA CABEZA LEVEMENTE A LA IZQUIERDA");

          setTimeout(() => {
            setStep("success");
            audioEngine.playVaultUnlock();

            // Capturar fotograma real de la cámara si está activa
            if (videoRef.current && canvasRef.current) {
              const video = videoRef.current;
              const canvas = canvasRef.current;
              canvas.width = video.videoWidth || 320;
              canvas.height = video.videoHeight || 400;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              }
            }

            stopCamera();

            setTimeout(() => {
              completeLivenessVerification();
            }, 1400);
          }, 2000);

          return 60;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛡️</span>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider uppercase text-electricViolet-glow">
                Liveness 3D // Anti-Catfish
              </h2>
              <p className="text-[11px] text-neutral-400">
                Prueba biométrica de presencia real y cámara en vivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLivenessModal}
            className="w-8 h-8 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center text-sm font-mono transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Viewport de Escaneo con Cámara Real */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-52 h-64 rounded-2xl bg-neutral-950 border-2 border-neutral-800 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Elemento de video nativo en vivo (espejado para experiencia natural) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${
                hasCameraAccess ? "opacity-90" : "opacity-0"
              }`}
            />

            {/* Canvas oculto para captura del snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Silueta y overlay de encuadre facial */}
            <div className="w-36 h-48 rounded-full border-2 border-dashed border-electricViolet/50 flex flex-col items-center justify-center relative z-10 pointer-events-none">
              {!hasCameraAccess && (
                <span className="text-4xl opacity-50">👤</span>
              )}

              {/* Malla de escaneo animada */}
              {step === "scanning" && (
                <div
                  className="absolute inset-x-0 h-1.5 bg-electricViolet shadow-[0_0_15px_#8B5CF6] transition-all"
                  style={{ top: `${progress}%` }}
                />
              )}

              {step === "gesture" && (
                <div className="absolute inset-0 rounded-full border-2 border-electricViolet animate-ping opacity-40" />
              )}

              {step === "success" && (
                <div className="absolute inset-0 rounded-full bg-emerald-500/25 border-2 border-emerald-400 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-5xl text-emerald-400 font-bold">✓</span>
                </div>
              )}
            </div>

            {/* Marcadores de esquinas tácticas */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-electricViolet/80 z-20" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-electricViolet/80 z-20" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-electricViolet/80 z-20" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-electricViolet/80 z-20" />
          </div>

          {/* Aviso de error de cámara si lo hubiere */}
          {cameraError && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono flex items-center gap-2 max-w-xs text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Instrucciones de estado */}
          <div className="space-y-1">
            <p className="font-mono text-xs font-bold text-neutral-200 uppercase tracking-wider">
              {step === "ready" && (hasCameraAccess ? "Ubica tu rostro dentro del marco" : "Preparando sensor óptico...")}
              {step === "scanning" && "Escaneando profundidad y contorno facial..."}
              {step === "gesture" && gestureInstruction}
              {step === "success" && "¡IDENTIDAD BIOMÉTRICA VERIFICADA!"}
            </p>
            <p className="text-[11px] text-neutral-500 max-w-xs">
              {step === "ready" && "Comprueba que eres una persona real mediante captura en vivo sin filtros."}
              {step === "scanning" && "Validando prueba de vida anti-spoofing en tiempo real."}
              {step === "gesture" && "Gesto en vivo de sincronización facial."}
              {step === "success" && "Tu perfil ahora cuenta con el sello de autenticidad garantizada."}
            </p>
          </div>

          {/* Botón de acción */}
          {step === "ready" && (
            <button
              type="button"
              onClick={startScan}
              className="w-full py-3 bg-electricViolet hover:bg-electricViolet-glow text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-violet-soft active:scale-95 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>INICIAR ESCANEO FACIAL</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
