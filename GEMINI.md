# Sistema VESSEL — Manual de Contexto & Vinculación Maestra (GEMINI.md)

Bienvenido al repositorio central de **VESSEL**. Este documento sirve como punto de anclaje maestro para la indexación contextual, reglas operativas y arquitectura del proyecto para modelos y agentes de IA.

---

## 📌 Vinculación de Reglas Globales, Guardas y Telemetría

- @.agents/rules/antigravity_global_rules.md — **Operating System, Reglas Globales y Estándares de Calidad de Gentle-AI (`trigger: always_on`)**.
- @.agents/skills/impeccable/SKILL.md — **Impeccable UI (v4.3.1)**: Sistema y autoridad obligatoria N°1 para diseño visual, jerarquía ergonómica y auditoría UX/UI en VESSEL.
- @REGLAS_DE_NEGOCIO.md — **Reglas de Negocio y Producto**: Cuotas de cuentas Free/Premium, doble consentimiento, protocolo Anti-Ghost, desconexión gradual y salud preventiva.
- @HABILIDADES_Y_TELEMETRIA.md — **Habilidades, Telemetría y Experiencia Sensorial**: Mapeo acústico sub-bass (45-80Hz), eventos de ciclo de vida y telemetría de hardware.

---

## 📚 Documentos de Contexto del Sistema

Los siguientes 8 documentos contienen el conocimiento arquitectónico, histórico, operativo y técnico de VESSEL:

1. @docs/contexto/arquitectura.md — **Arquitectura del Sistema**: Stack tecnológico (Next.js 16, React 19, Tailwind CSS v4, Web Audio API, Google S2), capas de componentes, servicios i18n y flujo de datos centralizado en `VesselContext`.
2. @docs/contexto/convenciones.md — **Convenciones de Código y Diseño**: Estándares de TypeScript, uniones discriminadas estrictas, tokens de diseño brutalistas (`obsidian`, `electricViolet`, `bloodNeon`), reglas de i18n e invariantes de hidratación SSR.
3. @docs/contexto/decisiones.md — **Registro Histórico de Decisiones (ADR)**: Registro cronológico con fecha, hora exacta e ID de Engram de cada hito de diseño, producto y arquitectura.
4. @docs/contexto/glosario.md — **Glosario y Jerga de Dominio**: Definiciones de términos clave (*Body State, Rendezvous PIN, Double Consent, Facial Privacy, Date Diary, No Ghost Mode, Respect Karma Score, Soft-Block, Google S2 Geohashing*).
5. @docs/contexto/flujo-de-trabajo.md — **Flujo de Trabajo y Desarrollo**: Comandos de ejecución, ciclo de desarrollo para nuevas características, protocolo de pruebas y Definition of Done (DoD).
6. @docs/contexto/errores-conocidos.md — **Errores Conocidos y Mitigaciones**: Manejo de políticas de autoplay de audio, desajustes de hidratación SSR, cuotas de álbumes, compatibilidad multiplataforma y caché de Webpack.
7. @docs/contexto/registro-de-features.md — **Registro de Features, Entregas y Control de Estado (Feature Ledger & Release Tracker)**: Bitácora estándar de la industria que documenta cada nueva funcionalidad, fix o refactor, con ID, fecha, % de avance, tipo y componentes afectados.
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
