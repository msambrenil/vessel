# Errores Conocidos, Casos Borde y Mitigaciones en VESSEL

Registro de problemas comunes de usabilidad, contraste, foco en teclado y ajustes de responsive móvil con sus soluciones probadas.

---

## 1. Usabilidad & Audio en Navegadores Móviles (Safari / Chrome)

- **Gotcha**: `AudioContext was not allowed to start` debido a restricciones de autoplay en WebKit/Blink antes del primer gesto del usuario.
- **Solución**:
  - En `SubBassAudioEngine.ts`, el `AudioContext` se instancia de forma perezosa (*lazy*) al primer toque y se ejecuta `ctx.resume()` antes de cualquier oscilador.
  - Se garantiza un interruptor maestro de silencio en el header y en `AppSettingsModal`.

---

## 2. Soluciones de Contraste y Legibilidad (WCAG AA)

- **Gotcha**: Texto blanco o ámbar poco legible sobre fotografías de perfiles con fondos claros o saturados.
- **Solución**:
  - Toda tarjeta de perfil y vista hero implementa una capa de degradado cinematográfico negro (`bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none`).
  - Los badges flotantes utilizan fondo semitransparente con desenfoque de fondo (`bg-black/70 backdrop-blur-md border border-white/10`).

---

## 3. Navegación por Teclado y Foco Accesible

- **Gotcha**: Botones estilizados con `outline-none` que pierden visibilidad al navegar con tecla Tab o lectores de pantalla.
- **Solución**:
  - Aplicar `focus-visible:ring-2 focus-visible:ring-rawAmber focus-visible:ring-offset-2 focus-visible:ring-offset-black` en todos los elementos interactivos.
  - Los modales implementan captura de tecla `Escape` y cierre al tocar fuera del contenedor principal.

---

## 4. Ajustes de Responsive Móvil y Safe Areas

- **Gotcha 1 (Solapamiento con Bottom Nav)**: El contenido inferior de las vistas queda tapado por la barra fija de navegación.
  - **Solución**: Padding inferior obligatorio `pb-28` en el contenedor de cada vista principal.
- **Gotcha 2 (Pantallas Ultra-Compactas <360px)**: Desbordamiento horizontal en tabs o grillas de 5 columnas.
  - **Solución**: `truncate`, `whitespace-nowrap`, iconos SVG vectoriales de tamaño exacto (`w-4 h-4` / `w-5 h-5`) y `max-w-lg mx-auto`.
- **Gotcha 3 (Safe-Areas de iOS / Notches)**: La barra de inicio de iPhone solapa botones inferiores.
  - **Solución**: Soporte de padding variable `pb-[calc(1.5rem+env(safe-area-inset-bottom))]` en modales y navegación fija.

---

## 5. Desajuste de Hidratación SSR (Hydration Mismatch)

- **Gotcha**: `Hydration failed because the server rendered HTML didn't match the client` al leer `localStorage` en los inicializadores de estado (`useState(() => loadFromStorage(...))`), `window.innerWidth` o APIs de hardware durante el renderizado inicial del servidor.
- **Solución**: Inicialización determinista con constantes fijas (`INITIAL_MY_PROFILE`, `INITIAL_MY_ALBUMS`, `INITIAL_APP_SETTINGS`, `INITIAL_BOUNDARIES`, `INITIAL_BATTERY_STATE`, etc.) durante SSR y primer render del cliente, postergando la lectura y sincronización de `localStorage` y hardware a un hook `useEffect` tras el montaje en el navegador.

---

## 6. Operabilidad Táctil y Touch Targets en Celulares

- **Gotcha**: Botones y chips de fetiches o energías pequeños (<36px) que generan frustración y toques erróneos en pantallas táctiles.
- **Solución**:
  - Todo botón o elemento interactivo tiene una dimensión mínima de impacto de **44×44px** o padding `p-2.5` / `p-3`.
  - Los selectores de fetiches y filtros se disponen en rejillas de 2 columnas con espacio amplio o chips de fácil pulsación con un solo pulgar.

