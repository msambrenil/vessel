// Web Audio API analog synth for physical/carnal sound & haptic feedback

class SubBassAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private hapticsEnabled: boolean = true;
  private fillOscillator: OscillatorNode | null = null;
  private fillGain: GainNode | null = null;

  private initContext() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.fillOscillator) {
      this.stopFillSound();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public getHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  /**
   * Ejecuta vibración táctil física respetando permisos y compatibilidad de hardware.
   * Funciona incluso en modo silenciado para permitir retroalimentación stealth en clubs/darkrooms.
   */
  public triggerHaptic(pattern: number | number[]) {
    if (!this.hapticsEnabled) return;
    if (typeof window === "undefined" || typeof navigator === "undefined") return;
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignorar silenciosamente si el dispositivo bloquea la vibración
      }
    }
  }

  // Micro-vibración táctil rápida (10-12ms) para pings, clics y pulsos
  public triggerTacticalPulse() {
    this.triggerHaptic(12);
  }

  // Doble pulso de alerta táctil (20ms vibración, 35ms pausa, 20ms vibración)
  public triggerWarningHaptic() {
    this.triggerHaptic([20, 35, 20]);
  }

  // Patrón táctil de confirmación exitosa o desbloqueo
  public triggerSuccessHaptic() {
    this.triggerHaptic([15, 40, 25]);
  }

  // Patrón de emergencia táctica / Alerta SOS de alta prioridad
  public triggerEmergencyBurst() {
    this.triggerHaptic([80, 40, 80, 40, 120]);
  }

  // Sutil sonido mecánico de switch para cambios de estado corporal
  public playStateSwitch(state: "open" | "occupied" | "dormant") {
    if (state === "open") {
      this.triggerHaptic(12);
    } else if (state === "occupied") {
      this.triggerHaptic([18, 40, 18]);
    } else {
      this.triggerHaptic(8);
    }

    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);

    if (state === "open") {
      // Tono cálido ascendente (Raw Amber)
      osc.type = "sine";
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    } else if (state === "occupied") {
      // Golpe seco y grave (Cold Concrete)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else {
      // Susurro descendente (Dormant)
      osc.type = "sine";
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Inicio de oscilación de llenado (Hold-to-Fill)
  public startFillSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.fillOscillator) {
      this.stopFillSound();
    }

    const now = this.ctx.currentTime;
    this.fillOscillator = this.ctx.createOscillator();
    this.fillGain = this.ctx.createGain();

    this.fillOscillator.type = "triangle";
    this.fillOscillator.frequency.setValueAtTime(45, now); // Frecuencia de sub-bajo
    this.fillGain.gain.setValueAtTime(0.01, now);
    this.fillGain.gain.linearRampToValueAtTime(0.25, now + 0.1);

    this.fillOscillator.connect(this.fillGain);
    this.fillGain.connect(this.ctx.destination);

    this.fillOscillator.start(now);
  }

  // Modula la frecuencia a medida que el recipiente se llena
  public updateFillProgress(progress: number) {
    if (this.isMuted || !this.ctx || !this.fillOscillator || !this.fillGain) return;

    const clamped = Math.min(Math.max(progress, 0), 1);
    const now = this.ctx.currentTime;
    
    // Sube de 45Hz a 110Hz con vibración creciente
    const freq = 45 + clamped * 65;
    this.fillOscillator.frequency.setValueAtTime(freq, now);
    this.fillGain.gain.setValueAtTime(0.1 + clamped * 0.25, now);
  }

  // Detiene el sonido de llenado
  public stopFillSound() {
    if (!this.fillOscillator || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (this.fillGain) {
        this.fillGain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      }
      this.fillOscillator.stop(now + 0.05);
    } catch {
      // Ignorar si ya estaba detenido
    }
    this.fillOscillator = null;
    this.fillGain = null;
  }

  // Sonido de señal transmitida al completar el llenado ("Yield the space")
  public playSignalSent() {
    this.stopFillSound();
    this.triggerHaptic([20, 30, 45]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.55);
    subOsc.stop(now + 0.55);
  }

  // Pulso general de interfaz o mensaje
  public playPulse() {
    this.playRadarPing();
  }

  // Pulso profundo de sub-bajo a medida (ej: 45Hz)
  public playSubBass(frequency: number = 45, duration: number = 0.4) {
    this.triggerHaptic(Math.min(Math.round(duration * 50), 30));
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.7, now + duration);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // Pulso de Radar
  public playRadarPing() {
    this.triggerHaptic(10);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Desbloqueo de Bóveda Privada
  public playVaultUnlock() {
    this.triggerHaptic([15, 30, 25, 40, 35]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(70, now);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.3);

    osc2.frequency.setValueAtTime(105, now);
    osc2.frequency.exponentialRampToValueAtTime(210, now + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(1200, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // Tono de éxito / Validación / PIN de encuentro (armónicos cálidos)
  public playSuccess() {
    this.triggerHaptic([12, 50, 18]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    osc1.frequency.setValueAtTime(65, now);
    osc1.frequency.exponentialRampToValueAtTime(130, now + 0.15);

    osc2.frequency.setValueAtTime(130, now);
    osc2.frequency.exponentialRampToValueAtTime(260, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  // Tono de error o alerta
  public playError() {
    this.triggerHaptic([30, 40, 30]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Generador de frecuencias de ambiente tácticas para Hospedaje (Soundtrack Vibe)
  private ambientInterval: NodeJS.Timeout | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  public playAmbientPreview(vibe: string) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    this.stopAmbientPreview();

    const now = this.ctx.currentTime;

    if (vibe === "dark_techno" || vibe === "berlin_industrial") {
      // Pulso rítmico simulando kick/sub a 128 BPM (~468ms)
      const intervalMs = vibe === "dark_techno" ? 468 : 520;
      let count = 0;
      const playBeat = () => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = vibe === "berlin_industrial" ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(vibe === "berlin_industrial" ? 75 : 55, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
        count++;
        if (count >= 12) {
          this.stopAmbientPreview();
        }
      };
      playBeat();
      this.ambientInterval = setInterval(playBeat, intervalMs);
    } else {
      // Tono continuo sub-bass o sensual (50Hz / 60Hz con filtro sutil)
      const freq = vibe === "subbass_50hz" ? 50 : vibe === "sensual_downtempo" ? 65 : 45;
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(150, now);

      this.ambientOsc.type = "sine";
      this.ambientOsc.frequency.setValueAtTime(freq, now);

      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.2, now + 0.5);

      this.ambientOsc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start(now);

      // Auto-detener después de 6 segundos
      this.ambientInterval = setTimeout(() => {
        this.stopAmbientPreview();
      }, 6000);
    }
  }

  public stopAmbientPreview() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      clearTimeout(this.ambientInterval as unknown as NodeJS.Timeout);
      this.ambientInterval = null;
    }
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {}
      this.ambientOsc = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }
}

export const audioEngine = new SubBassAudioEngine();
