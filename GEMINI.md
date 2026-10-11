# Sistema VESSEL — Manual de Contexto & Vinculación Maestra (GEMINI.md)

Bienvenido al repositorio central de **VESSEL**. Este documento sirve como punto de anclaje maestro para la indexación contextual, reglas operativas y arquitectura del proyecto para modelos y agentes de IA.

---

## 📌 Vinculación de Reglas Globales, Guardas y Telemetría

- @.agents/rules/antigravity_global_rules.md — **Operating System, Reglas Globales y Estándares de Calidad de Gentle-AI (`trigger: always_on`)**.
- **Tríada de Rendimiento & Arquitectura Moderna 2026 (`trigger: always_on`)**: Mandato obligatorio en cada cambio: (1) Cero Context Hell (`useVessel` prohibido, hooks atómicos por dominio y componentes puros), (2) Next.js 16 App Router real (`/radar`, `/pulses`, etc. con `View Transitions` nativas y deep-linking), (3) Protección del Main Thread (Web Workers para cálculo geoespacial, mutaciones a IndexedDB y Next Image adaptativo con fallback dev).
- **Invariante de Versión & Despliegue en Main (`trigger: git_push_main`)**: Actualización obligatoria de versión en cada push a `main`, sincronización de Service Worker (`npm run version:sync`), purga de caché forzada en navegadores clientes y reflejo en el panel de Admin ("Versión & Despliegues").
- @.agents/skills/impeccable/SKILL.md — **Impeccable UI (v4.3.1)**: Sistema y autoridad obligatoria N°1 para diseño visual, jerarquía ergonómica y auditoría UX/UI en VESSEL.
- @.agents/skills/ponytail/SKILL.md — **Ponytail**: Skill de ingeniería senior pragmática (YAGNI, The Ladder, reutilización interna, cero dependencias infladas y corrección de causa raíz).
- @REGLAS_DE_NEGOCIO.md — **Reglas de Negocio y Producto**: Cuotas de cuentas Free/Premium, doble consentimiento, protocolo Anti-Ghost, desconexión gradual y salud preventiva.
- @HABILIDADES_Y_TELEMETRIA.md — **Habilidades, Telemetría y Experiencia Sensorial**: Mapeo acústico sub-bass (45-80Hz), eventos de ciclo de vida y telemetría de hardware.
- **Cadencia de Mantenimiento Periódico por Fases (`trigger: periodic_maintenance`)**: Ciclo de auditoría recurrente obligatorio estructurado en 5 fases: Fase 1 (Higiene, Poda & Tipos), Fase 2 (Impeccable UI, Ergonomía & Primitivas), Fase 3 (Vitest, Batería & Rendimiento), Fase 4 (Contexto Vivo & Engram) y Fase 5 (Versionado, Despliegue & Purga SW).

---

## 📚 Documentos de Contexto del Sistema

Los siguientes 8 documentos contienen el conocimiento arquitectónico, histórico, operativo y técnico de VESSEL:

1. @docs/contexto/arquitectura.md — **Arquitectura del Sistema**: Stack tecnológico (Next.js 16, React 19, Tailwind CSS v4, Web Audio API, Google S2), capas de componentes, servicios i18n y flujo de datos centralizado en `VesselContext`.
2. @docs/contexto/convenciones.md — **Convenciones de Código y Diseño**: Estándares de TypeScript, uniones discriminadas estrictas, tokens de diseño brutalistas (`obsidian`, `electricViolet`, `bloodNeon`), reglas de i18n e invariantes de hidratación SSR.
3. @docs/contexto/decisiones.md — **Registro de Decisiones (ADR)**: Registro de decisiones fundacionales y del sprint activo (historial previo en `docs/contexto/historico/decisiones-historicas.md`).
4. @docs/contexto/glosario.md — **Glosario y Jerga de Dominio**: Definiciones de términos clave (*Body State, Rendezvous PIN, Double Consent, Facial Privacy, Date Diary, No Ghost Mode, Respect Karma Score, Soft-Block, Google S2 Geohashing*).
5. @docs/contexto/flujo-de-trabajo.md — **Flujo de Trabajo y Desarrollo**: Comandos de ejecución, ciclo de desarrollo para nuevas características, protocolo de pruebas y Definition of Done (DoD).
6. @docs/contexto/errores-conocidos.md — **Errores Conocidos y Mitigaciones**: Manejo de políticas de autoplay de audio, desajustes de hidratación SSR, cuotas de álbumes, compatibilidad multiplataforma y caché de Webpack.
7. @docs/contexto/registro-de-features.md — **Registro de Features, Entregas y Control de Estado (Sprint Activo)**: Bitácora del sprint actual con ID, fecha, % de avance y DoD (historial previo en `docs/contexto/historico/registro-de-features-historico.md`).
8. @docs/contexto/arquetipos.md — **Arquetipos de Usuario y Psicografía de Mercado**: 20 perfiles tácticos detallados para el lanzamiento inicial en Argentina (tecnologías, dispositivos, dolores, hooks funcionales y oportunidades de mejora).

---

## ⚡ Comandos Rápidos del Proyecto

```bash
# Desarrollo local (Servidor dev en puerto 3001)
npm run dev

# Verificación de tipos en caliente (Seguro con dev server activo, no rompe la caché .next)
npm run typecheck

# Suite de pruebas unitarias y de integración (Vitest, 194 tests)
npm run test

# Análisis estático de código (Linter)
npm run lint

# Validación completa previa a push (Tipos + Tests)
npm run validate

# Compilación y empaquetado para producción (Solo ejecutar con el servidor dev detenido)
npm run build
```