---

## 7. Solapamiento de Badges en Tarjetas de Perfil (ProfileCard)

- **Gotcha**: En cuadrículas densas (4 o 5 columnas en desktop o 3 en mobile), múltiples posicionamientos absolutos fijos (`top-2` y `top-8`) provocaban que las insignias de distancia, modo niebla, hosting inmediato y energía deseada colisionaran físicamente entre sí, tapando la fotografía y recortando el texto.
- **Solución**:
  - Unificar todos los badges superiores en un único contenedor estructural `absolute top-2 inset-x-2 flex flex-col gap-1.5 z-10`.
  - Distribuir la primera fila (distancia a la izquierda y micro-insignias a la derecha) y la segunda fila (hosting y energías en `flex flex-wrap gap-1`) en flujo natural, garantizando que nunca se solapen independientemente del ancho de la pantalla o la cantidad de badges activos.

---

## 8. Corrupción de Caché en Servidor de Desarrollo (`next dev` + `next build`)

- **Gotcha**: Ejecutar `npm run build` (`next build`) mientras el servidor de desarrollo `npm run dev` está corriendo sobreescribe los manifiestos de chunks dinámicos en `.next/`. Al recargar o hacer HMR en el navegador, el servidor de desarrollo busca los chunks dev antiguos y devuelve `404 This page could not be found` o pantalla blanca.
- **Solución**:
  - Para verificar tipos y sintaxis sin romper el servidor dev en ejecución, utilizar `npx tsc --noEmit` y `npm run lint`.
  - Si el usuario ve un 404 tras un build, reiniciar el servidor dev (`npm run dev`) o recargar limpiamente.

---

## 9. Prevención de Pantallas en Blanco (Error Boundaries & Auto-Recuperación)

- **Gotcha**: Excepciones de renderizado en React sin un manejador de errores de nivel superior causan el desmontaje total del árbol de componentes, dejando la pantalla completamente en blanco.
- **Solución**:
  - Implementación de `src/app/error.tsx` (Error Boundary reactivo con diagnóstico y botón de recuperación/reintento), `src/app/global-error.tsx` (Falla crítica de layout) y `src/app/not-found.tsx` (404 personalizado con botón directo a la matriz).

---

## 10. Error 500 en SSR de Firebase con Next.js 15 (`Cannot find module './vendor-chunks/@firebase.js'`)

- **Gotcha**: En Next.js 15 App Router, el empaquetador del servidor intenta compilar los subpaquetes ESM de Firebase (`@firebase/app`, `@firebase/auth`, `@firebase/firestore`, etc.) generando rutas de chunks inexistentes (`./vendor-chunks/@firebase.js`), lo que provoca un error 500 en el servidor y bloquea la entrega de los bundles JavaScript del cliente (`webpack.js`, `_app.js`, `main.js`), dejando la aplicación en pantalla blanca.
- **Solución**:
  - Configurar en `next.config.ts` la propiedad `serverExternalPackages: ["firebase"]` para que Next.js resuelva los módulos de Firebase directamente en Node.js desde `node_modules` en lugar de empaquetar chunks rotos en el servidor.

---

## 11. Recorte y Clipping de Popovers en Tarjetas con `overflow-hidden`

- **Gotcha**: Las tarjetas de perfil (`ProfileCard`) utilizan `aspect-[3/4]` y `overflow-hidden rounded-2xl` para el recorte de la fotografía. Al desplegar un popover flotante externo (`bottom-full mb-2`) en perfiles con 5 o más indicadores, la altura del elemento excedía el límite superior de la tarjeta, recortando el encabezado y botón de cierre.
- **Solución**:
  - Implementar el popover como un *In-Card Sheet Overlay* anclado internamente a la base (`inset-x-2 bottom-2 max-h-[85%] overflow-y-auto`).
  - Garantiza un margen superior libre de al menos 15%, soporte para cualquier cantidad de indicadores con scroll interno estilizado y aislamiento de eventos táctiles (`e.stopPropagation()`).

