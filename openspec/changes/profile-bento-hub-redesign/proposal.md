# Proposal: Profile Bento Hub Redesign (Reorganización Modular Limpia de Mi Perfil)

## Intent
Transformar la vista "Mi Perfil" (`ProtocolView.tsx`) y sus submódulos en una arquitectura modular limpia "Bento Hub Táctico". Eliminar la duplicación masiva de configuraciones de sistema (audio, nube, backup, idioma, cuenta) que estaban desparramadas en `BioTab` y `BoundariesTab`, compactar el Hero Banner visual para maximizar el espacio útil en pantallas móviles (360px–430px), simplificar el flujo laberíntico de cambio de foto de portada a un selector directo de 1 toque, y actualizar la jerga a español rioplatense 2026 auténtico para usuarios de 20 a 35 años en Argentina.

## Scope
- `src/components/account/ProtocolView.tsx`: Rediseño del Bento Hero Header compacto (altura reducida, medidor de completitud, píldoras de control rápido, Action Sheet de foto).
- `src/components/account/tabs/BioTab.tsx`: Poda de la sección 5 (Ajustes de sistema: idioma y medidas) y reorganización modular de los bloques corporales, de encuentro, identidad y redes.
- `src/components/account/tabs/BoundariesTab.tsx`: Poda de las secciones 3, 4 y 5 (Sesión Google, Audio/Háptica y Nube/Backups), dejando la pestaña estrictamente orientada a privacidad de ubicación (S2) y límites con contactos.
- `src/components/account/CoverPhotoSelectorModal.tsx`: Rediseño ergonómico tipo Action Sheet directo (Cámara inmediata, Galería del celu, o selección de álbum existente).
- `src/components/account/UserAlbumManager.tsx`: Pulido de copy y visualización de cuotas y llaves.
- `src/components/account/tabs/LogisticsTab.tsx`: Sintonización con `myHostCard` y copy rioplatense 2026 ("Comodidades del depto", "Cosas a mano en casa").
- `src/components/account/tabs/ReputationTab.tsx`: Refinamiento del bloque de Karma & Cero Plantones y auxilio SOS.
- `src/lib/i18n/translations.ts`: Actualización de strings rioplatenses vernáculos 2026.

## Target Archetypes Impact
- **Mateo (Dev Tech, Palermo, 29)**: Eliminación de redundancias, guardado reactivo ágil y visualización técnica limpia.
- **Facundo (Pibe Fit de Barrio, Lanús, 24)**: Uso mobile ergonómico con una sola mano en transporte público, botones claros de "Pongo casa / Voy yo" y menor sobrecarga visual.
- **Ignacio (Ejecutivo Discreto, Puerto Madero, 38) & Martín (Papá Bi, 33)**: Modo Niebla visible en el Hero fijo y acceso inmediato a Blindaje sin mezclar con configuraciones irrelevantes.
- **Rodrigo (Kink Master, San Telmo, 31) & Santi (Raver Queer, 23)**: Bloque de Morbos (Kinks) mutuos y sustancias sin lenguaje institucional.
