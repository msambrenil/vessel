# PRODUCT.md — VESSEL

Documento maestro de producto y contexto para el sistema de diseño e ingeniería de **VESSEL**, estructurado bajo el estándar de **Impeccable**.

---

## 1. Plataforma & Restricciones Técnicas

* **Plataforma Principal:** Web Mobile-First & Progressive Web App (PWA) instalable.
* **Stack:** Next.js 15.1.7 (App Router), React 19, TypeScript 5.7+ estricto, Tailwind CSS v3.4.
* **Entorno de Uso Real:**
  * Uso nocturno y en baja luminosidad (cama, clubes, transporte público, aeropuertos).
  * Conexiones móviles fluctuantes e intermitentes (metro, áreas concurridas).
  * Operación táctil con una sola mano (*Thumb Zone* / Zonas del pulgar optimizadas).
* **Hardware & Audio:**
  * Web Audio API para síntesis analógica Sub-Bass (45 Hz a 80 Hz) como respuesta física y háptica.
  * Discretización geoespacial Google S2 / Geohash 7 (~152m) y motor de ahorro de batería (`BatteryStateEngine`).

---

## 2. Usuarios & Arquetipos ("Personas")

VESSEL está diseñado para la comunidad gay y queer que busca conexiones directas, de alta calidad y sin rodeos:

1. **Alex (28 años) — Pasivo, navegación nocturna:**
   * *Contexto:* Usa la app en la cama o en transporte público con brillo de pantalla bajo.
   * *Necesidad:* Claridad inmediata en roles e intenciones, cero pérdida de tiempo en charlas triviales, navegación ultra rápida con una sola mano sin distracciones ni publicidad.
2. **Marcus (35 años) — Activo, viajero frecuente:**
   * *Contexto:* Usa la app en tránsito (hoteles, aeropuertos, eventos) con iluminación tenue o prisa.
   * *Necesidad:* Alto contraste visual, botones de acción inmediata grandes y precisos, geolocalización confiable en tiempo real.
3. **Liam (23 años) — Kink & Privacidad absoluta:**
   * *Contexto:* Comparte departamento o interactúa en espacios compartidos.
   * *Necesidad:* Bloqueo de emergencia instantáneo en 1 toque (*StealthLockScreen*), modo niebla facial (*Fog Mode*), bóvedas cifradas con llaves revocables y fotos de vista única (*Burn-on-View*).

---

## 3. Posicionamiento & Propuesta de Valor

* **Concepto:** *Brutalist Dark Luxury Queer Dating & Rendezvous*.
* **Metáfora Central:** El cuerpo como arquitectura: el contenedor (*Vessel*) diseñado para ser habitado, conectado y llenado.
* **Diferenciador Radical:**
  * **Cultura del Respeto (Anti-Ghosting):** Karma de respeto visible y salidas amables en 1 toque que penalizan la desaparición sin aviso.
  * **Estados Corporales Inmediatos (*Body States*):** Disponibilidad transparente en tiempo real (`Open Now`, `In Session`, `Stealth`).
  * **Profundidad Sensorial:** Audio sub-bass inmersivo y micro-interacciones cinematográficas.
  * **Privacidad Criptográfica & Local-First:** Diario de citas (*Date Diary*) y salud sexual 100% privado en cliente.

---

## 4. Voz, Tono & Registro Lingüístico

* **Registro:** Español Rioplatense auténtico para la comunidad gay joven (20-35 años) con voseo (*vos tenés, elegí, mandá, fijate, caele*).
* **Personalidad:** Directo, elegante, sensual, cálido y sin vueltas (*"Cero careteada"*, *"Sin vueltas"*, *"En una"*).
* **Soporte Bilingüe:** Español Rioplatense (`es`) e Inglés (`en`) tipado mediante catálogo reactivo.

---

## 5. Invariantes & Lo que NO Existe en VESSEL

1. **Cero Trackers de Terceros:** Sin Google Analytics, Facebook Pixel ni SDKs de monetización invasivos.
2. **Cero Coordenadas GPS Brutas:** La ubicación precisa nunca se expone ni almacena; siempre se discretiza en celdas Geohash 7 / S2.
3. **Cero Librerías UI Genéricas:** Sin Bootstrap, Material UI o TailwindUI; todos los componentes son brutalistas nativos a medida.
4. **Cero Exposición de Datos del Diario:** El *Date Diary* es exclusivamente Local-First y no se sincroniza en servidores de terceros.
5. **Cero Perfiles Fantasma:** Fotografía de perfil obligatoria (con opción de *Modo Niebla* para privacidad visual consentida).
