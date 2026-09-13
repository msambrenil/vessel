# Guía Maestra del Sistema VESSEL
### Análisis Integral de Características, Valor de Usuario & Benchmark Competitivo

---

## 🧭 Introducción & Filosofía de Producto

**VESSEL** no es un clon más de citas con una capa de color oscuro. Nace como respuesta a una crisis estructural en el ecosistema de aplicaciones carnales y de cruising gay (Grindr, Scruff, Sniffies, The Blowers):

1. **La Paradoja de Grindr**: Un monopolio obsoleto, plagado de publicidad invasiva, perfiles falsos, extorsión por capturas de pantalla, filtraciones de geolocalización, suscripciones prohibitivas ($39.99 USD/mes) y un índice de *ghosting* superior al 80% que provoca agotamiento psicológico crónico (*dating burnout*).
2. **La Precariedad de las Apps de Cruising (Sniffies / Blowers)**: Aunque son ágiles en lo carnal, operan sin protocolos de seguridad física, sin verificación de identidad anti-catfish y exponiendo la privacidad de los usuarios a capturas de pantalla indiscriminadas o filtraciones de geohash exacto en la web.

**VESSEL se posiciona como una Suite Táctica de Soberanía Física y Digital**: une la inmediatez del encuentro carnal con blindaje DRM militar, protocolos de rescate físico en la vida real, respeto mutuo gamificado y un modelo de micro-monetización accesible sin suscripciones forzadas.

---

## 📊 Escala de Importancia para el Usuario

* **🔴 CRÍTICA (Must-Have / Deal-Breaker)**: Resuelve dolores crónicos, riesgos físicos, legales o de extorsión que causan abandono inmediato de las plataformas tradicionales.
* **🟠 MUY ALTA (High-Value Retainer)**: Aumenta radicalmente la tasa de conversión de chats a encuentros reales y reduce la fatiga social.
* **🟡 ALTA (Engagement Booster)**: Enriquece la experiencia de uso diario, añade profundidad táctica y optimiza la navegación y discreción.
* **🟣 DIFERENCIADOR ESTRATÉGICO (Moat)**: Innovación exclusiva de VESSEL que la competencia no puede replicar sin canibalizar su modelo de anuncios o reescribir su arquitectura central.

---

## 🧱 BLOQUE 1: Privacidad Radical, Anti-Doxing y Blindaje DRM
*El talón de Aquiles de la competencia: proteger la integridad digital de los usuarios ante chantajes y filtraciones.*

### 1. Blindaje Anti-Captura Web/OS & "Hold to Reveal" (`ENH-003`)
* **Descripción Funcional**: Intercepta atajos de captura del sistema operativo en 0ms (`Cmd+Shift+3/4` en Mac, `PrintScreen` en Windows) forzando un apagón instantáneo a negro puro (`bg-black z-50`). Incorpora el protocolo militar **"Hold to Reveal"** (Mantener presionado para ver): la imagen privada solo se desencripta y renderiza mientras el usuario mantenga apoyado el dedo o puntero sobre la pantalla; al levantar el dedo o presionar cualquier tecla, el contenido desaparece al instante. Las miniaturas en la grilla permanecen protegidas con desenfoque (`blur-6px`).
* **Nivel de Importancia**: **🔴 CRÍTICA**.
* **Benchmark vs. Competencia**:
  * **Grindr**: En iOS solo emite una notificación cosmética pero permite la captura; en Android y web la captura es totalmente libre.
  * **Sniffies / The Blowers**: Al ser plataformas web abiertas, cualquiera puede hacer capturas de pantalla o grabar videos libremente sin restricción técnica alguna.
  * **Impacto**: Elimina de raíz el pánico a la extorsión de fotos íntimas en profesionales, figuras públicas y usuarios discretos.

### 2. Marca de Agua Esteganográfica Universal (`ENH-003`)
* **Descripción Funcional**: Estampa una densa retícula tipográfica diagonal a -25° con sombra proyectada de alto contraste sobre todas las fotos privadas. Contiene de forma indeleble el ID del observador, ID del propietario y timestamp UTC exacto.
* **Nivel de Importancia**: **🟠 MUY ALTA (Disuasión Psicológica)**.
* **Benchmark vs. Competencia**:
  * Inexistente en Grindr, Scruff, Sniffies y Blowers.
  * Si un usuario intenta fotografiar la pantalla con otro teléfono físico, la imagen queda marcada forensemente, permitiendo rastrear al responsable directo de la fuga.

