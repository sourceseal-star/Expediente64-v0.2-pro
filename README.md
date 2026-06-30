# EXPEDIENTE 64 — Sourceseal Global Protocol

> *"La verdad ahora tiene un protocolo."*

Un juego web de misterio e investigación en primera persona, construido con Three.js.

---

## 🎮 Sobre el juego

**Expediente 64** es un thriller de investigación en primera persona donde el jugador debe descubrir la verdad detrás de un expediente judicial comprometido. A través de 3 niveles, el jugador recopila evidencia, conecta pistas, evita guardias y confronta al responsable.

### Mecánicas principales
- 🔍 **Recolección de evidencia** — Revisa computadores y celulares en busca de archivos comprometedores
- 🧠 **Puzzle de deducción** — Conecta pistas en la pizarra de investigación estilo *corkboard detective*
- 👁️ **Sigilo** — Evita ser detectado por guardias con cono de visión dinámico
- 🎭 **Árbol de diálogo** — Interroga al sospechoso con múltiples caminos de conversación
- 🎬 **Cinemáticas dirigidas** — Secuencias estilo CoD con movimiento de cámara por waypoints

### Estructura de niveles
| Nivel | Escenario | Mecánica protagonista |
|-------|-----------|----------------------|
| 1 | Oficina de investigación | Puzzle de deducción |
| 2 | Barrio residencial | Sigilo |
| 3 | Oficina ejecutiva | Interrogatorio |

---

## 🚀 Cómo ejecutar

### En Replit
1. Abre el proyecto en Replit
2. Haz clic en **Run**
3. El servidor arranca en el puerto 3000

### Local
```bash
node server.js
```
Luego abre `http://localhost:3000` en tu navegador.

> **Requiere Node.js 18+**. Sin dependencias npm — el servidor usa solo módulos nativos de Node.

---

## 📁 Arquitectura del proyecto

```
expediente64/
├── index.html              # Shell principal + HUD + overlays CSS
├── game-data.js            # TODO el contenido: diálogos, pistas, niveles
├── game-engine.js          # Motor principal: Three.js, cámara, movimiento
├── mechanics-stealth.js    # Sistema de sigilo: detección, cono de visión
├── mechanics-dialogue.js   # Sistema de diálogo: árbol de conversación
├── mechanics-deduction.js  # Puzzle: pizarra de conexión de evidencia
├── cinematics.js           # Secuencias dirigidas: waypoints de cámara
├── server.js               # Servidor HTTP simple (Node.js nativo)
├── package.json
└── README.md
```

### Cómo editar contenido sin romper el motor
**Solo editar `game-data.js`** para cambiar:
- Diálogos del interrogatorio
- Textos de pistas y archivos
- Configuración de waypoints de cinemáticas
- Posiciones de guardias y puntos de cobertura

`game-engine.js` y los archivos de mecánicas son el motor — no editar salvo para cambiar comportamiento de juego.

---

## 📱 Play Store / Capacitor

El juego es una **Progressive Web App (PWA)** lista para empaquetar con **Capacitor** para Android:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Expediente 64" "com.sourceseal.expediente64"
npx cap add android
npx cap sync android
npx cap open android
```

Ver [`PLAYSTORE.md`](PLAYSTORE.md) para el flujo completo de publicación.

---

## 🔧 Stack técnico
- **Three.js** (via CDN) — motor 3D WebGL
- **JavaScript vanilla** — sin frameworks, sin bundler
- **Node.js HTTP** — servidor nativo sin dependencias
- **CSS puro** — HUD y overlays

---

## 📝 Changelog

### v0.2 — Expansión de mecánicas
- Puzzle de deducción en Nivel 1
- Sistema de sigilo con cono de visión en Nivel 2
- Árbol de diálogo e interrogatorio en Nivel 3
- Cinemáticas dirigidas estilo CoD en transiciones
- Arquitectura separada en módulos (game-data, engine, mechanics)

### v0.1
- Exploración básica + revisión de pantallas
