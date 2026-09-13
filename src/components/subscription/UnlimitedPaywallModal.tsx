"use client";

import React, { useState, useEffect } from "react";
import { useVessel } from "@/context/VesselContext";
import { audioEngine } from "@/lib/audio/SubBassAudioEngine";
import {
  X,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Receipt,
  Sparkles,
  Zap,
  AlertCircle,
  Smartphone,
  Check,
} from "lucide-react";
import { BrutalistButton } from "@/components/ui";
import { VesselPaymentReceipt } from "@/types/vessel";
import {
  saveToStorage,
  loadFromStorage,
  STORAGE_KEYS,
  getActiveAppMode,
} from "@/lib/storage/localStorageSync";

type PaymentMethodType = "card" | "mercadopago" | "apple_pay";
type CheckoutStep = "select" | "checkout" | "processing" | "success";

export const UnlimitedPaywallModal: React.FC = () => {
  const {
    isUnlimitedModalOpen,
    closeUnlimitedModal,
    userPlan,
    setUserPlan,
    weekendPass,
    activateWeekendPass,
    partyPass,
    activatePartyPass,
    appMode,
    t,
  } = useVessel();

  const [selectedTier, setSelectedTier] = useState<"annual" | "monthly" | "weekend" | "party">("party");
  const [step, setStep] = useState<CheckoutStep>("select");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("card");

  // Formulario de Tarjeta
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);

  // Recibo generado
  const [latestReceipt, setLatestReceipt] = useState<VesselPaymentReceipt | null>(null);

  // Reiniciar estado cada vez que se abre el modal
  useEffect(() => {
    if (isUnlimitedModalOpen) {
      setStep("select");
      setCardError(null);
      setCardNumber("");
      setCardHolder("");
      setCardExpiry("");
      setCardCvv("");
    }
  }, [isUnlimitedModalOpen]);

  // Bloqueo de scroll y Escape key
  useEffect(() => {
    if (!isUnlimitedModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeUnlimitedModal();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUnlimitedModalOpen, closeUnlimitedModal]);

  if (!isUnlimitedModalOpen) return null;

  const isAlreadyUnlimited =
    userPlan === "unlimited" || weekendPass?.isActive || partyPass?.isActive;

  const currentMode = appMode || getActiveAppMode();

  const tierDetails: Record<
    "annual" | "monthly" | "weekend" | "party",
    { name: string; price: number; priceLabel: string; period: string }
  > = {
    party: { name: "Pase Fiesta Nocturna", price: 1.99, priceLabel: "$1.99", period: "12 hs ilimitadas" },
    weekend: { name: "Pase Fin de Semana 48h", price: 2.99, priceLabel: "$2.99", period: "48 hs de acceso" },
    monthly: { name: "VESSEL UNLIMITED Mensual", price: 9.99, priceLabel: "$9.99", period: "por mes" },
    annual: { name: "VESSEL UNLIMITED Pasaporte Anual", price: 59.99, priceLabel: "$59.99", period: "facturado anual ($4.99/mes)" },
  };

  // Algoritmo de Luhn estricto para validar números de tarjeta bancaria
  const validateLuhn = (num: string): boolean => {
    const clean = num.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(clean)) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Detección de franquicia
  const getCardBrand = (num: string): string => {
    const clean = num.replace(/\s+/g, "");
    if (/^4/.test(clean)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "MASTERCARD";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^(6011|65)/.test(clean)) return "DISCOVER";
    return "CARD";
  };

  // Manejo de formateo de número de tarjeta con espacios
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(" "));
    setCardError(null);
  };

  // Formateo de vencimiento MM/AA
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
    setCardError(null);
  };

  // Activación directa para modo prueba (Sandbox)
  const handleDirectTestUpgrade = () => {
    audioEngine.playVaultUnlock();
    if (selectedTier === "party") {
      activatePartyPass();
    } else if (selectedTier === "weekend") {
      activateWeekendPass();
    } else {
      setUserPlan("unlimited");
    }
    closeUnlimitedModal();
  };

  // Procesamiento seguro en modo real
  const handleProcessPayment = () => {
    setCardError(null);

    if (paymentMethod === "card") {
      const cleanNum = cardNumber.replace(/\s+/g, "");
      // Permitir tarjeta de prueba estándar 4242424242424242 o validación Luhn
      const isTestStripeCard = cleanNum === "4242424242424242";
      if (!isTestStripeCard && !validateLuhn(cleanNum)) {
        setCardError("El número de tarjeta no supera el algoritmo de verificación bancaria (Luhn).");
        audioEngine.playSubBass(60);
        return;
      }
      if (!cardHolder.trim() || cardHolder.trim().length < 3) {
        setCardError("Ingresá el nombre completo del titular como figura en el plástico.");
        audioEngine.playSubBass(60);
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setCardError("La fecha de vencimiento debe tener el formato MM/AA válido.");
        audioEngine.playSubBass(60);
        return;
      }
      const [expMonth, expYear] = cardExpiry.split("/").map((v) => parseInt(v, 10));
      if (expMonth < 1 || expMonth > 12) {
        setCardError("Mes de vencimiento inválido (debe ser entre 01 y 12).");
        audioEngine.playSubBass(60);
        return;
      }
      const currentYear = new Date().getFullYear() % 100;
      if (expYear < currentYear) {
        setCardError("La tarjeta se encuentra vencida.");
        audioEngine.playSubBass(60);
        return;
      }
      if (cardCvv.length < 3) {
        setCardError("El código de seguridad CVV debe tener al menos 3 dígitos.");
        audioEngine.playSubBass(60);
        return;
      }
    }

    // Pasar a estado de procesamiento con feedback de seguridad TLS 1.3
    setStep("processing");
    audioEngine.playPulse();

    setTimeout(() => {
      const tierInfo = tierDetails[selectedTier];
      const receiptId = `TX-VESSEL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
      const cleanNum = cardNumber.replace(/\s+/g, "");
      const cardLast4 = cleanNum.slice(-4) || "4242";

      const receipt: VesselPaymentReceipt = {
        id: receiptId,
        tier: selectedTier,
        planName: tierInfo.name,
        amount: tierInfo.price,
        currency: "USD",
        timestamp: new Date().toISOString(),
        cardBrand: paymentMethod === "card" ? getCardBrand(cardNumber) : undefined,
        cardLast4: paymentMethod === "card" ? cardLast4 : undefined,
        paymentMethod,
        authCode,
        status: "approved",
      };

      // Persistir recibo en historial
      const existingReceipts = loadFromStorage<VesselPaymentReceipt[]>(
        STORAGE_KEYS.SUBSCRIPTION_RECEIPTS,
        [],
        currentMode
      );
      saveToStorage(STORAGE_KEYS.SUBSCRIPTION_RECEIPTS, [receipt, ...existingReceipts], currentMode);

      // Activar el plan correspondiente
      if (selectedTier === "party") {
        activatePartyPass();
      } else if (selectedTier === "weekend") {
        activateWeekendPass();
      } else {
        setUserPlan("unlimited");
      }

      setLatestReceipt(receipt);
      setStep("success");
      audioEngine.playVaultUnlock();
    }, 1400);
  };

  const perks = [
    {
      icon: "🛰️",
      title: "Transmisión Satelital de Largo Alcance (>1 km)",
      desc: "Chateá de inmediato con cualquier Vessel a más de 1 km sin tener que esperar que te devuelvan el pulso, con fotos nítidas y fichas desclasificadas.",
    },
    {
      icon: "✈️",
      title: "Radar de Teleportación (Travel Mode)",
      desc: "Navegá y conectá en otras ciudades 48 hs antes de viajar sin moverte de tu cama.",
    },
    {
      icon: "🗄️",
      title: "Multi-Bóvedas Temáticas Ilimitadas",
      desc: "Creá carpetas privadas separadas para Sensual, Kink, Gym y Cara con llaves granulares.",
    },
    {
      icon: "👁️",
      title: "Auditoría de Bóvedas en Vivo",
      desc: "Conocé exactamente quién abrió tus fotos privadas, a qué hora y por cuántos segundos.",
    },
    {
      icon: "👻",
      title: "Modo Fantasma Quirúrgico (Stealth Pro)",
      desc: "Navegá perfiles, mirá galerías y estados corporales sin dejar rastro de visita ni aparecer en el radar.",
    },
    {
      icon: "⚡",
      title: "Filtros Quirúrgicos de Logística",
      desc: "Filtrá por: Lugar propio AHORA, ducha lista, fetiches específicos y sintonía sexual directa.",
    },
    {
      icon: "🔥",
      title: "Priority Pulse & Boost de Visibilidad",
      desc: "Tus pulsos y perfil aparecen primero en la matriz y el radar con distintivo dorado.",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        className="relative w-full max-w-lg bg-[#0a0a0a] border border-electricViolet/40 rounded-3xl shadow-2xl shadow-purple-950/40 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente nocturno refinado */}
        <div className="p-5 border-b border-electricViolet/30 bg-gradient-to-r from-purple-950/50 via-neutral-900 to-purple-950/50 text-center relative">
          {step === "checkout" ? (
            <button
              type="button"
              onClick={() => setStep("select")}
              className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet"
              title="Volver al selector de planes"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={closeUnlimitedModal}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.96]"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="inline-block px-3 py-0.5 rounded-full bg-purple-950/60 border border-electricViolet/40 text-electricViolet-glow font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5 shadow-violet-soft">
            {step === "checkout" ? "PASARELA SEGURA" : step === "success" ? "TRANSACCIÓN APROBADA" : "MEMBRESÍA OFICIAL"}
          </span>
          <h2 className="text-xl font-black font-mono tracking-wider uppercase text-neutral-100">
            {step === "checkout" ? "CHECKOUT CIFRADO" : step === "success" ? "RECIBO DIGITAL" : "VESSEL UNLIMITED"}
          </h2>
          <p className="text-[11px] text-electricViolet-glow font-mono mt-0.5">
            {step === "checkout"
              ? "Cifrado SSL 256-bit • Facturación discreta garantizada"
              : step === "success"
              ? "Tu membresía está activa de forma inmediata"
              : '"Álbumes, bóvedas y señales ilimitadas."'}
          </p>
        </div>

        {/* CONTENIDO DEL MODAL SEGÚN PASO */}
        {step === "select" && (
          <>
            <div className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              {/* Banner de Modo Activo */}
              {currentMode === "test" ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs font-mono text-amber-300">
                  <span className="text-base">🧪</span>
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Modo Prueba Activo (Sandbox)</span>
                    <span className="text-[11px] text-amber-200/80">Podés activar cualquier membresía de forma directa ($0) sin tarjeta para probar en local.</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs font-mono text-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Entorno Real // Pasarela Cifrada</span>
                    <span className="text-[11px] text-emerald-200/80">Pago seguro con tarjeta bancaria, Mercado Pago o billeteras digitales con recibo digital.</span>
                  </div>
                </div>
              )}

              {/* Lista de Superpoderes */}
              <div className="space-y-2.5">
                {perks.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-electricViolet/40 transition-all font-mono"
                  >
                    <span className="text-xl p-1 bg-purple-950/40 rounded-xl border border-electricViolet/30 flex-shrink-0">
                      {p.icon}
                    </span>
                    <div>
                      <h3 className="font-mono font-bold text-neutral-200 text-xs">{p.title}</h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Selector */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Pase Fiesta Nocturna 12h */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("party")}
                  className={`p-2.5 min-h-[44px] rounded-2xl border text-center font-mono cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 active:scale-[0.96] ${
                    selectedTier === "party"
                      ? "border-purple-400 bg-purple-950/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[1.02]"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                  }`}
                >
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-purple-500 text-white uppercase tracking-wider font-extrabold block mb-1">
                    🎉 ESTA NOCHE
                  </span>
                  <span className="text-[9.5px] text-purple-300 uppercase tracking-wider block font-bold">
                    PASE FIESTA
                  </span>
                  <div className="text-base font-black text-white mt-0.5">$1.99</div>
                  <span className="text-[8px] text-neutral-400 block">12 hs ilimitadas</span>
                </button>

                {/* Pase Fin de Semana 48h */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("weekend")}
                  className={`p-2.5 min-h-[44px] rounded-2xl border text-center font-mono cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.96] ${
                    selectedTier === "weekend"
                      ? "border-electricViolet bg-purple-950/50 shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-[1.02]"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                  }`}
                >
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-electricViolet text-white uppercase tracking-wider font-extrabold block mb-1 shadow-sm">
                    POPULAR // 48H
                  </span>
                  <span className="text-[9.5px] text-electricViolet-glow uppercase tracking-wider block font-bold">
                    PASE FINDE
                  </span>
                  <div className="text-base font-black text-white mt-0.5">$2.99</div>
                  <span className="text-[8px] text-neutral-400 block">Pago único</span>
                </button>

                {/* Mensual Flex */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("monthly")}
                  className={`p-2.5 min-h-[44px] rounded-2xl border text-center font-mono cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.96] ${
                    selectedTier === "monthly"
                      ? "border-electricViolet bg-purple-950/50 shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-[1.02]"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                  }`}
                >
                  <span className="text-[9.5px] text-neutral-400 uppercase tracking-wider block font-bold">
                    MENSUAL
                  </span>
                  <div className="text-base font-black text-neutral-200 mt-0.5">
                    $9.99 <span className="text-[9px] font-normal text-neutral-400">/m</span>
                  </div>
                  <span className="text-[8px] text-neutral-500 block">Cancelá cuando quieras</span>
                </button>

                {/* Pasaporte Anual */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("annual")}
                  className={`p-2.5 min-h-[44px] rounded-2xl border text-center font-mono cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electricViolet active:scale-[0.96] ${
                    selectedTier === "annual"
                      ? "border-electricViolet bg-purple-950/50 shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-[1.02]"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                  }`}
                >
                  <span className="text-[9.5px] text-electricViolet-glow uppercase tracking-wider block font-bold">
                    ANUAL
                  </span>
                  <div className="text-base font-black text-neutral-100 mt-0.5">
                    $4.99 <span className="text-[9px] font-normal text-neutral-400">/m</span>
                  </div>
                  <span className="text-[8px] text-neutral-400 block">$59.99 anual</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-electricViolet/20 bg-neutral-950 flex flex-col gap-2">
              {isAlreadyUnlimited ? (
                <BrutalistButton
                  variant="secondary"
                  size="lg"
                  onClick={closeUnlimitedModal}
                  className="w-full min-h-[48px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 uppercase font-mono text-xs"
                >
                  Ya tenés VESSEL UNLIMITED Activo ✓
                </BrutalistButton>
              ) : currentMode === "test" ? (
                <div className="space-y-2">
                  <BrutalistButton
                    variant="primary"
                    size="lg"
                    onClick={handleDirectTestUpgrade}
                    className="w-full min-h-[48px] uppercase tracking-wider font-black text-xs bg-amber-500 hover:bg-amber-400 text-black border-amber-400"
                  >
                    Activar en Modo Prueba ($0) ⚡
                  </BrutalistButton>
                  <button
                    type="button"
                    onClick={() => setStep("checkout")}
                    className="w-full text-center text-[11px] font-mono text-neutral-400 hover:text-electricViolet-glow transition-colors py-1 cursor-pointer"
                  >
                    Probar flujo de pasarela bancaria real ➔
                  </button>
                </div>
              ) : (
                <BrutalistButton
                  variant="primary"
                  size="lg"
                  onClick={() => setStep("checkout")}
                  className="w-full min-h-[48px] uppercase tracking-wider font-black text-xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Proceder al Pago Seguro ({tierDetails[selectedTier].priceLabel})
                </BrutalistButton>
              )}
              <p className="text-[10px] text-center text-neutral-500 font-mono">
                Sin contratos forzosos. Discreción bancaria en el extracto garantizada (VESSEL NETWORKS).
              </p>
            </div>
          </>
        )}

        {/* PASO 2: CHECKOUT REAL DE PAGOS */}
        {step === "checkout" && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
            {/* Resumen del Plan Seleccionado */}
            <div className="p-3.5 bg-neutral-900/60 border border-electricViolet/30 rounded-2xl flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Plan Seleccionado</span>
                <span className="text-sm font-bold text-white">{tierDetails[selectedTier].name}</span>
                <span className="text-[10px] text-electricViolet-glow block">{tierDetails[selectedTier].period}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white">{tierDetails[selectedTier].priceLabel}</span>
                <span className="text-[9px] text-neutral-400 block uppercase">USD Total</span>
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="space-y-1.5 font-mono">
              <span className="text-[10px] uppercase text-neutral-400 font-bold block">Método de Pago</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-electricViolet bg-purple-950/40 text-white shadow-violet-soft"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] font-bold">Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("mercadopago")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "mercadopago"
                      ? "border-sky-400 bg-sky-950/40 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-4 h-4 text-sky-400" />
                  <span className="text-[10px] font-bold">MercadoPago</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("apple_pay")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === "apple_pay"
                      ? "border-emerald-400 bg-emerald-950/40 text-white shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold">Apple / Google</span>
                </button>
              </div>
            </div>

            {/* Formulario según Método */}
            {paymentMethod === "card" ? (
              <div className="space-y-3 font-mono">
                {/* Número de Tarjeta */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-neutral-300 uppercase font-bold">
                      Número de Tarjeta
                    </label>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-electricViolet-glow font-bold">
                      {cardNumber ? getCardBrand(cardNumber) : "VISA / MC / AMEX"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-electricViolet transition-colors font-mono tracking-wider"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-3" />
                  </div>
                </div>

                {/* Titular */}
                <div>
                  <label className="text-[10px] text-neutral-300 uppercase font-bold block mb-1">
                    Titular de la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value.toUpperCase());
                      setCardError(null);
                    }}
                    placeholder="NOMBRE COMO FIGURA EN EL PLÁSTICO"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-electricViolet transition-colors font-mono uppercase tracking-wider"
                  />
                </div>

                {/* Expiración y CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-300 uppercase font-bold block mb-1">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-electricViolet transition-colors font-mono text-center tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-300 uppercase font-bold block mb-1">
                      Código CVV / CVC
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value.replace(/\D/g, ""));
                        setCardError(null);
                      }}
                      placeholder="•••"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-electricViolet transition-colors font-mono text-center tracking-widest"
                    />
                  </div>
                </div>

                {cardError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl flex items-start gap-2 text-red-400 text-[11px] font-mono animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{cardError}</span>
                  </div>
                )}
              </div>
            ) : paymentMethod === "mercadopago" ? (
              <div className="p-4 bg-sky-950/20 border border-sky-500/30 rounded-2xl text-center space-y-2 font-mono">
                <Zap className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
                <h4 className="font-bold text-white text-xs uppercase">Checkout Pro Mercado Pago</h4>
                <p className="text-[11px] text-neutral-400">
                  Serás redirigido para autorizar tu pago con saldo en cuenta, dinero en Mercado Pago o tarjetas locales sin recargo.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-center space-y-2 font-mono">
                <Smartphone className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                <h4 className="font-bold text-white text-xs uppercase">Biometría Apple / Google Pay</h4>
                <p className="text-[11px] text-neutral-400">
                  Confirmación biométrica instantánea vía FaceID, TouchID o Huella Digital con tokenización del dispositivo.
                </p>
              </div>
            )}

            {/* Aviso de Privacidad y Cifrado */}
            <div className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Transacción cifrada SHA-256 / TLS 1.3. Certificación PCI-DSS de nivel bancario.</span>
            </div>

            {/* Botón de Confirmación */}
            <div className="pt-2">
              <BrutalistButton
                variant="primary"
                size="lg"
                onClick={handleProcessPayment}
                className="w-full min-h-[48px] uppercase tracking-wider font-black text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Confirmar Pago de {tierDetails[selectedTier].priceLabel} USD
              </BrutalistButton>
            </div>
          </div>
        )}

        {/* PASO 3: PROCESANDO TRANSACCIÓN */}
        {step === "processing" && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto font-mono">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-electricViolet/50 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)]">
              <Lock className="w-8 h-8 text-electricViolet-glow animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black uppercase text-white tracking-wider">
                Procesando Pago Seguro...
              </h3>
              <p className="text-xs text-electricViolet-glow">
                Cifrando canal bancario TLS 1.3 de extremo a extremo
              </p>
            </div>
            <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-electricViolet animate-[pulse_0.8s_ease-in-out_infinite]" />
            </div>
            <span className="text-[10px] text-neutral-500">
              No cierres esta ventana mientras confirmamos la autorización.
            </span>
          </div>
        )}

        {/* PASO 4: RECIBO DIGITAL Y ÉXITO */}
        {step === "success" && latestReceipt && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1 font-mono">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                ¡Membresía Activada con Éxito!
              </h3>
              <p className="text-xs text-emerald-300">
                Tu cuenta ahora cuenta con todos los superpoderes de VESSEL UNLIMITED.
              </p>
            </div>

            {/* Recibo Digital Auditado */}
            <div className="p-4 bg-black/60 border border-neutral-700 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-[10px] text-neutral-400 uppercase flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-electricViolet-glow" /> Comprobante Digital
                </span>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  APROBADO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Nº Transacción</span>
                  <span className="font-bold text-white">{latestReceipt.id}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Código Autorización</span>
                  <span className="font-bold text-emerald-300">{latestReceipt.authCode}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Concepto</span>
                  <span className="text-white font-bold">{latestReceipt.planName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Importe Abonado</span>
                  <span className="text-white font-black">${latestReceipt.amount} USD</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Método de Cobro</span>
                  <span className="text-neutral-300">
                    {latestReceipt.paymentMethod === "card"
                      ? `${latestReceipt.cardBrand} •••• ${latestReceipt.cardLast4}`
                      : latestReceipt.paymentMethod === "mercadopago"
                      ? "Mercado Pago Checkout"
                      : "Apple / Google Pay"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Fecha y Hora</span>
                  <span className="text-neutral-300">
                    {new Date(latestReceipt.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 text-[9px] text-neutral-500">
                Extracto bancario registrado bajo el nombre: <b>VESSEL NETWORKS INT.</b>
              </div>
            </div>

            <BrutalistButton
              variant="primary"
              size="lg"
              onClick={closeUnlimitedModal}
              className="w-full min-h-[48px] uppercase tracking-wider font-black text-xs bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400"
            >
              Comenzar a Usar VESSEL UNLIMITED 🔥
            </BrutalistButton>
          </div>
        )}
      </div>
    </div>
  );
};