### 3. Bóvedas Privadas Cifradas & Auditoría en Vivo / Vault Audit (`BASE-004`, `FEAT-029`)
* **Descripción Funcional**: Galerías multimedia privadas con entrega de llaves temporales. Cuenta con un registro inalterable en tiempo real (*Vault Audit*) que detalla quién abrió las fotos íntimas, a qué hora exacta y cuántos segundos permaneció mirándolas, con un botón táctico para revocar la llave de acceso de inmediato en tiempo de ejecución.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**:
  * **Grindr**: Permite enviar álbumes pero el usuario no sabe cuándo los miran ni por cuánto tiempo, y la revocación no destruye la caché del cliente ajeno al instante.
  * **The Blowers**: Galerías rudimentarias o enlaces externos no protegidos.

### 4. Modo Niebla / Fog Mode (`FEAT-013`)
* **Descripción Funcional**: Desenfoque facial voluntario y calibrado (`6-7px` en tarjetas y perfil; `3-4px` en radar y chat) que atenúa los rasgos identificatorios directos resguardando la discreción laboral y personal, pero manteniendo nítida la contextura física, vello corporal, sonrisa, musculatura y atmósfera luminosa.
* **Nivel de Importancia**: **🟣 DIFERENCIADOR ESTRATÉGICO**.
* **Benchmark vs. Competencia**:
  * En Grindr el usuario discreto sube una foto de un torso decapitado, un paisaje, un meme o deja el perfil vacío con un avatar negro, destruyendo la calidad visual de la grilla.
  * VESSEL exige foto obligatoria pero brinda el Modo Niebla como escudo de privacidad elegante.

### 5. Escudo Anti-Triangulación Geoespacial Google S2 (`BASE-003`)
* **Descripción Funcional**: Indexación espacial jerárquica en celdas esféricas S2 de Nivel 14 (~152m). Las coordenadas de latitud/longitud exactas del dispositivo jamás se transmiten a los clientes de otros usuarios ni se almacenan en crudo.
* **Nivel de Importancia**: **🔴 CRÍTICA (Seguridad Jurídica y Física)**.
* **Benchmark vs. Competencia**:
  * **Grindr**: Enfrentó multas históricas millonarias en Europa (GDPR) por permitir que terceros triangularan la posición exacta de usuarios mediante API con 3 puntos de distancia.
  * **Sniffies**: Proyecta pines de ubicación sobre el mapa de calles con precisión de pocos metros, facilitando el acecho (stalking).

### 6. Retención Configurable de Chat & Ver una Sola Vez (`FEAT-011`, `FEAT-010`)
* **Descripción Funcional**: Conmutador táctico en Darkroom Chat para alternar entre modo efímero (autodestrucción completa al cerrar la ventana) y modo guardado local. Incluye envío de fotos y videos con autodestrucción en 15 segundos (*Burn-on-View*).
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**:
  * Grindr cobra su suscripción más cara para fotos que expiran o mensajes efímeros. En VESSEL es parte de la arquitectura base.

---

## ⚡ BLOQUE 2: Logística Inmediata, Eficiencia y Sintonía Carnal
*Elimina la fricción número 1 del cruising gay: perder 40 minutos chateando para descubrir que ninguno tiene lugar o no buscan lo mismo.*

### 7. Ficha de Hospedaje Táctica / Host Card (`FEAT-017`)
* **Descripción Funcional**: Ficha estandarizada que responde de raíz "¿quién recibe?": declara si tiene lugar (`hasPlace`), tipo de convivencia (*solo, roommates, hotel*), comodidades inmediatas (*ducha lista, toallas limpias, aire acondicionado*) e insumos disponibles (*condones, lubricante, poppers*). Filtrable en 1 tap en la matriz.
* **Nivel de Importancia**: **🔴 CRÍTICA**.
* **Benchmark vs. Competencia**:
  * **Grindr / Scruff**: Solo ofrecen una etiqueta ambigua ("Tiene lugar"). El 80% de los chats se atascan preguntando detalles de convivencia e insumos.
  * **The Blowers**: Los usuarios deben tipear datos en descripciones de texto plano sin orden.
  * **Impacto**: Resuelve la compatibilidad logística antes de emitir la primera palabra.

