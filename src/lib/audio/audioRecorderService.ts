/**
 * audioRecorderService.ts
 * Servicio de grabación de audio real basado en MediaRecorder + getUserMedia.
 * Formato: audio/webm;codecs=opus (fallback audio/mp4 para Safari).
 */

export type RecordingState = "idle" | "requesting" | "recording" | "stopped" | "error";

export interface AudioRecordingResult {
  blob: Blob;
  durationSeconds: number;
  waveform: number[];
  dataUri: string; // base64 data URI para persistencia en localStorage
}

/** Comprueba si el navegador soporta grabación de audio */
export function isRecordingSupported(): boolean {
  return !!(
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

/** Obtiene el MIME type soportado por el navegador */
function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "audio/webm"; // fallback
}

/** Solicita permiso del micrófono */
export async function requestMicrophoneAccess(): Promise<MediaStream> {
  if (!isRecordingSupported()) {
    throw new Error("MICROPHONE_NOT_SUPPORTED");
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    });
    return stream;
  } catch (err) {
    const error = err as DOMException;
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      throw new Error("MICROPHONE_PERMISSION_DENIED");
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      throw new Error("MICROPHONE_NOT_FOUND");
    }
    throw new Error("MICROPHONE_UNKNOWN_ERROR");
  }
}

/** Convierte un Blob de audio a data URI base64 para persistencia en localStorage */
export function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to data URI"));
      }
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

/** Extrae niveles de amplitud en tiempo real para el visualizador de waveform */
export function getWaveformLevels(analyser: AnalyserNode, barCount: number = 12): number[] {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  const step = Math.floor(dataArray.length / barCount);
  const levels: number[] = [];

  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    const start = i * step;
    for (let j = start; j < start + step && j < dataArray.length; j++) {
      sum += dataArray[j];
    }
    // Normalizar a porcentaje 0-100
    levels.push(Math.round((sum / step / 255) * 100));
  }

  return levels;
}

/**
 * Clase de sesión de grabación de audio.
 * Encapsula MediaRecorder + AnalyserNode para grabación y visualización en tiempo real.
 */
export class AudioRecordingSession {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;
  private maxDurationMs: number;
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null;

  public onWaveformUpdate: ((levels: number[]) => void) | null = null;
  public onRecordingComplete: ((result: AudioRecordingResult) => void) | null = null;
  public onError: ((error: string) => void) | null = null;

  private waveformInterval: ReturnType<typeof setInterval> | null = null;
  private accumulatedWaveform: number[][] = [];

  constructor(maxDurationMs: number = 5000) {
    this.maxDurationMs = maxDurationMs;
  }

  async start(): Promise<void> {
    try {
      this.stream = await requestMicrophoneAccess();
      const mimeType = getSupportedMimeType();

      // Configurar AudioContext + AnalyserNode para visualización
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      // Configurar MediaRecorder
      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.finalizeRecording();
      };

      this.mediaRecorder.onerror = () => {
        this.onError?.("RECORDING_FAILED");
        this.cleanup();
      };

      // Iniciar grabación
      this.startTime = Date.now();
      this.mediaRecorder.start(100); // chunks cada 100ms

      // Waveform en tiempo real
      this.waveformInterval = setInterval(() => {
        if (this.analyser) {
          const levels = getWaveformLevels(this.analyser, 12);
          this.accumulatedWaveform.push(levels);
          this.onWaveformUpdate?.(levels);
        }
      }, 100);

      // Auto-stop al alcanzar duración máxima
      this.autoStopTimer = setTimeout(() => {
        this.stop();
      }, this.maxDurationMs);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "RECORDING_UNKNOWN_ERROR";
      this.onError?.(errorMsg);
      this.cleanup();
    }
  }

  stop(): void {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.waveformInterval) {
      clearInterval(this.waveformInterval);
      this.waveformInterval = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }
  }

  getElapsedSeconds(): number {
    if (this.startTime === 0) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  isActive(): boolean {
    return this.mediaRecorder?.state === "recording";
  }

  private async finalizeRecording(): Promise<void> {
    const durationSeconds = Math.round((Date.now() - this.startTime) / 1000);
    const blob = new Blob(this.chunks, { type: this.chunks[0]?.type || "audio/webm" });

    // Generar waveform promediado para la representación estática
    const waveform = this.computeAverageWaveform();

    try {
      const dataUri = await blobToDataUri(blob);
      this.onRecordingComplete?.({
        blob,
        durationSeconds: Math.max(1, durationSeconds),
        waveform,
        dataUri,
      });
    } catch {
      this.onError?.("DATA_CONVERSION_FAILED");
    }

    this.cleanup();
  }

  private computeAverageWaveform(): number[] {
    if (this.accumulatedWaveform.length === 0) {
      return Array.from({ length: 12 }, () => Math.floor(Math.random() * 60 + 20));
    }

    const barCount = this.accumulatedWaveform[0].length;
    // Tomar muestras distribuidas uniformemente
    const sampleCount = Math.min(13, this.accumulatedWaveform.length);
    const step = Math.max(1, Math.floor(this.accumulatedWaveform.length / sampleCount));
    const result: number[] = [];

    for (let i = 0; i < sampleCount && i * step < this.accumulatedWaveform.length; i++) {
      const sample = this.accumulatedWaveform[i * step];
      const avg = Math.round(sample.reduce((a, b) => a + b, 0) / barCount);
      result.push(Math.max(15, Math.min(100, avg)));
    }

    // Asegurar al menos 10 barras
    while (result.length < 10) {
      result.push(Math.floor(Math.random() * 40 + 20));
    }

    return result;
  }

  private cleanup(): void {
    if (this.waveformInterval) {
      clearInterval(this.waveformInterval);
      this.waveformInterval = null;
    }
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.accumulatedWaveform = [];
  }
}
