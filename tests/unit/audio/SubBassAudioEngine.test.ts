import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";

describe("SubBassAudioEngine — Motor Acústico Sub-Bass & Respuesta Háptica", () => {
  const originalVibrate = navigator.vibrate;
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vibrateMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateMock,
      configurable: true,
      writable: true,
    });
    audioEngine.setMuted(false);
    audioEngine.setHapticsEnabled(true);
  });

  afterEach(() => {
    Object.defineProperty(navigator, "vibrate", {
      value: originalVibrate,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it("debe activar y desactivar correctamente el estado de mute y hápticos", () => {
    audioEngine.setMuted(true);
    expect(audioEngine.getIsMuted()).toBe(true);
    audioEngine.setMuted(false);
    expect(audioEngine.getIsMuted()).toBe(false);

    audioEngine.setHapticsEnabled(false);
    expect(audioEngine.getHapticsEnabled()).toBe(false);
    audioEngine.setHapticsEnabled(true);
    expect(audioEngine.getHapticsEnabled()).toBe(true);
  });

  it("debe invocar navigator.vibrate con micro-vibración en triggerTacticalPulse", () => {
    audioEngine.triggerTacticalPulse();
    expect(vibrateMock).toHaveBeenCalledWith(12);
  });

  it("debe invocar navigator.vibrate con doble pulso en triggerWarningHaptic", () => {
    audioEngine.triggerWarningHaptic();
    expect(vibrateMock).toHaveBeenCalledWith([20, 35, 20]);
  });

  it("debe invocar navigator.vibrate con ráfaga SOS en triggerEmergencyBurst", () => {
    audioEngine.triggerEmergencyBurst();
    expect(vibrateMock).toHaveBeenCalledWith([80, 40, 80, 40, 120]);
  });

  it("no debe invocar navigator.vibrate cuando los hápticos están deshabilitados", () => {
    audioEngine.setHapticsEnabled(false);
    audioEngine.triggerTacticalPulse();
    audioEngine.playRadarPing();
    expect(vibrateMock).not.toHaveBeenCalled();
  });

  it("debe disparar respuesta háptica stealth incluso si el audio está silenciado (isMuted = true)", () => {
    audioEngine.setMuted(true);
    audioEngine.playPulse();
    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it("debe invocar patrones táctiles diferenciados según el evento acústico", () => {
    // Éxito / PIN / Validación
    audioEngine.playSuccess();
    expect(vibrateMock).toHaveBeenCalledWith([12, 50, 18]);

    // Error / Alerta
    audioEngine.playError();
    expect(vibrateMock).toHaveBeenCalledWith([30, 40, 30]);

    // Señal enviada ("Yield the space")
    audioEngine.playSignalSent();
    expect(vibrateMock).toHaveBeenCalledWith([20, 30, 45]);
  });
});