### 8. Pre-Flight Checklist de Compatibilidad Sexual (`FEAT-018`)
* **Descripción Funcional**: Formulario interactivo en 4 dimensiones de 1-tap: Ritmo (*Rápido & Carnal, Sensual, Rough*), Prácticas (*Oral, Penetración, Fetiches*), Barreras/Salud (*Bareback PrEP, Condón*) y Sustancias. Genera un ticket en el chat con el distintivo de coincidencia *"Sintonía Fuego 🔥"*.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**:
  * Inexistente en todas las aplicaciones existentes.
  * Elimina la incomodidad social y los malentendidos presenciales al explicitar los acuerdos de la sesión de antemano.

### 9. Radar "On-The-Clock" / Modo Listo YA (`FEAT-032`)
* **Descripción Funcional**: Estado efímero de alta urgencia con temporizador regresivo de 15 a 120 minutos. Proyecta una insignia pulsante ámbar `⚡ LISTO YA` en la grilla y el radar, contador regresivo en la cabecera y filtro rápido en la matriz.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**:
  * En Grindr el 70% de los perfiles conectados están en el trabajo, viajando o "mirando sin apuro".
  * VESSEL segrega de inmediato a los usuarios que tienen la ropa puesta y disponibilidad para concretar en los próximos 30 minutos.

### 10. Kink Matrix Ciega con 35 Fetiches Eróticos (`FEAT-038`)
* **Descripción Funcional**: Catálogo curado de 35 fetiches gay (pits, jocks, musk, cuero, BDSM, fisting, waterplay, daddys, etc.) con mecánica de coincidencia ciega: un fetiche solo se revela si ambas partes marcaron "Me gusta" o "Curioso".
* **Nivel de Importancia**: **🟡 ALTA (Alto Engagement)**.
* **Benchmark vs. Competencia**:
  * **Scruff**: Muestra los fetiches de forma pública (riesgo de estigmatización).
  * **Grindr**: Etiquetas básicas sin dinamismo.
  * **VESSEL**: Permite explorar fantasías tabú con total resguardo de la discreción individual.

### 11. Waypoint Seguro en 2 Fases (`FEAT-033`)
* **Descripción Funcional**: Protocolo anti-emboscadas para compartir ubicación. La Fase 1 solo comparte la esquina pública de aproximación; la Fase 2 (piso, dpto y notas de timbre) permanece bloqueada y cifrada hasta que el visitante presiona *"Ya estoy en la esquina"*.
* **Nivel de Importancia**: **🔴 CRÍTICA (Seguridad Personal)**.
* **Benchmark vs. Competencia**:
  * En Grindr los usuarios envían su dirección completa y número de piso a desconocidos sin saber si realmente se presentarán o si es un perfil malintencionado.

### 12. Modo "Voy en Camino" con ETA & Alerta de Puerta (`FEAT-020`)
* **Descripción Funcional**: Comparte una estimación de arribo en tiempo real (5, 10, 15, 30m) dentro del chat y reproduce un timbre analógico a 90 Hz al aproximarse a menos de 50 metros del anfitrión.
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Evita la necesidad de abandonar la aplicación y entregar el número de WhatsApp para coordinar la llegada.

### 13. Protocolo de Salida Post-Encuentro / Exit Protocol (`FEAT-025`)
* **Descripción Funcional**: Comunica sin tabúes la expectativa posterior al sexo: *Fast Encounter* ⏱️ (despedida inmediata tras el acto), *Chill & Cuddle* 🫂 (ducha y 20-30 min de charla) o *Sleepover* 🌙 (quedarse a dormir).
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Elimina uno de los momentos más incómodos y tensos de los encuentros casuales.

