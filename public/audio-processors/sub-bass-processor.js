/**
 * SubBassWorkletProcessor — Procesador de audio en tiempo real fuera del Hilo Principal
 * Sintetiza tonos analógicos sub-graves (45-80Hz) con rampa de amplitud libre de jitter.
 */

class SubBassWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
    this.isPlaying = false;
    this.frequency = 45;
    this.startFreq = 45;
    this.endFreq = 30;
    this.totalSamples = 0;
    this.currentSample = 0;
    this.gain = 0;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === "trigger-pulse") {
        this.frequency = data.frequency || 45;
        this.startFreq = this.frequency;
        this.endFreq = (data.frequency || 45) * 0.7;
        const durationSec = data.duration || 0.4;
        this.totalSamples = Math.floor(sampleRate * durationSec);
        this.currentSample = 0;
        this.isPlaying = true;
        this.phase = 0;

        // Notificar al hilo principal para sincronización háptica en fase de ataque
        this.port.postMessage({ type: "phase-attack" });
      } else if (data && data.type === "stop") {
        this.isPlaying = false;
        this.currentSample = 0;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!output || output.length === 0) return true;

    const channel = output[0];

    if (!this.isPlaying) {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = 0;
      }
      return true;
    }

    for (let i = 0; i < channel.length; i++) {
      if (this.currentSample >= this.totalSamples) {
        this.isPlaying = false;
        channel[i] = 0;
        continue;
      }

      // Progresión normalizada (0.0 -> 1.0)
      const progress = this.currentSample / this.totalSamples;

      // Frecuencia con caída exponencial descendente
      const currentFreq = this.startFreq * Math.pow(this.endFreq / this.startFreq, progress);

      // Envolvente de amplitud (Attack breve de 5ms, luego decaimiento exponencial)
      const attackSamples = Math.floor(sampleRate * 0.005);
      let amp = 0;
      if (this.currentSample < attackSamples) {
        amp = this.currentSample / attackSamples;
      } else {
        amp = Math.exp(-4 * progress);
      }

      // Síntesis analógica senoidal pura
      this.phase += (2 * Math.PI * currentFreq) / sampleRate;
      if (this.phase >= 2 * Math.PI) {
        this.phase -= 2 * Math.PI;
      }

      const sampleValue = Math.sin(this.phase) * amp * 0.6;
      channel[i] = sampleValue;

      // Duplicar en canal estéreo si existe
      if (output[1]) {
        output[1][i] = sampleValue;
      }

      this.currentSample++;
    }

    return true;
  }
}

registerProcessor("sub-bass-processor", SubBassWorkletProcessor);
