// ============================================================
// MECHANICS: CINEMATICS
// Mueve la cámara por una secuencia de waypoints con lerp,
// simulando cortes dirigidos estilo CoD. Usa narrative-screen
// existente para mostrar texto superpuesto si se provee.
// ============================================================

const CinematicSystem = {
  active: false,
  waypoints: [],
  currentIndex: 0,
  holdTimer: 0,
  camera: null,
  onComplete: null,
  lerpT: 0,
  startPos: null,
  startLook: null,

  play(camera, config, onComplete) {
    this.active = true;
    this.camera = camera;
    this.waypoints = config.waypoints;
    this.currentIndex = 0;
    this.holdTimer = 0;
    this.lerpT = 0;
    this.onComplete = onComplete;

    if (config.text) {
      const banner = document.getElementById('cinematic-text-banner');
      banner.textContent = config.text;
      banner.style.display = 'block';
      setTimeout(() => banner.classList.add('visible'), 50);
    }

    // Snap to first waypoint instantly
    const first = this.waypoints[0];
    this.camera.position.set(...first.pos);
    this.camera.lookAt(...first.lookAt);
    this.startPos = this.camera.position.clone();
  },

  update(delta) {
    if (!this.active) return;

    const current = this.waypoints[this.currentIndex];
    const next = this.waypoints[this.currentIndex + 1];

    if (!next) {
      // Last waypoint — hold then finish
      this.holdTimer += delta;
      if (this.holdTimer >= current.hold) {
        this.finish();
      }
      return;
    }

    this.lerpT += delta / Math.max(current.hold, 0.4);
    if (this.lerpT >= 1) {
      this.lerpT = 0;
      this.currentIndex++;
      return;
    }

    const a = current.pos, b = next.pos;
    const lookA = current.lookAt, lookB = next.lookAt;
    const ease = this.lerpT < 0.5 ? 2 * this.lerpT * this.lerpT : 1 - Math.pow(-2 * this.lerpT + 2, 2) / 2;

    const px = a[0] + (b[0] - a[0]) * ease;
    const py = a[1] + (b[1] - a[1]) * ease;
    const pz = a[2] + (b[2] - a[2]) * ease;
    const lx = lookA[0] + (lookB[0] - lookA[0]) * ease;
    const ly = lookA[1] + (lookB[1] - lookA[1]) * ease;
    const lz = lookA[2] + (lookB[2] - lookA[2]) * ease;

    this.camera.position.set(px, py, pz);
    this.camera.lookAt(lx, ly, lz);
  },

  finish() {
    this.active = false;
    const banner = document.getElementById('cinematic-text-banner');
    banner.classList.remove('visible');
    setTimeout(() => { banner.style.display = 'none'; }, 600);
    if (this.onComplete) this.onComplete();
  },
};