### 14. Voice Vibe (Audio Analógico de 5 Segundos) (`FEAT-019`)
* **Descripción Funcional**: Grabador y reproductor de audio analógico limitado estrictamente a 5 segundos con pulso sub-bass a 65 Hz y visualizador de onda.
* **Nivel de Importancia**: **🟡 ALTA (Filtro Anti-Catfish)**.
* **Benchmark vs. Competencia**: Escuchar la voz real y la cadencia de una persona antes de salir de casa desarticula el 90% de los perfiles falsos.

### 15. Centro de Pulsos de 1-Tap (`FEAT-016`)
* **Descripción Funcional**: Estandarización de la interacción rápida ("Mandar Pulso") con confirmación acústica sub-bass a 75 Hz y bandeja dedicada (`PulsesView`) dividida en recibidos y enviados.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**: Equivalente a los *Taps* de Grindr o el *Flash* de The Blowers, pero con retroalimentación sensorial analógica y trazabilidad completa.

---

## 🛡️ BLOQUE 3: Seguridad Física en Encuentros Reales & Discreción Táctica
*Herramientas diseñadas para proteger la vida, integridad y libertad del usuario en el plano físico.*

### 16. Guardián Silencioso & Dead-Man Switch Local-First (`FEAT-021`)
* **Descripción Funcional**: Temporizador regresivo de encuentro físico (45, 90, 120 min) con widget persistente en la cabecera. Si no se introduce el PIN antes del vencimiento, activa una alarma a 45 Hz y genera un despacho de auxilio al contacto de confianza local. Todos los datos se guardan estrictamente en el dispositivo del usuario (cero servidores).
* **Nivel de Importancia**: **🔴 CRÍTICA (Diferenciador Salvavidas)**.
* **Benchmark vs. Competencia**:
  * Totalmente ausente en Grindr, The Blowers y Sniffies.
  * Los asaltos planificados mediante citas trampa son un flagelo recurrente en la comunidad gay urbana. Esta feature es un argumento decisivo para que usuarios con temores de seguridad adopten VESSEL.

### 17. PIN de Coacción Silencioso y Alerta Antirrobo (`FEAT-022`)
* **Descripción Funcional**: Si el usuario es extorsionado o amenazado para abrir la app, ingresar un PIN secundario de coacción (ej. `9999`) simula apagar la app, salta a la pantalla señuelo y emite una señal de auxilio silenciosa al contacto local.
* **Nivel de Importancia**: **🔴 CRÍTICA**.
* **Benchmark vs. Competencia**: Ninguna aplicación comercial en el mundo cuenta con un protocolo militar de coacción física.

### 18. Bloc de Notas Camaleón Señuelo con Flip-to-Cover (`FEAT-023`)
* **Descripción Funcional**: Cobertura inmediata que transforma la app en un editor de texto funcional (`SCRATCHPAD.TXT`). Se activa instantáneamente al colocar el smartphone boca abajo sobre una mesa (giroscopio Flip-to-Cover) o presionar `Escape`.
* **Nivel de Importancia**: **🟠 MUY ALTA (Discreción Cotidiana)**.
* **Benchmark vs. Competencia**: Permite utilizar la app en el trabajo, transporte público o eventos familiares sin miedo a miradas indiscretas.

### 19. Verificación Biométrica Liveness 3D Facial (`FEAT-024`)
* **Descripción Funcional**: Malla tridimensional y prueba de gestos en vivo (parpadeo y giro lateral) que certifica que el usuario es un ser humano real e idéntico a sus fotos, emitiendo una credencial Zero-Knowledge.
* **Nivel de Importancia**: **🔴 CRÍTICA**.
* **Benchmark vs. Competencia**:
  * **Grindr**: Inundado de bots, estafadores de criptomonedas y fotos robadas de internet.
  * **Sniffies**: Cero verificación de identidad.
  * **Scruff**: Selfie 2D estática fácilmente falsificable.

### 20. Pantalla de Bloqueo Rápido / Stealth Lock (`BASE-007`)
* **Descripción Funcional**: Cortina de bloqueo con teclado numérico brutalista accesible con 1 toque en la cabecera.
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Bloqueo instantáneo ante descuidos con el dispositivo.

---

## 🪩 BLOQUE 4: Nightlife, Cruising Urbano & Dinámicas Sociales
*Conexión del plano digital con la noche real: fiestas, clubes, darkrooms y reencuentros.*

