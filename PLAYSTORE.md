# EXPEDIENTE 64 — Guía de publicación en Google Play Store

## Opción 1: PWA → Android con Capacitor (recomendada)

### Requisitos previos
- Node.js 18+
- Android Studio instalado (con SDK 33+)
- Cuenta de Google Play Console ($25 única vez)

### Paso 1 — Preparar el proyecto

```bash
cd expediente64
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Paso 2 — Inicializar Capacitor

```bash
npx cap init "Expediente 64" "com.sourceseal.expediente64" --web-dir .
npx cap add android
```

### Paso 3 — Configurar capacitor.config.json

```json
{
  "appId": "com.sourceseal.expediente64",
  "appName": "Expediente 64",
  "webDir": ".",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "minSdkVersion": 24,
    "targetSdkVersion": 34,
    "buildToolsVersion": "34.0.0"
  }
}
```

### Paso 4 — Sincronizar y abrir en Android Studio

```bash
npx cap sync android
npx cap open android
```

### Paso 5 — Firmar el APK/AAB

En Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. Selecciona **Android App Bundle** (.aab) — requerido por Play Store
3. Crea o importa tu keystore
4. Build type: **Release**

### Paso 6 — Subir a Google Play Console

1. Ve a [play.google.com/console](https://play.google.com/console)
2. Crea nueva aplicación
3. Llena los metadatos (ver sección de assets abajo)
4. Sube el `.aab` en **Producción → Versiones**

---

## Assets requeridos para la Play Store

| Asset | Tamaño | Notas |
|-------|--------|-------|
| Ícono de app | 512×512 px PNG | Fondo transparente o sólido |
| Feature graphic | 1024×500 px PNG/JPG | Banner principal de la tienda |
| Screenshots (mín 2) | Mín 320px — Máx 3840px | Landscape recomendado para juego |
| Video promo | YouTube URL | Opcional pero recomendado |

---

## Metadatos sugeridos para la tienda

**Título:** Expediente 64: Protocolo Inmutable

**Descripción corta (80 chars):**
Investiga, conecta pistas y descubre la verdad en este thriller de misterio.

**Descripción completa:**
```
EXPEDIENTE 64 — SOURCESEAL GLOBAL PROTOCOL

Cada día, documentos y pruebas son alterados antes de llegar a un juicio.
Tu trabajo es encontrar lo que es real, conectar las pistas y obtener la verdad.

🔍 INVESTIGA — Revisa archivos comprometedores en computadores y celulares
🧠 DEDUCE — Conecta evidencia en tu pizarra de investigación
👁️ INFILTRA — Cruza zonas custodiadas sin ser detectado
🎭 INTERROGA — Presiona al sospechoso con las pruebas correctas

3 niveles de tensión creciente. Una sola verdad.

¿Puedes sellar el expediente antes de que desaparezca?

SOURCESEAL GLOBAL PROTOCOL — La verdad ahora tiene un protocolo.
```

**Categoría:** Juegos → Aventura

**Clasificación de contenido:** PEGI 7 / Everyone (sin violencia explícita)

---

## Opción 2: TWA (Trusted Web Activity)

Si el juego ya está desplegado en Replit con dominio propio, puedes usar TWA para publicarlo directamente sin compilar código nativo:

1. Asegúrate de tener un `manifest.json` y service worker (PWA completa)
2. Usa [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) de Google:
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://tu-dominio-replit.com/manifest.json
bubblewrap build
```

---

## Notas importantes

- El archivo `.aab` es el formato requerido por Play Store desde 2021 (no `.apk`)
- La cuenta de Google Play Console tiene un costo único de **$25 USD**
- La revisión inicial puede tomar **3-7 días hábiles**
- Para actualizaciones futuras: incrementa `versionCode` en `android/app/build.gradle`
