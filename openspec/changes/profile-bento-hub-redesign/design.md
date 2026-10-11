# Technical Design: Profile Bento Hub Architecture

## Architecture Overview

```mermaid
graph TD
    User([Usuario en Mobile]) --> PV[ProtocolView: Bento Hub]
    
    subgraph Bento Hero Header
        PV --> HeroCard[Hero Card: Avatar + Alias + Barra de Salud 85%]
        HeroCard --> ActionSheet[CoverPhotoActionSheet: Cámara / Galería / Bóveda]
        HeroCard --> Pills[Píldoras Rápidas: Niebla + Audio 5s]
    end

    subgraph 4 Solapas Tácticas
        PV --> Tabs[Sticky Tablist]
        Tabs --> TabBio[1. Mi Ficha: Cuerpo, Dinámica, Vínculos, Límites]
        Tabs --> TabVaults[2. Bóvedas: Tus Álbumes & Llaves de Acceso]
        Tabs --> TabLogistics[3. Logística & Morbos: Casa, Kinks, Salida, Sustancias]
        Tabs --> TabSecurity[4. Blindaje: Sigilo S2, SOS, Camuflaje, Karma]
    end

    subgraph Panel Global de Sistema
        Gear[Botón Tuerquita en Header] --> SettingsModal[AppSettingsModal: Idioma, Audio, Nube, Backups, Sesión]
    end
```

## Component Transformations

1. **`ProtocolView.tsx`**:
   - Reemplaza el Hero estirado por una cuadrícula Bento asimétrica:
     - Izquierda: Avatar brutalista con badge de estado y trigger a Action Sheet.
     - Derecha: Alias editable, edad, micro-barra de completitud del perfil (`perfil al 80%`), y badges de confianza.
     - Inferior: Barra dividida con control directo de Modo Niebla y reproductor/grabador de audio de 5s.
   - 4 Solapas limpias y sin contaminaciones cruzadas.

2. **`CoverPhotoSelectorModal.tsx`**:
   - Transformado en un Bottom Sheet nativo brutalista.
   - Ofrece 3 botones táctiles de 56px de alto:
     - `Tomar Foto`: disparador `capture="user"`.
     - `Subir de la Galería`: selector de archivos con compresión automática a WebP.
     - `Elegir de mis Álbumes`: carrusel/grilla táctil de fotos públicas del usuario con selección en 1 toque.

3. **`BioTab.tsx`**:
   - Eliminación de la sección `PREFERENCIAS DE LA APLICACIÓN`.
   - Agrupación en 4 tarjetas Bento limpias con espaciado consistente (`space-y-4`).
   - Sincronización limpia de `mobility` con `myHostCard.hasPlace`.

4. **`BoundariesTab.tsx`**:
   - Eliminación de `CUENTA & SESIÓN OPERATIVA`, `EXPERIENCIA SENSORIAL` y `ALMACENAMIENTO & SINCRONIZACIÓN`.
   - Mantiene estrictamente:
     - `LocationPrivacySection` (GPS S2, Geohash, Modo Sigilo).
     - `Límites y Despedida sin Drama` (Soft-block / desconexión suave con perfiles específicos).

5. **`LogisticsTab.tsx` & `KinksTab.tsx`**:
   - Actualización de labels a rioplatense 2026.
   - Sincronización bidireccional limpia con `myProfile.mobility`.

6. **`translations.ts`**:
   - Actualización de las cadenas de idioma correspondientes.