### 21. Cruces en la Pista // Missed Connections (`FEAT-083`)
* **Descripción Funcional**: Registra automáticamente los perfiles que compartieron el mismo club/boliche durante la misma ventana horaria. Preserva los cruces durante 48 horas con cuenta regresiva, permitiendo enviar un pulso con nota contextual (*"Estábamos en la barra de Crobar, tenías campera de cuero"*).
* **Nivel de Importancia**: **🔴 CRÍTICA / ALTO ENGAGEMENT EMOCIONAL**.
* **Benchmark vs. Competencia**:
  * Resuelve la frustración histórica de cruzarse con alguien en una fiesta y no encontrarlo al día siguiente.
  * Grindr solo muestra quién está cerca en ese segundo; al salir del boliche, la conexión se pierde para siempre.

### 22. VESSEL Nightlife: Cartelera & Radar de Pista por Micro-Zonas (`FEAT-082`)
* **Descripción Funcional**: Cartelera de eventos y fiestas con RSVP ("Voy esta noche") y radar polar conmutador de sectores del club (*Pista Central, Barra Principal, Darkroom / Cruising, Fumadero, Baños*).
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**: Convierte a VESSEL en el navegador oficial de la vida nocturna gay.

### 23. Baliza Óptica de Pantalla Completa (`FEAT-082`)
* **Descripción Funcional**: Estroboscópico de pantalla completa de alta frecuencia (Ámbar 2.5Hz, Neón 5Hz, Carmesí Darkroom) para ubicarse visualmente en pistas oscuras o llenas de humo.
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Elimina el inútil texto *"Estoy al lado de una columna"* en boliches colmados.

### 24. Modo Wingman ("Salgo con Amigo") (`FEAT-082`)
* **Descripción Funcional**: Enlace efímero vía PIN de 4 dígitos entre amigos para sincronizar estados durante la noche (*De fiesta juntos, Separados a salvo, En cita casual, Necesito rescate*).
* **Nivel de Importancia**: **🟠 MUY ALTA (Cuidado Comunitario)**.
* **Benchmark vs. Competencia**: Cero equivalentes en la industria.

### 25. Alerta de Vaso Seguro / Spiked Drink (`FEAT-082`)
* **Descripción Funcional**: Protocolo silencioso ante sospecha de adulteración de bebidas con marcación rápida a emergencias sanitarias (107/911).
* **Nivel de Importancia**: **🟡 ALTA / PREVENCIÓN CRÍTICA**.

### 26. Hotspots Tácticos Urbanos & Check-In Anónimo (`FEAT-031`)
* **Descripción Funcional**: Mapeo en el radar de puntos de cruising emblemáticos (darkrooms, saunas, clubes) con check-in anónimo y conteo agregado de Vessels activos (*"🔥 18 Vessels en el lugar"*).
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**:
  * **Sniffies**: Publica pines individuales que exponen la posición de cada usuario.
  * **VESSEL**: Agrega el dato estadístico protegiendo la identidad individual.

### 27. Salas de Sesión Privadas & Modo Dúo de Pareja (`FEAT-027`)
* **Descripción Funcional**: Salas con aforo estricto para tríos o dinámicas grupales; y vinculación simbiótica de dos cuentas de pareja con insignia unificada `👥 DÚO` en grilla y chat.
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: En Grindr las parejas se ven obligadas a crear perfiles conjuntos confusos o mezclar fotos.

### 28. Travel Mode (Teleportación Virtual de Radar) (`FEAT-030`)
* **Descripción Funcional**: Reubicación virtual del radar a otras metrópolis globales (Berlín, Madrid, São Paulo, NY) 48h antes de viajar.
* **Nivel de Importancia**: **🟡 ALTA (Palanca de Monetización)**.
* **Benchmark vs. Competencia**: Equivalente al "Passport/Roaming" de Grindr, pero sin publicidad.

---

## 🤝 BLOQUE 5: Cultura del Respeto, Anti-Ghosting y Reputación Ética
*Sanando la toxicidad y el desgaste psicológico que caracterizan a las apps convencionales.*

