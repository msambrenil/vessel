import { BatteryEngineState, BatteryMode, BodyState } from "@/types/vessel";

export interface BatteryEngineConfig {
  isDocumentVisible: boolean;
  myBodyState: BodyState;
  manualEcoSaver: boolean;
  activeView: string;
}

export const INITIAL_BATTERY_STATE: BatteryEngineState = {
  mode: "foreground_active",
  level: 85,
  isCharging: false,
  lastSampledAt: "20:00",
  updateIntervalSeconds: 30,
  highAccuracyGps: true,
  autoEcoActive: false,
  hasHardwareApi: false,
};

export class BatteryStateEngine {
  private batteryLevel: number = 85;
  private isCharging: boolean = false;
  private hasBatteryApi: boolean = false;
  private isInitialized: boolean = false;
  private listeners: ((state: BatteryEngineState) => void)[] = [];

  public async initBatteryListener(onUpdate?: () => void) {
    if (typeof window === "undefined" || this.isInitialized) return;
    this.isInitialized = true;

    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        addEventListener: (type: string, listener: () => void) => void;
      }>;
    };

    if ("getBattery" in nav && typeof nav.getBattery === "function") {
      try {
        const battery = await nav.getBattery();
        this.hasBatteryApi = true;
        this.batteryLevel = Math.round(battery.level * 100);
        this.isCharging = battery.charging;
        if (onUpdate) onUpdate();

        battery.addEventListener("levelchange", () => {
          this.batteryLevel = Math.round(battery.level * 100);
          this.notifyListeners();
          if (onUpdate) onUpdate();
        });

        battery.addEventListener("chargingchange", () => {
          this.isCharging = battery.charging;
          this.notifyListeners();
          if (onUpdate) onUpdate();
        });
      } catch (e) {
        // Fallback silencioso si no está permitido
        this.hasBatteryApi = false;
      }
    }
  }

  public resolveEngineState(config: BatteryEngineConfig): BatteryEngineState {
    const { isDocumentVisible, myBodyState, manualEcoSaver } = config;

    let mode: BatteryMode = "foreground_active";
    let updateIntervalSeconds = 30;
    let highAccuracyGps = true;
    const autoEcoActive = !this.isCharging && this.batteryLevel <= 20;

    if (manualEcoSaver || autoEcoActive) {
      mode = "eco_saver";
      updateIntervalSeconds = 300; // 5 minutos
      highAccuracyGps = false;
    } else if (myBodyState === "dormant") {
      mode = "passive_geofence";
      updateIntervalSeconds = 0; // Solo disparos por cruce de celda Geohash
      highAccuracyGps = false;
    } else if (!isDocumentVisible) {
      mode = "background_coarse";
      updateIntervalSeconds = 900; // 15 minutos (Ubicación por red / Wi-Fi)
      highAccuracyGps = false;
    } else {
      mode = "foreground_active";
      updateIntervalSeconds = 30; // 30 segundos en primer plano
      highAccuracyGps = true;
    }

    return {
      mode,
      level: this.batteryLevel,
      isCharging: this.isCharging,
      lastSampledAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      updateIntervalSeconds,
      highAccuracyGps,
      autoEcoActive,
      hasHardwareApi: this.hasBatteryApi,
    };
  }

  public subscribe(callback: (state: BatteryEngineState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners() {
    // Los suscriptores se actualizarán mediante el ciclo de contexto
  }

  public getBatteryLevel(): number {
    return this.batteryLevel;
  }

  public getIsCharging(): boolean {
    return this.isCharging;
  }

  public getHasBatteryApi(): boolean {
    return this.hasBatteryApi;
  }
}

export const batteryStateEngine = new BatteryStateEngine();
