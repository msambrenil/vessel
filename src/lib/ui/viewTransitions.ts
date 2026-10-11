/**
 * viewTransitions.ts — Envoltorio seguro y resiliente para la API View Transitions.
 *
 * En navegadores modernos (Chromium / WebKit), `document.startViewTransition` aborta
 * y rechaza su promesa interna `ready` con `InvalidStateError` ("Transition was aborted
 * because of invalid state. Animation start failed") en escenarios habituales:
 * - El usuario pulsa rápidamente varios elementos (interrumpiendo la transición previa).
 * - La pestaña pasa a segundo plano o no está visible (`document.visibilityState !== "visible"`).
 * - El motor gráfico no puede inicializar el snapshot de animación a tiempo.
 *
 * Esta utilidad:
 * 1. Comprueba soporte y visibilidad del documento antes de intentar la transición.
 * 2. Ejecuta el callback en bloque try/catch para garantizar que la navegación o mutación de estado ocurra siempre.
 * 3. Captura silenciosamente los rechazos benignos en las promesas `ready` y `finished` del objeto `ViewTransition`.
 */

export function safeStartViewTransition(updateCallback: () => void | Promise<void>): void {
  if (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof (document as unknown as { startViewTransition?: unknown }).startViewTransition === "function" &&
    document.visibilityState === "visible"
  ) {
    try {
      const transition = (
        document as unknown as {
          startViewTransition: (cb: () => void | Promise<void>) => {
            ready?: Promise<void>;
            finished?: Promise<void>;
            updateCallbackDone?: Promise<void>;
          };
        }
      ).startViewTransition(() => {
        updateCallback();
      });

      // Neutralizar errores de aborto no capturados en las promesas internas del navegador
      if (transition) {
        if (typeof transition.ready?.catch === "function") {
          transition.ready.catch(() => {
            // Benigno: abortado por concurrencia o estado inválido
          });
        }
        if (typeof transition.finished?.catch === "function") {
          transition.finished.catch(() => {
            // Benigno
          });
        }
      }
      return;
    } catch {
      // Fallback síncrono si el navegador lanza antes de inicializar
      updateCallback();
      return;
    }
  }

  // Fallback nativo directo sin View Transitions
  updateCallback();
}