### 29. Modo Anti-Ghosting & Salidas Rápidas en 1-Tap (`FEAT-002`)
* **Descripción Funcional**: Biblioteca de respuestas respetuosas y directas en 1 tap para cerrar conversaciones cordialmente (*"Sos fuego, pero hoy no tengo chispa"*), premiando al usuario con **+5 puntos de Karma de Respeto** e insignia de honor en su perfil.
* **Nivel de Importancia**: **🟠 MUY ALTA / PSICOLOGÍA POSITIVA**.
* **Benchmark vs. Competencia**:
  * En Grindr el ghosting crónico supera el 80%, provocando desilusión y frustración constante.
  * VESSEL gamifica el trato digno mediante el *Respect Karma Score*.

### 30. Desconexión Gradual / Soft-Block Architecture (`FEAT-003`)
* **Descripción Funcional**: Cuatro protocolos de cierre sin hostilidad: *Pausa Temporal*, *Cierre Amable*, *Shadow Stealth* (buzón silenciado sin alertar al usuario) y *Cortafuegos Estricto*.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**: El bloqueo abrupto en Grindr genera rencores o episodios violentos si los usuarios viven cerca o se cruzan en un bar.

### 31. Dossier de Reputación Comunitaria (`FEAT-005`)
* **Descripción Funcional**: Evaluación ética comunitaria (puntualidad, respeto a Safe-Words y trato digno) que genera veredictos transparentes (*Alta Confiabilidad, Impecable, Precaución*).
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Expulsa orgánicamente a perfiles problemáticos o agresivos.

### 32. Testimonios con Doble Consentimiento Mutuo (`BASE-006`)
* **Descripción Funcional**: Los testimonios solo pueden redactarse si hubo encuentro físico comprobado bilateralmente (vía geofencing o PIN), y ambos deben aprobar el texto antes de que sea visible.
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Evita difamaciones, falsas reseñas y venganzas de exparejas.

---

## 🩺 BLOQUE 6: Salud Sexual Preventiva, Harm Reduction y Cuidado
*Una perspectiva pragmática, sin estigmas y orientada a la salud de la comunidad gay.*

### 33. Alerta Médica Anónima de Exposición a ITS (`FEAT-037`)
* **Descripción Funcional**: Protocolo Zero-Knowledge para notificar diagnósticos de ITS (sífilis, gonorrea, clamidia, MPOX). Los contactos recientes del Date Diary reciben una advertencia médica en el chat sin revelar el nombre ni la fecha del remitente.
* **Nivel de Importancia**: **🔴 CRÍTICA (Salud Pública)**.
* **Benchmark vs. Competencia**: Inexistente en la competencia. Es un salto cualitativo en salud comunitaria.

### 34. Botiquín Clínico Doxy-PEP (`FEAT-026`)
* **Descripción Funcional**: Seguimiento clínico post-exposición para la profilaxis bacteriana dentro de la ventana de 72 horas en el Date Diary, registrando dosis inicial y refuerzo.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**: Ninguna aplicación comercial integra seguimiento farmacológico en su experiencia.

### 35. Date Diary Local-First & Calendario PrEP a 90 Días (`FEAT-001`, `BASE-003`)
* **Descripción Funcional**: Bitácora confidencial de encuentros y química corporal guardada en el dispositivo. Agenda automáticamente un recordatorio para el próximo control médico de salud sexual a los 90 días.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**: Transforma a VESSEL en el asistente personal de salud preventiva del usuario.

### 36. Asistente de Reducción de Daños & Chem-Chill (`FEAT-036`)
* **Descripción Funcional**: Herramienta de cuidado nocturno: temporizador de hidratación cada 45 minutos con alertas sensoriales a 45 Hz, registro local y confidencial de sustancias para evitar redosificaciones accidentales y guía de Posición Lateral de Seguridad (PLS).
* **Nivel de Importancia**: **🔴 CRÍTICA (Protección de Vida)**.
* **Benchmark vs. Competencia**: Las apps tradicionales fingen que el chemsex no existe o banean términos arbitrariamente. VESSEL asume la realidad desde una óptica pragmática de reducción de daños.