---

## 12. Pérdida Total de Estilos CSS / Renderizado HTML Crudo (FOUC por colisión de `next build` sobre `next dev`)

- **Síntoma / Diagnóstico**: La interfaz se renderiza como HTML crudo sin estilos Tailwind, con fondo blanco, tipografía Times New Roman por defecto, botones nativos del sistema operativo, imágenes desbordadas y bloqueo total de interactividad en botones (los botones de navegación no responden).
- **Causa Raíz Detallada**:
  1. Next.js utiliza la carpeta `.next/` de forma compartida por defecto para la compilación en desarrollo (`next dev`) y los paquetes de producción (`next build`).
  2. Cuando se ejecuta `npm run build` (`next build`), Next.js purga `.next/` y genera manifiestos de producción con nombres de chunks hasheados (ej: `chunks/4bd1b696-*.js`).
  3. El servidor `next dev` en ejecución en segundo plano mantiene en memoria el mapa de rutas de desarrollo y solicita los chunks de desarrollo (`_next/static/css/app/layout.css?v=...`, `_next/static/chunks/main-app.js`, etc.).
  4. Dado que los archivos de desarrollo fueron eliminados por el build, el servidor devuelve `404 Not Found` tanto para el archivo CSS como para los scripts de React.
  5. Sin CSS: FOUC absoluto (pantalla blanca, texto crudo).
  6. Sin JS: React no se hidrata en el navegador (cero eventos `onClick`, la navegación y los modales quedan congelados).
- **Protocolo de Blindaje Permanente**:
  1. ⛔ **Regla de Oro Inviolable**: **NUNCA ejecutar `npm run build` mientras un servidor `npm run dev` esté corriendo**.
  2. ⚡ **Comando Oficial de Verificación en Caliente**: Utilizar **`npm run typecheck`** (`tsc --noEmit`), el cual realiza una verificación estricta de tipos en memoria sin escribir en disco ni tocar `.next/`.
  3. 🛠️ **Procedimiento de Recuperación si Ocurre**:
     - Detener el servidor de desarrollo (`Ctrl + C`).
     - Purgar la caché corrupta: `rm -rf .next`.
     - Reiniciar el servidor: `npm run dev`.
     - Recargar el navegador de forma limpia: `Cmd + Shift + R`.

---

## 13. Salto Horizontal de Layout (Layout Shift / Jitter) en Header y Bottom Nav al Conmutar Vistas
- **Síntoma / Diagnóstico**: Al alternar entre opciones del menú inferior (por ejemplo, de *Cerca* a *Radar* o *Pulsos*), se observaba un leve desplazamiento o temblor horizontal (~8px) en los iconos del menú inferior y en la cabecera.
- **Causa Raíz Detallada**:
  1. **Aparición/Desaparición de la Barra de Desplazamiento Vertical**: Vistas con contenido extenso (*Cerca*, *Mi Perfil*) desbordan la pantalla y hacen visible la barra de desplazamiento vertical (~15px). Vistas con menor contenido en altura (*Radar*, *Pulsos*, *Mensajes*) no desbordaban el viewport, ocultando la barra. Al alternar entre ambas, el ancho disponible de la ventana cambiaba en 15px, desplazando 7.5px el centrado horizontal de los contenedores `max-w-4xl mx-auto`.
  2. **Diferencias de Contenedor en `BrutalistNav`**: El tag `<nav>` utilizaba `fixed left-0 right-0 max-w-4xl mx-auto` directamente sobre el elemento fijo, centrándose respecto a la ventana en lugar del contenedor común de la aplicación.
  3. **Mutación de Peso Tipográfico en Botones Activos**: El texto de las pestañas alternaba entre `font-bold` e `font-extrabold`, alterando el ancho de los glifos tipográficos en cada conmutación.
