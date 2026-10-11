# Spec: Profile Bento Hub Architecture

## Requirements

### REQ-1: Separation of Identity vs System Settings
The system MUST isolate user identity, encounter logistics, photo vaults, and privacy shielding inside the "Mi Perfil" domain (`ProtocolView.tsx`). The system MUST NOT render system settings (audio synthesis parameters, cloud database backups, JSON data purge, Google OAuth session management, language selection, or measurement units) within `BioTab.tsx` or `BoundariesTab.tsx`. These capabilities SHALL be accessible solely via `AppSettingsModal.tsx`.

### REQ-2: Compact Tactical Bento Hero
The Hero header in `ProtocolView.tsx` MUST fit comfortably in mobile viewports (≤160px height on standard 390px screens). It MUST render:
- Avatar thumbnail with Fog Mode / Stylized overlay.
- Tactical completion indicator (e.g., "Ficha 80% completa").
- Direct 1-tap Cover Photo Action Sheet trigger.
- Inline editable codename with availability validation.
- Quick control pills: Fog Mode switch and 5s Voice Vibe Player.
- Identity badges: Housing mobility ("Pongo casa" / "Voy yo"), Verification badge, Anti-Ghost Respect Karma score, and Verified physical encounters.

### REQ-3: 1-Tap Cover Photo Selector
`CoverPhotoSelectorModal.tsx` MUST provide a direct, modal-level Action Sheet allowing:
1. Native camera capture (`capture="user"`).
2. Device file upload (compressed client-side to WebP).
3. 1-tap selection from existing user public album photos.
The component MUST NOT require the user to switch tabs or open separate album detail modals to set their avatar/cover.

### REQ-4: Coherent Logistics & Hosting Unification
`BioTab.tsx` and `LogisticsTab.tsx` MUST share a single unified source of truth for hosting availability (`myHostCard.hasPlace` and `myProfile.mobility`). Toggling "Pongo casa" or "Voy yo" in either view MUST stay in lockstep without string-matching discrepancies.

### REQ-5: Argentine Rioplatense 2026 Vernacular
All copy displayed in Spanish within the profile view and dependent tabs MUST use natural, contemporary 2026 Rioplatense Spanish (voseo, colloquial clarity without clinical or corporate euphemisms). Specifically:
- "Tus Álbumes" instead of "Gestor de Álbumes"
- "Cosas a mano en casa" instead of "Insumos para el encuentro"
- "Comodidades del depto" instead of "Comodidades del espacio"
- "Límites y despedida sin drama" instead of "Límites & Desconexión gradual"
- "Contextura física" instead of "Yo Soy (Contextura)"
- "Altura (cm)" instead of "Estatura (cm)"
- "Guardar cambios" instead of "Guardar Ahora"
- "Karma & Cero Plantones" instead of "Cultura del Respeto"

## Scenarios

### Scenario 1: Quick Cover Photo Update
- **Given** a user viewing "Mi Perfil" on a mobile device
- **When** they tap on their avatar picture
- **Then** a direct Action Sheet opens presenting camera, gallery, and existing photos
- **When** they select a photo
- **Then** the avatar updates immediately, saves, and plays an audio feedback cue without changing the active tab.

### Scenario 2: System Settings Isolation
- **Given** a user navigating "Mi Perfil"
- **When** they inspect "Mi Ficha" (`BioTab`) and "Seguridad" (`BoundariesTab`)
- **Then** they see no duplicate toggles for audio sub-bass, cloud backup JSON, language, or Google login
- **And** those controls remain intact and fully functional in `AppSettingsModal`.
