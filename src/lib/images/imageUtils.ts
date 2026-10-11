/**
 * Comprueba si una URL es candidata a optimización nativa por el optimizador de Next.js (WebP/AVIF).
 * Dominios configurados en next.config.ts (Unsplash, Firebase Storage, Google User Content) y rutas relativas.
 */
export function isOptimizableImageUrl(url?: string | null): boolean {
  if (!url) return false;
  // En desarrollo local o test, el proxy de Next.js (/_next/image) requiere que Node.js
  // haga fetch de la URL remota. En entornos locales o sandboxes sin salida Node, esto
  // falla con 500 y dispara el onError. En desarrollo o test usamos unoptimized={true}
  // para que el navegador descargue la imagen de forma directa y nativa sin proxy.
  if (process.env.NODE_ENV !== "production") return false;
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return (
      host === "images.unsplash.com" ||
      host === "firebasestorage.googleapis.com" ||
      host === "lh3.googleusercontent.com" ||
      host.endsWith(".googleusercontent.com") ||
      host === "googleusercontent.com"
    );
  } catch {
    return false;
  }
}
