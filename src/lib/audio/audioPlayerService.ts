/**
 * audioPlayerService.ts
 * Servicio de reproducción de audio real para Voice Vibes y mensajes de voz.
 * Soporta data URIs (base64) y URLs remotas.
 */

export type PlaybackState = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export interface PlaybackProgress {
  currentTime: number;
  duration: number;
  progress: number; // 0 a 1
}

class AudioPlayerService {
  private audio: HTMLAudioElement | null = null;
  private currentId: string | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  public onStateChange: ((state: PlaybackState, id: string | null) => void) | null = null;
  public onProgress: ((progress: PlaybackProgress, id: string | null) => void) | null = null;

  /**
   * Reproduce audio desde un data URI (base64) o URL.
   * Si ya hay algo reproduciéndose con el mismo ID, lo pausa/reanuda (toggle).
   */
  async play(audioSource: string, id: string): Promise<void> {
    // Toggle: si es el mismo audio, pausar/reanudar
    if (this.currentId === id && this.audio) {
      if (this.audio.paused) {
        await this.audio.play();
        this.onStateChange?.("playing", id);
        this.startProgressTracking();
      } else {
        this.audio.pause();
        this.onStateChange?.("paused", id);
        this.stopProgressTracking();
      }
      return;
    }

    // Detener audio anterior si hay
    this.stop();

    try {
      this.onStateChange?.("loading", id);
      this.currentId = id;

      this.audio = new Audio();
      this.audio.preload = "auto";
      this.audio.src = audioSource;

      this.audio.onended = () => {
        this.onStateChange?.("ended", id);
        this.stopProgressTracking();
        this.currentId = null;
      };

      this.audio.onerror = () => {
        this.onStateChange?.("error", id);
        this.stopProgressTracking();
        this.currentId = null;
      };

      await this.audio.play();
      this.onStateChange?.("playing", id);
      this.startProgressTracking();
    } catch {
      this.onStateChange?.("error", id);
      this.currentId = null;
    }
  }

  /** Pausa la reproducción actual */
  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
      this.onStateChange?.("paused", this.currentId);
      this.stopProgressTracking();
    }
  }

  /** Detiene y limpia completamente */
  stop(): void {
    this.stopProgressTracking();
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio.load(); // liberar recursos
      this.audio = null;
    }
    if (this.currentId) {
      this.onStateChange?.("idle", this.currentId);
      this.currentId = null;
    }
  }

  /** ID del audio actualmente en reproducción */
  getCurrentPlayingId(): string | null {
    if (this.audio && !this.audio.paused && !this.audio.ended) {
      return this.currentId;
    }
    return null;
  }

  /** Verifica si un ID específico está reproduciéndose */
  isPlaying(id: string): boolean {
    return this.currentId === id && !!this.audio && !this.audio.paused && !this.audio.ended;
  }

  /** Duración total del audio actual en segundos */
  getDuration(): number {
    return this.audio?.duration || 0;
  }

  /** Tiempo transcurrido en segundos */
  getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressInterval = setInterval(() => {
      if (this.audio && this.currentId) {
        const duration = this.audio.duration || 1;
        this.onProgress?.(
          {
            currentTime: this.audio.currentTime,
            duration,
            progress: Math.min(1, this.audio.currentTime / duration),
          },
          this.currentId
        );
      }
    }, 100);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

/** Singleton de reproducción de audio — instancia única en toda la app */
export const audioPlayerService = new AudioPlayerService();
