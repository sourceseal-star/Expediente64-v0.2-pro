# EXPEDIENTE 64 — Sourceseal Global Protocol
## Registro de implementación y progreso

## v0.2 — Expansión de mecánicas (reemplaza v0.1)

### Contexto de este salto de versión:
La v0.1 era solo "caminar + revisar pantallas". Se pidió expandir a:
sigilo, diálogos/interrogatorios, puzzles de deducción, y secuencias
dirigidas tipo cinemática (estilo Call of Duty: cortes de cámara,
tensión controlada, momentos guionados).
Decisión tomada: priorizar tener LOS 3 NIVELES completos con las
4 mecánicas integradas, aceptando menos pulido por mecánica
individual, en vez de 1 nivel perfecto.

### Arquitectura (importante para seguir editando):
- `game-data.js` — TODO el contenido: diálogos, pistas, evidencia,
  configuración de cada secuencia dirigida, NPCs. Editar aquí para
  cambiar narrativa/textos sin tocar lógica.
- `game-engine.js` — Motor: cámara, movimiento, Three.js, render loop.
- `mechanics-stealth.js` — Sistema de sigilo: detección, conos de
  visión de NPCs guardia, estado alerta/oculto.
- `mechanics-dialogue.js` — Sistema de diálogo: árbol de conversación
  simple, UI de interrogatorio con opciones.
- `mechanics-deduction.js` — Sistema de puzzle: pizarra de conexión
  de pistas (estilo "corkboard detective"), el jugador conecta
  evidencia para desbloquear conclusiones.
- `cinematics.js` — Sistema de secuencias dirigidas: mueve la cámara
  por waypoints predefinidos con cortes, sincroniza con narrative
  beats existentes.

### Nivel por nivel — qué mecánica protagoniza cada uno:
- **Nivel 1 (oficina investigación):** Puzzle de deducción es el
  foco. Recolectas evidencia (como v0.1) pero ahora debes conectarla
  en la pizarra para desbloquear la salida. Cinemática de apertura
  dirigida (CoD-style cortes rápidos).
- **Nivel 2 (cabina auto → barrio → entrada tienda):** Sigilo es el
  foco. Tras verificar en el celular, el jugador sale del auto y
  debe cruzar el barrio evitando ser visto por un NPC vigilante
  antes de llegar a la entrada de la tienda de comida rápida.
- **Nivel 3 (oficina lujosa):** Diálogo/interrogatorio es el foco.
  El jugador encuentra al sospechoso y tiene una conversación con
  opciones de diálogo que determinan si consigue la confesión final.
  Reutiliza puzzle de deducción para la evidencia inicial.

### Pendiente / simplificado a propósito (para no inflar el scope):
- Conos de visión del guardia son geometría simple (cono semi-
  transparente), no raycasting complejo de oclusión por objetos.
- Árbol de diálogo es lineal con 2-3 ramas, no un sistema complejo
  de reputación/consecuencias a largo plazo.
- Cinemáticas mueven la cámara por waypoints con lerp, no hay
  control de "director" avanzado (depth of field, motion blur).
- Manos en primera persona: mismo placeholder de v0.1, sigue
  pendiente de reemplazo por modelo rigged.

### Cómo seguir iterando en Replit:
1. Prueba el flujo completo primero (los 3 niveles de inicio a fin)
2. Si una mecánica se siente floja, dile al agente: "mejora SOLO
   mechanics-stealth.js, no toques los demás archivos" — así no
   gastas créditos re-generando todo
3. Contenido narrativo (diálogos, pistas) se edita en game-data.js
   sin riesgo de romper el motor