- **Solución Definitiva**:
  1. **Estabilización de Gutter**: Se incorporó en `globals.css` la regla:
     ```css
     html {
       overflow-y: scroll;
       scrollbar-gutter: stable;
     }
     ```
     Garantiza que el espacio de la barra de desplazamiento vertical esté siempre reservado de manera idéntica en todas las pantallas y rutas.
  2. **Encapsulamiento del Bottom Nav**: Se configuró `<nav>` a pantalla completa fija (`left-0 right-0`) y su contenido interno se ancló dentro de `<div className="w-full max-w-4xl mx-auto">`, sincronizando su eje de alineación matemática con `BrutalistHeader`.
  3. **Invarianza Tipográfica y Dimensional**: Los botones del menú inferior fijaron su altura en `h-[52px]` estricto, su contenedor de icono en `w-5 h-5 flex-shrink-0`, y sus etiquetas en `font-bold` constante, aplicando únicamente transiciones de color (`transition-colors duration-150`).
  4. **Estandarización de Padding**: Se unificó el espaciado horizontal de todas las vistas en `p-3 sm:p-4`.

---

## 14. Deformación de Proporciones (Aspect Ratio) al Comprimir Fotos de Galería / Portada
- **Síntoma / Diagnóstico**: Al subir fotografías tomadas con smartphones a una galería de perfil o al chat, las imágenes se renderizaban excesivamente delgadas, estiradas verticalmente y aplastadas a un ancho de ~1:5.
- **Causa Raíz Detallada**:
  - En la función `compressImage` (`src/lib/firebase/storageService.ts`), cuando la imagen era vertical (`height > width`), la rama condicional calculaba `width = Math.round((width * maxHeight) / height)` pero reasignaba erróneamente la variable local `maxHeight = height` en lugar de actualizar `height = maxHeight`.
  - Como consecuencia, la altura permanecía en su resolución nativa (ej. 4032px) mientras el ancho se escalaba hacia abajo (ej. 810px). El canvas resultante comprimía la imagen de 3:4 a un ratio distorsionado de 1:5.
- **Solución Definitiva**:
  - Sustitución de las ramas por un factor de escala proporcional canónico:
    ```typescript
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    ```
  - En `AlbumDetailModal.tsx`, se configuró `object-contain` en los visores protegidos para que cualquier imagen conserve su encuadre original completo sin recortes laterales ni de cabezas.

---

## 15. Crash de Firestore por Valores `undefined` (`FirebaseError: Unsupported field value: undefined`)
- **Síntoma / Diagnóstico**: Al enviar fotos, audios o acciones de chat sin texto explícito de pie de foto (`caption`), la app arrojaba en consola: `FirebaseError: Function addDoc() called with invalid data. Unsupported field value: undefined (found in field text in document vessel_chats/...)`.
- **Causa Raíz Detallada**:
  - El SDK de Firestore rechaza por diseño cualquier clave de documento cuyo valor sea `undefined`, tanto a nivel raíz como en objetos y arrays anidados.
  - Al enviar adjuntos sin texto, la expresión `text: text || media.caption` producía `undefined`, y otros campos opcionales del adjunto (`expiresInMinutes`, etc.) también quedaban en `undefined`.
- **Solución Definitiva**:
  - Creación de la función recursiva `sanitizeForFirestore<T>` en `src/lib/firebase/chatService.ts` que recorre el objeto y remueve todas las claves con valor `undefined`, preservando valores legítimos (`null`, `""`, `0`, `false`) y tipos internos de Firestore (`serverTimestamp()`, `FieldValue`).
  - Asignación obligatoria de valor por defecto `text: message.text ?? ""` en el payload de `sendCloudMessage` y saneamiento en `sendMediaChatMessage`.

---

