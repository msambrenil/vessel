# Technical Design: Tactical Zen & Progressive Disclosure Redesign

## Architecture Overview

This design addresses the cognitive overload and linguistic disconnect identified in VESSEL by enforcing a strict **3-Level Progressive Disclosure Hierarchy** and an **Authentic 2026 Argentine LGBT Cultural Tone**:

```
[ LEVEL 1: RADAR MATRIX ]
  • Photo + Codename + Age
  • Role ("Activo", "Pasivo", "Versa", "Side")
  • Host Status ("Pone lugar 🏠", "Recibe solo", "Viaja 🚗", "Sin lugar")
  • Readiness Badge ("⚡ LISTO 45m" or Distance "250m")
  • ONE primary action: "Tirar Onda ⚡" (with 55Hz sub-bass)
  • Tap card anywhere -> opens LEVEL 2

[ LEVEL 2: TACTICAL DOSSIER ]
  • Full Compatibility Triad:
    - Host Card Details (amenities, shower, privacy level)
    - Health & Harm Reduction (PrEP al día, Indetectable I=I, última fecha)
    - Mutual Morbos / Kinks Matrix
    - Biometric 3D Verification badge
  • Primary Action: "Sintonizar con Pre-Flight ⚡" (3-tap agreement sheet)
  • Secondary Action: "Mensaje Directo"

[ LEVEL 3: ACTION-FIRST DARKROOM CHAT ]
  • Pinned Pre-Flight agreement banner at top of conversation
  • Direct ephemeral messaging, photo unlock keys, and Rendezvous PIN
```

---

## 1. Header & Quick Actions Consolidation (`BrutalistHeader.tsx`)

### The Problem
The current header mounts 8 competing controls into 48px with sub-34px buttons:
- Logo & LIVE badge
- Rendezvous PIN button
- Beacon countdown widget
- Harm reduction session button
- Unlimited gold crown
- 3D verification shield
- Audio volume button with ping state
- QR share button
- User session chip

### The Zen Solution
- **Left**: VESSEL Logo + subtle Live radar dot.
- **Center**: Active emergency widgets *only when running* (`activeRendezvous` or `safetyBeacon.isActive`). When idle, center zone is completely clear.
- **Right**: Single 44px ergonomic user chip displaying avatar/alias and connection status. Tapping it opens a sleek tactical drop-down menu / bottom sheet with:
  1. **Audio Sensorial**: Sub-bass toggle (45-80Hz).
  2. **Pase QR**: Fullscreen QR party code generator.
  3. **Verificación 3D**: Biometric badge status.
  4. **VESSEL UNLIMITED**: Membership status & upgrade CTA.
  5. **Cerrar Sesión / Cuenta**: Auth management.

---

## 2. Profile Card Level-1 Simplification (`ProfileCard.tsx`)

### The Problem
Each 160px grid card has 4 competing buttons (Sintonizar, Star, Chat, Pulso) + 7 badges (99+ quota, ready timer, distance pill with remote tag, sentinel alert, host chip, role, health badge, mutual kinks badge).

### The Zen Solution
- **Visual hierarchy**:
  - Image: clean full bleed with subtle bottom gradient.
  - Top-Left: Badge only if `⚡ LISTO YA` or `⭐ VOS`.
  - Top-Right: S2 discretized distance + availability dot.
  - Bottom:
    - Line 1: `Codename` + `Age` + `Pone lugar 🏠` / `Viaja 🚗`.
    - Line 2: Role in electric violet (`Activo`, `Pasivo`, `Versa`, `Side`).
    - Line 3: Exactly **ONE primary button**: `"Tirar Onda ⚡"` (or `"Sintonizar"` with 55Hz sub-bass haptic feedback).
    - Top right or subtle header dot: Star (★) for favorites.
  - Deep health badges, mutual morbos, and dossier verdicts move to Level 2 (Dossier Modal).

---

## 3. Home Banner De-Cluttering (`page.tsx`)

### The Problem
`EnRouteBanner` and `UpcomingEncounterBanner` stack statically underneath `IntentHubSelector`, pushing the grid down.

### The Zen Solution
- Consolidate active journey and upcoming rendezvous into a single, elegant floating pill:
  - If en route: floating pill at bottom-right or top-center with live telemetry.
  - If appointment scheduled: slim 32px banner with 1-tap chat jump.

---

## 4. Argentine LGBT 2026 Linguistic Dictionary (`translations.ts`)

| Existing Stiff / Iberian Term | Authentic 2026 Argentine Queer Vernacular |
|-------------------------------|--------------------------------------------|
| `Zumbidos` | `Ondas` / `Toques` |
| `Zumbido Mutuo` | `Hay Onda ⚡` / `Onda Mutua` |
| `Cero Plantones` | `0% Fantasmas (Gente que cumple)` |
| `Hospedaje` / `Tiene Casa` | `Pone lugar` / `Tiene depto` / `Recibe solo` |
| `Busca Lugar` | `Sin lugar` / `Puede viajar` |
| `De incógnito` | `Modo Discreto` / `Sin foto pública` |
| `Cerca` (Nav) | `Radar` |
| `Encuentros` (Nav) | `Bitácora` |
| `Morbos y Preferencias` | `Morbos` / `Fetiches` |
| `Enviar Pulso con Pre-Flight` | `Tirar onda con puntos claros ⚡` |
| `Aceptar Sintonía` | `Aceptar onda ⚡` |
| `Declinar con Respeto` | `Paso, gracias` |
| `Posición en la cama` | `Rol` (`Activo`, `Pasivo`, `Versa`, `Side`) |
| `VIH / Salud` | `PrEP al día`, `Indetectable (I=I)`, `Negativo` |