### 37. Matriz de Atmósfera & Sustancias (`FEAT-081`)
* **Descripción Funcional**: Declaración voluntaria de 4 niveles de ambiente (*Sober, Social Drinks, 420 Friendly, Party & Play*), con filtrado directo en la matriz de perfiles.
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Facilita que usuarios sobrios o en recuperación encuentren espacios 100% sobrios, y que quienes buscan fiesta no pierdan tiempo.

---

## 🎧 BLOQUE 7: Experiencia Sensorial, UX Brutalista y Rendimiento
*Diseño táctil y arquitectura de software de alto rendimiento.*

### 38. Motor de Síntesis Sub-Bass Analógico 45-80Hz (`BASE-002`, `FEAT-034`)
* **Descripción Funcional**: Síntesis pura Web Audio API que produce pulsos graves analógicos (45 Hz a 80 Hz) para cada interacción y alerta, más 5 frecuencias seleccionables de soundtrack para el anfitrión en su Host Card (*Dark Techno, Sensual Downtempo, Sub-Bass 50Hz, Berlin Industrial, Ambient Chill*).
* **Nivel de Importancia**: **🟣 DIFERENCIADOR ESTRATÉGICO / IDENTIDAD DE MARCA**.
* **Benchmark vs. Competencia**: Las demás apps usan timbres agudos genéricos. VESSEL vibra como un instrumento físico y carnal en las manos del usuario.

### 39. UI Brutalista Inmersiva con Aspect Ratio 2/3 Áureo (`FEAT-080`, `FEAT-039`)
* **Descripción Funcional**: Tarjetas verticales optimizadas con proporción áurea fotográfica, scrim degradé retraído (el 70% superior de la foto queda completamente despejado), micro-HUD de 2 líneas de alta densidad informativa y touch targets de 44px.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**:
  * Grindr está saturado de popups de video, publicidad que no se puede cerrar y banners molestos.
  * VESSEL ofrece una estética limpia, inmersiva y táctica.

### 40. Estados Corporales Reactivos / Body State (`FEAT-007`)
* **Descripción Funcional**: Selector de 4 estados: *Listo / Open* (ámbar pulsante), *En Sesión / Occupied* (ocupado), *De Incógnito / Dormant* (sigilo en radar) y *Durmiente*.
* **Nivel de Importancia**: **🟠 MUY ALTA**.
* **Benchmark vs. Competencia**: Permite navegar o revisar chats sin recibir mensajes nuevos cuando ya estás en medio de una cita.

### 41. Motor de Ahorro de Batería de 4 Modos (`BASE-003`)
* **Descripción Funcional**: Modula la frecuencia de muestreo de radar y desactiva animaciones cuando la batería cae por debajo del 20% (*Eco-Saver*).
* **Nivel de Importancia**: **🟡 ALTA**.
* **Benchmark vs. Competencia**: Grindr es famoso por sobrecalentar los smartphones y agotar la batería en un par de horas.

---

## 💰 BLOQUE 8: Modelo de Monetización y Micro-Transacciones
*Derribando la barrera económica que frustra a los usuarios.*

### 42. Micro-Pases por Impulso: Fiesta 12h & Finde 48h (`FEAT-035`, `FEAT-082`)
* **Descripción Funcional**: Micro-pagos puntuales sin renovación automática de **$1.99 USD** (Pase de Fiesta por 12 horas) y **$2.99 USD** (Pase de Fin de Semana por 48 horas) para desbloquear la suite completa de VESSEL UNLIMITED durante las horas de salida.
* **Nivel de Importancia**: **🔴 CRÍTICA (Disrupción de Negocio)**.
* **Benchmark vs. Competencia**:
  * **Grindr**: Exige suscripciones mensuales desorbitadas ($39.99/mes), atrapando al usuario en renovaciones automáticas difíciles de cancelar.
  * **VESSEL**: Convierte al 85% de los usuarios que jamás pagarían $40 dólares pero pagan con gusto $1.99 o $2.99 de forma impulsiva antes de salir de noche.

### 43. Suscripción VESSEL UNLIMITED (`FEAT-028`)
* **Descripción Funcional**: Suscripción recurrente ($14.99/mes o $79.99/año) que habilita Travel Mode global, Multi-Bóvedas ilimitadas, Auditoría de Bóvedas, Stealth Pro, Filtros de Logística Quirúrgicos y Boost en Radar.
* **Nivel de Importancia**: **🟡 ALTA**.