## 16. Saturación de Cuota de LocalStorage (`QuotaExceededError: Setting the value of 'vessel_user_albums_v1' exceeded the quota`)
- **Síntoma / Diagnóstico**: Al crear un álbum privado o público y seleccionar fotografías de la cámara del celular o computadora, la aplicación arrojaba `QuotaExceededError` interrumpiendo el flujo de guardado.
- **Causa Raíz Detallada**:
  - `CreateAlbumModal.tsx` leía los archivos fotográficos directamente con `readFileAsDataUrl(file)`, inyectando imágenes en Base64 sin comprimir (entre 5MB y 15MB cada una) y duplicando la cadena en `blurredUrl`.
  - Como `localStorage` impone un límite infranqueable de 5MB por dominio en todos los navegadores, almacenar una sola foto de alta resolución saturaba inmediatamente la cuota.
  - Además, `saveToStorage` se invocaba dentro del reducer de estado en `SettingsContext.tsx`, propagando el fallo directamente a React 19.
- **Solución Definitiva**:
---

## 17. Excepción de Firestore en Guardado de Álbumes (`FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined in vessel_users/.../albums/...`)
- **Síntoma / Diagnóstico**: Al crear o actualizar un álbum en la nube, la consola reportaba: `FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined (found in document vessel_users/WvpRlBDADDhxZHiZTI6M91Q2EXe2/albums/album-1788747430504)`.
- **Causa Raíz Detallada**:
  - En `CreateAlbumModal.tsx`, al mapear los borradores a `AlbumPhoto[]`, propiedades opcionales como `caption: undefined` o `durationSeconds: undefined` (para fotos) se asignaban explícitamente como `undefined`.
  - La función `saveCloudAlbum` en `albumService.ts` realizaba `setDoc(albumRef, { ...album, createdAtRaw: serverTimestamp(), updatedAt: serverTimestamp() })` sin saneamiento. Como Firestore rechaza cualquier propiedad `undefined` dentro de arrays de objetos, la llamada fallaba.
- **Solución Definitiva**:
  - Creación del módulo centralizado `src/lib/firebase/firestoreSanitizer.ts` con `sanitizeForFirestore<T>(data: T): T` que elimina recursivamente claves `undefined` en mapas y arrays, preservando `serverTimestamp()`, `FieldValue`, `Timestamp` y `Date`.
  - Envolvimiento de todos los payloads de `setDoc` en `albumService.ts`, `profileService.ts` y `matrixService.ts`.
  - Limpieza en la construcción de `photosToSave` en `CreateAlbumModal.tsx`.

---

## 18. Bloqueo Inadecuado de Propietario en Bóveda Privada (Blur Efímero y Botón "VER 10S" sobre Álbumes Propios)
- **Síntoma / Diagnóstico**: El usuario que administraba sus propios álbumes privados en la sección de cuenta se encontraba con sus fotos desenfocadas (`blur-md`), en blanco y negro, y un botón "VER (10S)" que iniciaba un temporizador de 10 segundos cerrando la foto tras la cuenta regresiva.
- **Causa Raíz Detallada**:
  - El componente `AlbumDetailModal.tsx` aplicaba las mismas reglas de seguridad efímera destinadas a destinatarios externos en chats (vista efímera, cuenta regresiva de 10 segundos, `requireHoldToReveal` y desenfoque) sobre el propio creador/dueño del álbum.
- **Solución Definitiva**:
  - Se eliminó el desenfoque (`blur-md`), la escala forzada y el filtro de escala de grises en la cuadrícula de medios del propietario.
  - Se eliminó el botón "VER (10S)" y la cuenta regresiva efímera de 10 segundos en `AlbumDetailModal.tsx`.
  - Se implementó un visor de pantalla completa directo y permanente para el propietario con soporte de fotos y clips de video, controles de audio, opción de selección de portada y cierre manual sin límites de tiempo.
  - Se adaptó `PrivateVault.tsx` con la propiedad `isOwner` para que la vista previa de perfil propio (`ProfileDetailModal.tsx`) tampoco bloquee al usuario.



