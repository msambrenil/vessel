/**
 * useAudioRecorder.ts
 * Hook React que encapsula el ciclo de vida completo de grabación de audio.
 * Usado por VoiceVibeRecorderModal (5s) y ChatVoiceRecorderInline (60s).
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  AudioRecordingSession,
  AudioRecordingResult,
  isRecordingSupported,
} from "@/lib/audio/audioRecorderService";

export type RecorderStatus = "idle" | "requesting" | "recording" | "recorded" | "error";

export interface UseAudioRecorderOptions {
  maxDurationMs?: number; // Default: 5000 (5s)
  onRecordingComplete?: (result: AudioRecordingResult) => void;
}

export interface UseAudioRecorderReturn {
  status: RecorderStatus;
  isSupported: boolean;
  secondsElapsed: number;
  maxSeconds: number;
  waveformLevels: number[];
  recordedResult: AudioRecordingResult | null;
  errorCode: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  discardRecording: () => void;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn {
  const { maxDurationMs = 5000, onRecordingComplete } = options;
  const maxSeconds = Math.round(maxDurationMs / 1000);

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState<number[]>([20, 30, 40, 30, 20, 35, 25, 40, 30, 20, 35, 28]);
  const [recordedResult, setRecordedResult] = useState<AudioRecordingResult | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const sessionRef = useRef<AudioRecordingSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSupported = isRecordingSupported();

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      sessionRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setStatus("error");
      setErrorCode("MICROPHONE_NOT_SUPPORTED");
      return;
    }

    setStatus("requesting");
    setErrorCode(null);
    setRecordedResult(null);
    setSecondsElapsed(0);

    const session = new AudioRecordingSession(maxDurationMs);
    sessionRef.current = session;

    session.onWaveformUpdate = (levels) => {
      setWaveformLevels(levels);
    };

    session.onRecordingComplete = (result) => {
      setRecordedResult(result);
      setStatus("recorded");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onRecordingComplete?.(result);
    };

    session.onError = (error) => {
      setStatus("error");
      setErrorCode(error);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    session
      .start()
      .then(() => {
        setStatus("recording");
        // Contador de segundos
        timerRef.current = setInterval(() => {
          setSecondsElapsed((prev) => {
            const next = prev + 1;
            if (next >= maxSeconds) {
              // El session se auto-detiene, pero limpiamos el timer
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }
            return next;
          });
        }, 1000);
      })
      .catch((err) => {
        setStatus("error");
        setErrorCode(err instanceof Error ? err.message : "RECORDING_START_FAILED");
      });
  }, [isSupported, maxDurationMs, maxSeconds, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    sessionRef.current?.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const discardRecording = useCallback(() => {
    setRecordedResult(null);
    setStatus("idle");
    setSecondsElapsed(0);
    setErrorCode(null);
    setWaveformLevels([20, 30, 40, 30, 20, 35, 25, 40, 30, 20, 35, 28]);
  }, []);

  return {
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
  };
}