### 44. SPA Ejecutiva para Inversores y Simulador Financiero (`FEAT-084`)
* **Descripción Funcional**: Aplicación interactiva autónoma (`presentation/index.html`) con simulador de smartphone de 5 pantallas en tiempo real, catálogo de 52 features y calculadora interactiva de ARR y unit economics para rondas de capital.
* **Nivel de Importancia**: **🟣 ESTRATÉGICA**.

---

## ⚔️ Matriz Comparativa (Battlecard Estratégico)

| Eje Estratégico | Grindr (Incumbente) | The Blowers | Sniffies | **VESSEL (Ecosistema)** |
| :--- | :--- | :--- | :--- | :--- |
| **Protección Anti-Capturas & Doxing** | ❌ Nula (capturas libres) | ❌ Nula | ❌ Nula (web abierta) | **✅ DRM Blackout + Hold to Reveal + Marca de Agua** |
| **Verificación Anti-Catfish / Bots** | ❌ Plagado de bots y spam cripto | ❌ Sin verificación | ❌ Sin verificación | **✅ Liveness 3D Facial Activo (Zero-Knowledge)** |
| **Seguridad Física en Encuentros** | ❌ Inexistente | ❌ Inexistente | ❌ Inexistente | **✅ Dead-Man Switch, PIN Coacción, Waypoint 2 Fases** |
| **Logística Inmediata ("¿Quién tiene lugar?")**| ❌ Pregunta repetitiva en chat | ⚠️ Texto sin estructurar | ⚠️ Pines sin filtro de insumos | **✅ Ficha de Hospedaje Táctica (Host Card) + Filtro 1-Tap** |
| **Sintonía Sexual Previa** | ❌ Charlas eternas e incómodas | ⚠️ Rudimentario | ❌ Inexistente | **✅ Pre-Flight Checklist en 3 taps (Sintonía Fuego 🔥)** |
| **Experiencia Nocturna (Nightlife)** | ❌ Solo radar crudo sin contexto | ❌ No aplicable | ⚠️ Mapa sin herramientas de club | **✅ Cruces en Pista 48h + Baliza Óptica + Modo Wingman** |
| **Cultura Social / Anti-Ghosting** | ❌ Ghosting crónico del 80%+ | ❌ Alto abandono | ❌ Anonimato sin consecuencias | **✅ Karma de Respeto (+5 pts) + Desconexión Gradual** |
| **Salud Sexual & Reducción de Daños** | ⚠️ Recordatorio genérico VIH | ❌ Tabú | ❌ Tabú | **✅ Alerta ITS ZK + Doxy-PEP 72h + Chem-Chill** |
| **Modelo de Monetización** | ❌ Muro rígido de $39.99/mes + Ads | ⚠️ Donaciones / Básico | ⚠️ Suscripción de $15.00/mes | **✅ Micro-pases ($1.99/$2.99) + SaaS sin publicidad** |
| **Riesgo Legal / Privacidad (GDPR)** | ❌ Multas millonarias por triangulación | ⚠️ Servidores expuestos | ⚠️ Ubicación pública vulnerable | **✅ Cero Riesgo: Local-First + Google S2 (~152m)** |

---

## 💡 Conclusión de Producto

VESSEL redefine el estándar de las plataformas carnales y afectivas de la comunidad gay. La aplicación supera a Grindr y The Blowers no por añadir complejidad superflua, sino por **resolver los 4 grandes dolores no resueltos de la industria**:

1. **La Vulnerabilidad Digital**: Resuelta con blindaje DRM militar, marca de agua esteganográfica y datos locales.
2. **La Vulnerabilidad Física**: Resuelta con el Guardián Silencioso (Dead-Man Switch), el PIN de Coacción y el Waypoint en 2 Fases.
3. **La Fricción Logística y Sexual**: Resuelta con la Host Card, el Radar On-the-clock y el Pre-Flight Checklist.
4. **La Exclusión Económica**: Resuelta sustituyendo suscripciones predatorias de $40 USD por micro-pases nocturnos de $1.99 y $2.99 USD.
